const pool = require('../config/db.config');

/**
 * Fetch all master component UMO records
 */
async function getAllMasterComponentUmo() {
  const result = await pool.query('SELECT id, item_name, item_order, is_active, created_by, created_date FROM sdp_component_uom');
  return result.rows;
}

/**
 * Fetch master component UMO by ID
 */
async function getMasterComponentUmoById(id) {
  const result = await pool.query('SELECT id, item_name, item_order, is_active, created_by, created_date FROM sdp_component_uom WHERE id = $1', [id]);
  return result.rows[0];
}

module.exports = { getAllMasterComponentUmo, getMasterComponentUmoById }; 