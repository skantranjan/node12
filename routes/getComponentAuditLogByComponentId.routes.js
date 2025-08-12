const { getComponentAuditLogByComponentIdHandler } = require('../controllers/controller.getComponentAuditLogByComponentId');
const bearerTokenMiddleware = require('../middleware/middleware.bearer');

/**
 * Routes for component audit log by component_id
 */
async function routes(fastify, options) {
  // GET component audit log by component_id - Protected route
  fastify.get('/component-audit-log/:componentId', {
    preHandler: bearerTokenMiddleware,
    schema: {
      params: {
        type: 'object',
        required: ['componentId'],
        properties: {
          componentId: {
            type: 'string',
            description: 'Component ID to fetch audit log for'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  component_id: { type: 'integer' },
                  sku_code: { type: 'string' },
                  component_code: { type: 'string' },
                  component_description: { type: 'string' },
                  created_date: { type: 'string', format: 'date-time' },
                  created_by: { type: 'string' },
                  // Add other fields as needed
                }
              }
            },
            count: { type: 'integer' }
          }
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        },
        404: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'array' }
          }
        },
        500: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            error: { type: 'string' }
          }
        }
      }
    }
  }, getComponentAuditLogByComponentIdHandler);
}

module.exports = routes; 