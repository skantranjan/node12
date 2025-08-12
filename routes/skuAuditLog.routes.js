const { insertSkuAuditLogController } = require('../controllers/controller.skuAuditLog');
const bearerTokenMiddleware = require('../middleware/middleware.bearer');

async function skuAuditLogRoutes(fastify, options) {
  // Protected route - requires Bearer token
  fastify.post('/sku-auditlog/add', {
    preHandler: bearerTokenMiddleware
  }, insertSkuAuditLogController);
}

module.exports = skuAuditLogRoutes; 