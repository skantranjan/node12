const { 
  getSkuDetailsByCMCode, 
  getAllSkuDetails, 
  updateIsActiveStatus, 
  getActiveYears, 
  getAllSkuDescriptions, 
  updateSkuDetailBySkuCode, 
  getAllMasterData, 
  getConsolidatedDashboardData, 
  toggleUniversalStatus,
  checkSkuCodeExists
} = require('../models/model.getSkuDetails');

const { 
  insertSkuDetail, 
  insertSkuComponentMapping, 
  checkMappingTableExists,
  getMappingTableStructure,
  checkSkuDescriptionExists,
  getSimilarSkuDescriptions
} = require('../models/model.insertSkuDetail');

const pool = require('../config/db.config');

/**
 * AUDIT LOGGING FUNCTIONS
 * These functions maintain a complete audit trail of all changes
 */

/**
 * Log component mapping deletion to audit log
 */
async function logComponentMappingDeletion(deletedMapping, action, reason, user) {
  try {
    const auditData = {
      cm_code: deletedMapping.cm_code,
      sku_code: deletedMapping.sku_code,
      component_code: deletedMapping.component_code,
      version: deletedMapping.version,
      component_packaging_type_id: deletedMapping.component_packaging_type_id,
      period_id: deletedMapping.period_id,
      component_valid_from: deletedMapping.component_valid_from,
      component_valid_to: deletedMapping.component_valid_to,
      created_by: deletedMapping.created_by,
      action_type: 'DELETE',
      action_reason: reason,
      old_values: JSON.stringify(deletedMapping),
      new_values: null,
      changed_by: user || deletedMapping.created_by || 'system',
      changed_at: new Date(),
      change_summary: `Component mapping deleted: ${reason}`
    };

    const query = `
      INSERT INTO public.sdp_sku_component_mapping_details_auditlog (
        cm_code, sku_code, component_code, version, component_packaging_type_id,
        period_id, component_valid_from, component_valid_to, created_by,
        action_type, action_reason, old_values, new_values, changed_by, 
        changed_at, change_summary
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    `;

    const values = [
      auditData.cm_code, auditData.sku_code, auditData.component_code,
      auditData.version, auditData.component_packaging_type_id, auditData.period_id,
      auditData.component_valid_from, auditData.component_valid_to, auditData.created_by,
      auditData.action_type, auditData.action_reason, auditData.old_values,
      auditData.new_values, auditData.changed_by, auditData.changed_at,
      auditData.change_summary
    ];

    await pool.query(query, values);
    console.log(`✅ Audit log created for DELETE: ${deletedMapping.component_code} - ${reason}`);
  } catch (error) {
    console.error('❌ Error logging component mapping deletion:', error);
    // Don't throw error - audit logging failure shouldn't break main operation
  }
}

/**
 * Log component mapping insertion to audit log
 */
async function logComponentMappingInsertion(insertedMapping, action, reason, user) {
  try {
    const auditData = {
      cm_code: insertedMapping.cm_code,
      sku_code: insertedMapping.sku_code,
      component_code: insertedMapping.component_code,
      version: insertedMapping.version,
      component_packaging_type_id: insertedMapping.component_packaging_type_id,
      period_id: insertedMapping.period_id,
      component_valid_from: insertedMapping.component_valid_from,
      component_valid_to: insertedMapping.component_valid_to,
      created_by: insertedMapping.created_by,
      action_type: 'INSERT',
      action_reason: reason,
      old_values: null,
      new_values: JSON.stringify(insertedMapping),
      changed_by: user || insertedMapping.created_by || 'system',
      changed_at: new Date(),
      change_summary: `Component mapping inserted: ${reason}`
    };

    const query = `
      INSERT INTO public.sdp_sku_component_mapping_details_auditlog (
        cm_code, sku_code, component_code, version, component_packaging_type_id,
        period_id, component_valid_from, component_valid_to, created_by,
        action_type, action_reason, old_values, new_values, changed_by, 
        changed_at, change_summary
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    `;

    const values = [
      auditData.cm_code, auditData.sku_code, auditData.component_code,
      auditData.version, auditData.component_packaging_type_id, auditData.period_id,
      auditData.component_valid_from, auditData.component_valid_to, auditData.created_by,
      auditData.action_type, auditData.action_reason, auditData.old_values,
      auditData.new_values, auditData.changed_by, auditData.changed_at,
      auditData.change_summary
    ];

    await pool.query(query, values);
    console.log(`✅ Audit log created for INSERT: ${insertedMapping.component_code} - ${reason}`);
  } catch (error) {
    console.error('❌ Error logging component mapping insertion:', error);
    // Don't throw error - audit logging failure shouldn't break main operation
  }
}

/**
 * Log SKU detail update to audit log
 */
async function logSkuDetailUpdate(oldData, newData, changedFields, user) {
  try {
    const auditData = {
      cm_code: oldData.cm_code,
      sku_code: oldData.sku_code,
      component_code: null, // SKU updates don't affect component mappings directly
      version: null,
      component_packaging_type_id: null,
      period_id: null,
      component_valid_from: null,
      component_valid_to: null,
      created_by: oldData.created_by,
      action_type: 'UPDATE',
      action_reason: 'SKU_DETAIL_UPDATE',
      old_values: JSON.stringify(oldData),
      new_values: JSON.stringify(newData),
      changed_by: user || 'system',
      changed_at: new Date(),
      change_summary: `SKU details updated: ${changedFields.join(', ')}`
    };

    const query = `
      INSERT INTO public.sdp_sku_component_mapping_details_auditlog (
        cm_code, sku_code, component_code, version, component_packaging_type_id,
        period_id, component_valid_from, component_valid_to, created_by,
        action_type, action_reason, old_values, new_values, changed_by, 
        changed_at, change_summary
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    `;

    const values = [
      auditData.cm_code, auditData.sku_code, auditData.component_code,
      auditData.version, auditData.component_packaging_type_id, auditData.period_id,
      auditData.component_valid_from, auditData.component_valid_to, auditData.created_by,
      auditData.action_type, auditData.action_reason, auditData.old_values,
      auditData.new_values, auditData.changed_by, auditData.changed_at,
      auditData.change_summary
    ];

    await pool.query(query, values);
    console.log(`✅ Audit log created for SKU UPDATE: ${oldData.sku_code} - Fields: ${changedFields.join(', ')}`);
  } catch (error) {
    console.error('❌ Error logging SKU detail update:', error);
    // Don't throw error - audit logging failure shouldn't break main operation
  }
}

