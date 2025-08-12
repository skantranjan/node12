const pool = require('../config/db.config');

/**
 * Toggle is_active status for a component detail by ID
 */
async function toggleComponentStatus(id) {
  // First get the current status
  const currentResult = await pool.query('SELECT is_active FROM sdp_component_details WHERE id = $1', [id]);
  
  if (currentResult.rows.length === 0) {
    return null; // Record not found
  }
  
  const currentStatus = currentResult.rows[0].is_active;
  const newStatus = !currentStatus; // Toggle the status
  
  // Update with the new status
  const updateResult = await pool.query(`
    UPDATE sdp_component_details 
    SET is_active = $1, last_update_date = CURRENT_TIMESTAMP
    WHERE id = $2 
    RETURNING id, sku_code, component_code, component_description, is_active, last_update_date
  `, [newStatus, id]);
  
  return updateResult.rows[0];
}

module.exports = { toggleComponentStatus }; 