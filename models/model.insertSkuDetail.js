const pool = require('../config/db.config');

/**
 * Check if sdp_sku_component_mapping_details table exists
 * @returns {Promise<boolean>} True if table exists
 */
async function checkMappingTableExists() {
  try {
    const query = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'sdp_sku_component_mapping_details'
      );
    `;
    
    const result = await pool.query(query);
    const tableExists = result.rows[0].exists;
    
    console.log('🔍 Table existence check:', tableExists);
    return tableExists;
  } catch (error) {
    console.error('❌ Error checking table existence:', error);
    return false;
  }
}

/**
 * Get table structure for sdp_sku_component_mapping_details
 * @returns {Promise<Array>} Array of column information
 */
async function getMappingTableStructure() {
  try {
    const query = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'sdp_sku_component_mapping_details'
      ORDER BY ordinal_position;
    `;
    
    const result = await pool.query(query);
    console.log('📋 Table structure:', result.rows);
    return result.rows;
  } catch (error) {
    console.error('❌ Error getting table structure:', error);
    return [];
  }
}

/**
 * Insert a new SKU detail into sdp_skudetails
 * @param {Object} data - The SKU detail data
 * @returns {Promise<Object>} The inserted record
 */
async function insertSkuDetail(data) {
  const query = `
    INSERT INTO public.sdp_skudetails (
      sku_code, sku_description, cm_code, cm_description, sku_reference, is_active, created_by, created_date, period, purchased_quantity, sku_reference_check, formulation_reference, dual_source_sku, site, skutype, bulk_expert, is_approved
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    RETURNING id, sku_code, sku_description, cm_code, cm_description, sku_reference, is_active, created_by, created_date, period, purchased_quantity, sku_reference_check, formulation_reference, dual_source_sku, site, skutype, bulk_expert, is_approved;
  `;
  const values = [
    data.sku_code,
    data.sku_description,
    data.cm_code || null,
    data.cm_description || null,
    data.sku_reference || null,
    typeof data.is_active === 'boolean' ? data.is_active : true,
    data.created_by || null,
    data.created_date || new Date(),
    data.period || null,
    data.purchased_quantity || null,
    data.sku_reference_check || null,
    data.formulation_reference || null,
    data.dual_source_sku || null,
    data.site || null,
    data.skutype || null,  // Only insert if provided
    data.bulk_expert || null,
    data.is_approved || null
  ];
  
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
}

/**
 * Insert SKU component mapping details into sdp_sku_component_mapping_details
 * @param {Object} mappingData - The mapping data
 * @returns {Promise<Object>} The inserted record
 */
async function insertSkuComponentMapping(mappingData) {
  console.log('🗄️ === DATABASE INSERTION ATTEMPT ===');
  console.log('Table: sdp_sku_component_mapping_details');
  console.log('Data:', JSON.stringify(mappingData, null, 2));
  
  // First check if table exists
  const tableExists = await checkMappingTableExists();
  if (!tableExists) {
    console.error('❌ TABLE DOES NOT EXIST: sdp_sku_component_mapping_details');
    throw new Error('Table sdp_sku_component_mapping_details does not exist');
  }
  
  // Get table structure for debugging
  const tableStructure = await getMappingTableStructure();
  console.log('📋 Table columns available:', tableStructure.map(col => col.column_name));
  
  // Build dynamic INSERT query based on actual table structure
  const availableColumns = tableStructure.map(col => col.column_name);
  
  // Filter mapping data to only include columns that exist in the table
  const filteredData = {};
  const filteredColumns = [];
  const filteredValues = [];
  let paramIndex = 1;
  
  // Define the columns we want to insert (in priority order)
  const desiredColumns = [
    'cm_code', 'sku_code', 'component_code', 'version', 
    'component_packaging_type_id', 'period_id', 
    'component_valid_from', 'component_valid_to', 'created_by'
  ];
  
  for (const column of desiredColumns) {
    if (availableColumns.includes(column)) {
      filteredColumns.push(column);
      
      // Handle special cases for required fields
      let value;
      if (column === 'created_by') {
        value = mappingData[column] || '1'; // Default to "1" if not provided
      } else if (column === 'version') {
        value = mappingData[column] || 1; // Default version to 1
      } else {
        value = mappingData[column] || null;
      }
      
      filteredData[column] = value;
      filteredValues.push(value);
      paramIndex++;
    }
  }
  
  console.log('🔧 Filtered columns for INSERT:', filteredColumns);
  console.log('🔧 Filtered values:', filteredValues);
  console.log('🔧 Created_by value:', filteredData.created_by || 'Using default "1"');
  
  const query = `
    INSERT INTO public.sdp_sku_component_mapping_details (
      ${filteredColumns.join(', ')}
    ) VALUES (${filteredColumns.map((_, i) => `$${i + 1}`).join(', ')})
    RETURNING *;
  `;
  
  console.log('SQL Query:', query);
  console.log('Values:', filteredValues);
  
  try {
    console.log('Executing database query...');
    const result = await pool.query(query, filteredValues);
    console.log('✅ Database insertion successful!');
    console.log('Result:', result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error('❌ DATABASE ERROR:', error);
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    console.error('Error Detail:', error.detail);
    console.error('Error Hint:', error.hint);
    throw error;
  }
}

/**
 * Check if normalized SKU description already exists
 * @param {string} description - The SKU description to check
 * @returns {Promise<boolean>} True if description exists
 */
async function checkSkuDescriptionExists(description) {
  try {
    // Normalize the description for comparison
    const normalizedDescription = description
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .trim();
    
    console.log('🔍 Checking for duplicate SKU description...');
    console.log('Original description:', description);
    console.log('Normalized description:', normalizedDescription);
    
    const query = `
      SELECT id, sku_code, sku_description 
      FROM public.sdp_skudetails 
      WHERE LOWER(REPLACE(REPLACE(REPLACE(sku_description, ' ', ''), '-', ''), '_', '')) = $1
      AND is_active = true
    `;
    
    const result = await pool.query(query, [normalizedDescription]);
    const exists = result.rows.length > 0;
    
    if (exists) {
      console.log('❌ Duplicate description found:', result.rows[0]);
    } else {
      console.log('✅ No duplicate description found');
    }
    
    return exists;
  } catch (error) {
    console.error('❌ Error checking SKU description:', error);
    throw error;
  }
}

/**
 * Get similar SKU descriptions for better error reporting
 * @param {string} description - The SKU description to check
 * @returns {Promise<Array>} Array of similar descriptions
 */
async function getSimilarSkuDescriptions(description) {
  try {
    const normalizedDescription = description
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .trim();
    
    // Find descriptions that contain similar words
    const query = `
      SELECT id, sku_code, sku_description 
      FROM public.sdp_skudetails 
      WHERE is_active = true
      AND (
        LOWER(sku_description) LIKE $1 
        OR LOWER(sku_description) LIKE $2
        OR LOWER(sku_description) LIKE $3
      )
      LIMIT 5
    `;
    
    const searchTerm = `%${description.toLowerCase()}%`;
    const partialTerm = `%${description.toLowerCase().split(' ')[0]}%`;
    const reverseTerm = `%${description.toLowerCase().split(' ').reverse().join(' ')}%`;
    
    const result = await pool.query(query, [searchTerm, partialTerm, reverseTerm]);
    return result.rows;
  } catch (error) {
    console.error('❌ Error finding similar descriptions:', error);
    return [];
  }
}

module.exports = {
  insertSkuDetail,
  insertSkuComponentMapping,
  checkMappingTableExists,
  getMappingTableStructure,
  checkSkuDescriptionExists,
  getSimilarSkuDescriptions
}; 