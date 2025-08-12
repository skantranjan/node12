const { getComponentDetailsBySku } = require('../models/model.getComponentDetailsBySku');

/**
 * Controller to get component details by SKU code
 */
async function getComponentDetailsBySkuController(request, reply) {
  try {
    const { sku_code } = request.params;
    
    if (!sku_code || sku_code.trim() === '') {
      return reply.code(400).send({ 
        success: false, 
        message: 'SKU code is required' 
      });
    }

    const componentDetails = await getComponentDetailsBySku(sku_code);
    
    reply.code(200).send({ 
      success: true, 
      sku_code: sku_code,
      count: componentDetails.length,
      data: componentDetails 
    });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ 
      success: false, 
      message: 'Failed to fetch component details by SKU code', 
      error: error.message 
    });
  }
}

module.exports = { getComponentDetailsBySkuController }; 