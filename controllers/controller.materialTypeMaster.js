const { getAllMaterialTypeMaster, getMaterialTypeMasterById } = require('../models/model.materialTypeMaster');

async function getAllMaterialTypeMasterController(request, reply) {
  try {
    const data = await getAllMaterialTypeMaster();
    reply.send({ success: true, data });
  } catch (error) {
    reply.code(500).send({ success: false, message: error.message });
  }
}

async function getMaterialTypeMasterByIdController(request, reply) {
  try {
    const { id } = request.params;
    const data = await getMaterialTypeMasterById(id);
    reply.send({ success: true, data });
  } catch (error) {
    reply.code(500).send({ success: false, message: error.message });
  }
}

module.exports = { getAllMaterialTypeMasterController, getMaterialTypeMasterByIdController }; 