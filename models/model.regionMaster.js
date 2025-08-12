const pool = require('../config/db.config');

/**
 * Get all regions
 */
async function getAllRegions() {
  const result = await pool.query('SELECT id, name FROM sdp_region ORDER BY name');
  return result.rows;
}

/**
 * Get region by ID
 */
async function getRegionById(id) {
  const result = await pool.query('SELECT id, name FROM sdp_region WHERE id = $1', [id]);
  return result.rows[0];
}

/**
 * Create a new region
 */
async function createRegion(name) {
  const result = await pool.query(
    'INSERT INTO sdp_region (name) VALUES ($1) RETURNING id, name',
    [name]
  );
  return result.rows[0];
}

/**
 * Update region by ID
 */
async function updateRegion(id, name) {
  const result = await pool.query(
    'UPDATE sdp_region SET name = $1 WHERE id = $2 RETURNING id, name',
    [name, id]
  );
  return result.rows[0];
}

/**
 * Delete region by ID
 */
async function deleteRegion(id) {
  const result = await pool.query(
    'DELETE FROM sdp_region WHERE id = $1 RETURNING id, name',
    [id]
  );
  return result.rows[0];
}

/**
 * Check if region exists by name (for validation)
 */
async function checkRegionExistsByName(name, excludeId = null) {
  let query = 'SELECT id FROM sdp_region WHERE name = $1';
  let params = [name];
  
  if (excludeId) {
    query += ' AND id != $2';
    params.push(excludeId);
  }
  
  const result = await pool.query(query, params);
  return result.rows.length > 0;
}

module.exports = {
  getAllRegions,
  getRegionById,
  createRegion,
  updateRegion,
  deleteRegion,
  checkRegionExistsByName
}; 