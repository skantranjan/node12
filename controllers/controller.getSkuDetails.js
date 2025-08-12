const { getSkuDetailsByCMCode, getAllSkuDetails, updateIsActiveStatus, getActiveYears, getAllSkuDescriptions, updateSkuDetailBySkuCode, checkSkuCodeExists, getAllMasterData, getConsolidatedDashboardData, toggleUniversalStatus } = require('../models/model.getSkuDetails');
const { insertSkuDetail, insertSkuComponentMapping, checkMappingTableExists, getMappingTableStructure, checkSkuDescriptionExists, getSimilarSkuDescriptions } = require('../models/model.insertSkuDetail');
const { getComponentDetailsByCode, insertComponentDetail, updateComponentSkuCode } = require('../models/model.componentOperations');

/**
 * Controller to get SKU details filtered by CM code
 */
async function getSkuDetailsByCMCodeController(request, reply) {
  try {
    const { cm_code } = request.params;
    
    const skuDetails = await getSkuDetailsByCMCode(cm_code);
    
    reply.code(200).send({ 
      success: true, 
      count: skuDetails.length,
      cm_code: cm_code,
      data: skuDetails 
    });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ 
      success: false, 
      message: 'Failed to fetch SKU details', 
      error: error.message 
    });
  }
}

/**
 * Controller to get all SKU details
 */
async function getAllSkuDetailsController(request, reply) {
  try {
    const skuDetails = await getAllSkuDetails();
    
    reply.code(200).send({ 
      success: true, 
      count: skuDetails.length,
      data: skuDetails 
    });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ 
      success: false, 
      message: 'Failed to fetch SKU details', 
      error: error.message 
    });
  }
}

/**
 * Controller to update is_active status for a SKU detail by id
 */
async function updateIsActiveStatusController(request, reply) {
  try {
    const { id } = request.params;
    const { is_active } = request.body;
    if (typeof is_active !== 'boolean') {
      return reply.code(400).send({ success: false, message: 'is_active must be a boolean' });
    }
    const updated = await updateIsActiveStatus(id, is_active);
    if (!updated) {
      return reply.code(404).send({ success: false, message: 'SKU detail not found' });
    }
    reply.code(200).send({ success: true, data: updated });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ success: false, message: 'Failed to update is_active status', error: error.message });
  }
}

/**
 * Controller to get unique active years (period)
 */
async function getActiveYearsController(request, reply) {
  try {
    const years = await getActiveYears();
    reply.code(200).send({ success: true, count: years.length, years });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ success: false, message: 'Failed to fetch years', error: error.message });
  }
}

/**
 * Controller to get all sku_description values with CM code and description
 */
async function getAllSkuDescriptionsController(request, reply) {
  try {
    const descriptions = await getAllSkuDescriptions();
    reply.code(200).send({ success: true, count: descriptions.length, data: descriptions });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ success: false, message: 'Failed to fetch sku descriptions', error: error.message });
  }
}

/**
 * Controller to insert a new SKU detail
 */
