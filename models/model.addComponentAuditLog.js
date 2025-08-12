const pool = require('../config/db.config');

/**
 * Insert a new component details audit log record
 */
async function insertComponentAuditLog(data) {
  const query = `
    INSERT INTO sdp_component_details_auditlog (
      component_id, sku_code, formulation_reference, material_type_id, 
      components_reference, component_code, component_description, component_valid_from, 
      component_valid_to, component_material_group, component_quantity, component_uom_id, 
      component_base_quantity, component_base_uom_id, percent_w_w, evidence, 
      component_packaging_type_id, component_packaging_material, helper_column, 
      component_unit_weight, weight_unit_measure_id, percent_mechanical_pcr_content, 
      percent_mechanical_pir_content, percent_chemical_recycled_content, percent_bio_sourced, 
      material_structure_multimaterials, component_packaging_color_opacity, 
      component_packaging_level_id, component_dimensions, packaging_specification_evidence, 
      evidence_of_recycled_or_bio_source, last_update_date, category_entry_id, 
      data_verification_entry_id, user_id, signed_off_by, signed_off_date, 
      mandatory_fields_completion_status, evidence_provided, document_status, is_active, 
      created_by, created_date, year, component_unit_weight_id, cm_code, periods
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
      $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39,
      $40, $41, $42, $43, $44, $45, $46, $47
    ) RETURNING *
  `;

  const values = [
    data.component_id || null,
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

module.exports = { insertComponentAuditLog }; 