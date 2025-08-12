const { getAllMasterComponentPackagingMaterialController, getMasterComponentPackagingMaterialByIdController } = require('../controllers/controller.masterComponentPackagingMaterial');
const bearerTokenMiddleware = require('../middleware/middleware.bearer');

async function masterComponentPackagingMaterialRoutes(fastify, options) {
  // Protected routes - requires Bearer token
  fastify.get('/master-component-packaging-material', {
    preHandler: bearerTokenMiddleware
  }, getAllMasterComponentPackagingMaterialController);
  
  fastify.get('/master-component-packaging-material/:id', {
    preHandler: bearerTokenMiddleware
  }, getMasterComponentPackagingMaterialByIdController);
}

module.exports = masterComponentPackagingMaterialRoutes; 