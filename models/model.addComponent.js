const pool = require('../config/db.config');

/**
 * Check for duplicate component_code across both tables
 * @param {string} componentCode - The component code to check
 * @returns {Promise<Object>} Object with duplicate info and table details
 */
async function checkDuplicateComponentCode(componentCode) {
  try {
    console.log(`🔍 Checking for duplicate component_code: ${componentCode}`);
    
    // Check in sdp_component_details table
    const componentDetailsQuery = `
      SELECT id, cm_code, sku_code, component_code, component_description, 
             component_valid_from, component_valid_to, is_active
      FROM sdp_component_details 
      WHERE component_code = $1 AND is_active = true
    `;
    
    console.log('📋 Executing query on sdp_component_details table...');
    const componentDetailsResult = await pool.query(componentDetailsQuery, [componentCode]);
    console.log(`✅ sdp_component_details query successful. Found ${componentDetailsResult.rows.length} records.`);
    
    // Check in sdp_sku_component_mapping_details table
    // Note: This table doesn't have component_description column
    const mappingDetailsQuery = `
      SELECT id, cm_code, sku_code, component_code, version, component_packaging_type_id, 
             period_id, component_valid_from, component_valid_to, created_by, created_at, 
             updated_at, is_active
      FROM sdp_sku_component_mapping_details 
      WHERE component_code = $1 AND is_active = true
    `;
    
    console.log('📋 Executing query on sdp_sku_component_mapping_details table...');
    const mappingDetailsResult = await pool.query(mappingDetailsQuery, [componentCode]);
    console.log(`✅ sdp_sku_component_mapping_details query successful. Found ${mappingDetailsResult.rows.length} records.`);
    
    const duplicates = [];
    
    // Check component_details table
    if (componentDetailsResult.rows.length > 0) {
      console.log('📋 Processing duplicates from sdp_component_details...');
      componentDetailsResult.rows.forEach((row, index) => {
        console.log(`  Record ${index + 1}: ID=${row.id}, CM=${row.cm_code}, SKU=${row.sku_code}`);
        duplicates.push({
          table: 'sdp_component_details',
          id: row.id,
          cm_code: row.cm_code,
          sku_code: row.sku_code,
          component_code: row.component_code,
          component_description: row.component_description || 'No description',
          component_valid_from: row.component_valid_from,
          component_valid_to: row.component_valid_to
        });
      });
    }
    
    // Check mapping_details table
    if (mappingDetailsResult.rows.length > 0) {
      console.log('📋 Processing duplicates from sdp_sku_component_mapping_details...');
      mappingDetailsResult.rows.forEach((row, index) => {
        console.log(`  Record ${index + 1}: ID=${row.id}, CM=${row.cm_code}, SKU=${row.sku_code}`);
        duplicates.push({
          table: 'sdp_sku_component_mapping_details',
          id: row.id,
          cm_code: row.cm_code,
          sku_code: row.sku_code,
          component_code: row.component_code,
          component_description: 'No description available', // This table doesn't have this column
          component_valid_from: row.component_valid_from,
          component_valid_to: row.component_valid_to,
          version: row.version,
          component_packaging_type_id: row.component_packaging_type_id,
          period_id: row.period_id
        });
      });
    }
    
    console.log(`✅ Duplicate check complete. Found ${duplicates.length} duplicates.`);
    
    return {
      hasDuplicates: duplicates.length > 0,
      duplicates: duplicates,
      count: duplicates.length
    };
    
  } catch (error) {
    console.error('❌ Error in checkDuplicateComponentCode:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
      where: error.where
    });
    throw error; // Re-throw to be handled by the controller
  }
}

/**
 * Check for duplicate component_description in sdp_component_details table
 * @param {string} componentDescription - The component description to check
 * @returns {Promise<Object>} Object with duplicate info and table details
 */
async function checkDuplicateComponentDescription(componentDescription) {
  try {
    console.log(`🔍 Checking for duplicate component_description: "${componentDescription}"`);
    
    // Check in sdp_component_details table for exact match
    const componentDetailsQuery = `
      SELECT id, cm_code, sku_code, component_code, component_description, 
             component_valid_from, component_valid_to, is_active
      FROM sdp_component_details 
      WHERE LOWER(TRIM(component_description)) = LOWER(TRIM($1)) 
        AND is_active = true
    `;
    
    console.log('📋 Executing query on sdp_component_details table for description...');
    const componentDetailsResult = await pool.query(componentDetailsQuery, [componentDescription]);
    console.log(`✅ component_description query successful. Found ${componentDetailsResult.rows.length} records.`);
    
    const duplicates = [];
    
    // Check component_details table
    if (componentDetailsResult.rows.length > 0) {
      console.log('📋 Processing duplicates from sdp_component_details for description...');
      componentDetailsResult.rows.forEach((row, index) => {
        console.log(`  Record ${index + 1}: ID=${row.id}, CM=${row.cm_code}, SKU=${row.sku_code}, Description="${row.component_description}"`);
        duplicates.push({
          table: 'sdp_component_details',
          id: row.id,
          cm_code: row.cm_code,
          sku_code: row.sku_code,
          component_code: row.component_code,
          component_description: row.component_description,
          component_valid_from: row.component_valid_from,
          component_valid_to: row.component_valid_to
        });
      });
    }
    
    console.log(`✅ Description duplicate check complete. Found ${duplicates.length} duplicates.`);
    
    return {
      hasDuplicates: duplicates.length > 0,
      duplicates: duplicates,
      count: duplicates.length
    };
    
  } catch (error) {
    console.error('❌ Error in checkDuplicateComponentDescription:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
      where: error.where
    });
    throw error; // Re-throw to be handled by the controller
  }
}

