const pool = require('../config/db.config');

/**
 * Fetch all Material Type Master records
 */
async function getAllMaterialTypeMaster() {
  const result = await pool.query('SELECT id, item_name, item_order, is_active, created_by, created_date FROM sdp_material_type');
  return result.rows;
}

/**
 * Fetch Material Type Master by id
 */
async function getMaterialTypeMasterById(id) {
  const result = await pool.query('SELECT id, item_name, item_order, is_active, created_by, created_date FROM sdp_material_type WHERE id = $1', [id]);
  return result.rows;
}

module.exports = { getAllMaterialTypeMaster, getMaterialTypeMasterById }; 