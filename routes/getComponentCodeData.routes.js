const { getComponentCodeDataController } = require('../controllers/controller.getComponentCodeData');
const bearerTokenMiddleware = require('../middleware/middleware.bearer');

async function getComponentCodeDataRoutes(fastify, options) {
  // Protected route - requires Bearer token
  fastify.get('/component-code-data', {
    preHandler: bearerTokenMiddleware
  }, getComponentCodeDataController);
}

module.exports = getComponentCodeDataRoutes; 