/**
 * Log bulk component mapping operations (multiple deletions/insertions)
 */
async function logBulkComponentMappingOperation(operations, action, reason, user) {
  try {
    for (const operation of operations) {
      if (action === 'DELETE') {
        await logComponentMappingDeletion(operation, action, reason, user);
      } else if (action === 'INSERT') {
        await logComponentMappingInsertion(operation, action, reason, user);
      }
    }
    console.log(`✅ Bulk audit logging completed: ${operations.length} ${action} operations - ${reason}`);
  } catch (error) {
    console.error(`❌ Error in bulk audit logging for ${action}:`, error);
  }
}

/**
 * Controller to get SKU details filtered by CM code
 */
async function getSkuDetailsByCMCodeController(request, reply) {
  try {
    const { cm_code } = request.params;
    
    const skuDetails = await getSkuDetailsByCMCode(cm_code);
    
    reply.code(200).send({ 
      success: true, 
      count: skuDetails.length,
      cm_code: cm_code,
      data: skuDetails 
    });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ 
      success: false, 
      message: 'Failed to fetch SKU details', 
      error: error.message 
    });
  }
}

/**
 * Controller to get all SKU details
 */
async function getAllSkuDetailsController(request, reply) {
  try {
    const skuDetails = await getAllSkuDetails();
    
    reply.code(200).send({ 
      success: true, 
      count: skuDetails.length,
      data: skuDetails 
    });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ 
      success: false, 
      message: 'Failed to fetch SKU details', 
      error: error.message 
    });
  }
}

/**
 * Controller to update is_active status for a SKU detail by id
 */
async function updateIsActiveStatusController(request, reply) {
  try {
    const { id } = request.params;
    const { is_active } = request.body;
    if (typeof is_active !== 'boolean') {
      return reply.code(400).send({ success: false, message: 'is_active must be a boolean' });
    }
    const updated = await updateIsActiveStatus(id, is_active);
    if (!updated) {
      return reply.code(404).send({ success: false, message: 'SKU detail not found' });
    }
    reply.code(200).send({ success: true, data: updated });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ success: false, message: 'Failed to update is_active status', error: error.message });
  }
}

/**
 * Controller to get unique active years (period)
 */
async function getActiveYearsController(request, reply) {
  try {
    const years = await getActiveYears();
    reply.code(200).send({ success: true, count: years.length, years });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ success: false, message: 'Failed to fetch years', error: error.message });
  }
}

/**
 * Controller to get all sku_description values with CM code and description
 */
async function getAllSkuDescriptionsController(request, reply) {
  try {
    const descriptions = await getAllSkuDescriptions();
    reply.code(200).send({ success: true, count: descriptions.length, data: descriptions });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ success: false, message: 'Failed to fetch sku descriptions', error: error.message });
  }
}

/**
 * Controller to insert a new SKU detail
 */
async function insertSkuDetailController(request, reply) {
  try {
    const {
      sku_data,
      components // Array of component objects
    } = request.body;

    // Get skutype from query parameter if provided
    const skutype = request.query.skutype;

         // Log the incoming data from UI
     // console.log('=== SKU ADDITION REQUEST DATA ===');
     // console.log('Full Request Body:', JSON.stringify(request.body, null, 2));
     // console.log('SKU Data:', JSON.stringify(sku_data, null, 2));
     // console.log('Components Data:', JSON.stringify(components, null, 2));
     // console.log('SKU Type from query:', skutype);
     // console.log('=== END SKU ADDITION REQUEST DATA ===');

    // Validate required sku_data
    if (!sku_data) {
      return reply.code(400).send({ 
        success: false, 
        message: 'sku_data is required' 
      });
    }

    // Validate required fields in sku_data
    if (!sku_data.sku_code || sku_data.sku_code.trim() === '') {
      return reply.code(400).send({ success: false, message: 'A value is required for SKU code' });
    }
    if (!sku_data.sku_description || sku_data.sku_description.trim() === '') {
      return reply.code(400).send({ success: false, message: 'A value is required for SKU description' });
    }

    // Check if SKU code already exists
    const skuExists = await checkSkuCodeExists(sku_data.sku_code);
    if (skuExists) {
      return reply.code(409).send({ 
        success: false, 
        message: `SKU code '${sku_data.sku_code}' already exists in the system` 
      });
    }

         // Check if SKU description already exists (normalized comparison)
     // console.log('🔍 === CHECKING FOR DUPLICATE SKU DESCRIPTION ===');
     // console.log('Description to check:', sku_data.sku_description);
     
     const descriptionExists = await checkSkuDescriptionExists(sku_data.sku_description);
     if (descriptionExists) {
       // console.log('❌ Duplicate description detected!');
       
       // Get similar descriptions for better error reporting
       const similarDescriptions = await getSimilarSkuDescriptions(sku_data.sku_description);
       // console.log('Similar descriptions found:', similarDescriptions.length);
       
       return reply.code(422).send({ 
         success: false, 
         message: `SKU description already exists in the system`,
         error_type: 'DUPLICATE_DESCRIPTION',
         details: {
           original_description: sku_data.sku_description,
           similar_existing_descriptions: similarDescriptions.map(d => ({
             sku_code: d.sku_code,
             description: d.sku_description
           }))
         }
       });
     } else {
       // console.log('✅ No duplicate description found');
     }

    // Add skutype to sku_data only if provided
    if (skutype) {
      sku_data.skutype = skutype;
    }

    // Insert SKU detail
    const insertedSku = await insertSkuDetail(sku_data);
    
    // Handle component data if provided
    const mappingResults = [];
    
         if (components && Array.isArray(components) && components.length > 0) {
       // console.log('🔍 === PROCESSING COMPONENTS FOR MAPPING ONLY ===');
       // console.log('Components count:', components.length);
       
       for (const component of components) {
         try {
           // Insert into SKU component mapping table only (no component table insertion)
           // console.log('🔍 === MAPPING TABLE INSERTION ATTEMPT ===');
           // console.log('Component:', component.component_code);
           
           const mappingData = {
             cm_code: sku_data.cm_code,
             sku_code: sku_data.sku_code,
             component_code: component.component_code,
             version: component.version || 1,
             component_packaging_type_id: component.component_packaging_type_id,
             period_id: sku_data.period || component.period_id || 2, // Added fallback to integer 2
             component_valid_from: component.component_valid_from,
             component_valid_to: component.component_valid_to,
             created_by: sku_data.created_by || component.created_by || '1'
           };
           
           // console.log('Mapping Data to Insert:', JSON.stringify(mappingData, null, 2));
           // console.log('Calling insertSkuComponentMapping...');
           
                       const insertedMapping = await insertSkuComponentMapping(mappingData);
            
            // console.log('✅ Mapping Inserted Successfully:', insertedMapping);
            
            // Log the insertion to audit log
            await logComponentMappingInsertion(insertedMapping, 'INSERT', 'NEW_SKU_COMPONENT', sku_data.created_by || 'admin');
           
           mappingResults.push({
             component_code: component.component_code,
             mapping_action: 'inserted',
             mapping_id: insertedMapping.id
           });
          
                 } catch (mappingError) {
           console.error('❌ ERROR Inserting into Mapping Table:', mappingError);
           // console.error('Error Stack:', mappingError.stack);
           mappingResults.push({
             component_code: component.component_code,
             mapping_action: 'error',
             error: mappingError.message
           });
         }
      }
    }
    
    // No components = no mapping table entries (removed basic mapping logic)

    reply.code(201).send({ 
      success: true, 
      sku_data: insertedSku,
      mapping_processed: mappingResults.length,
      mapping_results: mappingResults
    });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ success: false, message: 'Failed to insert SKU detail', error: error.message });
  }
}

