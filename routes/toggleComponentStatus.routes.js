const { toggleComponentStatusController } = require('../controllers/controller.toggleComponentStatus');
const bearerTokenMiddleware = require('../middleware/middleware.bearer');

async function toggleComponentStatusRoutes(fastify, options) {
  // Protected route - requires Bearer token
  fastify.patch('/component-status-change/:id', {
    preHandler: bearerTokenMiddleware
  }, toggleComponentStatusController);
}

module.exports = toggleComponentStatusRoutes; 