const { getAllCMCodesController, getCMCodeByCodeController, toggleCMCodeActiveStatusController } = require('../controllers/controller.getcmcodes');
const bearerTokenMiddleware = require('../middleware/middleware.bearer');

async function cmRoutes(fastify, options) {
  // Protected routes - requires Bearer token
  fastify.get('/cm-codes', {
    preHandler: bearerTokenMiddleware
  }, getAllCMCodesController);
  
  fastify.get('/cm-codes/:cm_code', {
    preHandler: bearerTokenMiddleware
  }, getCMCodeByCodeController);
  
  fastify.patch('/cm-codes/:id/toggle-active', {
    preHandler: bearerTokenMiddleware
  }, toggleCMCodeActiveStatusController);
}

module.exports = cmRoutes; 