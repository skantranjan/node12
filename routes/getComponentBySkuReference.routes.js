const { getComponentBySkuReferenceController } = require('../controllers/controller.getComponentBySkuReference');
const bearerTokenMiddleware = require('../middleware/middleware.bearer');

async function getComponentBySkuReferenceRoutes(fastify, options) {
  // Test endpoint without authentication
  fastify.get('/test-getcomponentbyskureference', async (request, reply) => {
    return { 
      success: true, 
      message: 'Route is working! This is a test endpoint.',
      timestamp: new Date().toISOString()
    };
  });

  // Protected route - requires Bearer token
  fastify.post('/getcomponentbyskureference', {
    preHandler: bearerTokenMiddleware
  }, getComponentBySkuReferenceController);

  // Unprotected route for testing (temporarily)
  fastify.post('/getcomponentbyskureference-test', async (request, reply) => {
    try {
      const { cm_code, sku_code } = request.body;
      
      if (!cm_code || cm_code.trim() === '') {
        return reply.code(400).send({ 
          success: false, 
          message: 'CM code is required' 
        });
      }
      
      if (!sku_code || sku_code.trim() === '') {
        return reply.code(400).send({ 
          success: false, 
          message: 'SKU code is required' 
        });
      }

      return {
        success: true,
        message: 'Test endpoint working!',
        received_data: { cm_code, sku_code },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return reply.code(500).send({
        success: false,
        message: 'Test endpoint error',
        error: error.message
      });
    }
  });
}

module.exports = getComponentBySkuReferenceRoutes; 