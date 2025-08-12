const { getAllMasterComponentUmo, getMasterComponentUmoById } = require('../models/model.masterComponentUmo');

/**
 * Controller to get all master component UMO records
 */
async function getAllMasterComponentUmoController(request, reply) {
  try {
    const data = await getAllMasterComponentUmo();
    reply.code(200).send({ 
      success: true, 
      count: data.length,
      data: data 
    });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ 
      success: false, 
      message: 'Failed to fetch master component UMO data', 
      error: error.message 
    });
  }
}

/**
 * Controller to get master component UMO by ID
 */
async function getMasterComponentUmoByIdController(request, reply) {
  try {
    const { id } = request.params;
    const data = await getMasterComponentUmoById(id);
    
    if (!data) {
      return reply.code(404).send({ 
        success: false, 
        message: 'Master component UMO not found' 
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
      message: 'Failed to fetch master component UMO data', 
      error: error.message 
    });
  }
}

module.exports = { getAllMasterComponentUmoController, getMasterComponentUmoByIdController }; 