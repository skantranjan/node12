const { getComponentDetailsByPeriodAndCm } = require('../models/model.getComponentDetailsByPeriodAndCm');

/**
 * Controller to get SKU details by period and cm_code, then get all active components for those SKUs
 */
async function getComponentDetailsByPeriodAndCmController(request, reply) {
  try {
    console.log('🔍 ===== GET COMPONENT DETAILS BY PERIOD AND CM API =====');
    
    const { period, cm_code } = request.query;
    
    console.log('📋 Request Parameters:');
    console.log('  - Period:', period);
    console.log('  - CM Code:', cm_code);

    // Validate required parameters
    if (!period || !cm_code) {
      return reply.code(400).send({
        success: false,
        message: 'Missing required parameters: period and cm_code'
      });
    }

    // Get SKU details and their components
    console.log('\n📊 === FETCHING DATA FROM DATABASE ===');
    const results = await getComponentDetailsByPeriodAndCm(period, cm_code);
    
    console.log(`✅ Found ${results.length} SKUs with their components`);

    // Calculate total components across all SKUs
    let totalComponents = 0;
    results.forEach(skuData => {
      totalComponents += skuData.components.length;
    });

    const responseData = {
      success: true,
      message: `Found ${results.length} SKUs with ${totalComponents} total active components for period: ${period} and cm_code: ${cm_code}`,
      data: {
        search_criteria: {
          period: period,
          cm_code: cm_code
        },
        summary: {
          total_skus: results.length,
          total_components: totalComponents
        },
        skus_with_components: results.map(skuData => ({
          sku_info: {
            cm_code: skuData.sku_details.cm_code,
            year: skuData.sku_details.period, // Using period as year
            period: skuData.sku_details.period,
            sku_id: skuData.sku_details.sku_id,
            sku_code: skuData.sku_details.sku_code,
            sku_description: skuData.sku_details.sku_description,
            cm_description: skuData.sku_details.cm_description,
            sku_reference: skuData.sku_details.sku_reference,
            purchased_quantity: skuData.sku_details.purchased_quantity,
            sku_reference_check: skuData.sku_details.sku_reference_check,
            formulation_reference: skuData.sku_details.formulation_reference,
            dual_source_sku: skuData.sku_details.dual_source_sku,
            is_active: skuData.sku_details.sku_is_active,
            created_by: skuData.sku_details.sku_created_by,
            created_date: skuData.sku_details.sku_created_date
          },
          active_components: skuData.components.map(component => ({
            component_id: component.component_id,
            sku_code: component.sku_code,
            formulation_reference: component.formulation_reference,
            material_type_id: component.material_type_id,
            components_reference: component.components_reference,
            component_code: component.component_code,
            component_description: component.component_description,
            component_valid_from: component.component_valid_from,
            component_valid_to: component.component_valid_to,
            component_material_group: component.component_material_group,
            component_quantity: component.component_quantity,
            component_uom_id: component.component_uom_id,
            component_base_quantity: component.component_base_quantity,
            component_base_uom_id: component.component_base_uom_id,
            percent_w_w: component.percent_w_w,
            evidence: component.evidence,
            component_packaging_type_id: component.component_packaging_type_id,
            component_packaging_material: component.component_packaging_material,
            helper_column: component.helper_column,
            component_unit_weight: component.component_unit_weight,
            weight_unit_measure_id: component.weight_unit_measure_id,
            percent_mechanical_pcr_content: component.percent_mechanical_pcr_content,
            percent_mechanical_pir_content: component.percent_mechanical_pir_content,
            percent_chemical_recycled_content: component.percent_chemical_recycled_content,
            percent_bio_sourced: component.percent_bio_sourced,
            material_structure_multimaterials: component.material_structure_multimaterials,
            component_packaging_color_opacity: component.component_packaging_color_opacity,
            component_packaging_level_id: component.component_packaging_level_id,
            component_dimensions: component.component_dimensions,
            packaging_specification_evidence: component.packaging_specification_evidence,
            evidence_of_recycled_or_bio_source: component.evidence_of_recycled_or_bio_source,
            last_update_date: component.last_update_date,
            category_entry_id: component.category_entry_id,
            data_verification_entry_id: component.data_verification_entry_id,
            user_id: component.user_id,
            signed_off_by: component.signed_off_by,
            signed_off_date: component.signed_off_date,
            mandatory_fields_completion_status: component.mandatory_fields_completion_status,
            evidence_provided: component.evidence_provided,
            document_status: component.document_status,
            is_active: component.is_active,
            created_by: component.created_by,
            created_date: component.created_date,
            year: component.year,
            component_unit_weight_id: component.component_unit_weight_id,
            cm_code: component.cm_code,
            periods: component.periods
          }))
        }))
      }
    };

    console.log('\n📤 === API RESPONSE ===');
    console.log('Status Code: 200');
    console.log('Response Body:');
    console.log(JSON.stringify(responseData, null, 2));

    reply.code(200).send(responseData);

  } catch (error) {
    console.error('❌ Error in getComponentDetailsByPeriodAndCmController:', error);
    reply.code(500).send({
      success: false,
      message: 'Failed to fetch component details',
      error: error.message
    });
  }
}

module.exports = { getComponentDetailsByPeriodAndCmController }; 