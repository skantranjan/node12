const pool = require('../config/db.config');

/**
 * Copy SKUs with new business logic
 * @param {Object} requestData - The request data with cm_code, year_id, and skuData
 * @param {string} createdBy - The user creating the copy
 * @returns {Promise<Object>} The copy operation results
 */
async function copySkuWithNewLogic(requestData, createdBy) {
  const { cm_code, year_id, skuData } = requestData;
  
  console.log('🏗️ === STARTING COPY OPERATION ===');
  console.log('Request data:', { cm_code, year_id, skuData: skuData.length, createdBy });
  
  const results = {
    cm_code,
    year_id,
    total_skus: skuData.length,
    processed_skus: [],
    skipped_skus: [],
    errors: []
  };

  try {
    // Process each SKU in the array
    for (const sku of skuData) {
      try {
        const skuResult = await processIndividualSku(sku, year_id, cm_code, createdBy);
        
        if (skuResult.action === 'skipped') {
          results.skipped_skus.push(skuResult);
        } else {
          results.processed_skus.push(skuResult);
        }
      } catch (error) {
        results.errors.push({
          sku_code: sku.sku_code,
          error: error.message
        });
      }
    }

    // Process component mappings for all SKUs
    const componentResults = await processComponentMappings(cm_code, year_id, skuData, createdBy);
    results.component_mappings = componentResults;

    console.log('✅ === COPY OPERATION COMPLETED ===');
    console.log('Final results:', JSON.stringify(results, null, 2));
    
    return results;
  } catch (error) {
    throw error;
  }
}

/**
 * Process individual SKU copy logic
 * @param {Object} sku - SKU data
 * @param {string} yearId - New year ID
 * @param {string} cmCode - CM code from request
 * @param {string} createdBy - User creating the copy
 * @returns {Promise<Object>} SKU processing result
 */
async function processIndividualSku(sku, yearId, cmCode, createdBy) {
  const { sku_code, sku_description } = sku;
  
  console.log(`\n📦 Processing SKU: ${sku_code}`);
  console.log(`Year ID received: ${yearId} (Type: ${typeof yearId})`);
  console.log(`CM Code received: ${cmCode} (Type: ${typeof cmCode})`);
  
  try {
    // FIRST: Check if SKU + year combination already exists
    const existingSkuYearQuery = `
      SELECT id, sku_code, period, cm_code
      FROM public.sdp_skudetails
      WHERE sku_code = $1 AND period = $2 AND is_active = true
      LIMIT 1
    `;
    
    const existingSkuYearResult = await pool.query(existingSkuYearQuery, [sku_code, yearId]);
    
    if (existingSkuYearResult.rows.length > 0) {
      // SKU + year combination already exists - SKIP
      const existingRecord = existingSkuYearResult.rows[0];
      console.log(`⏭️ SKIP: SKU ${sku_code} with year ${yearId} already exists (ID: ${existingRecord.id})`);
      
      return {
        sku_code,
        action: 'skipped',
        reason: 'SKU code and year combination already exists',
        existing_sku_id: existingRecord.id,
        existing_period: existingRecord.period,
        existing_cm_code: existingRecord.cm_code
      };
    }
    
    // SECOND: Check if SKU exists in sdp_skudetails (for copying data)
    const existingSkuQuery = `
      SELECT id, sku_code, site, sku_description, cm_code, cm_description, 
             sku_reference, is_active, created_by, created_date, period, 
             purchased_quantity, sku_reference_check, formulation_reference, 
             dual_source_sku, skutype, bulk_expert, is_approved, is_copied
      FROM public.sdp_skudetails
      WHERE sku_code = $1 AND is_active = true
      ORDER BY created_date DESC
      LIMIT 1
    `;
    
    const existingSkuResult = await pool.query(existingSkuQuery, [sku_code]);
    
    let newSkuData;
    
    if (existingSkuResult.rows.length > 0) {
      // SKU exists - copy existing data with new period
      const existingSku = existingSkuResult.rows[0];
      console.log(`📋 SKU exists - copying from existing record`);
      console.log(`Existing period: ${existingSku.period}`);
      console.log(`Existing cm_code: ${existingSku.cm_code}`);
      
      // Use year_id directly instead of looking up period
      console.log(`📅 Using year_id directly: ${yearId}`);
      
      // Insert copied SKU
      const insertQuery = `
        INSERT INTO public.sdp_skudetails (
          sku_code, site, sku_description, cm_code, cm_description, 
          sku_reference, is_active, created_by, created_date, period, 
          purchased_quantity, sku_reference_check, formulation_reference, 
          dual_source_sku, skutype, bulk_expert, is_approved, is_copied
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING id, sku_code, sku_description, cm_code, period, is_copied, is_approved, created_date
      `;
      
      const values = [
        existingSku.sku_code,                    // sku_code
        existingSku.site,                        // site
        existingSku.sku_description,             // sku_description
        cmCode,                                  // cm_code (use from request, not from existing)
        existingSku.cm_description,              // cm_description
        existingSku.sku_reference,               // sku_reference
        true,                                    // is_active
        createdBy,                               // created_by
        new Date(),                              // created_date
        yearId,                                  // period (use year_id directly)
        existingSku.purchased_quantity,          // purchased_quantity
        existingSku.sku_reference_check,         // sku_reference_check
        existingSku.formulation_reference,       // formulation_reference
        existingSku.dual_source_sku,             // dual_source_sku
        existingSku.skutype,                     // skutype
        existingSku.bulk_expert,                 // bulk_expert
        false,                                   // is_approved (always false for copied)
        1                                        // is_copied (always true for copied)
      ];
      
      console.log(`💾 Inserting copied SKU with period: ${yearId} and cm_code: ${cmCode}`);
      const insertResult = await pool.query(insertQuery, values);
      newSkuData = insertResult.rows[0];
      
    } else {
      // SKU doesn't exist - create fresh entry
      console.log(`🆕 SKU doesn't exist - creating fresh entry`);
      
      const insertQuery = `
        INSERT INTO public.sdp_skudetails (
          sku_code, sku_description, cm_code, is_active, created_by, created_date, 
          period, is_approved, is_copied
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, sku_code, sku_description, cm_code, period, is_copied, is_approved, created_date
      `;
      
      // Use year_id directly instead of looking up period
      console.log(`📅 Using year_id directly: ${yearId}`);
      
      const values = [
        sku_code,                                // sku_code
        sku_description,                         // sku_description
        cmCode,                                  // cm_code (use from request)
        true,                                    // is_active
        createdBy,                               // created_by
        new Date(),                              // created_date
        yearId,                                  // period (use year_id directly)
        false,                                   // is_approved (always false for new)
        1                                        // is_copied (always true for new)
      ];
      
      console.log(`💾 Inserting new SKU with period: ${yearId} and cm_code: ${cmCode}`);
      const insertResult = await pool.query(insertQuery, values);
      newSkuData = insertResult.rows[0];
    }
    
    console.log(`✅ SKU ${sku_code} processed successfully`);
    console.log(`Final period stored: ${newSkuData.period}`);
    console.log(`Final cm_code stored: ${newSkuData.cm_code}`);
    
    return {
      sku_code,
      action: existingSkuResult.rows.length > 0 ? 'copied' : 'created',
      new_sku_id: newSkuData.id,
      period: newSkuData.period,
      cm_code: newSkuData.cm_code,
      is_copied: newSkuData.is_copied,
      is_approved: newSkuData.is_approved
    };
    
  } catch (error) {
    throw new Error(`Failed to process SKU ${sku_code}: ${error.message}`);
  }
}

