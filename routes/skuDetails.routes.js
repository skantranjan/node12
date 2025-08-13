const { getSkuDetailsByCMCodeController, getAllSkuDetailsController, updateIsActiveStatusController, getActiveYearsController, getAllSkuDescriptionsController, insertSkuDetailController, updateSkuDetailBySkuCodeController, getAllMasterDataController, getConsolidatedDashboardController, toggleUniversalStatusController, testMappingTableStatus, exportExcelController, skuComponentMappingController } = require('../controllers/controller.getSkuDetails');
const bearerTokenMiddleware = require('../middleware/middleware.bearer');

async function skuDetailsRoutes(fastify, options) {
  // Protected routes - requires Bearer token
  fastify.get('/sku-details', {
    preHandler: bearerTokenMiddleware
  }, getAllSkuDetailsController);
  
  fastify.get('/sku-details/:cm_code', {
    preHandler: bearerTokenMiddleware
  }, getSkuDetailsByCMCodeController);
  
  fastify.patch('/sku-details/:id/is-active', {
    preHandler: bearerTokenMiddleware
  }, updateIsActiveStatusController);
  
  fastify.get('/sku-details-active-years', {
    preHandler: bearerTokenMiddleware
  }, getActiveYearsController);
  
  fastify.get('/sku-descriptions', {
    preHandler: bearerTokenMiddleware
  }, getAllSkuDescriptionsController);
  
  fastify.post('/sku-details/add', {
    preHandler: bearerTokenMiddleware
  }, insertSkuDetailController);
  
  fastify.put('/sku-details/update/:sku_code', {
    preHandler: bearerTokenMiddleware
  }, updateSkuDetailBySkuCodeController);
  
  // Master Data API - Get all master data in one call
  fastify.get('/get-masterdata', {
    preHandler: bearerTokenMiddleware
  }, getAllMasterDataController);

  // Consolidated Dashboard API - Get multiple data types in one call
  fastify.get('/cm-dashboard/:cmCode', {
    preHandler: bearerTokenMiddleware
  }, getConsolidatedDashboardController);

  // Universal Status Toggle API - Handle both SKU and Component status changes
  fastify.patch('/toggle-status', {
    preHandler: bearerTokenMiddleware
  }, toggleUniversalStatusController);

  // Test endpoint to check mapping table status
  fastify.get('/test-mapping-table', {
    preHandler: bearerTokenMiddleware
  }, testMappingTableStatus);

  // Export Excel API
  fastify.post('/export-excel', {
    preHandler: bearerTokenMiddleware
  }, exportExcelController);

  // SKU Component Mapping API - Get mapping data between SKU and components
  fastify.post('/sku-component-mapping', {
    preHandler: bearerTokenMiddleware
  }, skuComponentMappingController);
}

module.exports = skuDetailsRoutes; 