const { getAllMasterComponentPackagingLevel, getMasterComponentPackagingLevelById } = require('../models/model.masterComponentPackagingLevel');

/**
 * Controller to get all master component packaging level records
 */
async function getAllMasterComponentPackagingLevelController(request, reply) {
  try {
    const data = await getAllMasterComponentPackagingLevel();
    reply.code(200).send({ 
      success: true, 
      count: data.length,
      data: data 
    });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ 
      success: false, 
      message: 'Failed to fetch master component packaging level data', 
      error: error.message 
    });
  }
}

/**
 * Controller to get master component packaging level by ID
 */
async function getMasterComponentPackagingLevelByIdController(request, reply) {
  try {
    const { id } = request.params;
    const data = await getMasterComponentPackagingLevelById(id);
    
    if (!data) {
      return reply.code(404).send({ 
        success: false, 
        message: 'Master component packaging level not found' 
      });
    }
    
    reply.code(200).send({ 
      success: true, 
      data: data 
    });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ 
      success: false, 
      message: 'Failed to fetch master component packaging level data', 
      error: error.message 
    });
  }
}

module.exports = { getAllMasterComponentPackagingLevelController, getMasterComponentPackagingLevelByIdController }; 