const pool = require('../config/db.config');

/**
 * Fetch all master component packaging level records
 */
async function getAllMasterComponentPackagingLevel() {
  const result = await pool.query('SELECT id, item_name, item_order, is_active, created_by, created_date FROM sdp_component_packaging_level');
  return result.rows;
}

/**
 * Fetch master component packaging level by ID
 */
async function getMasterComponentPackagingLevelById(id) {
  const result = await pool.query('SELECT id, item_name, item_order, is_active, created_by, created_date FROM sdp_component_packaging_level WHERE id = $1', [id]);
  return result.rows[0];
}

module.exports = { getAllMasterComponentPackagingLevel, getMasterComponentPackagingLevelById }; 