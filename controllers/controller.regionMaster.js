const { 
  getAllRegions, 
  getRegionById, 
  createRegion, 
  updateRegion, 
  deleteRegion, 
  checkRegionExistsByName 
} = require('../models/model.regionMaster');

/**
 * Controller to get all regions
 */
async function getAllRegionsController(request, reply) {
  try {
    const regions = await getAllRegions();
    reply.code(200).send({ 
      success: true, 
      count: regions.length,
      data: regions 
    });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ 
      success: false, 
      message: 'Failed to fetch regions', 
      error: error.message 
    });
  }
}

/**
 * Controller to get region by ID
 */
async function getRegionByIdController(request, reply) {
  try {
    const { id } = request.params;
    
    if (!id || isNaN(parseInt(id))) {
      return reply.code(400).send({ 
        success: false, 
        message: 'Valid ID is required' 
      });
    }

    const region = await getRegionById(parseInt(id));
    
    if (!region) {
      return reply.code(404).send({ 
        success: false, 
        message: 'Region not found' 
      });
    }
    
    reply.code(200).send({ 
      success: true, 
      data: region 
    });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ 
      success: false, 
      message: 'Failed to fetch region', 
      error: error.message 
    });
  }
}

/**
 * Controller to create a new region
 */
async function createRegionController(request, reply) {
  try {
    const { name } = request.body;
    
    if (!name || name.trim() === '') {
      return reply.code(400).send({ 
        success: false, 
        message: 'Region name is required' 
      });
    }

    // Check if region name already exists
    const exists = await checkRegionExistsByName(name.trim());
    if (exists) {
      return reply.code(409).send({ 
        success: false, 
        message: 'Region name already exists' 
      });
    }

    const newRegion = await createRegion(name.trim());
    
    reply.code(201).send({ 
      success: true, 
      message: 'Region created successfully',
      data: newRegion 
    });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ 
      success: false, 
      message: 'Failed to create region', 
      error: error.message 
    });
  }
}

/**
 * Controller to update region by ID
 */
async function updateRegionController(request, reply) {
  try {
    const { id } = request.params;
    const { name } = request.body;
    
    if (!id || isNaN(parseInt(id))) {
      return reply.code(400).send({ 
        success: false, 
        message: 'Valid ID is required' 
      });
    }

    if (!name || name.trim() === '') {
      return reply.code(400).send({ 
        success: false, 
        message: 'Region name is required' 
      });
    }

    // Check if region name already exists (excluding current record)
    const exists = await checkRegionExistsByName(name.trim(), parseInt(id));
    if (exists) {
      return reply.code(409).send({ 
        success: false, 
        message: 'Region name already exists' 
      });
    }

    const updatedRegion = await updateRegion(parseInt(id), name.trim());
    
    if (!updatedRegion) {
      return reply.code(404).send({ 
        success: false, 
        message: 'Region not found' 
      });
    }
    
    reply.code(200).send({ 
      success: true, 
      message: 'Region updated successfully',
      data: updatedRegion 
    });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ 
      success: false, 
      message: 'Failed to update region', 
      error: error.message 
    });
  }
}

/**
 * Controller to delete region by ID
 */
async function deleteRegionController(request, reply) {
  try {
    const { id } = request.params;
    
    if (!id || isNaN(parseInt(id))) {
      return reply.code(400).send({ 
        success: false, 
        message: 'Valid ID is required' 
      });
    }

    const deletedRegion = await deleteRegion(parseInt(id));
    
    if (!deletedRegion) {
      return reply.code(404).send({ 
        success: false, 
        message: 'Region not found' 
      });
    }
    
    reply.code(200).send({ 
      success: true, 
      message: 'Region deleted successfully',
      data: deletedRegion 
    });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ 
      success: false, 
      message: 'Failed to delete region', 
      error: error.message 
    });
  }
}

module.exports = {
  getAllRegionsController,
  getRegionByIdController,
  createRegionController,
  updateRegionController,
  deleteRegionController
}; 