const { insertComponentAuditLog } = require('../models/model.addComponentAuditLog');

/**
 * Controller to add a new component details audit log
 */
async function addComponentAuditLogController(request, reply) {
  try {
    const auditLogData = request.body;

    // Basic validation for required fields
    if (!auditLogData.sku_code || auditLogData.sku_code.trim() === '') {
      return reply.code(400).send({ 
        success: false, 
        message: 'SKU code is required' 
      });
    }

    if (!auditLogData.component_code || auditLogData.component_code.trim() === '') {
      return reply.code(400).send({ 
        success: false, 
        message: 'Component code is required' 
      });
    }

    if (!auditLogData.component_description || auditLogData.component_description.trim() === '') {
      return reply.code(400).send({ 
        success: false, 
        message: 'Component description is required' 
      });
    }

    // Set default values for timestamps if not provided
    if (!auditLogData.created_date) {
      auditLogData.created_date = new Date();
    }

    if (!auditLogData.last_update_date) {
      auditLogData.last_update_date = new Date();
    }

    // Set default value for is_active if not provided
    if (auditLogData.is_active === undefined) {
      auditLogData.is_active = true;
    }

    const insertedAuditLog = await insertComponentAuditLog(auditLogData);

    reply.code(201).send({
      success: true,
      message: 'Component audit log added successfully',
      data: insertedAuditLog
    });

  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ 
      success: false, 
      message: 'Failed to add component audit log', 
      error: error.message 
    });
  }
}

module.exports = { addComponentAuditLogController }; 