async function insertSkuDetailController(request, reply) {
  try {
    const {
      sku_data,
      components // Array of component objects
    } = request.body;

    // Get skutype from query parameter if provided
    const skutype = request.query.skutype;

    // Log the incoming data from UI
    console.log('=== SKU ADDITION REQUEST DATA ===');
    console.log('Full Request Body:', JSON.stringify(request.body, null, 2));
    console.log('SKU Data:', JSON.stringify(sku_data, null, 2));
    console.log('Components Data:', JSON.stringify(components, null, 2));
    console.log('SKU Type from query:', skutype);
    console.log('=== END SKU ADDITION REQUEST DATA ===');

    // Validate required sku_data
    if (!sku_data) {
      return reply.code(400).send({ 
        success: false, 
        message: 'sku_data is required' 
      });
    }

    // Validate required fields in sku_data
    if (!sku_data.sku_code || sku_data.sku_code.trim() === '') {
      return reply.code(400).send({ success: false, message: 'A value is required for SKU code' });
    }
    if (!sku_data.sku_description || sku_data.sku_description.trim() === '') {
      return reply.code(400).send({ success: false, message: 'A value is required for SKU description' });
    }

    // Check if SKU code already exists
    const skuExists = await checkSkuCodeExists(sku_data.sku_code);
    if (skuExists) {
      return reply.code(409).send({ 
        success: false, 
        message: `SKU code '${sku_data.sku_code}' already exists in the system` 
      });
    }

    // Check if SKU description already exists (normalized comparison)
    console.log('🔍 === CHECKING FOR DUPLICATE SKU DESCRIPTION ===');
    console.log('Description to check:', sku_data.sku_description);
    
    const descriptionExists = await checkSkuDescriptionExists(sku_data.sku_description);
    if (descriptionExists) {
      console.log('❌ Duplicate description detected!');
      
      // Get similar descriptions for better error reporting
      const similarDescriptions = await getSimilarSkuDescriptions(sku_data.sku_description);
      console.log('Similar descriptions found:', similarDescriptions.length);
      
      return reply.code(422).send({ 
        success: false, 
        message: `SKU description already exists in the system`,
        error_type: 'DUPLICATE_DESCRIPTION',
        details: {
          original_description: sku_data.sku_description,
          similar_existing_descriptions: similarDescriptions.map(d => ({
            sku_code: d.sku_code,
            description: d.sku_description
          }))
        }
      });
    } else {
      console.log('✅ No duplicate description found');
    }

    // Add skutype to sku_data only if provided
    if (skutype) {
      sku_data.skutype = skutype;
    }

    // Insert SKU detail
    const insertedSku = await insertSkuDetail(sku_data);
    
    // Handle component data if provided
    const componentResults = [];
    const mappingResults = [];
    
    if (components && Array.isArray(components) && components.length > 0) {
      for (const component of components) {
        try {
          // Check if component_code already exists
          const existingComponent = await getComponentDetailsByCode(component.component_code);
          
          if (existingComponent) {
            // Update existing component by appending SKU code
            const updatedComponent = await updateComponentSkuCode(
              component.component_code, 
              existingComponent.sku_code, 
              sku_data.sku_code
            );
            componentResults.push({
              component_code: component.component_code,
              action: 'updated',
              data: updatedComponent
            });
          } else {
            // Insert new component
            const componentData = {
              ...component,
              sku_code: sku_data.sku_code, // Set the current SKU code
              created_by: sku_data.created_by || component.created_by,
              created_date: sku_data.created_date || component.created_date || new Date(),
              is_active: component.is_active !== undefined ? component.is_active : true
            };
            
            const insertedComponent = await insertComponentDetail(componentData);
            componentResults.push({
              component_code: component.component_code,
              action: 'inserted',
              data: insertedComponent
            });
          }
          
          // Insert into SKU component mapping table
          try {
            console.log('🔍 === MAPPING TABLE INSERTION ATTEMPT ===');
            console.log('Component:', component.component_code);
            
            const mappingData = {
              cm_code: sku_data.cm_code,
              sku_code: sku_data.sku_code,
              component_code: component.component_code,
              version: component.version || 1,
              component_packaging_type_id: component.component_packaging_type_id,
              period_id: sku_data.period || component.period_id,
              component_valid_from: component.component_valid_from,
              component_valid_to: component.component_valid_to,
              created_by: sku_data.created_by || component.created_by || '1'
            };
            
            console.log('Mapping Data to Insert:', JSON.stringify(mappingData, null, 2));
            console.log('Calling insertSkuComponentMapping...');
            
            const insertedMapping = await insertSkuComponentMapping(mappingData);
            
            console.log('✅ Mapping Inserted Successfully:', insertedMapping);
            
            mappingResults.push({
              component_code: component.component_code,
              mapping_action: 'inserted',
              mapping_id: insertedMapping.id
            });
          } catch (mappingError) {
            console.error('❌ ERROR Inserting into Mapping Table:', mappingError);
            console.error('Error Stack:', mappingError.stack);
            mappingResults.push({
              component_code: component.component_code,
              mapping_action: 'error',
              error: mappingError.message
            });
          }
        } catch (componentError) {
          componentResults.push({
            component_code: component.component_code,
            action: 'error',
            error: componentError.message
          });
        }
      }
    }
    
    // If no components but SKU has cm_code, create a basic mapping entry
    if ((!components || components.length === 0) && sku_data.cm_code) {
      try {
        console.log('🔍 === BASIC MAPPING TABLE INSERTION ATTEMPT ===');
        console.log('SKU has cm_code but no components, creating basic mapping...');
        
        const basicMappingData = {
          cm_code: sku_data.cm_code,
          sku_code: sku_data.sku_code,
          component_code: null, // No component
          version: 1,
          component_packaging_type_id: null,
          period_id: sku_data.period,
          component_valid_from: null,
          component_valid_to: null,
          created_by: sku_data.created_by || '1'
        };
        
        console.log('Basic Mapping Data to Insert:', JSON.stringify(basicMappingData, null, 2));
        console.log('Calling insertSkuComponentMapping for basic mapping...');
        
        const insertedBasicMapping = await insertSkuComponentMapping(basicMappingData);
        
        console.log('✅ Basic Mapping Inserted Successfully:', insertedBasicMapping);
        
        mappingResults.push({
          component_code: 'N/A',
          mapping_action: 'inserted',
          mapping_id: insertedBasicMapping.id,
          note: 'Basic SKU mapping without components'
        });
      } catch (mappingError) {
        console.error('❌ ERROR Inserting Basic Mapping:', mappingError);
        console.error('Error Stack:', mappingError.stack);
        mappingResults.push({
          component_code: 'N/A',
          mapping_action: 'error',
          error: mappingError.message,
          note: 'Basic SKU mapping failed'
        });
      }
    }

    reply.code(201).send({ 
      success: true, 
      sku_data: insertedSku,
      components_processed: componentResults.length,
      component_results: componentResults,
      mapping_processed: mappingResults.length,
      mapping_results: mappingResults
    });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ success: false, message: 'Failed to insert SKU detail', error: error.message });
  }
}