/**
 * Controller to update a SKU detail by sku_code
 */
async function updateSkuDetailBySkuCodeController(request, reply) {
  // console.log('🔥 UPDATE API CALLED!');
  
  try {
    const { sku_code } = request.params;
    const { 
      sku_description, 
      sku_reference, 
      skutype, 
      site, 
      formulation_reference,
      bulk_expert,
      is_approved,
      components
    } = request.body;
    
         // Console log the data received from UI
     // console.log('=== SKU UPDATE API - DATA FROM UI ===');
     // console.log('SKU Code:', sku_code);
     // console.log('Request Body:', JSON.stringify(request.body, null, 2));
     // console.log('Components:', components);
     // console.log('=== END SKU UPDATE API DATA ===');
    
    // Validation
    if (!sku_code || sku_code.trim() === '') {
      return reply.code(400).send({ success: false, message: 'A value is required for SKU code' });
    }
    
    // Check if at least one field is provided for update
    const updateFields = { sku_description, sku_reference, skutype, site, formulation_reference, bulk_expert, is_approved };
    const hasUpdateData = Object.values(updateFields).some(value => value !== undefined && value !== null);
    
    if (!hasUpdateData && (!components || components.length === 0)) {
      return reply.code(400).send({ 
        success: false, 
        message: 'At least one field must be provided for update (sku_description, sku_reference, skutype, site, formulation_reference, bulk_expert, is_approved) or components array' 
      });
    }
    
    // First, we need to get the existing SKU data to access cm_code
    const existingSkuData = await getExistingSkuData(sku_code);
    if (!existingSkuData) {
      return reply.code(404).send({ 
        success: false, 
        message: 'SKU not found' 
      });
    }
    
    // Update SKU detail
    const data = {};
    if (sku_description !== undefined) data.sku_description = sku_description;
    if (sku_reference !== undefined) data.sku_reference = sku_reference;
    if (skutype !== undefined) data.skutype = skutype;
    if (site !== undefined) data.site = site;
    if (formulation_reference !== undefined) data.formulation_reference = formulation_reference;
    if (bulk_expert !== undefined) data.bulk_expert = bulk_expert;
    if (is_approved !== undefined) data.is_approved = is_approved;
    
    // Get the updated data to compare with old data for audit logging
    const updated = await updateSkuDetailBySkuCode(sku_code, data);
    
    // Log SKU detail changes to audit log
    if (updated && Object.keys(data).length > 0) {
      const changedFields = Object.keys(data).filter(key => 
        existingSkuData[key] !== data[key]
      );
      
      if (changedFields.length > 0) {
        await logSkuDetailUpdate(existingSkuData, updated, changedFields, 'admin');
      }
    }
    
    if (!updated) {
      return reply.code(404).send({ success: false, message: 'SKU detail not found' });
    }
    
    // Handle component mapping updates only if components array is provided
    let componentMappingResults = {};
    
    const cm_code = existingSkuData.cm_code;
    
    if (components && Array.isArray(components)) {
      // Components array provided - handle component mapping updates
      if (skutype === 'internal') {
        // console.log('🔍 === SKU TYPE CHANGED TO INTERNAL ===');
        // console.log('Removing all component mappings for internal SKU');
        
        // DELETE all mappings for internal SKU (no component relationships)
        const deletedMappings = await deleteAllMappingsForCMAndSKU(cm_code, sku_code, 'INTERNAL_SKU_CONVERSION', 'admin');
        
        componentMappingResults = {
          deleted_mappings: deletedMappings,
          inserted_mappings: [],
          action: 'removed_all_mappings_for_internal_sku'
        };
        
      } else if (skutype === 'external') {
        // console.log('🔍 === SKU TYPE CHANGED TO EXTERNAL ===');
        
        if (components.length > 0) {
          // console.log('✅ External SKU with components - DELETE old + INSERT new');
          // console.log('Components count:', components.length);
          
          // External SKU with components - DELETE old + INSERT new
          const deletedMappings = await deleteAllMappingsForCMAndSKU(cm_code, sku_code, 'EXTERNAL_SKU_UPDATE', 'admin');
          const insertedMappings = await insertNewMappingsForCMAndSKU(cm_code, sku_code, components, 'EXTERNAL_SKU_UPDATE', 'admin');
          
          componentMappingResults = {
            deleted_mappings: deletedMappings,
            inserted_mappings: insertedMappings,
            action: 'external_sku_mappings_updated'
          };
          
        } else {
          // console.log('⚠️ External SKU with empty components array - removing all mappings');
          // External SKU with empty components - remove all mappings
          const deletedMappings = await deleteAllMappingsForCMAndSKU(cm_code, sku_code, 'EXTERNAL_SKU_NO_COMPONENTS', 'admin');
          
          componentMappingResults = {
            deleted_mappings: deletedMappings,
            inserted_mappings: [],
            action: 'external_sku_mappings_removed_no_components'
          };
        }
      } else {
        // console.log('🔍 === COMPONENTS ARRAY PROVIDED - SKU INFO + COMPONENT UPDATE ===');
        // Components provided but no SKU type change - update component mappings
        const deletedMappings = await deleteAllMappingsForCMAndSKU(cm_code, sku_code, 'COMPONENT_MAPPING_UPDATE', 'admin');
        const insertedMappings = await insertNewMappingsForCMAndSKU(cm_code, sku_code, components, 'COMPONENT_MAPPING_UPDATE', 'admin');
        
        componentMappingResults = {
          deleted_mappings: deletedMappings,
          inserted_mappings: insertedMappings,
          action: 'component_mappings_updated'
        };
      }
    } else {
      // console.log('🔍 === NO COMPONENTS ARRAY - SKU INFO ONLY UPDATE ===');
      // No components array provided - SKU info only update
      componentMappingResults = {
        deleted_mappings: [],
        inserted_mappings: [],
        action: 'sku_info_only_updated'
      };
    }
    
    reply.code(200).send({ 
      success: true, 
      data: updated,
      component_mapping_updates: componentMappingResults
    });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ success: false, message: 'Failed to update SKU detail', error: error.message });
  }
}



