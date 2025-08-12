const { getSignoffDetailsByCmController } = require('../controllers/controller.getSignoffDetailsByCm');
const bearerTokenMiddleware = require('../middleware/middleware.bearer');

async function getSignoffDetailsByCmRoutes(fastify, options) {
  // Protected route - requires Bearer token
  fastify.get('/signoff-details-by-cm', {
    preHandler: bearerTokenMiddleware
  }, getSignoffDetailsByCmController);
}

module.exports = getSignoffDetailsByCmRoutes; 