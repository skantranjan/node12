const { getSignoffDetailsByCmAndPeriodController } = require('../controllers/controller.getSignoffDetailsByCmAndPeriod');
const bearerTokenMiddleware = require('../middleware/middleware.bearer');

async function getSignoffDetailsByCmAndPeriodRoutes(fastify, options) {
  // Protected route - requires Bearer token
  fastify.get('/signoff-details-by-cm-period', {
    preHandler: bearerTokenMiddleware
  }, getSignoffDetailsByCmAndPeriodController);
}

module.exports = getSignoffDetailsByCmAndPeriodRoutes; 