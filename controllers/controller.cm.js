const { getAllCM, getCMByCode } = require('../models/model.cm');

async function getAllCMController(request, reply) {
  try {
    const data = await getAllCM();
    reply.send({ success: true, data });
  } catch (error) {
    reply.code(500).send({ success: false, message: error.message });
  }
}

async function getCMByCodeController(request, reply) {
  try {
    const { cm_code } = request.params;
    const data = await getCMByCode(cm_code);
    reply.send({ success: true, data });
  } catch (error) {
    reply.code(500).send({ success: false, message: error.message });
  }
}

module.exports = { getAllCMController, getCMByCodeController }; 