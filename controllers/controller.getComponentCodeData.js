const { getComponentCodeData } = require('../models/model.getComponentCodeData');

/**
 * Controller to get component details by component_code and their associated evidence
 */
async function getComponentCodeDataController(request, reply) {
  try {
    console.log('🔍 ===== GET COMPONENT CODE DATA API =====');
    
    const { component_code } = request.query;
    
    console.log('📋 Request Parameters:');
    console.log('  - Component Code:', component_code);

    // Validate required parameters
    if (!component_code) {
      return reply.code(400).send({
        success: false,
        message: 'Missing required parameter: component_code'
      });
    }

    // Get component details and evidence by component_code
    console.log('\n📊 === FETCHING DATA FROM DATABASE ===');
    const results = await getComponentCodeData(component_code);
    
    console.log(`✅ Found ${results.length} components with their evidence for component_code: ${component_code}`);

    // Calculate total evidence across all components
    let totalEvidence = 0;
    results.forEach(componentData => {
      totalEvidence += componentData.evidence.length;
    });

    const responseData = {
      success: true,
      message: `Found ${results.length} components with ${totalEvidence} total evidence files for component_code: ${component_code}`,
      data: {
        search_criteria: {
          component_code: component_code
        },
        summary: {
          total_components: results.length,
          total_evidence_files: totalEvidence
        },
        components_with_evidence: results.map(componentData => ({
          component_details: {
            id: componentData.component.id,
            sku_code: componentData.component.sku_code,
            formulation_reference: componentData.component.formulation_reference,
            material_type_id: componentData.component.material_type_id,
            components_reference: componentData.component.components_reference,
            component_code: componentData.component.component_code,
            component_description: componentData.component.component_description,
            component_valid_from: componentData.component.component_valid_from,
            component_valid_to: componentData.component.component_valid_to,
            component_material_group: componentData.component.component_material_group,
            component_quantity: componentData.component.component_quantity,
            component_uom_id: componentData.component.component_uom_id,
            component_base_quantity: componentData.component.component_base_quantity,
            component_base_uom_id: componentData.component.component_base_uom_id,
            percent_w_w: componentData.component.percent_w_w,
            evidence: componentData.component.evidence,
            component_packaging_type_id: componentData.component.component_packaging_type_id,
            component_packaging_material: componentData.component.component_packaging_material,
            helper_column: componentData.component.helper_column,
            component_unit_weight: componentData.component.component_unit_weight,
            weight_unit_measure_id: componentData.component.weight_unit_measure_id,
            percent_mechanical_pcr_content: componentData.component.percent_mechanical_pcr_content,
            percent_mechanical_pir_content: componentData.component.percent_mechanical_pir_content,
            percent_chemical_recycled_content: componentData.component.percent_chemical_recycled_content,
            percent_bio_sourced: componentData.component.percent_bio_sourced,
            material_structure_multimaterials: componentData.component.material_structure_multimaterials,
            component_packaging_color_opacity: componentData.component.component_packaging_color_opacity,
            component_packaging_level_id: componentData.component.component_packaging_level_id,
            component_dimensions: componentData.component.component_dimensions,
            packaging_specification_evidence: componentData.component.packaging_specification_evidence,
            evidence_of_recycled_or_bio_source: componentData.component.evidence_of_recycled_or_bio_source,
            last_update_date: componentData.component.last_update_date,
            category_entry_id: componentData.component.category_entry_id,
            data_verification_entry_id: componentData.component.data_verification_entry_id,
            user_id: componentData.component.user_id,
            signed_off_by: componentData.component.signed_off_by,
            signed_off_date: componentData.component.signed_off_date,
            mandatory_fields_completion_status: componentData.component.mandatory_fields_completion_status,
            evidence_provided: componentData.component.evidence_provided,
            document_status: componentData.component.document_status,
            is_active: componentData.component.is_active,
            created_by: componentData.component.created_by,
            created_date: componentData.component.created_date,
            year: componentData.component.year,
            component_unit_weight_id: componentData.component.component_unit_weight_id,
            cm_code: componentData.component.cm_code,
            periods: componentData.component.periods
          },
          evidence_files: componentData.evidence.map(evidence => ({
            id: evidence.id,
            component_id: evidence.component_id,
            evidence_file_name: evidence.evidence_file_name,
            evidence_file_url: evidence.evidence_file_url,
            category: evidence.category,
            created_by: evidence.created_by,
            created_date: evidence.created_date
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
    console.error('❌ Error in getComponentCodeDataController:', error);
    reply.code(500).send({
      success: false,
      message: 'Failed to fetch component data',
      error: error.message
    });
  }
}

module.exports = { getComponentCodeDataController }; 