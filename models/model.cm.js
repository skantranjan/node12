const pool = require('../config/db.config');

/**
 * Fetch all CM records
 */
async function getAllCM() {
  const result = await pool.query('SELECT * FROM cm');
  return result.rows;
}

/**
 * Fetch CM by code
 */
async function getCMByCode(cm_code) {
  const result = await pool.query('SELECT * FROM cm WHERE cm_code = $1', [cm_code]);
  return result.rows;
}

module.exports = { getAllCM, getCMByCode }; 