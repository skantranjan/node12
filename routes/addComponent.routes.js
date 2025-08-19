const { addComponentController } = require('../controllers/controller.addComponent');
const bearerTokenMiddleware = require('../middleware/middleware.bearer');

async function addComponentRoutes(fastify, options) {
  // Protected route - requires Bearer token
  fastify.post('/add-component', {
    preHandler: bearerTokenMiddleware
  }, addComponentController);
}

module.exports = addComponentRoutes;
