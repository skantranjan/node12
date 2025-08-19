const pool = require('../config/db.config');

/**
 * Check if component_code exists in sdp_component_details table
 * @param {string} componentCode - The component code to check
 * @returns {Promise<Object|null>} Component data if exists, null if not
 */
async function checkComponentCodeExists(componentCode) {
  try {
    const query = 'SELECT id, component_code FROM sdp_component_details WHERE component_code = $1 AND is_active = true';
    const result = await pool.query(query, [componentCode]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Error checking component code: ${error.message}`);
  }
}

/**
 * Check if mapping already exists in sdp_sku_component_mapping_details table
 * @param {Object} data - Mapping data to check
 * @returns {Promise<Object|null>} Existing mapping if found, null if not
 */
async function checkMappingExists(data) {
  try {
    const query = `
      SELECT * FROM sdp_sku_component_mapping_details 
      WHERE cm_code = $1 AND sku_code = $2 AND component_code = $3 AND version = $4 AND period_id = $5
    `;
    const result = await pool.query(query, [data.cm_code, data.sku_code, data.component_code, data.version, data.period_id]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Error checking mapping: ${error.message}`);
  }
}

/**
 * Insert component detail into sdp_component_details table
 * @param {Object} data - Component data from UI form
 * @returns {Promise<Object>} Inserted component record
 */
async function insertComponentDetail(data) {
  try {
    const columns = [
      'sku_code', 'formulation_reference', 'material_type_id', 'components_reference', 'component_code',
      'component_description', 'component_valid_from', 'component_valid_to', 'component_material_group',
      'component_quantity', 'component_uom_id', 'component_base_quantity', 'component_base_uom_id',
      'percent_w_w', 'evidence', 'component_packaging_type_id', 'component_packaging_material',
      'helper_column', 'component_unit_weight', 'weight_unit_measure_id', 'percent_mechanical_pcr_content',
      'percent_mechanical_pir_content', 'percent_chemical_recycled_content', 'percent_bio_sourced',
      'material_structure_multimaterials', 'component_packaging_color_opacity', 'component_packaging_level_id',
      'component_dimensions', 'packaging_specification_evidence', 'evidence_of_recycled_or_bio_source',
      'last_update_date', 'category_entry_id', 'data_verification_entry_id', 'user_id', 'signed_off_by',
      'signed_off_date', 'mandatory_fields_completion_status', 'evidence_provided', 'document_status',
      'is_active', 'created_by', 'created_date', 'year', 'component_unit_weight_id', 'cm_code', 'periods'
    ];
    
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
    const query = `INSERT INTO sdp_component_details (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    
    const values = [
      data.sku_code, data.formulation_reference, data.material_type_id, data.components_reference,
      data.component_code, data.component_description, data.component_valid_from, data.component_valid_to,
      data.component_material_group, data.component_quantity, data.component_uom_id, data.component_base_quantity,
      data.component_base_uom_id, data.percent_w_w, data.evidence, data.component_packaging_type_id,
      data.component_packaging_material, data.helper_column, data.component_unit_weight, data.weight_unit_measure_id,
      data.percent_mechanical_pcr_content, data.percent_mechanical_pir_content, data.percent_chemical_recycled_content,
      data.percent_bio_sourced, data.material_structure_multimaterials, data.component_packaging_color_opacity,
      data.component_packaging_level_id, data.component_dimensions, data.packaging_specification_evidence,
      data.evidence_of_recycled_or_bio_source, data.last_update_date, data.category_entry_id,
      data.data_verification_entry_id, data.user_id, data.signed_off_by, data.signed_off_date,
      data.mandatory_fields_completion_status, data.evidence_provided, data.document_status, data.is_active,
      data.created_by, data.created_date, data.year, data.component_unit_weight_id, data.cm_code, data.periods
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error inserting component detail: ${error.message}`);
  }
}

/**
 * Insert component mapping into sdp_sku_component_mapping_details table
 * @param {Object} data - Mapping data
 * @returns {Promise<Object>} Inserted mapping record
 */
async function insertComponentMapping(data) {
  try {
    const result = await checkMappingExists(data);
    if (result) {
      return result; // Return existing mapping
    }
    
    const query = `
      INSERT INTO sdp_sku_component_mapping_details 
      (cm_code, sku_code, component_code, version, component_packaging_type_id, period_id, 
       component_valid_from, component_valid_to, created_by, is_active) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *
    `;
    
    const values = [
      data.cm_code, data.sku_code, data.component_code, data.version, data.component_packaging_type_id,
      data.period_id, data.component_valid_from, data.component_valid_to, data.created_by, data.is_active
    ];
    
    const insertResult = await pool.query(query, values);
    return insertResult.rows[0];
  } catch (error) {
    throw new Error(`Error inserting component mapping: ${error.message}`);
  }
}

