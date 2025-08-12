const { addComponentAuditLogController } = require('../controllers/controller.addComponentAuditLog');
const bearerTokenMiddleware = require('../middleware/middleware.bearer');

async function addComponentAuditLogRoutes(fastify, options) {
  // Protected route - requires Bearer token
  fastify.post('/add-component-audit-log', {
    preHandler: bearerTokenMiddleware
  }, addComponentAuditLogController);
}

module.exports = addComponentAuditLogRoutes; 