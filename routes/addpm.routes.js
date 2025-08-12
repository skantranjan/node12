const { 
  addPmController, 
  getAllPmUsersController, 
  getPmUserByIdController, 
  updatePmUserController, 
  deletePmUserController 
} = require('../controllers/controller.addpm');

const bearerTokenMiddleware = require('../middleware/middleware.bearer');

/**
 * Add PM User Routes
 * All routes require Bearer Token authentication
 */

async function addPmRoutes(fastify, options) {
  
  // Add PM User - POST /addpm
  fastify.post('/addpm', {
    preHandler: bearerTokenMiddleware
  }, addPmController);
  
  // Get All PM Users - GET /addpm
  fastify.get('/addpm', {
    preHandler: bearerTokenMiddleware
  }, getAllPmUsersController);
  
  // Get PM User by ID - GET /addpm/{id}
  fastify.get('/addpm/:id', {
    preHandler: bearerTokenMiddleware
  }, getPmUserByIdController);
  
  // Update PM User - PUT /addpm/{id}
  fastify.put('/addpm/:id', {
    preHandler: bearerTokenMiddleware
  }, updatePmUserController);
  
  // Delete PM User - DELETE /addpm/{id}
  fastify.delete('/addpm/:id', {
    preHandler: bearerTokenMiddleware
  }, deletePmUserController);
  
}

module.exports = addPmRoutes; 