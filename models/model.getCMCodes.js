const pool = require('../config/db.config');

/**
 * Fetch all CM codes with region information
 */
async function getAllCMCodes() {
  const result = await pool.query(`
    SELECT 
      c.id, 
      c.cm_code, 
      c.cm_description, 
      c.created_at, 
      c.updated_at, 
      c.company_name, 
      c.signoff_by, 
      c.signoff_date, 
      c.signoff_status, 
      c.document_url, 
      c.periods, 
      c.is_active,
      c.region_id,
      r.name as region_name
    FROM sdp_contractors c
    LEFT JOIN sdp_region r ON c.region_id = r.id
    ORDER BY c.created_at DESC
  `);
  return result.rows;
}

/**
 * Fetch CM code by cm_code with region information
 */
async function getCMCodeByCode(cm_code) {
  const result = await pool.query(`
    SELECT 
      c.id, 
      c.cm_code, 
      c.cm_description, 
      c.created_at, 
      c.updated_at, 
      c.company_name, 
      c.signoff_by, 
      c.signoff_date, 
      c.signoff_status, 
      c.document_url, 
      c.periods, 
      c.is_active,
      c.region_id,
      r.name as region_name
    FROM sdp_contractors c
    LEFT JOIN sdp_region r ON c.region_id = r.id
    WHERE c.cm_code = $1
  `, [cm_code]);
  return result.rows;
}

/**
 * Toggle is_active status for a CM code by id
 */
async function toggleCMCodeActiveStatus(id) {
  // First get the current status
  const currentResult = await pool.query('SELECT is_active FROM sdp_contractors WHERE id = $1', [id]);
  
  if (currentResult.rows.length === 0) {
    return null; // Record not found
  }
  
  const currentStatus = currentResult.rows[0].is_active;
  const newStatus = !currentStatus; // Toggle the status
  
  // Update with the new status
  const updateResult = await pool.query(`
    UPDATE sdp_contractors 
    SET is_active = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2 
    RETURNING id, cm_code, cm_description, created_at, updated_at, company_name, signoff_by, signoff_date, signoff_status, document_url, periods, is_active, region_id
  `, [newStatus, id]);
  
  return updateResult.rows[0];
}

module.exports = { getAllCMCodes, getCMCodeByCode, toggleCMCodeActiveStatus }; 