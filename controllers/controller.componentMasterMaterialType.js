const { getAllComponentMasterMaterialType, getComponentMasterMaterialTypeById } = require('../models/model.componentMasterMaterialType');

/**
 * Controller to get all component master material type records
 */
async function getAllComponentMasterMaterialTypeController(request, reply) {
  try {
    const data = await getAllComponentMasterMaterialType();
    reply.code(200).send({ 
      success: true, 
      count: data.length,
      data: data 
    });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ 
      success: false, 
      message: 'Failed to fetch component master material type data', 
      error: error.message 
    });
  }
}

/**
 * Controller to get component master material type by ID
 */
async function getComponentMasterMaterialTypeByIdController(request, reply) {
  try {
    const { id } = request.params;
    const data = await getComponentMasterMaterialTypeById(id);
    
    if (!data) {
      return reply.code(404).send({ 
        success: false, 
        message: 'Component master material type not found' 
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
      message: 'Failed to fetch component master material type data', 
      error: error.message 
    });
  }
}

module.exports = { getAllComponentMasterMaterialTypeController, getComponentMasterMaterialTypeByIdController }; 