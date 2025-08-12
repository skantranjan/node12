const { insertSkuAuditLog } = require('../models/model.skuAuditLog');

/**
 * Controller to insert a new audit log record (no validation)
 */
async function insertSkuAuditLogController(request, reply) {
  try {
    const data = request.body;
    const inserted = await insertSkuAuditLog(data);
    reply.code(201).send({ success: true, data: inserted });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ success: false, message: 'Failed to insert audit log', error: error.message });
  }
}

module.exports = { insertSkuAuditLogController }; 