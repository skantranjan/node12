const { getSignoffDetailsByCmAndPeriod } = require('../models/model.getSignoffDetailsByCmAndPeriod');

/**
 * Controller to get signoff details by cm_code and period
 */
async function getSignoffDetailsByCmAndPeriodController(request, reply) {
  try {
    const { cm_code, period } = request.query;
    
    if (!cm_code || cm_code.trim() === '') {
      return reply.code(400).send({ 
        success: false, 
        message: 'CM code is required' 
      });
    }

    if (!period || period.trim() === '') {
      return reply.code(400).send({ 
        success: false, 
        message: 'Period is required' 
      });
    }

    const signoffDetails = await getSignoffDetailsByCmAndPeriod(cm_code, period);
    
    reply.code(200).send({ 
      success: true, 
      cm_code: cm_code,
      period: period,
      count: signoffDetails.length,
      data: signoffDetails 
    });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ 
      success: false, 
      message: 'Failed to fetch signoff details by CM code and period', 
      error: error.message 
    });
  }
}

module.exports = { getSignoffDetailsByCmAndPeriodController }; 