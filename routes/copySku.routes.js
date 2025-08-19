const { copySkuController, getSkuCopyHistoryController } = require('../controllers/controller.copySku');
const bearerTokenMiddleware = require('../middleware/middleware.bearer');

async function copySkuRoutes(fastify, options) {
  // POST /copy-sku - Copy SKUs with new business logic
  fastify.post('/copy-sku', {
    preHandler: bearerTokenMiddleware,
    schema: {
      description: 'Copy SKUs with new business logic for CM and year',
      tags: ['SKU Management'],
      body: {
        type: 'object',
        required: ['cm_code', 'year_id', 'skuData'],
        properties: {
          cm_code: {
            type: 'string',
            description: 'The CM code for the SKUs'
          },
          year_id: {
            type: 'string',
            description: 'The year ID for the new period'
          },
          skuData: {
            type: 'array',
            description: 'Array of SKU data to copy',
            items: {
              type: 'object',
              required: ['sku_code', 'sku_description'],
              properties: {
                sku_code: {
                  type: 'string',
                  description: 'The SKU code'
                },
                sku_description: {
                  type: 'string',
                  description: 'The SKU description'
                }
              }
            }
          },
          created_by: {
            type: 'string',
            description: 'The user creating the copy (optional, defaults to "system.user")'
          }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                cm_code: { type: 'string' },
                year_id: { type: 'string' },
                total_skus: { type: 'number' },
                processed_skus: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      sku_code: { type: 'string' },
                      action: { type: 'string' },
                      new_sku_id: { type: 'number' },
                      period: { type: 'string' },
                      is_copied: { type: 'number' },
                      is_approved: { type: 'boolean' }
                    }
                  }
                },
                errors: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      sku_code: { type: 'string' },
                      error: { type: 'string' }
                    }
                  }
                },
                component_mappings: {
                  type: 'object',
                  properties: {
                    total_mappings: { type: 'number' },
                    copied_mappings: { type: 'number' },
                    errors: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          sku_code: { type: 'string' },
                          error: { type: 'string' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
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
  }, copySkuController);

  // GET /copy-sku/:sku_code/history - Get copy history for a specific SKU
  fastify.get('/copy-sku/:sku_code/history', {
    preHandler: bearerTokenMiddleware,
    schema: {
      description: 'Get copy history for a specific SKU',
      tags: ['SKU Management'],
      params: {
        type: 'object',
        required: ['sku_code'],
        properties: {
          sku_code: {
            type: 'string',
            description: 'The SKU code to get copy history for'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                sku_code: { type: 'string' },
                copy_history: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'number' },
                      sku_code: { type: 'string' },
                      created_by: { type: 'string' },
                      created_date: { type: 'string' },
                      sku_description: { type: 'string' },
                      cm_code: { type: 'string' },
                      period: { type: 'string' },
                      is_copied: { type: 'number' },
                      is_approved: { type: 'boolean' }
                    }
                  }
                },
                total_records: { type: 'number' }
              }
            }
          }
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
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
  }, getSkuCopyHistoryController);
}

module.exports = copySkuRoutes;
