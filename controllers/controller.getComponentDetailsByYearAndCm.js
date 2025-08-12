const { getComponentDetailsByYearAndCm } = require('../models/model.getComponentDetailsByYearAndCm');

/**
 * Controller to get component details by year and cm_code
 */
async function getComponentDetailsByYearAndCmController(request, reply) {
  try {
    const { year, cm_code } = request.query;
    
    if (!year || year.trim() === '') {
      return reply.code(400).send({ 
        success: false, 
        message: 'Year is required' 
      });
    }

    if (!cm_code || cm_code.trim() === '') {
      return reply.code(400).send({ 
        success: false, 
        message: 'CM code is required' 
      });
    }

    const componentDetails = await getComponentDetailsByYearAndCm(year, cm_code);
    
    reply.code(200).send({ 
      success: true, 
      year: year,
      cm_code: cm_code,
      count: componentDetails.length,
      data: componentDetails 
    });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ 
      success: false, 
      message: 'Failed to fetch component details by year and cm_code', 
      error: error.message 
    });
  }
}

module.exports = { getComponentDetailsByYearAndCmController }; 