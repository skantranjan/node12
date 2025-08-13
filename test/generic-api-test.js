const pool = require('../config/db.config');

/**
 * Generic function to fetch data from any table (TEST VERSION)
 * @param {string} tableName - The table name to query
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of records from the table
 */
async function getDataFromTableTest(tableName, options = {}) {
  try {
    // Validate table name to prevent SQL injection
    const allowedTables = [
      'sdp_period',
      'sdp_region', 
      'sdp_material_type',
      'sdp_component_uom',
      'sdp_component_packaging_material',
      'sdp_component_packaging_level',
      'sdp_component_base_uom',
      'sdp_cm_codes',
      'sdp_skudetails'
    ];

    if (!allowedTables.includes(tableName)) {
      throw new Error(`Table '${tableName}' is not allowed`);
    }

    // Build dynamic query based on options
    let query = `SELECT * FROM public.${tableName}`;
    const values = [];
    let paramIndex = 1;

    // Add WHERE conditions
    const whereConditions = [];

    if (options.is_active !== undefined) {
      whereConditions.push(`is_active = $${paramIndex++}`);
      values.push(options.is_active);
    }

    if (options.limit) {
      query += ` LIMIT $${paramIndex++}`;
      values.push(options.limit);
    }

    if (options.offset) {
      query += ` OFFSET $${paramIndex++}`;
      values.push(options.offset);
    }

    // Add ORDER BY
    if (options.orderBy) {
      query += ` ORDER BY ${options.orderBy}`;
    } else {
      query += ` ORDER BY id`;
    }

    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    throw error;
  }
}

/**
 * Get multiple tables data in one call (TEST VERSION)
 * @param {Array} tableRequests - Array of table requests
 * @returns {Promise<Object>} Object with data from all requested tables
 */
async function getMultipleTablesDataTest(tableRequests) {
  try {
    const results = {};

    for (const request of tableRequests) {
      const { tableName, options = {} } = request;
      results[tableName] = await getDataFromTableTest(tableName, options);
    }

    return results;
  } catch (error) {
    throw error;
  }
}

/**
 * Test function to demonstrate the generic API usage
 */
async function testGenericAPI() {
  try {
    console.log('🧪 Testing Generic API...\n');

    // Test 1: Get single table data
    console.log('📋 Test 1: Get single table data');
    const periods = await getDataFromTableTest('sdp_period', { is_active: true, limit: 5 });
    console.log('Periods:', periods.length, 'records found');
    console.log('Sample data:', periods[0] || 'No data');
    console.log('');

    // Test 2: Get multiple tables data
    console.log('📋 Test 2: Get multiple tables data');
    const multiTableData = await getMultipleTablesDataTest([
      { tableName: 'sdp_period', options: { is_active: true, limit: 3 } },
      { tableName: 'sdp_region', options: { limit: 3 } },
      { tableName: 'sdp_material_type', options: { is_active: true, limit: 3 } }
    ]);
    
    console.log('Multi-table results:');
    Object.keys(multiTableData).forEach(table => {
      console.log(`  ${table}: ${multiTableData[table].length} records`);
    });
    console.log('');

    // Test 3: Test with different options
    console.log('📋 Test 3: Test with different options');
    const customData = await getDataFromTableTest('sdp_material_type', {
      is_active: true,
      limit: 2,
      orderBy: 'item_name'
    });
    console.log('Custom query result:', customData.length, 'records');
    console.log('');

    console.log('✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

/**
 * Controller function for testing (can be used in routes)
 */
async function testGenericAPIController(request, reply) {
  try {
    const { tableName, options, multiTables } = request.body;

    let result;

    if (multiTables) {
      // Get multiple tables data
      result = await getMultipleTablesDataTest(multiTables);
    } else if (tableName) {
      // Get single table data
      result = await getDataFromTableTest(tableName, options || {});
    } else {
      return reply.code(400).send({
        success: false,
        message: 'Either tableName or multiTables must be provided'
      });
    }

    reply.code(200).send({
      success: true,
      message: 'Data retrieved successfully',
      data: result
    });

  } catch (error) {
    reply.code(500).send({
      success: false,
      message: 'Failed to retrieve data',
      error: error.message
    });
  }
}

module.exports = {
  getDataFromTableTest,
  getMultipleTablesDataTest,
  testGenericAPI,
  testGenericAPIController
};
