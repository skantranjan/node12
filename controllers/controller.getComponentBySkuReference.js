const { getComponentBySkuReference } = require('../models/model.getComponentBySkuReference');

/**
 * Controller to get component details by CM code and SKU code using two-table approach
 */
async function getComponentBySkuReferenceController(request, reply) {
  try {
    const { cm_code, sku_code } = request.body;
    
    // Validation
    if (!cm_code || cm_code.trim() === '') {
      return reply.code(400).send({ 
        success: false, 
        message: 'CM code is required' 
      });
    }
    
    if (!sku_code || sku_code.trim() === '') {
      return reply.code(400).send({ 
        success: false, 
        message: 'SKU code is required' 
      });
    }
    
    const componentDetails = await getComponentBySkuReference(cm_code, sku_code);
    
    // Always return success with data (empty array if no results found)
    reply.code(200).send({ 
      success: true, 
      count: componentDetails.length,
      cm_code: cm_code,
      sku_code: sku_code,
      message: componentDetails.length > 0 
        ? `Found ${componentDetails.length} component(s) for CM: ${cm_code} and SKU: ${sku_code}`
        : `No components found for CM: ${cm_code} and SKU: ${sku_code}`,
      data: componentDetails,
      mapping_info: {
        total_mappings: componentDetails.length,
        unique_components: [...new Set(componentDetails.map(item => item.component_code))].length
      }
    });
    
  } catch (error) {
    request.log.error('Error in getComponentBySkuReferenceController:', error);
    reply.code(500).send({ 
      success: false, 
      message: 'Failed to fetch component details by SKU reference', 
      error: error.message,
      cm_code: request.body?.cm_code,
      sku_code: request.body?.sku_code
    });
  }
}

module.exports = {
  getComponentBySkuReferenceController
}; 