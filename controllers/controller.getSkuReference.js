const { getSkuDetailsByReference, getSkuDetailsByPeriodAndCm, getComponentDetailsBySkuCode } = require('../models/model.getSkuReference');

/**
 * Controller to get SKU details by reference
 */
async function getSkuDetailsByReferenceController(request, reply) {
  try {
    const { sku_reference } = request.params;
    
    if (!sku_reference || sku_reference.trim() === '') {
      return reply.code(400).send({ 
        success: false, 
        message: 'SKU reference is required' 
      });
    }
    
    const skuDetails = await getSkuDetailsByReference(sku_reference);
    
    if (skuDetails.length === 0) {
      return reply.code(404).send({ 
        success: false, 
        message: 'No SKU details found for the given reference',
        sku_reference: sku_reference
      });
    }
    
    // Get unique SKU codes from the results
    const skuCodes = [...new Set(skuDetails.map(item => item.sku_code))]; // Remove duplicates
    
    // For each unique SKU code, get the component details
    const skuInfoList = [];
    for (const skuCode of skuCodes) {
      const skuInfoList = skuDetails.filter(item => item.sku_code === skuCode);
      
      // Get component details for this SKU code
      const componentDetails = await getComponentDetailsBySkuCode(skuCode);
      
      skuInfoList.push({
        sku_code: skuCode,
        sku_details: skuInfoList,
        component_details: componentDetails
      });
    }
    
    reply.code(200).send({ 
      success: true, 
      sku_reference: sku_reference,
      total_skus: skuDetails.length,
      unique_sku_codes: skuCodes.length,
      data: skuInfoList
    });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ 
      success: false, 
      message: 'Failed to fetch SKU details by reference', 
      error: error.message 
    });
  }
}

/**
 * Controller to get SKU details by period and CM code for active records only
 */
async function getSkuDetailsByPeriodAndCmController(request, reply) {
  try {
    const { period, cm_code } = request.params;
    
    // Validation
    if (!period || period.trim() === '') {
      return reply.code(400).send({ 
        success: false, 
        message: 'Period is required' 
      });
    }
    
    if (!cm_code || cm_code.trim() === '') {
      return reply.code(400).send({ 
        success: false, 
        message: 'CM code is required' 
      });
    }
    
    const skuDetails = await getSkuDetailsByPeriodAndCm(period, cm_code);
    
    if (skuDetails.length === 0) {
      return reply.code(404).send({ 
        success: false, 
        message: 'No active SKU details found for the given period and CM code',
        period: period,
        cm_code: cm_code
      });
    }
    
    reply.code(200).send({ 
      success: true, 
      count: skuDetails.length,
      period: period,
      cm_code: cm_code,
      data: skuDetails 
    });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ 
      success: false, 
      message: 'Failed to fetch SKU details by period and CM code', 
      error: error.message 
    });
  }
}

module.exports = {
  getSkuDetailsByReferenceController,
  getSkuDetailsByPeriodAndCmController
}; 