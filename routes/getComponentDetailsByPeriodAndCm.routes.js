const { getComponentDetailsByPeriodAndCmController } = require('../controllers/controller.getComponentDetailsByPeriodAndCm');
const bearerTokenMiddleware = require('../middleware/middleware.bearer');

async function getComponentDetailsByPeriodAndCmRoutes(fastify, options) {
  // Protected route - requires Bearer token
  fastify.get('/component-details-by-period-cm', {
    preHandler: bearerTokenMiddleware
  }, getComponentDetailsByPeriodAndCmController);
}

module.exports = getComponentDetailsByPeriodAndCmRoutes; 