const pool = require('../config/db.config');

/**
 * Fetch all component details by SKU code (handles comma-separated values)
 */
async function getComponentDetailsBySku(sku_code) {
  const query = `
    SELECT id, 
           CASE 
             WHEN sku_code = $1 THEN sku_code
             WHEN sku_code LIKE $2 THEN $1
             WHEN sku_code LIKE $3 THEN $1
             WHEN sku_code LIKE $4 THEN $1
             WHEN $1 = ANY(string_to_array(sku_code, ',')) THEN $1
             ELSE sku_code
           END as sku_code,
           formulation_reference, material_type_id, components_reference, 
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
    WHERE 
      sku_code = $1 OR
      sku_code LIKE $2 OR
      sku_code LIKE $3 OR
      sku_code LIKE $4 OR
      $1 = ANY(string_to_array(sku_code, ','))
    ORDER BY component_code;
  `;
  
  // Create patterns to match the sku_code in comma-separated values
  const patterns = [
    sku_code,                           // exact match
    `${sku_code},%`,                    // sku_code at the beginning
    `%,${sku_code},%`,                  // sku_code in the middle
    `%,${sku_code}`,                    // sku_code at the end
  ];
  
  const result = await pool.query(query, patterns);
  return result.rows;
}

module.exports = { getComponentDetailsBySku }; 