/**
 * Check for duplicate component records (existing logic)
 * @param {Object} data - The component data to check
 * @returns {Promise<boolean>} True if duplicate exists, false otherwise
 */
async function checkDuplicateComponent(data) {
  const query = `
    SELECT id FROM sdp_component_details 
    WHERE cm_code = $1 
      AND sku_code = $2 
      AND component_code = $3 
      AND component_valid_from = $4 
      AND component_valid_to = $5
      AND is_active = true
  `;
  
  const values = [
    data.cm_code,
    data.sku_code,
    data.component_code,
    data.component_valid_from,
    data.component_valid_to
  ];
  
  const result = await pool.query(query, values);
  return result.rows.length > 0;
}

/**
 * Insert a new component detail record
 */
async function insertComponentDetail(data) {
  const query = `
    INSERT INTO sdp_component_details (
      sku_code, formulation_reference, material_type_id, components_reference, 
      component_code, component_description, component_valid_from, component_valid_to, 
      component_material_group, component_quantity, component_uom_id, component_base_quantity, 
      component_base_uom_id, percent_w_w, evidence, component_packaging_type_id, 
      component_packaging_material, helper_column, component_unit_weight, weight_unit_measure_id, 
      percent_mechanical_pcr_content, percent_mechanical_pir_content, percent_chemical_recycled_content, 
      percent_bio_sourced, material_structure_multimaterials, component_packaging_color_opacity, 
      component_packaging_level_id, component_dimensions, packaging_specification_evidence, 
      evidence_of_recycled_or_bio_source, last_update_date, category_entry_id, data_verification_entry_id, 
      user_id, signed_off_by, signed_off_date, mandatory_fields_completion_status, evidence_provided, 
      document_status, is_active, created_by, created_date, year, component_unit_weight_id, cm_code, periods
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
      $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39,
      $40, $41, $42, $43, $44, $45, $46
    ) RETURNING *
  `;

  const values = [
    data.sku_code || null,
    data.formulation_reference || null,
    data.material_type_id || null,
    data.components_reference || null,
    data.component_code || null,
    data.component_description || null,
    data.component_valid_from || null,
    data.component_valid_to || null,
    data.component_material_group || null,
    data.component_quantity || null,
    data.component_uom_id || null,
    data.component_base_quantity || null,
    data.component_base_uom_id || null,
    data.percent_w_w || null,
    data.evidence || null,
    data.component_packaging_type_id || null,
    data.component_packaging_material || null,
    data.helper_column || null,
    data.component_unit_weight || null,
    data.weight_unit_measure_id || null,
    data.percent_mechanical_pcr_content || null,
    data.percent_mechanical_pir_content || null,
    data.percent_chemical_recycled_content || null,
    data.percent_bio_sourced || null,
    data.material_structure_multimaterials || null,
    data.component_packaging_color_opacity || null,
    data.component_packaging_level_id || null,
    data.component_dimensions || null,
    data.packaging_specification_evidence || null,
    data.evidence_of_recycled_or_bio_source || null,
    data.last_update_date || new Date(),
    data.category_entry_id || null,
    data.data_verification_entry_id || null,
    data.user_id || null,
    data.signed_off_by || null,
    data.signed_off_date || null,
    data.mandatory_fields_completion_status || null,
    data.evidence_provided || null,
    data.document_status || null,
    data.is_active !== undefined ? data.is_active : true,
    data.created_by || null,
    data.created_date || new Date(),
    data.year || null,
    data.component_unit_weight_id || null,
    data.cm_code || null,
    data.periods || null
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

/**
 * Test function to verify table accessibility
 * @returns {Promise<Object>} Test results
 */
async function testTableAccess() {
  try {
    console.log('🧪 Testing table accessibility...');
    
    // Test sdp_component_details table
    const testComponentDetails = await pool.query('SELECT COUNT(*) as count FROM sdp_component_details LIMIT 1');
    console.log(`✅ sdp_component_details accessible. Count: ${testComponentDetails.rows[0].count}`);
    
    // Test sdp_sku_component_mapping_details table
    const testMappingDetails = await pool.query('SELECT COUNT(*) as count FROM sdp_sku_component_mapping_details LIMIT 1');
    console.log(`✅ sdp_sku_component_mapping_details accessible. Count: ${testMappingDetails.rows[0].count}`);
    
    return {
      success: true,
      componentDetailsCount: testComponentDetails.rows[0].count,
      mappingDetailsCount: testMappingDetails.rows[0].count
    };
    
  } catch (error) {
    console.error('❌ Table accessibility test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = { 
  insertComponentDetail,
  checkDuplicateComponent,
  checkDuplicateComponentCode,
  checkDuplicateComponentDescription,
  testTableAccess
}; 