/**
 * Controller to update a SKU detail by sku_code
 */
async function updateSkuDetailBySkuCodeController(request, reply) {
  console.log('🔥 UPDATE API CALLED!');
  
  try {
    const { sku_code } = request.params;
    const { 
      sku_description, 
      sku_reference, 
      skutype, 
      site, 
      formulation_reference,
      bulk_expert,
      components
    } = request.body;
    
    // Console log the data received from UI
    console.log('=== SKU UPDATE API - DATA FROM UI ===');
    console.log('SKU Code:', sku_code);
    console.log('Request Body:', JSON.stringify(request.body, null, 2));
    console.log('Components:', components);
    console.log('=== END SKU UPDATE API DATA ===');
    
    // Validation
    if (!sku_code || sku_code.trim() === '') {
      return reply.code(400).send({ success: false, message: 'A value is required for SKU code' });
    }
    
    // Check if at least one field is provided for update
    const updateFields = { sku_description, sku_reference, skutype, site, formulation_reference, bulk_expert };
    const hasUpdateData = Object.values(updateFields).some(value => value !== undefined && value !== null);
    
    if (!hasUpdateData && (!components || components.length === 0)) {
      return reply.code(400).send({ 
        success: false, 
        message: 'At least one field must be provided for update (sku_description, sku_reference, skutype, site, formulation_reference, bulk_expert) or components array' 
      });
    }
    
    // Update SKU detail
    const data = {};
    if (sku_description !== undefined) data.sku_description = sku_description;
    if (sku_reference !== undefined) data.sku_reference = sku_reference;
    if (skutype !== undefined) data.skutype = skutype;
    if (site !== undefined) data.site = site;
    if (formulation_reference !== undefined) data.formulation_reference = formulation_reference;
    if (bulk_expert !== undefined) data.bulk_expert = bulk_expert;
    
    const updated = await updateSkuDetailBySkuCode(sku_code, data);
    
    if (!updated) {
      return reply.code(404).send({ success: false, message: 'SKU detail not found' });
    }
    
    // Handle component updates
    let componentUpdateResults = null;
    
    if (components && Array.isArray(components) && components.length > 0) {
      // Extract component_id from the component objects
      const componentIds = components.map(comp => ({
        component_id: comp.component_id || comp.id // Handle both component_id and id
      }));
      
      console.log('Extracted Component IDs:', componentIds);
      
      // Step A: Remove SKU code from ALL components first
      const removedFromAll = await removeSkuFromAllComponentDetails(sku_code);
      
      // Step B: Add SKU code to specified components
      const addedToSpecific = await addSkuToSpecificComponents(sku_code, componentIds);
      
      componentUpdateResults = {
        removed_from_all: removedFromAll,
        added_to_specific: addedToSpecific
      };
    } else if (skutype === 'external') {
      // Special handling for external SKUs (remove from all components)
      componentUpdateResults = await removeSkuFromAllComponentDetails(sku_code);
    }
    
    reply.code(200).send({ 
      success: true, 
      data: updated,
      component_updates: componentUpdateResults
    });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ success: false, message: 'Failed to update SKU detail', error: error.message });
  }
}

