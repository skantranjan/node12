// Load environment variables
require('dotenv').config();
const fastify = require('fastify')({ logger: false });
const skuRoutes = require('./routes/sku.routes');
const cmRoutes = require('./routes/cm.routes');
const skuDetailsRoutes = require('./routes/skuDetails.routes');
const jwtMiddleware = require('./middleware/middleware.jwt');
const pool = require('./config/db.config');
const fastifyCors = require('@fastify/cors');
const fastifyMultipart = require('@fastify/multipart');
const skuAuditLogRoutes = require('./routes/skuAuditLog.routes');
const materialTypeMasterRoutes = require('./routes/materialTypeMaster.routes');
const masterComponentUmoRoutes = require('./routes/masterComponentUmo.routes');
const masterComponentPackagingLevelRoutes = require('./routes/masterComponentPackagingLevel.routes');
const masterComponentPackagingMaterialRoutes = require('./routes/masterComponentPackagingMaterial.routes');
const addComponentRoutes = require('./routes/addComponent.routes');
const componentMasterMaterialTypeRoutes = require('./routes/componentMasterMaterialType.routes');
const getComponentDetailsBySkuRoutes = require('./routes/getComponentDetailsBySku.routes');
const toggleComponentStatusRoutes = require('./routes/toggleComponentStatus.routes');
const addComponentAuditLogRoutes = require('./routes/addComponentAuditLog.routes');
const getComponentAuditLogByComponentIdRoutes = require('./routes/getComponentAuditLogByComponentId.routes');
const getComponentDetailsByYearAndCmRoutes = require('./routes/getComponentDetailsByYearAndCm.routes');
const getSignoffDetailsByCmRoutes = require('./routes/getSignoffDetailsByCm.routes');
const getSignoffDetailsByCmAndPeriodRoutes = require('./routes/getSignoffDetailsByCmAndPeriod.routes');
const getComponentDetailsByPeriodAndCmRoutes = require('./routes/getComponentDetailsByPeriodAndCm.routes');
const getComponentCodeDataRoutes = require('./routes/getComponentCodeData.routes');
const getComponentBySkuReferenceRoutes = require('./routes/getComponentBySkuReference.routes');
const regionMasterRoutes = require('./routes/regionMaster.routes');
const skuReferenceRoutes = require('./routes/skuReference.routes');
const addPmRoutes = require('./routes/addpm.routes');

// Register multipart plugin for file uploads (MUST be registered before routes)
fastify.register(fastifyMultipart, {
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 20 // Maximum 20 files
  },
  attachFieldsToBody: true
});



// Register SKU routes
fastify.register(skuRoutes);

// Register CM routes
fastify.register(cmRoutes);

// Register SKU Details routes
fastify.register(skuDetailsRoutes);

// Register SKU Audit Log routes
fastify.register(skuAuditLogRoutes);

// Register Material Type Master routes
fastify.register(materialTypeMasterRoutes);

// Register Master Component UMO routes
fastify.register(masterComponentUmoRoutes);

// Register Master Component Packaging Level routes
fastify.register(masterComponentPackagingLevelRoutes);

// Register Master Component Packaging Material routes
fastify.register(masterComponentPackagingMaterialRoutes);

// Register Add Component routes
fastify.register(addComponentRoutes);

// Register Component Master Material Type routes
fastify.register(componentMasterMaterialTypeRoutes);

// Register Get Component Details by SKU routes
fastify.register(getComponentDetailsBySkuRoutes);

// Register Toggle Component Status routes
fastify.register(toggleComponentStatusRoutes);

// Register Add Component Audit Log routes
fastify.register(addComponentAuditLogRoutes);

// Register Get Component Audit Log by Component ID routes
fastify.register(getComponentAuditLogByComponentIdRoutes);

// Register Get Component Details by Year and CM routes
fastify.register(getComponentDetailsByYearAndCmRoutes);

// Register Get Signoff Details by CM routes
fastify.register(getSignoffDetailsByCmRoutes);

// Register Get Signoff Details by CM and Period routes
fastify.register(getSignoffDetailsByCmAndPeriodRoutes);

// Register Get Component Details by Period and CM routes
fastify.register(getComponentDetailsByPeriodAndCmRoutes);

// Register Get Component Code Data routes
fastify.register(getComponentCodeDataRoutes);

// Register Get Component By SKU Reference routes
fastify.register(getComponentBySkuReferenceRoutes);

// Register Region Master routes
fastify.register(regionMasterRoutes);

// Register Add PM routes
fastify.register(addPmRoutes);

// Register SKU Reference routes
fastify.register(skuReferenceRoutes);

// Add JWT middleware globally
//fastify.addHook('preHandler', jwtMiddleware);

// Health check endpoint for EIP deployment
fastify.get('/health', async (request, reply) => {
  try {
    // Test database connection
    const dbResult = await pool.query('SELECT NOW()');
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: 'connected',
        timestamp: dbResult.rows[0].now
      },
      azure: {
        account: process.env.AZURE_STORAGE_ACCOUNT || 'not-configured',
        container: process.env.AZURE_CONTAINER_NAME || 'not-configured'
      },
      server: {
        port: process.env.PORT || 3000,
        host: process.env.HOST || '0.0.0.0'
      }
    };
  } catch (error) {
    fastify.log.error('Health check failed:', error);
    return reply.code(503).send({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Test database connection
fastify.get('/db-test', async (request, reply) => {
  try {
    const result = await pool.query('SELECT NOW()');
    return { 
      status: 'Database connected successfully', 
      timestamp: result.rows[0].now 
    };
  } catch (error) {
    fastify.log.error('Database connection failed:', error);
    return reply.code(500).send({ 
      status: 'Database connection failed', 
      error: error.message 
    });
  }
});

// Start server
const start = async () => {
  try {
    // Test database connection on startup
    await pool.query('SELECT NOW()');
    fastify.log.info('Database connected successfully');
    
    fastify.register(fastifyCors, {
      origin: ['http://localhost:5000'],
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS']
    });
    
    await fastify.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' });
    fastify.log.info(`Server running on port ${process.env.PORT || 3000}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start(); 