const { getAllComponentMasterMaterialTypeController, getComponentMasterMaterialTypeByIdController } = require('../controllers/controller.componentMasterMaterialType');
const bearerTokenMiddleware = require('../middleware/middleware.bearer');

async function componentMasterMaterialTypeRoutes(fastify, options) {
  // Protected routes - requires Bearer token
  fastify.get('/component-master-material-type', {
    preHandler: bearerTokenMiddleware
  }, getAllComponentMasterMaterialTypeController);
  
  fastify.get('/component-master-material-type/:id', {
    preHandler: bearerTokenMiddleware
  }, getComponentMasterMaterialTypeByIdController);
}

module.exports = componentMasterMaterialTypeRoutes; 