const pool = require('../config/db.config');

/**
 * Insert a new audit log record into sdp_skudetails_auditlog
 * @param {Object} data - The audit log data
 * @returns {Promise<Object>} The inserted record
 */
async function insertSkuAuditLog(data) {
  const query = `
    INSERT INTO public.sdp_skudetails_auditlog (
      sku_code, sku_description, cm_code, cm_description, is_active, created_by, created_date
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, sku_code, sku_description, cm_code, cm_description, is_active, created_by, created_date;
  `;
  const values = [
    data.sku_code || null,
    data.sku_description || null,
    data.cm_code || null,
    data.cm_description || null,
    typeof data.is_active === 'boolean' ? data.is_active : null,
    data.created_by || null,
    data.created_date || new Date()
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
}

module.exports = { insertSkuAuditLog }; 