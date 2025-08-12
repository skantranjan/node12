const pool = require('../config/db.config');

/**
 * Get SKU details by period and cm_code, then get all active components for those SKUs
 */
async function getComponentDetailsByPeriodAndCm(period, cm_code) {
  // First, get SKU details
  const skuQuery = `
    SELECT DISTINCT 
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
      sd.dual_source_sku
    FROM sdp_skudetails sd
    WHERE sd.period = $1 AND sd.cm_code = $2 AND sd.is_active = true
    ORDER BY sd.id DESC
  `;

  const skuResult = await pool.query(skuQuery, [period, cm_code]);
  const skuDetails = skuResult.rows;

  // For each SKU, get all active components
  const finalResult = [];
  
  for (const sku of skuDetails) {
    const componentQuery = `
      SELECT 
        cd.id as component_id,
        cd.sku_code,
        cd.formulation_reference,
        cd.material_type_id,
        cd.components_reference,
        cd.component_code,
        cd.component_description,
        cd.component_valid_from,
        cd.component_valid_to,
        cd.component_material_group,
        cd.component_quantity,
        cd.component_uom_id,
        cd.component_base_quantity,
        cd.component_base_uom_id,
        cd.percent_w_w,
        cd.evidence,
        cd.component_packaging_type_id,
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
        cd.is_active,
        cd.created_by,
        cd.created_date,
        cd.year,
        cd.component_unit_weight_id,
        cd.cm_code,
        cd.periods
      FROM sdp_component_details cd
      WHERE cd.sku_code = $1 AND cd.cm_code = $2 AND cd.is_active = true
      ORDER BY cd.id DESC
    `;

    const componentResult = await pool.query(componentQuery, [sku.sku_code, sku.cm_code]);
    const components = componentResult.rows;

    finalResult.push({
      sku_details: sku,
      components: components
    });
  }

  return finalResult;
}

module.exports = { getComponentDetailsByPeriodAndCm }; 