/**
 * Remove SKU code from ALL component details (handles comma-separated values)
 */
async function removeSkuFromAllComponentDetails(skuCode) {
  try {
    const { removeSkuFromAllComponentDetails } = require('../models/model.getSkuDetails');
    const results = await removeSkuFromAllComponentDetails(skuCode);
    return {
      message: `Removed SKU code '${skuCode}' from all component details`,
      updated_components: results.length,
      details: results
    };
  } catch (error) {
    console.error('Error removing SKU from all component details:', error);
    throw error;
  }
}

/**
 * Add SKU code to specific components (handles comma-separated values)
 */
async function addSkuToSpecificComponents(skuCode, components) {
  try {
    const { addSkuToSpecificComponents } = require('../models/model.getSkuDetails');
    const results = await addSkuToSpecificComponents(skuCode, components);
    return {
      message: `Added SKU code '${skuCode}' to specified components`,
      updated_components: results.length,
      details: results
    };
  } catch (error) {
    console.error('Error adding SKU to specific components:', error);
    throw error;
  }
}

/**
 * Controller to get all master data in one API call
 */
async function getAllMasterDataController(request, reply) {
  try {
    const masterData = await getAllMasterData();
    
    reply.code(200).send({ 
      success: true, 
      message: 'Master data retrieved successfully',
      data: masterData
    });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ 
      success: false, 
      message: 'Failed to fetch master data', 
      error: error.message 
    });
  }
}

/**
 * Controller to get consolidated dashboard data for a CM code
 */
async function getConsolidatedDashboardController(request, reply) {
  try {
    const { cmCode } = request.params;
    const { 
      include = '', 
      period, 
      search, 
      component_id 
    } = request.query;

    // Validate CM code
    if (!cmCode) {
      return reply.code(400).send({
        success: false,
        message: 'CM code is required'
      });
    }

    // Parse include parameter
    const includeArray = include ? include.split(',').map(item => item.trim()) : [];

    // Validate include parameters
    const validIncludes = ['skus', 'descriptions', 'references', 'audit_logs', 'component_data', 'master_data'];
    const invalidIncludes = includeArray.filter(item => !validIncludes.includes(item));
    
    if (invalidIncludes.length > 0) {
      return reply.code(400).send({
        success: false,
        message: `Invalid include parameters: ${invalidIncludes.join(', ')}. Valid options: ${validIncludes.join(', ')}`
      });
    }

    // Get consolidated data
    const dashboardData = await getConsolidatedDashboardData(cmCode, {
      include: includeArray,
      period,
      search,
      component_id
    });

    // Log the request for debugging
    console.log('=== CONSOLIDATED DASHBOARD REQUEST ===');
    console.log('CM Code:', cmCode);
    console.log('Include:', includeArray);
    console.log('Period:', period);
    console.log('Search:', search);
    console.log('Component ID:', component_id);
    console.log('Data Keys:', Object.keys(dashboardData));
    console.log('=== END CONSOLIDATED DASHBOARD REQUEST ===');

    reply.code(200).send({
      success: true,
      message: 'Consolidated dashboard data retrieved successfully',
      data: dashboardData
    });

  } catch (error) {
    console.error('Error in consolidated dashboard controller:', error);
    reply.code(500).send({
      success: false,
      message: 'Failed to retrieve consolidated dashboard data',
      error: error.message
    });
  }
}

/**
 * Controller for universal status toggle (SKU and Component)
 */
