const { copySkuWithNewLogic, getSkuCopyHistory } = require('../models/model.copySku');

/**
 * Controller to handle copying SKU data with new business logic
 */
async function copySkuController(request, reply) {
  try {
    const { cm_code, year_id, skuData, created_by } = request.body;
    
    // Add detailed logging to see exactly what we receive from UI
    console.log('🔍 === INCOMING REQUEST DATA FROM UI ===');
    console.log('Full request body:', JSON.stringify(request.body, null, 2));
    console.log('cm_code:', cm_code, 'Type:', typeof cm_code);
    console.log('year_id:', year_id, 'Type:', typeof year_id);
    console.log('skuData:', skuData, 'Type:', typeof skuData, 'Length:', Array.isArray(skuData) ? skuData.length : 'Not an array');
    console.log('created_by:', created_by, 'Type:', typeof created_by);
    console.log('==========================================');
    
    // Validate required fields (created_by is now optional)
    if (!cm_code || !year_id || !skuData) {
      console.log('❌ Validation failed - missing required fields');
      return reply.code(400).send({
        success: false,
        message: 'cm_code, year_id, and skuData are required fields'
      });
    }
    
    // Set default value for created_by if not provided
    const userCreating = created_by || 'system.user';
    console.log('👤 User creating the copy:', userCreating);
    
    // Validate skuData is an array
    if (!Array.isArray(skuData) || skuData.length === 0) {
      console.log('❌ Validation failed - skuData must be non-empty array');
      return reply.code(400).send({
        success: false,
        message: 'skuData must be a non-empty array'
      });
    }
    
    // Validate each SKU in the array
    for (let i = 0; i < skuData.length; i++) {
      const sku = skuData[i];
      console.log(`📦 SKU ${i + 1}:`, sku);
      if (!sku.sku_code || !sku.sku_description) {
        console.log(`❌ Validation failed - SKU at index ${i} missing required fields`);
        return reply.code(400).send({
          success: false,
          message: `SKU at index ${i} must have both sku_code and sku_description`
        });
      }
    }
    
    // Validate data types
    if (typeof cm_code !== 'string' || typeof year_id !== 'string') {
      console.log('❌ Validation failed - invalid data types');
      return reply.code(400).send({
        success: false,
        message: 'cm_code and year_id must be strings'
      });
    }
    
    if (cm_code.trim() === '' || year_id.trim() === '') {
      console.log('❌ Validation failed - empty fields');
      return reply.code(400).send({
        success: false,
        message: 'cm_code and year_id cannot be empty'
      });
    }
    
    console.log('✅ All validation passed, proceeding with copy operation...');
    
    // Copy the SKUs with new business logic
    const copyResults = await copySkuWithNewLogic(
      {
        cm_code: cm_code.trim(),
        year_id: year_id.trim(),
        skuData: skuData.map(sku => ({
          sku_code: sku.sku_code.trim(),
          sku_description: sku.sku_description.trim()
        }))
      },
      userCreating.trim()
    );
    
    console.log('🎉 Copy operation completed successfully!');
    console.log('Results:', JSON.stringify(copyResults, null, 2));
    
    reply.code(201).send({
      success: true,
      message: `Successfully processed ${copyResults.total_skus} SKUs for CM ${cm_code} with year ${year_id}`,
      data: copyResults
    });
    
  } catch (error) {
    console.error('💥 Copy SKU error:', error);
    request.log.error('Copy SKU error:', error);
    
    reply.code(500).send({
      success: false,
      message: 'Failed to copy SKUs',
      error: error.message
    });
  }
}

/**
 * Controller to get SKU copy history
 */
async function getSkuCopyHistoryController(request, reply) {
  try {
    const { sku_code } = request.params;
    
    if (!sku_code) {
      return reply.code(400).send({
        success: false,
        message: 'sku_code parameter is required'
      });
    }
    
    const copyHistory = await getSkuCopyHistory(sku_code);
    
    reply.code(200).send({
      success: true,
      data: {
        sku_code,
        copy_history: copyHistory,
        total_records: copyHistory.length
      }
    });
    
  } catch (error) {
    request.log.error('Get SKU copy history error:', error);
    
    reply.code(500).send({
      success: false,
      message: 'Failed to get SKU copy history',
      error: error.message
    });
  }
}

module.exports = {
  copySkuController,
  getSkuCopyHistoryController
};
