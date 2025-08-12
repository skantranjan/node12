const { getComponentAuditLogByComponentId } = require('../models/model.getComponentAuditLogByComponentId');

/**
 * Get component audit log by component_id
 */
async function getComponentAuditLogByComponentIdHandler(request, reply) {
  try {
    const { componentId } = request.params;

    // Validate component_id
    if (!componentId) {
      return reply.code(400).send({
        success: false,
        message: 'Component ID is required'
      });
    }

    // Check if component_id is a valid number
    const componentIdNum = parseInt(componentId);
    if (isNaN(componentIdNum)) {
      return reply.code(400).send({
        success: false,
        message: 'Component ID must be a valid number'
      });
    }

    console.log('🔍 === FETCHING COMPONENT AUDIT LOG ===');
    console.log(`📋 Component ID: ${componentIdNum}`);

    // Get audit log data
    const auditLogData = await getComponentAuditLogByComponentId(componentIdNum);

    console.log(`📊 Found ${auditLogData.length} audit log records`);

    if (auditLogData.length === 0) {
      return reply.code(404).send({
        success: false,
        message: 'No audit log records found for this component ID',
        data: []
      });
    }

    return reply.code(200).send({
      success: true,
      message: 'Component audit log retrieved successfully',
      data: auditLogData,
      count: auditLogData.length
    });

  } catch (error) {
    console.error('❌ Error fetching component audit log:', error);
    return reply.code(500).send({
      success: false,
      message: 'Failed to fetch component audit log',
      error: error.message
    });
  }
}

module.exports = { getComponentAuditLogByComponentIdHandler }; 