/**
 * Get existing SKU data by SKU code
 */
async function getExistingSkuData(sku_code) {
  try {
    // console.log('🔍 === GETTING EXISTING SKU DATA ===');
    // console.log('SKU Code:', sku_code);
    
    const query = `
      SELECT * FROM public.sdp_skudetails 
      WHERE sku_code = $1
    `;
    
    const result = await pool.query(query, [sku_code]);
    
    if (result.rows.length === 0) {
      // console.log('❌ No SKU found with code:', sku_code);
      return null;
    }
    
    // console.log('✅ Found existing SKU data');
    return result.rows[0];
    
  } catch (error) {
    console.error('❌ Error getting existing SKU data:', error);
    throw error;
  }
}

/**
 * Delete all mapping records for a specific CM code and SKU code combination
 */
async function deleteAllMappingsForCMAndSKU(cm_code, sku_code, reason = 'REPLACED', user = 'system') {
  try {
    // console.log('🗑️ === DELETING ALL MAPPINGS ===');
    // console.log('CM Code:', cm_code);
    // console.log('SKU Code:', sku_code);
    
    // First, get all records that will be deleted for audit logging
    const selectQuery = `
      SELECT * FROM public.sdp_sku_component_mapping_details 
      WHERE cm_code = $1 AND sku_code = $2
    `;
    
    const selectResult = await pool.query(selectQuery, [cm_code, sku_code]);
    const recordsToDelete = selectResult.rows;
    
    if (recordsToDelete.length === 0) {
      return {
        message: `No mapping records found for CM Code: ${cm_code} and SKU Code: ${sku_code}`,
        deleted_count: 0,
        deleted_records: []
      };
    }
    
    // Now delete the records
    const deleteQuery = `
      DELETE FROM public.sdp_sku_component_mapping_details 
      WHERE cm_code = $1 AND sku_code = $2
      RETURNING *
    `;
    
    const result = await pool.query(deleteQuery, [cm_code, sku_code]);
    
    // Log all deletions to audit log
    await logBulkComponentMappingOperation(recordsToDelete, 'DELETE', reason, user);
    
    // console.log('✅ Deleted mappings count:', result.rows.length);
    
    return {
      message: `Deleted all mapping records for CM Code: ${cm_code} and SKU Code: ${sku_code}`,
      deleted_count: result.rows.length,
      deleted_records: result.rows,
      audit_logged: true
    };
  } catch (error) {
    console.error('❌ Error deleting mappings:', error);
    throw error;
  }
}

/**
 * Insert new mapping records for a CM code and SKU code combination
 */
async function insertNewMappingsForCMAndSKU(cm_code, sku_code, components, reason = 'NEW_MAPPING', user = 'system') {
  try {
    // console.log('➕ === INSERTING NEW MAPPINGS ===');
    // console.log('CM Code:', cm_code);
    // console.log('SKU Code:', sku_code);
    // console.log('Components:', components.length);
    
    const insertedMappings = [];
    const successfulInsertions = [];
    
    for (const component of components) {
      try {
                 const mappingData = {
           cm_code: cm_code,
           sku_code: sku_code,
           component_code: component.component_code,
           version: component.version || 1,
           component_packaging_type_id: component.component_packaging_type_id || null,
           period_id: component.period_id || 2, // Changed from '2025-2026' to integer 2
           component_valid_from: component.component_valid_from || null,
           component_valid_to: component.component_valid_to || null,
           created_by: component.created_by || '1'
         };
        
        // console.log('📝 Inserting mapping data:', JSON.stringify(mappingData, null, 2));
        
        // console.log('📝 Attempting to insert mapping with data:', JSON.stringify(mappingData, null, 2));
        
        // Check if insertSkuComponentMapping function exists
        if (typeof insertSkuComponentMapping !== 'function') {
          throw new Error('insertSkuComponentMapping function is not available');
        }
        
        // console.log('🔍 Function exists, calling insertSkuComponentMapping...');
        try {
          const insertedMapping = await insertSkuComponentMapping(mappingData);
          // console.log('✅ Mapping inserted successfully:', insertedMapping);
          
          // Store successful insertion for audit logging
          successfulInsertions.push(insertedMapping);
          
          insertedMappings.push({
            component_code: component.component_code,
            mapping_id: insertedMapping.id,
            status: 'inserted'
          });
          
        } catch (insertError) {
          console.error('❌ ERROR in insertSkuComponentMapping call:', insertError);
          console.error('Error details:', {
            message: insertError.message,
            stack: insertError.stack,
            function: typeof insertSkuComponentMapping
          });
          throw insertError;
        }
        
      } catch (insertError) {
        console.error('❌ ERROR inserting mapping for component:', component.component_code, insertError);
        insertedMappings.push({
          component_code: component.component_code,
          error: insertError.message,
          status: 'failed'
        });
      }
    }
    
    // Log all successful insertions to audit log
    if (successfulInsertions.length > 0) {
      await logBulkComponentMappingOperation(successfulInsertions, 'INSERT', reason, user);
    }
    
    return {
      message: `Inserted new mapping records for CM Code: ${cm_code} and SKU Code: ${sku_code}`,
      inserted_count: insertedMappings.filter(m => m.status === 'inserted').length,
      failed_count: insertedMappings.filter(m => m.status === 'failed').length,
      inserted_mappings: insertedMappings,
      audit_logged: successfulInsertions.length > 0
    };
    
  } catch (error) {
    console.error('❌ Error inserting new mappings:', error);
    throw error;
  }
}

