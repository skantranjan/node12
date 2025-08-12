const { getAllMasterComponentPackagingMaterial, getMasterComponentPackagingMaterialById } = require('../models/model.masterComponentPackagingMaterial');

/**
 * Controller to get all master component packaging material records
 */
async function getAllMasterComponentPackagingMaterialController(request, reply) {
  try {
    const data = await getAllMasterComponentPackagingMaterial();
    reply.code(200).send({ 
      success: true, 
      count: data.length,
      data: data 
    });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ 
      success: false, 
      message: 'Failed to fetch master component packaging material data', 
      error: error.message 
    });
  }
}

/**
 * Controller to get master component packaging material by ID
 */
async function getMasterComponentPackagingMaterialByIdController(request, reply) {
  try {
    const { id } = request.params;
    const data = await getMasterComponentPackagingMaterialById(id);
    
    if (!data) {
      return reply.code(404).send({ 
        success: false, 
        message: 'Master component packaging material not found' 
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
      message: 'Failed to fetch master component packaging material data', 
      error: error.message 
    });
  }
}

module.exports = { getAllMasterComponentPackagingMaterialController, getMasterComponentPackagingMaterialByIdController }; 