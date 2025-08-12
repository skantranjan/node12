const { saveSkuController } = require('../controllers/controller.savesku');
const bearerTokenMiddleware = require('../middleware/middleware.bearer');

async function skuRoutes(fastify, options) {
  // Protected route - requires Bearer token
  fastify.post('/sku', {
    preHandler: bearerTokenMiddleware
  }, saveSkuController);
}

module.exports = skuRoutes; 