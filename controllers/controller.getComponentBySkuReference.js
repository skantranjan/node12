const { getComponentBySkuReference } = require('../models/model.getComponentBySkuReference');

/**
 * Controller to get component details by CM code and SKU code (handles comma-separated values)
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
    
    if (componentDetails.length === 0) {
      return reply.code(404).send({ 
        success: false, 
        message: 'No active component details found for the given CM code and SKU code',
        cm_code: cm_code,
        sku_code: sku_code
      });
    }
    
    reply.code(200).send({ 
      success: true, 
      count: componentDetails.length,
      cm_code: cm_code,
      sku_code: sku_code,
      data: componentDetails 
    });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ 
      success: false, 
      message: 'Failed to fetch component details by SKU reference', 
      error: error.message 
    });
  }
}

module.exports = {
  getComponentBySkuReferenceController
}; 