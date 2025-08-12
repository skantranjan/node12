const pool = require('../config/db.config');

/**
 * Fetch all component master material type records
 */
async function getAllComponentMasterMaterialType() {
  const result = await pool.query('SELECT id, item_name, item_order, is_active, created_by, created_date FROM sdp_material_type');
  return result.rows;
}

/**
 * Fetch component master material type by ID
 */
async function getComponentMasterMaterialTypeById(id) {
  const result = await pool.query('SELECT id, item_name, item_order, is_active, created_by, created_date FROM sdp_material_type WHERE id = $1', [id]);
  return result.rows[0];
}

module.exports = { getAllComponentMasterMaterialType, getComponentMasterMaterialTypeById }; 