const { getAllCMCodes, getCMCodeByCode, toggleCMCodeActiveStatus } = require('../models/model.getCMCodes');

async function getAllCMCodesController(request, reply) {
  try {
    const data = await getAllCMCodes();
    reply.send({ success: true, data });
  } catch (error) {
    reply.code(500).send({ success: false, message: error.message });
  }
}

async function getCMCodeByCodeController(request, reply) {
  try {
    const { cm_code } = request.params;
    const data = await getCMCodeByCode(cm_code);
    reply.send({ success: true, data });
  } catch (error) {
    reply.code(500).send({ success: false, message: error.message });
  }
}

/**
 * Controller to toggle CM code active status
 */
async function toggleCMCodeActiveStatusController(request, reply) {
  try {
    const { id } = request.params;
    
    if (!id || isNaN(parseInt(id))) {
      return reply.code(400).send({ 
        success: false, 
        message: 'Valid ID is required' 
      });
    }

    const updatedCMCode = await toggleCMCodeActiveStatus(parseInt(id));
    
    if (!updatedCMCode) {
      return reply.code(404).send({ 
        success: false, 
        message: 'CM code not found' 
      });
    }
    
    reply.code(200).send({ 
      success: true, 
      message: 'CM code status toggled successfully',
      data: updatedCMCode
    });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ 
      success: false, 
      message: 'Failed to toggle CM code status', 
      error: error.message 
    });
  }
}

module.exports = { getAllCMCodesController, getCMCodeByCodeController, toggleCMCodeActiveStatusController }; 