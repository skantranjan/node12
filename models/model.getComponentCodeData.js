const pool = require('../config/db.config');

/**
 * Get component details by component_code and their associated evidence
 */
async function getComponentCodeData(component_code) {
  // First, get component details
  const componentQuery = `
    SELECT 
      id, sku_code, formulation_reference, material_type_id, components_reference, 
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
    FROM sdp_component_details 
    WHERE component_code = $1
    ORDER BY id DESC
  `;

  const componentResult = await pool.query(componentQuery, [component_code]);
  const components = componentResult.rows;

  // For each component, get its evidence data
  const finalResult = [];
  
  for (const component of components) {
    const evidenceQuery = `
      SELECT 
        id, component_id, evidence_file_name, evidence_file_url, created_by, created_date, category
      FROM sdp_evidence 
      WHERE component_id = $1
      ORDER BY id DESC
    `;

    const evidenceResult = await pool.query(evidenceQuery, [component.id]);
    const evidence = evidenceResult.rows;

    finalResult.push({
      component: component,
      evidence: evidence
    });
  }

  return finalResult;
}

module.exports = { getComponentCodeData }; 