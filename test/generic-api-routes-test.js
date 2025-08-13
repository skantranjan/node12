const { testGenericAPIController } = require('./generic-api-test');
const bearerTokenMiddleware = require('../middleware/middleware.bearer');

async function genericAPITestRoutes(fastify, options) {
  // Test route for generic API - requires Bearer token
  fastify.post('/test-generic-api', {
    preHandler: bearerTokenMiddleware
  }, testGenericAPIController);

  // Test route for single table data
  fastify.get('/test-table/:tableName', {
    preHandler: bearerTokenMiddleware
  }, async (request, reply) => {
    try {
      const { tableName } = request.params;
      const { limit, offset, orderBy, is_active } = request.query;

      const { getDataFromTableTest } = require('./generic-api-test');
      
      const options = {};
      if (limit) options.limit = parseInt(limit);
      if (offset) options.offset = parseInt(offset);
      if (orderBy) options.orderBy = orderBy;
      if (is_active !== undefined) options.is_active = is_active === 'true';

      const result = await getDataFromTableTest(tableName, options);

      reply.code(200).send({
        success: true,
        message: `Data retrieved from ${tableName}`,
        tableName,
        count: result.length,
        data: result
      });

    } catch (error) {
      reply.code(500).send({
        success: false,
        message: 'Failed to retrieve data',
        error: error.message
      });
    }
  });
}

module.exports = genericAPITestRoutes;