/**
 * Process component mappings for all SKUs
 * @param {string} cmCode - CM code
 * @param {string} yearId - New year ID
 * @param {Array} skuData - Array of SKU data
 * @param {string} createdBy - User creating the copy
 * @returns {Promise<Object>} Component mapping results
 */
async function processComponentMappings(cmCode, yearId, skuData, createdBy) {
  const results = {
    total_mappings: 0,
    copied_mappings: 0,
    errors: []
  };
  
  try {
    for (const sku of skuData) {
      try {
        // Check if component mapping exists for this SKU + CM combination
        const existingMappingQuery = `
          SELECT id, cm_code, sku_code, component_code, version, component_packaging_type_id, 
                 period_id, component_valid_from, component_valid_to, created_by, created_at, 
                 updated_at, is_active
          FROM public.sdp_sku_component_mapping_details
          WHERE sku_code = $1 AND cm_code = $2 AND is_active = true
        `;
        
        const existingMappingResult = await pool.query(existingMappingQuery, [sku.sku_code, cmCode]);
        
        if (existingMappingResult.rows.length > 0) {
          // Copy existing component mappings with new period_id
          for (const mapping of existingMappingResult.rows) {
            const insertMappingQuery = `
              INSERT INTO public.sdp_sku_component_mapping_details (
                cm_code, sku_code, component_code, version, component_packaging_type_id,
                period_id, component_valid_from, component_valid_to, created_by, created_at,
                updated_at, is_active
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
              RETURNING id, cm_code, sku_code, component_code, period_id
            `;
            
            const mappingValues = [
              mapping.cm_code,                    // cm_code
              mapping.sku_code,                   // sku_code
              mapping.component_code,             // component_code
              mapping.version,                    // version
              mapping.component_packaging_type_id, // component_packaging_type_id
              yearId,                             // period_id (new year)
              mapping.component_valid_from,       // component_valid_from
              mapping.component_valid_to,         // component_valid_to
              createdBy,                          // created_by
              new Date(),                         // created_at
              new Date(),                         // updated_at
              true                                // is_active
            ];
            
            await pool.query(insertMappingQuery, mappingValues);
            results.copied_mappings++;
          }
        }
        
        results.total_mappings += existingMappingResult.rows.length;
        
      } catch (error) {
        results.errors.push({
          sku_code: sku.sku_code,
          error: error.message
        });
      }
    }
    
    return results;
    
  } catch (error) {
    throw new Error(`Failed to process component mappings: ${error.message}`);
  }
}

/**
 * Get copy history for a specific SKU
 * @param {string} skuCode - The SKU code to get copy history for
 * @returns {Promise<Array>} Array of copy history records
 */
async function getSkuCopyHistory(skuCode) {
  try {
    const query = `
      SELECT id, sku_code, created_by, created_date, sku_description, cm_code, period, is_copied, is_approved
      FROM public.sdp_skudetails
      WHERE sku_code = $1
      ORDER BY created_date DESC
    `;
    
    const result = await pool.query(query, [skuCode]);
    return result.rows;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  copySkuWithNewLogic,
  getSkuCopyHistory
};
