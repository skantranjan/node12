const { getAllMasterComponentUmoController, getMasterComponentUmoByIdController } = require('../controllers/controller.masterComponentUmo');
const bearerTokenMiddleware = require('../middleware/middleware.bearer');

async function masterComponentUmoRoutes(fastify, options) {
  // Protected routes - requires Bearer token
  fastify.get('/master-component-umo', {
    preHandler: bearerTokenMiddleware
  }, getAllMasterComponentUmoController);
  
  fastify.get('/master-component-umo/:id', {
    preHandler: bearerTokenMiddleware
  }, getMasterComponentUmoByIdController);
}

module.exports = masterComponentUmoRoutes; 