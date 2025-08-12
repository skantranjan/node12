const { getComponentDetailsBySkuController } = require('../controllers/controller.getComponentDetailsBySku');
const bearerTokenMiddleware = require('../middleware/middleware.bearer');

async function getComponentDetailsBySkuRoutes(fastify, options) {
  // Protected route - requires Bearer token
  fastify.get('/component-details-by-sku', {
    preHandler: bearerTokenMiddleware
  }, getComponentDetailsBySkuController);
}

module.exports = getComponentDetailsBySkuRoutes; 