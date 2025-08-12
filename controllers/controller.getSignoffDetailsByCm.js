const { getSignoffDetailsByCm } = require('../models/model.getSignoffDetailsByCm');

/**
 * Controller to get signoff details by cm_code
 */
async function getSignoffDetailsByCmController(request, reply) {
  try {
    const { cm_code } = request.params;
    
    if (!cm_code || cm_code.trim() === '') {
      return reply.code(400).send({ 
        success: false, 
        message: 'CM code is required' 
      });
    }

    const signoffDetails = await getSignoffDetailsByCm(cm_code);
    
    reply.code(200).send({ 
      success: true, 
      cm_code: cm_code,
      count: signoffDetails.length,
      data: signoffDetails 
    });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ 
      success: false, 
      message: 'Failed to fetch signoff details by CM code', 
      error: error.message 
    });
  }
}

module.exports = { getSignoffDetailsByCmController }; 