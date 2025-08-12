const pool = require('../config/db.config');

/**
 * Fetch signoff details by cm_code and period
 */
async function getSignoffDetailsByCmAndPeriod(cm_code, period) {
  const result = await pool.query(`
    SELECT id, cm_code, period, signoff_by, signoff_date, signoff_status, document_url, created_at, updated_at, used_id
    FROM sdp_signoff_details 
    WHERE cm_code = $1 AND period = $2
    ORDER BY id ASC
  `, [cm_code, period]);
  return result.rows;
}

module.exports = { getSignoffDetailsByCmAndPeriod }; 