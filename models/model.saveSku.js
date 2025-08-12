const pool = require('../config/db.config');

/**
 * Save SKU data to the database
 * @param {Object} skuData - The SKU data to save
 * @returns {Promise<Object>} The saved SKU record
 */
async function saveSku(skuData) {
  const { sku, name, description, price } = skuData;
  const query = `
    INSERT INTO skus (sku, name, description, price)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [sku, name, description, price];
  const { rows } = await pool.query(query, values);
  return rows[0];
}

module.exports = { saveSku }; 