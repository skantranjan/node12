const { getSkuDetailsByReferenceController, getSkuDetailsByPeriodAndCmController } = require('../controllers/controller.getSkuReference');
const bearerTokenMiddleware = require('../middleware/middleware.bearer');

async function skuReferenceRoutes(fastify, options) {
  // Protected routes - requires Bearer token
  fastify.get('/sku-reference/:sku_reference', {
    preHandler: bearerTokenMiddleware
  }, getSkuDetailsByReferenceController);
  
  fastify.get('/getskureference/:period/:cm_code', {
    preHandler: bearerTokenMiddleware
  }, getSkuDetailsByPeriodAndCmController);
}

module.exports = skuReferenceRoutes; 