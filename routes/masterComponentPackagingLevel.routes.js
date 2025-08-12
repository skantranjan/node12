const { getAllMasterComponentPackagingLevelController, getMasterComponentPackagingLevelByIdController } = require('../controllers/controller.masterComponentPackagingLevel');
const bearerTokenMiddleware = require('../middleware/middleware.bearer');

async function masterComponentPackagingLevelRoutes(fastify, options) {
  // Protected routes - requires Bearer token
  fastify.get('/master-component-packaging-level', {
    preHandler: bearerTokenMiddleware
  }, getAllMasterComponentPackagingLevelController);
  
  fastify.get('/master-component-packaging-level/:id', {
    preHandler: bearerTokenMiddleware
  }, getMasterComponentPackagingLevelByIdController);
}

module.exports = masterComponentPackagingLevelRoutes; 