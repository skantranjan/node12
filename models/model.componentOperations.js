const pool = require('../config/db.config');

/**
 * Get component details by component_code
 * @param {string} componentCode - The component code to search for
 * @returns {Promise<Object|null>} Component details or null if not found
 */
async function getComponentDetailsByCode(componentCode) {
  const query = `
    SELECT id, sku_code, formulation_reference, material_type_id, components_reference, 
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
    FROM public.sdp_component_details 
    WHERE component_code = $1
    LIMIT 1;
  `;
  
  const result = await pool.query(query, [componentCode]);
  return result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * Insert a new component detail
 * @param {Object} componentData - The component data to insert
 * @returns {Promise<Object>} The inserted component record
 */
async function insertComponentDetail(componentData) {
  const query = `
    INSERT INTO public.sdp_component_details (
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
    ) RETURNING *;
  `;

  const values = [
    componentData.sku_code || null,
    componentData.formulation_reference || null,
    componentData.material_type_id || null,
    componentData.components_reference || null,
    componentData.component_code || null,
    componentData.component_description || null,
    componentData.component_valid_from || null,
    componentData.component_valid_to || null,
    componentData.component_material_group || null,
    componentData.component_quantity || null,
    componentData.component_uom_id || null,
    componentData.component_base_quantity || null,
    componentData.component_base_uom_id || null,
    componentData.percent_w_w || null,
    componentData.evidence || null,
    componentData.component_packaging_type_id || null,
    componentData.component_packaging_material || null,
    componentData.helper_column || null,
    componentData.component_unit_weight || null,
    componentData.weight_unit_measure_id || null,
    componentData.percent_mechanical_pcr_content || null,
    componentData.percent_mechanical_pir_content || null,
    componentData.percent_chemical_recycled_content || null,
    componentData.percent_bio_sourced || null,
    componentData.material_structure_multimaterials || null,
    componentData.component_packaging_color_opacity || null,
    componentData.component_packaging_level_id || null,
    componentData.component_dimensions || null,
    componentData.packaging_specification_evidence || null,
    componentData.evidence_of_recycled_or_bio_source || null,
    componentData.last_update_date || new Date(),
    componentData.category_entry_id || null,
    componentData.data_verification_entry_id || null,
    componentData.user_id || null,
    componentData.signed_off_by || null,
    componentData.signed_off_date || null,
    componentData.mandatory_fields_completion_status || null,
    componentData.evidence_provided || null,
    componentData.document_status || null,
    componentData.is_active !== undefined ? componentData.is_active : true,
    componentData.created_by || null,
    componentData.created_date || new Date(),
    componentData.year || null,
    componentData.component_unit_weight_id || null,
    componentData.cm_code || null,
    componentData.periods || null
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

/**
 * Update component SKU code by appending new SKU code to existing comma-separated list
 * @param {string} componentCode - The component code to update
 * @param {string} existingSkuCode - The existing SKU code(s)
 * @param {string} newSkuCode - The new SKU code to append
 * @returns {Promise<Object>} The updated component record
 */
async function updateComponentSkuCode(componentCode, existingSkuCode, newSkuCode) {
  // Check if new SKU code already exists in the comma-separated list
  const existingSkuCodes = existingSkuCode ? existingSkuCode.split(',').map(code => code.trim()) : [];
  
  if (!existingSkuCodes.includes(newSkuCode)) {
    // Append new SKU code to existing list
    const updatedSkuCode = existingSkuCode ? `${existingSkuCode},${newSkuCode}` : newSkuCode;
    
    const query = `
      UPDATE public.sdp_component_details 
      SET sku_code = $1, last_update_date = $2
      WHERE component_code = $3
      RETURNING *;
    `;
    
    const result = await pool.query(query, [updatedSkuCode, new Date(), componentCode]);
    return result.rows[0];
  } else {
    // SKU code already exists, return existing record
    const query = `
      SELECT * FROM public.sdp_component_details 
      WHERE component_code = $1;
    `;
    
    const result = await pool.query(query, [componentCode]);
    return result.rows[0];
  }
}

module.exports = {
  getComponentDetailsByCode,
  insertComponentDetail,
  updateComponentSkuCode
}; 