async function toggleUniversalStatusController(request, reply) {
  try {
    const { type, id, is_active } = request.body;

    // Validate required fields
    if (!type) {
      return reply.code(400).send({
        success: false,
        message: 'Type is required',
        error: 'VALIDATION_ERROR'
      });
    }

    if (!id) {
      return reply.code(400).send({
        success: false,
        message: 'ID is required',
        error: 'VALIDATION_ERROR'
      });
    }

    if (is_active === undefined || is_active === null) {
      return reply.code(400).send({
        success: false,
        message: 'is_active is required',
        error: 'VALIDATION_ERROR'
      });
    }

    // Validate type
    if (!['sku', 'component'].includes(type)) {
      return reply.code(400).send({
        success: false,
        message: `Invalid type provided. Must be 'sku' or 'component'`,
        error: 'VALIDATION_ERROR'
      });
    }

    // Validate id
    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
      return reply.code(400).send({
        success: false,
        message: `Invalid ID: ${id}. Must be a positive integer`,
        error: 'VALIDATION_ERROR'
      });
    }

    // Validate is_active
    if (typeof is_active !== 'boolean') {
      return reply.code(400).send({
        success: false,
        message: `Invalid is_active: ${is_active}. Must be a boolean`,
        error: 'VALIDATION_ERROR'
      });
    }

    // Log the request for debugging
    console.log('=== UNIVERSAL STATUS TOGGLE REQUEST ===');
    console.log('Type:', type);
    console.log('ID:', id);
    console.log('Is Active:', is_active);
    console.log('=== END UNIVERSAL STATUS TOGGLE REQUEST ===');

    // Perform the status toggle
    const result = await toggleUniversalStatus(type, id, is_active);

    // Log the action for audit purposes
    console.log(`Status change: ${type} ID ${id} set to ${is_active ? 'active' : 'inactive'}`);

    reply.code(200).send({
      success: true,
      message: 'Status updated successfully',
      data: result
    });

  } catch (error) {
    console.error('Error in universal status toggle controller:', error);
    
    // Handle specific error types
    if (error.message.includes('not found')) {
      return reply.code(404).send({
        success: false,
        message: error.message,
        error: 'NOT_FOUND'
      });
    }

    if (error.message.includes('Invalid type') || 
        error.message.includes('Invalid ID') || 
        error.message.includes('Invalid is_active')) {
      return reply.code(400).send({
        success: false,
        message: error.message,
        error: 'VALIDATION_ERROR'
      });
    }

    reply.code(500).send({
      success: false,
      message: 'Failed to update status',
      error: error.message
    });
  }
}

/**
 * Test function to check mapping table status
 */
async function testMappingTableStatus(request, reply) {
  try {
    console.log('🔍 === TESTING MAPPING TABLE STATUS ===');
    
    // Check if table exists
    const tableExists = await checkMappingTableExists();
    console.log('Table exists:', tableExists);
    
    if (!tableExists) {
      return reply.code(404).send({
        success: false,
        message: 'Table sdp_sku_component_mapping_details does not exist',
        suggestion: 'Please create the table first'
      });
    }
    
    // Get table structure
    const tableStructure = await getMappingTableStructure();
    
    // Try a simple test insert
    let testInsertResult = null;
    try {
      const testData = {
        cm_code: 'TEST_CM',
        sku_code: 'TEST_SKU',
        component_code: 'TEST_COMP',
        version: 1,
        component_packaging_type_id: null,
        period_id: 'TEST_PERIOD',
        component_valid_from: null,
        component_valid_to: null,
        created_by: 'TEST_USER'
      };
      
      testInsertResult = await insertSkuComponentMapping(testData);
      console.log('✅ Test insert successful:', testInsertResult);
      
      // Clean up test data
      // Note: You might want to add a delete function for this
      
    } catch (testError) {
      console.error('❌ Test insert failed:', testError);
      testInsertResult = { error: testError.message };
    }
    
    reply.code(200).send({
      success: true,
      table_exists: tableExists,
      table_structure: tableStructure,
      test_insert: testInsertResult,
      message: 'Mapping table status check completed'
    });
    
  } catch (error) {
    console.error('Error in test function:', error);
    reply.code(500).send({
      success: false,
      message: 'Failed to check mapping table status',
      error: error.message
    });
  }
}

module.exports = {
  getSkuDetailsByCMCodeController,
  getAllSkuDetailsController,
  updateIsActiveStatusController,
  getActiveYearsController,
  getAllSkuDescriptionsController,
  insertSkuDetailController,
  updateSkuDetailBySkuCodeController,
  getAllMasterDataController,
  getConsolidatedDashboardController,
  toggleUniversalStatusController,
  testMappingTableStatus
}; 