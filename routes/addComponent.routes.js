const { addComponentController, testTableAccessController } = require('../controllers/controller.addComponent');
const bearerTokenMiddleware = require('../middleware/middleware.bearer');

async function addComponentRoutes(fastify, options) {
  // Protected route - requires Bearer token
  fastify.post('/add-component', {
    preHandler: bearerTokenMiddleware
  }, addComponentController);
  
  // Test route for debugging table accessibility
  fastify.get('/test-table-access', testTableAccessController);
}

module.exports = addComponentRoutes; 