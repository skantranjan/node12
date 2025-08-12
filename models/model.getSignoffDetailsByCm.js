const pool = require('../config/db.config');

/**
 * Fetch signoff details by cm_code
 */
async function getSignoffDetailsByCm(cm_code) {
  const result = await pool.query(`
    SELECT id, cm_code, signoff_by, signoff_date, signoff_status, document_url, created_at, updated_at, used_id
    FROM sdp_signoff_details 
    WHERE cm_code = $1
    ORDER BY id ASC
  `, [cm_code]);
  return result.rows;
}

module.exports = { getSignoffDetailsByCm }; 