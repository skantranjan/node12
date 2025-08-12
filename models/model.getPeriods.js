const pool = require('../config/db.config');

/**
 * Fetch all periods
 */
async function getAllPeriods() {
  const result = await pool.query('SELECT * FROM sdp_period ORDER BY id ASC');
  return result.rows;
}

/**
 * Fetch period by ID
 */
async function getPeriodById(id) {
  const result = await pool.query('SELECT * FROM sdp_period WHERE id = $1', [id]);
  return result.rows[0];
}

module.exports = { getAllPeriods, getPeriodById }; 