/**
 * Controller to get all master data in one API call
 */
async function getAllMasterDataController(request, reply) {
  try {
    const masterData = await getAllMasterData();
    
    reply.code(200).send({ 
      success: true, 
      message: 'Master data retrieved successfully',
      data: masterData
    });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ 
      success: false, 
      message: 'Failed to fetch master data', 
      error: error.message 
    });
  }
}

/**
 * Controller to get SKU component mapping data
 * Maps between sdp_sku_component_mapping_details and sdp_component_details tables
 */
async function skuComponentMappingController(request, reply) {
  try {
    // console.log('🚀 === SKU COMPONENT MAPPING API CALLED ===');
    // console.log('📅 Timestamp:', new Date().toISOString());
    // console.log('🔗 Request URL:', request.url);
    // console.log('📝 Request Method:', request.method);
    // console.log('🔑 Headers:', JSON.stringify(request.headers, null, 2));
    
    const { cm_code, sku_code } = request.body;
    
    // console.log('📊 === REQUEST BODY DATA ===');
    // console.log('Full Request Body:', JSON.stringify(request.body, null, 2));
    // console.log('Extracted cm_code:', cm_code);
    // console.log('Extracted sku_code:', sku_code);
    // console.log('cm_code type:', typeof cm_code);
    // console.log('sku_code type:', typeof sku_code);
    // console.log('cm_code length:', cm_code ? cm_code.length : 'null/undefined');
    // console.log('sku_code length:', sku_code ? sku_code.length : 'null/undefined');
    
         // Validate required parameters
     if (!cm_code || cm_code.trim() === '') {
       // console.log('❌ VALIDATION FAILED: cm_code is missing or empty');
       return reply.code(400).send({
         success: false,
         message: 'cm_code is required in request body'
       });
     }
     
     if (!sku_code || sku_code.trim() === '') {
       // console.log('❌ VALIDATION FAILED: sku_code is missing or empty');
       return reply.code(400).send({
         success: false,
         message: 'sku_code is required in request body'
       });
     }
     
     // console.log('✅ VALIDATION PASSED: Both cm_code and sku_code are present');
     // console.log('🔍 === STARTING DATABASE QUERIES ===');
     // console.log('Searching for CM Code:', cm_code, 'and SKU Code:', sku_code);
    
         // Step 1: Find mapping records for the specific cm_code + sku_code combination
     // console.log('📋 Step 1: Querying sdp_sku_component_mapping_details table...');
     const mappingRecords = await getMappingRecordsByCMAndSKU(cm_code, sku_code);
     
     // console.log('📊 === MAPPING RECORDS RESULTS ===');
     // console.log('Raw mapping records:', JSON.stringify(mappingRecords, null, 2));
     // console.log('Number of mapping records found:', mappingRecords ? mappingRecords.length : 'null');
     // console.log('Mapping records type:', typeof mappingRecords);
     
     if (!mappingRecords || mappingRecords.length === 0) {
       // console.log('❌ NO MAPPING RECORDS FOUND');
       return reply.code(404).send({
         success: false,
         message: `No mapping records found for CM Code: ${cm_code} and SKU Code: ${sku_code}`
       });
     }
     
     // console.log('✅ Mapping records found:', mappingRecords.length);
     // console.log('📋 Step 2: Extracting component codes from mapping records...');
    
         // Step 2: Extract all component_codes from mapping records
     const componentCodes = mappingRecords.map(record => record.component_code).filter(code => code !== null);
     // console.log('🔍 === COMPONENT CODES EXTRACTION ===');
     // console.log('All component_codes from mapping records:', componentCodes);
     // console.log('Number of component codes:', componentCodes.length);
     // console.log('Component codes type:', typeof componentCodes);
     
     if (componentCodes.length === 0) {
       // console.log('⚠️ WARNING: No component codes found in mapping records');
     }
     
     // console.log('📋 Step 3: Querying sdp_component_details table...');
    
         // Step 3: Get component details from sdp_component_details table
     const componentDetails = await getComponentDetailsByCodes(componentCodes);
     // console.log('📊 === COMPONENT DETAILS RESULTS ===');
     // console.log('Raw component details:', JSON.stringify(componentDetails, null, 2));
     // console.log('Number of component details found:', componentDetails ? componentDetails.length : 'null');
     // console.log('Component details type:', typeof componentDetails);
     
     // console.log('📋 Step 4: Combining mapping data with component details...');
    
         // Step 4: Combine mapping data with component details
     const combinedData = mappingRecords.map(mappingRecord => {
       const componentDetail = componentDetails.find(comp => comp.component_code === mappingRecord.component_code);
       return {
         mapping: mappingRecord,
         component: componentDetail || null
       };
     });
     
     // console.log('🔗 === COMBINED DATA RESULTS ===');
     // console.log('Combined data structure:', JSON.stringify(combinedData, null, 2));
     // console.log('Number of combined records:', combinedData.length);
     
     // console.log('✅ === PREPARING FINAL RESPONSE ===');
    
         const finalResponse = {
       success: true,
       message: 'SKU component mapping data retrieved successfully',
       request: {
         cm_code: cm_code,
         sku_code: sku_code
       },
       summary: {
         mapping_records_count: mappingRecords.length,
         component_details_count: componentDetails.length,
         combined_records_count: combinedData.length
       },
       data: {
         mapping_records: mappingRecords,
         component_details: componentDetails,
         combined_data: combinedData
       }
     };
     
     // console.log('📤 === FINAL RESPONSE ===');
     // console.log('Response status: 200 OK');
     // console.log('Response body:', JSON.stringify(finalResponse, null, 2));
     // console.log('🚀 === API CALL COMPLETED SUCCESSFULLY ===');
    
    reply.code(200).send(finalResponse);
    
     } catch (error) {
     console.error('❌ === ERROR IN SKU COMPONENT MAPPING CONTROLLER ===');
     console.error('Error message:', error.message);
     // console.error('Error stack:', error.stack);
     // console.error('Error type:', error.constructor.name);
     // console.error('Full error object:', JSON.stringify(error, null, 2));
    
    reply.code(500).send({
      success: false,
      message: 'Failed to retrieve SKU component mapping data',
      error: error.message
    });
  }
}

