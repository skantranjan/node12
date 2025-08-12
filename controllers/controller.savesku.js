const { saveSku } = require('../models/model.saveSku');

/**
 * Controller to handle saving SKU data
 */
async function saveSkuController(request, reply) {
  try {
    const skuData = request.body;
    const savedSku = await saveSku(skuData);
    reply.code(201).send({ success: true, data: savedSku });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ success: false, message: 'Failed to save SKU', error: error.message });
  }
}

module.exports = { saveSkuController }; 