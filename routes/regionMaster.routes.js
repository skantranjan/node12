const { 
  getAllRegionsController,
  getRegionByIdController,
  createRegionController,
  updateRegionController,
  deleteRegionController
} = require('../controllers/controller.regionMaster');
const bearerTokenMiddleware = require('../middleware/middleware.bearer');

async function regionMasterRoutes(fastify, options) {
  // Protected routes - requires Bearer token
  
  // Get all regions
  fastify.get('/regions', {
    preHandler: bearerTokenMiddleware
  }, getAllRegionsController);
  
  // Get region by ID
  fastify.get('/regions/:id', {
    preHandler: bearerTokenMiddleware
  }, getRegionByIdController);
  
  // Create new region
  fastify.post('/regions', {
    preHandler: bearerTokenMiddleware
  }, createRegionController);
  
  // Update region by ID
  fastify.put('/regions/:id', {
    preHandler: bearerTokenMiddleware
  }, updateRegionController);
  
  // Delete region by ID
  fastify.delete('/regions/:id', {
    preHandler: bearerTokenMiddleware
  }, deleteRegionController);
}

module.exports = regionMasterRoutes; 