/**
 * Get mapping records by CM code and SKU code
 */
async function getMappingRecordsByCMAndSKU(cm_code, sku_code) {
  try {
    const query = `
      SELECT * FROM public.sdp_sku_component_mapping_details 
      WHERE cm_code = $1 AND sku_code = $2
      ORDER BY component_code ASC, version ASC, component_packaging_type_id ASC
    `;
    
    const result = await pool.query(query, [cm_code, sku_code]);
    return result.rows;
  } catch (error) {
    console.error('Error getting mapping records:', error);
    throw error;
  }
}

/**
 * Get component details by component codes
 */
async function getComponentDetailsByCodes(componentCodes) {
  try {
    if (!componentCodes || componentCodes.length === 0) {
      return [];
    }
    
    const placeholders = componentCodes.map((_, index) => `$${index + 1}`).join(',');
    const query = `
      SELECT * FROM public.sdp_component_details 
      WHERE component_code IN (${placeholders})
      ORDER BY id ASC
    `;
    
    const result = await pool.query(query, componentCodes);
    return result.rows;
  } catch (error) {
    console.error('Error getting component details:', error);
    throw error;
  }
}

/**
 * Controller to get consolidated dashboard data for a CM code
 */
async function getConsolidatedDashboardController(request, reply) {
  try {
    const { cmCode } = request.params;
    const { 
      include = '', 
      period, 
      search, 
      component_id 
    } = request.query;

    // Validate CM code
    if (!cmCode) {
      return reply.code(400).send({
        success: false,
        message: 'CM code is required'
      });
    }

    // Parse include parameter
    const includeArray = include ? include.split(',').map(item => item.trim()) : [];

    // Validate include parameters
    const validIncludes = ['skus', 'descriptions', 'references', 'audit_logs', 'component_data', 'master_data'];
    const invalidIncludes = includeArray.filter(item => !validIncludes.includes(item));
    
    if (invalidIncludes.length > 0) {
      return reply.code(400).send({
        success: false,
        message: `Invalid include parameters: ${invalidIncludes.join(', ')}. Valid options: ${validIncludes.join(', ')}`
      });
    }

    // Get consolidated data
    const dashboardData = await getConsolidatedDashboardData(cmCode, {
      include: includeArray,
      period,
      search,
      component_id
    });

         // Log the request for debugging
     // console.log('=== CONSOLIDATED DASHBOARD REQUEST ===');
     // console.log('CM Code:', cmCode);
     // console.log('Include:', includeArray);
     // console.log('Period:', period);
     // console.log('Search:', search);
     // console.log('Component ID:', component_id);
     // console.log('Data Keys:', Object.keys(dashboardData));
     // console.log('=== END CONSOLIDATED DASHBOARD REQUEST ===');

    reply.code(200).send({
      success: true,
      message: 'Consolidated dashboard data retrieved successfully',
      data: dashboardData
    });

  } catch (error) {
    console.error('Error in consolidated dashboard controller:', error);
    reply.code(500).send({
      success: false,
      message: 'Failed to retrieve consolidated dashboard data',
      error: error.message
    });
  }
}

/**
 * Controller for universal status toggle (SKU and Component)
 */
async function toggleUniversalStatusController(request, reply) {
  try {
    const { type, id, is_active } = request.body;

    // Validate required fields
    if (!type) {
      return reply.code(400).send({
        success: false,
        message: 'Type is required',
        error: 'VALIDATION_ERROR'
      });
    }

    if (!id) {
      return reply.code(400).send({
        success: false,
        message: 'ID is required',
        error: 'VALIDATION_ERROR'
      });
    }

    if (is_active === undefined || is_active === null) {
      return reply.code(400).send({
        success: false,
        message: 'is_active is required',
        error: 'VALIDATION_ERROR'
      });
    }

    // Validate type
    if (!['sku', 'component'].includes(type)) {
      return reply.code(400).send({
        success: false,
        message: `Invalid type provided. Must be 'sku' or 'component'`,
        error: 'VALIDATION_ERROR'
      });
    }

    // Validate id
    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
      return reply.code(400).send({
        success: false,
        message: `Invalid ID: ${id}. Must be a positive integer`,
        error: 'VALIDATION_ERROR'
      });
    }

    // Validate is_active
    if (typeof is_active !== 'boolean') {
      return reply.code(400).send({
        success: false,
        message: `Invalid is_active: ${is_active}. Must be a boolean`,
        error: 'VALIDATION_ERROR'
      });
    }

         // Log the request for debugging
     // console.log('=== UNIVERSAL STATUS TOGGLE REQUEST ===');
     // console.log('Type:', type);
     // console.log('ID:', id);
     // console.log('Is Active:', is_active);
     // console.log('=== END UNIVERSAL STATUS TOGGLE REQUEST ===');
     
     // Perform the status toggle
     const result = await toggleUniversalStatus(type, id, is_active);
     
     // Log the action for audit purposes
     // console.log(`Status change: ${type} ID ${id} set to ${is_active ? 'active' : 'inactive'}`);

    reply.code(200).send({
      success: true,
      message: 'Status updated successfully',
      data: result
    });

  } catch (error) {
    console.error('Error in universal status toggle controller:', error);
    
    // Handle specific error types
    if (error.message.includes('not found')) {
      return reply.code(404).send({
        success: false,
        message: error.message,
        error: 'NOT_FOUND'
      });
    }

    if (error.message.includes('Invalid type') || 
        error.message.includes('Invalid ID') || 
        error.message.includes('Invalid is_active')) {
      return reply.code(400).send({
        success: false,
        message: error.message,
        error: 'VALIDATION_ERROR'
      });
    }

    reply.code(500).send({
      success: false,
      message: 'Failed to update status',
      error: error.message
    });
  }
}

