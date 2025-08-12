const { getAllMaterialTypeMasterController, getMaterialTypeMasterByIdController } = require('../controllers/controller.materialTypeMaster');
const bearerTokenMiddleware = require('../middleware/middleware.bearer');

async function materialTypeMasterRoutes(fastify, options) {
  // Protected routes - requires Bearer token
  fastify.get('/material-type-master', {
    preHandler: bearerTokenMiddleware
  }, getAllMaterialTypeMasterController);
  
  fastify.get('/material-type-master/:id', {
    preHandler: bearerTokenMiddleware
  }, getMaterialTypeMasterByIdController);
}

module.exports = materialTypeMasterRoutes; 