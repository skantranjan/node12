const pool = require('../config/db.config');

/**
 * Get SKU details by reference
 * @param {string} skuReference - The SKU reference to search for
 * @returns {Promise<Array>} Array of SKU details
 */
async function getSkuDetailsByReference(skuReference) {
  const query = `
    SELECT id, sku_code, site, sku_description, cm_code, cm_description, sku_reference, is_active, created_by, created_date, period, purchased_quantity, sku_reference_check, formulation_reference, dual_source_sku, skutype, bulk_expert
    FROM public.sdp_skudetails
    WHERE sku_reference = $1 AND is_active = true
    ORDER BY id DESC;
  `;
  const result = await pool.query(query, [skuReference]);
  return result.rows;
}

/**
 * Get SKU details by period and CM code for active records only
 * @param {string} period - The period to search for
 * @param {string} cmCode - The CM code to search for
 * @returns {Promise<Array>} Array of SKU details
 */
async function getSkuDetailsByPeriodAndCm(period, cmCode) {
  const query = `
    SELECT id, sku_code, sku_description, cm_code, cm_description, sku_reference, is_active, created_by, created_date, period, purchased_quantity, sku_reference_check, formulation_reference, dual_source_sku, site, skutype, bulk_expert
    FROM public.sdp_skudetails
    WHERE period = $1 AND cm_code = $2 AND is_active = true
    ORDER BY id DESC;
  `;
  const result = await pool.query(query, [period, cmCode]);
  return result.rows;
}

/**
 * Get component details by SKU code
 * @param {string} skuCode - The SKU code to search for
 * @returns {Promise<Array>} Array of component details
 */
async function getComponentDetailsBySkuCode(skuCode) {
  const query = `
    SELECT id, component_code, component_description, sku_code, material_type, packaging_type, weight, weight_uom, packaging_level, packaging_material, is_active, created_by, created_date
    FROM public.sdp_componentdetails
    WHERE sku_code = $1 AND is_active = true
    ORDER BY id DESC;
  `;
  const result = await pool.query(query, [skuCode]);
  return result.rows;
}

module.exports = {
  getSkuDetailsByReference,
  getSkuDetailsByPeriodAndCm,
  getComponentDetailsBySkuCode
}; 