/**
 * Export data to Excel format based on CM code
 */
async function exportExcelController(request, reply) {
  try {
    const { cm_code, reporting_period, sku_code } = request.body;
    
    // console.log('📊 === EXPORT EXCEL REQUEST ===');
    // console.log('CM Code:', cm_code);
    // console.log('Reporting Period:', reporting_period);
    // console.log('SKU Code:', sku_code);
    
    // Validate cm_code (required)
    if (!cm_code || cm_code.trim() === '') {
      return reply.code(400).send({
        success: false,
        message: 'cm_code is required in request body'
      });
    }
    
    // Get comprehensive component data for the CM code with optional filters
    const componentData = await getComponentDataForCMExport(cm_code, reporting_period, sku_code);
    
    // Always return success with data (empty array if no results found)
    reply.code(200).send({
      success: true,
      count: componentData.length,
      cm_code: cm_code,
      filters_applied: {
        reporting_period: reporting_period || null,
        sku_code: sku_code || null
      },
      message: componentData.length > 0 
        ? `Found ${componentData.length} record(s) for CM: ${cm_code}${reporting_period ? ` with period: ${reporting_period}` : ''}${sku_code ? ` for SKU: ${sku_code}` : ''}`
        : `No records found for CM: ${cm_code}${reporting_period ? ` with period: ${reporting_period}` : ''}${sku_code ? ` for SKU: ${sku_code}` : ''}`,
      data: componentData,
      summary: {
        total_records: componentData.length,
        unique_skus: [...new Set(componentData.map(item => item.sku_code))].length,
        skus_with_components: componentData.filter(item => item.mapping_id !== null).length,
        skus_without_components: componentData.filter(item => item.mapping_id === null).length,
        unique_components: [...new Set(componentData.filter(item => item.component_code).map(item => item.component_code))].length,
        active_skus: componentData.filter(item => item.sku_is_active).length,
        active_mappings: componentData.filter(item => item.mapping_is_active).length,
        active_components: componentData.filter(item => item.component_is_active).length
      }
    });
    
  } catch (error) {
    console.error('❌ Error in export-excel controller:', error);
    reply.code(500).send({
      success: false,
      message: 'Failed to fetch component data for Excel export',
      error: error.message,
      cm_code: request.body?.cm_code,
      filters_applied: {
        reporting_period: request.body?.reporting_period || null,
        sku_code: request.body?.sku_code || null
      }
    });
  }
}

/**
 * Get mapping data by CM code
 */
async function getMappingDataByCMCode(cm_code) {
  try {
    const query = `
      SELECT * FROM public.sdp_sku_component_mapping_details 
      WHERE cm_code = $1 
      ORDER BY sku_code ASC, component_code ASC, version ASC
    `;
    
    const result = await pool.query(query, [cm_code]);
    return result.rows;
  } catch (error) {
    console.error('Error getting mapping data:', error);
    return [];
  }
}

/**
 * Test function to check mapping table status
 */
async function testMappingTableStatus(request, reply) {
  try {
    // console.log('🔍 === TESTING MAPPING TABLE STATUS ===');
    
    // Check if table exists
    const tableExists = await checkMappingTableExists();
    // console.log('Table exists:', tableExists);
    
    if (!tableExists) {
      return reply.code(404).send({
        success: false,
        message: 'Table sdp_sku_component_mapping_details does not exist',
        suggestion: 'Please create the table first'
      });
    }
    
    // Get table structure
    const tableStructure = await getMappingTableStructure();
    
    // Try a simple test insert
    let testInsertResult = null;
    try {
              const testData = {
          cm_code: 'TEST_CM',
          sku_code: 'TEST_SKU',
          component_code: 'TEST_COMP',
          version: 1,
          component_packaging_type_id: null,
          period_id: 1, // Changed from 'TEST_PERIOD' to integer 1
          component_valid_from: null,
          component_valid_to: null,
          created_by: 'TEST_USER'
        };
       
       testInsertResult = await insertSkuComponentMapping(testData);
       // console.log('✅ Test insert successful:', testInsertResult);
       
       // Clean up test data
       // Note: You might want to add a delete function for this
       
     } catch (testError) {
       console.error('❌ Test insert failed:', testError);
       testInsertResult = { error: testError.message };
     }
     
     reply.code(200).send({
       success: true,
       table_exists: tableExists,
       table_structure: tableStructure,
       test_insert: testInsertResult,
       message: 'Mapping table status check completed'
     });
     
   } catch (error) {
     console.error('Error in test function:', error);
     reply.code(500).send({
       success: false,
       message: 'Failed to check mapping table status',
       error: error.message
     });
   }
 }

/**
 * Get audit log data for reporting and analysis
 */