/**
 * Insert audit log into sdp_component_details_auditlog table
 * @param {Object} data - Audit data including component_id
 * @returns {Promise<Object>} Inserted audit record
 */
async function insertComponentAuditLog(data) {
  try {
    const columns = [
      'component_id', 'sku_code', 'formulation_reference', 'material_type_id', 'components_reference',
      'component_code', 'component_description', 'component_valid_from', 'component_valid_to',
      'component_material_group', 'component_quantity', 'component_uom_id', 'component_base_quantity',
      'component_base_uom_id', 'percent_w_w', 'evidence', 'component_packaging_type_id',
      'component_packaging_material', 'helper_column', 'component_unit_weight', 'weight_unit_measure_id',
      'percent_mechanical_pcr_content', 'percent_mechanical_pir_content', 'percent_chemical_recycled_content',
      'percent_bio_sourced', 'material_structure_multimaterials', 'component_packaging_color_opacity',
      'component_packaging_level_id', 'component_dimensions', 'packaging_specification_evidence',
      'evidence_of_recycled_or_bio_source', 'last_update_date', 'category_entry_id',
      'data_verification_entry_id', 'user_id', 'signed_off_by', 'signed_off_date',
      'mandatory_fields_completion_status', 'evidence_provided', 'document_status', 'is_active',
      'created_by', 'created_date', 'year', 'component_unit_weight_id', 'cm_code', 'periods'
    ];
    
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
    const query = `INSERT INTO sdp_component_details_auditlog (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    
    const values = [
      data.component_id, data.sku_code, data.formulation_reference, data.material_type_id, data.components_reference,
      data.component_code, data.component_description, data.component_valid_from, data.component_valid_to,
      data.component_material_group, data.component_quantity, data.component_uom_id, data.component_base_quantity,
      data.component_base_uom_id, data.percent_w_w, data.evidence, data.component_packaging_type_id,
      data.component_packaging_material, data.helper_column, data.component_unit_weight, data.weight_unit_measure_id,
      data.percent_mechanical_pcr_content, data.percent_mechanical_pir_content, data.percent_chemical_recycled_content,
      data.percent_bio_sourced, data.material_structure_multimaterials, data.component_packaging_color_opacity,
      data.component_packaging_level_id, data.component_dimensions, data.packaging_specification_evidence,
      data.evidence_of_recycled_or_bio_source, data.last_update_date, data.category_entry_id,
      data.data_verification_entry_id, data.user_id, data.signed_off_by, data.signed_off_date,
      data.mandatory_fields_completion_status, data.evidence_provided, data.document_status, data.is_active,
      data.created_by, data.created_date, data.year, data.component_unit_weight_id, data.cm_code, data.periods
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error inserting audit log: ${error.message}`);
  }
}

async function insertEvidenceFile(data) {
  try {
    const query = `
      INSERT INTO sdp_evidence 
      (component_id, evidence_file_name, evidence_file_url, created_by, created_date, category) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *
    `;
    
    const values = [
      data.component_id,
      data.evidence_file_name,
      data.evidence_file_url,
      data.created_by,
      data.created_date,
      data.category
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error inserting evidence file: ${error.message}`);
  }
}

/**
 * Safe JSON stringify function to handle circular references
 */
function safeStringify(obj) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (error) {
    if (error.message.includes('circular')) {
      // Handle circular references by creating a clean copy
      const cleanObj = {};
      Object.keys(obj).forEach(key => {
        try {
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            // For complex objects, just show the keys
            cleanObj[key] = `[Object with keys: ${Object.keys(obj[key]).join(', ')}]`;
          } else {
            cleanObj[key] = obj[key];
          }
        } catch (e) {
          cleanObj[key] = '[Circular Reference]';
          }
      });
      return JSON.stringify(cleanObj, null, 2);
    }
    return `[Error serializing: ${error.message}]`;
  }
}

module.exports = { 
  checkComponentCodeExists, 
  checkMappingExists, 
  insertComponentDetail, 
  insertComponentMapping, 
  insertComponentAuditLog,
  insertEvidenceFile
};
