const pool = require('../config/db.config');

/**
 * Fetch all master component packaging material records
 */
async function getAllMasterComponentPackagingMaterial() {
  const result = await pool.query('SELECT id, item_name, item_order, is_active, created_by, created_date FROM sdp_component_packaging_material');
  return result.rows;
}

/**
 * Fetch master component packaging material by ID
 */
async function getMasterComponentPackagingMaterialById(id) {
  const result = await pool.query('SELECT id, item_name, item_order, is_active, created_by, created_date FROM sdp_component_packaging_material WHERE id = $1', [id]);
  return result.rows[0];
}

module.exports = { getAllMasterComponentPackagingMaterial, getMasterComponentPackagingMaterialById }; 