async function getAuditLogController(request, reply) {
  try {
    const { 
      cm_code, 
      sku_code, 
      component_code, 
      action_type, 
      action_reason,
      start_date,
      end_date,
      limit = 100,
      offset = 0
    } = request.query;
    
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;
    
    // Build dynamic WHERE clause based on provided filters
    if (cm_code) {
      whereConditions.push(`cm_code = $${paramIndex++}`);
      queryParams.push(cm_code);
    }
    
    if (sku_code) {
      whereConditions.push(`sku_code = $${paramIndex++}`);
      queryParams.push(sku_code);
    }
    
    if (component_code) {
      whereConditions.push(`component_code = $${paramIndex++}`);
      queryParams.push(component_code);
    }
    
    if (action_type) {
      whereConditions.push(`action_type = $${paramIndex++}`);
      queryParams.push(action_type);
    }
    
    if (action_reason) {
      whereConditions.push(`action_reason = $${paramIndex++}`);
      queryParams.push(action_reason);
    }
    
    if (start_date) {
      whereConditions.push(`changed_at >= $${paramIndex++}`);
      queryParams.push(start_date);
    }
    
    if (end_date) {
      whereConditions.push(`changed_at <= $${paramIndex++}`);
      queryParams.push(end_date);
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    const query = `
      SELECT * FROM public.sdp_sku_component_mapping_details_auditlog
      ${whereClause}
      ORDER BY changed_at DESC, cm_code ASC, sku_code ASC, component_code ASC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    
    queryParams.push(limit, offset);
    
    const result = await pool.query(query, queryParams);
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total FROM public.sdp_sku_component_mapping_details_auditlog
      ${whereClause}
    `;
    
    const countResult = await pool.query(countQuery, whereConditions.length > 0 ? queryParams.slice(0, -2) : []);
    const totalCount = parseInt(countResult.rows[0].total);
    
    reply.code(200).send({
      success: true,
      message: 'Audit log data retrieved successfully',
      data: {
        records: result.rows,
        pagination: {
          total: totalCount,
          limit: parseInt(limit),
          offset: parseInt(offset),
          has_more: (parseInt(offset) + parseInt(limit)) < totalCount
        },
        filters_applied: {
          cm_code, sku_code, component_code, action_type, action_reason, start_date, end_date
        }
      }
    });
    
  } catch (error) {
    console.error('Error in audit log controller:', error);
    reply.code(500).send({
      success: false,
      message: 'Failed to retrieve audit log data',
      error: error.message
    });
  }
}

/**
 * Get comprehensive component data for a CM code (for Excel export)
 * Includes ALL SKUs for the CM, with component data when available
 * Uses LEFT JOINs to ensure no SKUs are missed
 * Supports optional filtering by reporting_period and sku_code
 */
async function getComponentDataForCMExport(cmCode, reporting_period, sku_code) {
  try {
    // Build dynamic WHERE conditions
    let whereConditions = [`sd.cm_code = $1`];
    let queryParams = [cmCode];
    let paramIndex = 2;
    
    // Add period filter if provided
    if (reporting_period && reporting_period.trim() !== '') {
      whereConditions.push(`sd.period = $${paramIndex++}`);
      queryParams.push(reporting_period);
    }
    
    // Add SKU filter if provided
    if (sku_code && sku_code.trim() !== '') {
      whereConditions.push(`sd.sku_code = $${paramIndex++}`);
      queryParams.push(sku_code);
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    const query = `
      SELECT 
        -- SKU Details (always present)
        sd.id as sku_id,
        sd.sku_code,
        sd.sku_description,
        sd.cm_code,
        sd.cm_description,
        sd.sku_reference,
        sd.is_active as sku_is_active,
        sd.created_by as sku_created_by,
        sd.created_date as sku_created_date,
        sd.period,
        sd.purchased_quantity,
        sd.sku_reference_check,
        sd.formulation_reference,
        sd.dual_source_sku,
        sd.site,
        sd.skutype,
        sd.bulk_expert,
        
        -- Mapping table data (may be NULL if no components)
        m.id as mapping_id,
        m.version as mapping_version,
        m.component_packaging_type_id as mapping_packaging_type_id,
        m.period_id as mapping_period_id,
        m.component_valid_from as mapping_valid_from,
        m.component_valid_to as mapping_valid_to,
        m.is_active as mapping_is_active,
        m.created_by as mapping_created_by,
        m.created_at as mapping_created_at,
        m.updated_at as mapping_updated_at,
        
        -- Component details data (may be NULL if no components)
        cd.id as component_id,
        cd.component_code,
        cd.formulation_reference as component_formulation_reference,
        cd.material_type_id,
        cd.components_reference,
        cd.component_description,
        cd.component_valid_from as component_valid_from,
        cd.component_valid_to as component_valid_to,
        cd.component_material_group,
        cd.component_quantity,
        cd.component_uom_id,
        cd.component_base_quantity,
        cd.component_base_uom_id,
        cd.percent_w_w,
        cd.evidence,
        cd.component_packaging_type_id as component_packaging_type_id,
        cd.component_packaging_material,
        cd.helper_column,
        cd.component_unit_weight,
        cd.weight_unit_measure_id,
        cd.percent_mechanical_pcr_content,
        cd.percent_mechanical_pir_content,
        cd.percent_chemical_recycled_content,
        cd.percent_bio_sourced,
        cd.material_structure_multimaterials,
        cd.component_packaging_color_opacity,
        cd.component_packaging_level_id,
        cd.component_dimensions,
        cd.packaging_specification_evidence,
        cd.evidence_of_recycled_or_bio_source,
        cd.last_update_date,
        cd.category_entry_id,
        cd.data_verification_entry_id,
        cd.user_id,
        cd.signed_off_by,
        cd.signed_off_date,
        cd.mandatory_fields_completion_status,
        cd.evidence_provided,
        cd.document_status,
        cd.is_active as component_is_active,
        cd.created_by as component_created_by,
        cd.created_date as component_created_date,
        cd.year,
        cd.component_unit_weight_id,
        cd.periods
      FROM public.sdp_skudetails sd
      LEFT JOIN public.sdp_sku_component_mapping_details m 
        ON sd.sku_code = m.sku_code 
        AND sd.cm_code = m.cm_code
      LEFT JOIN public.sdp_component_details cd 
        ON m.component_code = cd.component_code 
        AND cd.is_active = true
      WHERE ${whereClause}
      ORDER BY sd.sku_code ASC, m.component_code ASC NULLS FIRST, m.version ASC NULLS FIRST, 
               m.component_packaging_type_id ASC NULLS FIRST, m.period_id ASC NULLS FIRST, 
               m.component_valid_from ASC NULLS FIRST, m.component_valid_to ASC NULLS FIRST;
    `;
    
    const result = await pool.query(query, queryParams);
    return result.rows;
  } catch (error) {
    console.error('Error in getComponentDataForCMExport:', error);
    throw error;
  }
}

module.exports = {
  getSkuDetailsByCMCodeController,
  getAllSkuDetailsController,
  updateIsActiveStatusController,
  getActiveYearsController,
  getAllSkuDescriptionsController,
  insertSkuDetailController,
  updateSkuDetailBySkuCodeController,
  getAllMasterDataController,
  getConsolidatedDashboardController,
  toggleUniversalStatusController,
  testMappingTableStatus,
  exportExcelController,
  skuComponentMappingController,
  getAuditLogController
}; 