const { getComponentBySkuReferenceController } = require('../controllers/controller.getComponentBySkuReference');
const bearerTokenMiddleware = require('../middleware/middleware.bearer');

async function getComponentBySkuReferenceRoutes(fastify, options) {
  // Protected route - requires Bearer token
  fastify.post('/getcomponetbyskurefrence', {
    preHandler: bearerTokenMiddleware
  }, getComponentBySkuReferenceController);
}

module.exports = getComponentBySkuReferenceRoutes; 