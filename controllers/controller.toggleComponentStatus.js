const { toggleComponentStatus } = require('../models/model.toggleComponentStatus');

/**
 * Controller to toggle component status (is_active)
 */
async function toggleComponentStatusController(request, reply) {
  try {
    const { id } = request.params;
    
    if (!id || isNaN(parseInt(id))) {
      return reply.code(400).send({ 
        success: false, 
        message: 'Valid ID is required' 
      });
    }

    const updatedComponent = await toggleComponentStatus(parseInt(id));
    
    if (!updatedComponent) {
      return reply.code(404).send({ 
        success: false, 
        message: 'Component detail not found' 
      });
    }
    
    reply.code(200).send({ 
      success: true, 
      message: 'Component status toggled successfully',
      data: updatedComponent
    });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ 
      success: false, 
      message: 'Failed to toggle component status', 
      error: error.message 
    });
  }
}

module.exports = { toggleComponentStatusController }; 