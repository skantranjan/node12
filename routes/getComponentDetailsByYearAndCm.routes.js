const { getComponentDetailsByYearAndCmController } = require('../controllers/controller.getComponentDetailsByYearAndCm');
const bearerTokenMiddleware = require('../middleware/middleware.bearer');

async function getComponentDetailsByYearAndCmRoutes(fastify, options) {
  // Protected route - requires Bearer token
  fastify.get('/component-details-by-year-cm', {
    preHandler: bearerTokenMiddleware
  }, getComponentDetailsByYearAndCmController);
}

module.exports = getComponentDetailsByYearAndCmRoutes; 