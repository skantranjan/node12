const pool = require('../config/db.config');

/**
 * Get SKU details by CM code
 * @param {string} cmCode - The CM code to search for
 * @returns {Promise<Array>} Array of SKU details
 */
async function getSkuDetailsByCMCode(cmCode) {
  const query = `
    SELECT id, sku_code, site, sku_description, cm_code, cm_description, sku_reference, is_active, created_by, created_date, period, purchased_quantity, sku_reference_check, formulation_reference, dual_source_sku, skutype, bulk_expert
    FROM public.sdp_skudetails
    WHERE cm_code = $1 AND is_active = true
    ORDER BY id DESC;
  `;
  const result = await pool.query(query, [cmCode]);
  return result.rows;
}

/**
 * Get all SKU details
 * @returns {Promise<Array>} Array of all SKU details
 */
async function getAllSkuDetails() {
  const query = `
    SELECT id, sku_code, site, sku_description, cm_code, cm_description, sku_reference, is_active, created_by, created_date, period, purchased_quantity, sku_reference_check, formulation_reference, dual_source_sku, skutype, bulk_expert
    FROM public.sdp_skudetails
    WHERE is_active = true
    ORDER BY id DESC;
  `;
  const result = await pool.query(query);
  return result.rows;
}

/**
 * Update is_active status for a SKU detail by id
 * @param {number} id - The SKU detail id
 * @param {boolean} isActive - The new is_active status
 * @returns {Promise<Object>} The updated record
 */
async function updateIsActiveStatus(id, isActive) {
  const query = `
    UPDATE public.sdp_skudetails
    SET is_active = $1
    WHERE id = $2
    RETURNING id, sku_code, sku_description, cm_code, cm_description, sku_reference, is_active, created_by, created_date;
  `;
  const result = await pool.query(query, [isActive, id]);
  return result.rows[0];
}

/**
 * Get unique periods from sdp_period where is_active is true
 * @returns {Promise<Array>} Array of active periods with id
 */
async function getActiveYears() {
  const query = `
    SELECT id, period
    FROM public.sdp_period
    WHERE is_active = true
    ORDER BY id DESC;
  `;
  const result = await pool.query(query);
  return result.rows;
}

/**
 * Get all sku_description values with CM code and description from sdp_skudetails
 * @returns {Promise<Array>} Array of objects with sku_description, cm_code, and cm_description
 */
async function getAllSkuDescriptions() {
  const query = `
    SELECT sku_description, cm_code, cm_description
    FROM public.sdp_skudetails
    ORDER BY sku_description;
  `;
  const result = await pool.query(query);
  return result.rows;
}

/**
 * Insert a new SKU detail into sdp_skudetails
 * @param {Object} data - The SKU detail data
 * @returns {Promise<Object>} The inserted record
 */
async function insertSkuDetail(data) {
  const query = `
    INSERT INTO public.sdp_skudetails (
      sku_code, sku_description, cm_code, cm_description, sku_reference, is_active, created_by, created_date, period, purchased_quantity, sku_reference_check, formulation_reference, dual_source_sku, site, skutype, bulk_expert
    ) VALUES ($1, $2, $3, $4, NULL, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    RETURNING id, sku_code, sku_description, cm_code, cm_description, is_active, created_by, created_date, period, purchased_quantity, sku_reference_check, formulation_reference, dual_source_sku, site, skutype, bulk_expert;
  `;
  const values = [
    data.sku_code,
    data.sku_description,
    data.cm_code || null,
    data.cm_description || null,
    typeof data.is_active === 'boolean' ? data.is_active : true,
    data.created_by || null,
    data.created_date || new Date(),
    data.period || null,
    data.purchased_quantity || null,
    data.sku_reference_check || null,
    data.formulation_reference || null,
    data.dual_source_sku || null,
    data.site || null,
    data.skutype || null,
    data.bulk_expert || null
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
}

/**
 * Update a SKU detail by sku_code
 * @param {string} sku_code - The SKU code to update
 * @param {Object} data - The fields to update
 * @returns {Promise<Object>} The updated record
 */
async function updateSkuDetailBySkuCode(sku_code, data) {
  // Build dynamic query based on provided fields
  const updateFields = [];
  const values = [];
  let paramIndex = 1;
  
  if (data.sku_description !== undefined) {
    updateFields.push(`sku_description = $${paramIndex++}`);
    values.push(data.sku_description);
  }
  
  if (data.sku_reference !== undefined) {
    updateFields.push(`sku_reference = $${paramIndex++}`);
    values.push(data.sku_reference);
  }
  
  if (data.skutype !== undefined) {
    updateFields.push(`skutype = $${paramIndex++}`);
    values.push(data.skutype);
  }
  
  if (data.site !== undefined) {
    updateFields.push(`site = $${paramIndex++}`);
    values.push(data.site);
  }
  
  if (data.formulation_reference !== undefined) {
    updateFields.push(`formulation_reference = $${paramIndex++}`);
    values.push(data.formulation_reference);
  }
  
  if (data.bulk_expert !== undefined) {
    updateFields.push(`bulk_expert = $${paramIndex++}`);
    values.push(data.bulk_expert);
  }
  
  if (data.is_approved !== undefined) {
    updateFields.push(`is_approved = $${paramIndex++}`);
    values.push(data.is_approved);
  }
  
  // Add WHERE condition
  values.push(sku_code);
  
  const query = `
    UPDATE public.sdp_skudetails SET
      ${updateFields.join(', ')}
    WHERE sku_code = $${paramIndex}
    RETURNING id, sku_code, sku_description, cm_code, cm_description, sku_reference, is_active, created_by, created_date, period, purchased_quantity, sku_reference_check, formulation_reference, dual_source_sku, site, skutype, bulk_expert, is_approved;
  `;
  
  const result = await pool.query(query, values);
  return result.rows[0];
}

/**
 * Remove SKU code from component details (handles comma-separated values)
 * @param {string} skuCode - The SKU code to remove from component details
 * @returns {Promise<Array>} Array of updated component records
 */
async function removeSkuFromComponentDetails(skuCode) {
  // First, find all components that contain this SKU code
  const findQuery = `
    SELECT id, sku_code, component_code, component_description
    FROM public.sdp_component_details
    WHERE (sku_code LIKE $1 OR sku_code LIKE $2 OR sku_code LIKE $3 OR sku_code = $4)
    AND is_active = true
  `;
  
  // Create patterns to match the sku_code in comma-separated values
  const patterns = [
    `${skuCode},%`,           // sku_code at the beginning
    `%,${skuCode},%`,         // sku_code in the middle
    `%,${skuCode}`,           // sku_code at the end
    skuCode                   // exact match
  ];
  
  const findResult = await pool.query(findQuery, patterns);
  const componentsToUpdate = findResult.rows;
  
  if (componentsToUpdate.length === 0) {
    console.log(`No components found containing SKU code: ${skuCode}`);
    return [];
  }
  
  console.log(`Found ${componentsToUpdate.length} components containing SKU code: ${skuCode}`);
  
  const updatedComponents = [];
  
  for (const component of componentsToUpdate) {
    try {
      // Remove the SKU code from the comma-separated list
      let updatedSkuCode = component.sku_code;
      
      // Handle different patterns
      if (updatedSkuCode === skuCode) {
        // Exact match - set to null or empty
        updatedSkuCode = null;
      } else if (updatedSkuCode.startsWith(`${skuCode},`)) {
        // At the beginning
        updatedSkuCode = updatedSkuCode.replace(`${skuCode},`, '');
      } else if (updatedSkuCode.endsWith(`,${skuCode}`)) {
        // At the end
        updatedSkuCode = updatedSkuCode.replace(`,${skuCode}`, '');
      } else {
        // In the middle
        updatedSkuCode = updatedSkuCode.replace(`,${skuCode},`, ',');
      }
      
      // Clean up any double commas that might result
      if (updatedSkuCode) {
        updatedSkuCode = updatedSkuCode.replace(/,,/g, ',');
        // Remove leading/trailing commas
        updatedSkuCode = updatedSkuCode.replace(/^,|,$/g, '');
      }
      
      // If the result is empty or just commas, set to null
      if (!updatedSkuCode || updatedSkuCode.trim() === '' || updatedSkuCode === ',') {
        updatedSkuCode = null;
      }
      
      // Update the component
      const updateQuery = `
        UPDATE public.sdp_component_details
        SET sku_code = $1
        WHERE id = $2
        RETURNING id, sku_code, component_code, component_description
      `;
      
      const updateResult = await pool.query(updateQuery, [updatedSkuCode, component.id]);
      
      if (updateResult.rows[0]) {
        updatedComponents.push({
          component_id: component.id,
          component_code: component.component_code,
          old_sku_code: component.sku_code,
          new_sku_code: updatedSkuCode
        });
        
        console.log(`Updated component ${component.component_code}: removed '${skuCode}' from SKU list`);
      }
    } catch (error) {
      console.error(`Error updating component ${component.component_code}:`, error);
      updatedComponents.push({
        component_id: component.id,
        component_code: component.component_code,
        error: error.message
      });
    }
  }
  
  return updatedComponents;
}

/**
 * Remove SKU code from ALL component details (handles comma-separated values)
 * @param {string} skuCode - The SKU code to remove from all component details
 * @returns {Promise<Array>} Array of updated component records
 */
async function removeSkuFromAllComponentDetails(skuCode) {
  // Find all components that contain this SKU code
  const findQuery = `
    SELECT id, sku_code, component_code, component_description
    FROM public.sdp_component_details
    WHERE (sku_code LIKE $1 OR sku_code LIKE $2 OR sku_code LIKE $3 OR sku_code = $4)
    AND is_active = true
  `;
  
  // Create patterns to match the sku_code in comma-separated values
  const patterns = [
    `${skuCode},%`,           // sku_code at the beginning
    `%,${skuCode},%`,         // sku_code in the middle
    `%,${skuCode}`,           // sku_code at the end
    skuCode                   // exact match
  ];
  
  const findResult = await pool.query(findQuery, patterns);
  const componentsToUpdate = findResult.rows;
  
  if (componentsToUpdate.length === 0) {
    return [];
  }
  
  const updatedComponents = [];
  
  for (const component of componentsToUpdate) {
    try {
      // Remove the SKU code from the comma-separated list
      let updatedSkuCode = component.sku_code;
      
      // Handle different patterns
      if (updatedSkuCode === skuCode) {
        // Exact match - set to null or empty
        updatedSkuCode = null;
      } else if (updatedSkuCode.startsWith(`${skuCode},`)) {
        // At the beginning
        updatedSkuCode = updatedSkuCode.replace(`${skuCode},`, '');
      } else if (updatedSkuCode.endsWith(`,${skuCode}`)) {
        // At the end
        updatedSkuCode = updatedSkuCode.replace(`,${skuCode}`, '');
      } else {
        // In the middle
        updatedSkuCode = updatedSkuCode.replace(`,${skuCode},`, ',');
      }
      
      // Clean up any double commas that might result
      if (updatedSkuCode) {
        updatedSkuCode = updatedSkuCode.replace(/,,/g, ',');
        // Remove leading/trailing commas
        updatedSkuCode = updatedSkuCode.replace(/^,|,$/g, '');
      }
      
      // If the result is empty or just commas, set to null
      if (!updatedSkuCode || updatedSkuCode.trim() === '' || updatedSkuCode === ',') {
        updatedSkuCode = null;
      }
      
      // Update the component
      const updateQuery = `
        UPDATE public.sdp_component_details
        SET sku_code = $1
        WHERE id = $2
        RETURNING id, sku_code, component_code, component_description
      `;
      
      const updateResult = await pool.query(updateQuery, [updatedSkuCode, component.id]);
      
      if (updateResult.rows[0]) {
        const result = updateResult.rows[0];
        
        updatedComponents.push({
          component_id: component.id,
          component_code: component.component_code,
          old_sku_code: component.sku_code,
          new_sku_code: result.sku_code
        });
      }
    } catch (error) {
      updatedComponents.push({
        component_id: component.id,
        component_code: component.component_code,
        error: error.message
      });
    }
  }
  
  return updatedComponents;
}

/**
 * Add SKU code to specific components (handles comma-separated values)
 * @param {string} skuCode - The SKU code to add to specific components
 * @param {Array} components - Array of component objects with component_id
 * @returns {Promise<Array>} Array of updated component records
 */
async function addSkuToSpecificComponents(skuCode, components) {
  const updatedComponents = [];
  
  for (const component of components) {
    try {
      const componentId = component.component_id;
      
      if (!componentId) {
        continue;
      }
      
      // Get current component data
      const getQuery = `
        SELECT id, sku_code, component_code, component_description
        FROM public.sdp_component_details
        WHERE id = $1 AND is_active = true
      `;
      
      const getResult = await pool.query(getQuery, [componentId]);
      
      if (getResult.rows.length === 0) {
        continue;
      }
      
      const componentData = getResult.rows[0];
      let updatedSkuCode = componentData.sku_code;
      
      // Add SKU code to the comma-separated list
      if (!updatedSkuCode || updatedSkuCode.trim() === '') {
        // If empty, just add the SKU code
        updatedSkuCode = skuCode;
      } else {
        // Check if SKU code already exists
        const skuList = updatedSkuCode.split(',').map(s => s.trim());
        if (!skuList.includes(skuCode)) {
          // Add to the end
          updatedSkuCode = `${updatedSkuCode},${skuCode}`;
        } else {
          continue;
        }
      }
      
      // Update the component
      const updateQuery = `
        UPDATE public.sdp_component_details
        SET sku_code = $1
        WHERE id = $2
        RETURNING id, sku_code, component_code, component_description
      `;
      
      const updateResult = await pool.query(updateQuery, [updatedSkuCode, componentId]);
      
      if (updateResult.rows[0]) {
        const result = updateResult.rows[0];
        
        updatedComponents.push({
          component_id: componentId,
          component_code: componentData.component_code,
          old_sku_code: componentData.sku_code,
          new_sku_code: result.sku_code
        });
      }
    } catch (error) {
      updatedComponents.push({
        component_id: component.component_id,
        error: error.message
      });
    }
  }
  
  return updatedComponents;
}

/**
 * Check if SKU code already exists in sdp_skudetails
 * @param {string} skuCode - The SKU code to check
 * @returns {Promise<boolean>} True if exists, false otherwise
 */
async function checkSkuCodeExists(skuCode) {
  const query = `
    SELECT COUNT(*) as count
    FROM public.sdp_skudetails
    WHERE sku_code = $1;
  `;
  const result = await pool.query(query, [skuCode]);
  return result.rows[0].count > 0;
}

/**
 * Get all master data in one API call
 * @returns {Promise<Object>} Object containing all master data
 */
async function getAllMasterData() {
  try {
    // Get all periods
    const periodsQuery = `
      SELECT id, period, is_active
      FROM public.sdp_period
      WHERE is_active = true
      ORDER BY period;
    `;
    const periodsResult = await pool.query(periodsQuery);

    // Get all regions
    const regionsQuery = `
      SELECT id, name
      FROM public.sdp_region
      ORDER BY name;
    `;
    const regionsResult = await pool.query(regionsQuery);

    // Get all material types
    const materialTypesQuery = `
      SELECT id, item_name, item_order, is_active, created_by, created_date
      FROM public.sdp_material_type
      WHERE is_active = true
      ORDER BY item_order, item_name;
    `;
    const materialTypesResult = await pool.query(materialTypesQuery);

    // Get all component UOMs
    const uomsQuery = `
      SELECT id, item_name, item_order, is_active, created_by, created_date
      FROM public.sdp_component_uom
      WHERE is_active = true
      ORDER BY item_order, item_name;
    `;
    const uomsResult = await pool.query(uomsQuery);

    // Get all packaging materials
    const packagingMaterialsQuery = `
      SELECT id, item_name, item_order, is_active, created_by, created_date
      FROM public.sdp_component_packaging_material
      WHERE is_active = true
      ORDER BY item_order, item_name;
    `;
    const packagingMaterialsResult = await pool.query(packagingMaterialsQuery);

    // Get all packaging levels
    const packagingLevelsQuery = `
      SELECT id, item_name, item_order, is_active, created_by, created_date
      FROM public.sdp_component_packaging_level
      WHERE is_active = true
      ORDER BY item_order, item_name;
    `;
    const packagingLevelsResult = await pool.query(packagingLevelsQuery);

    // Get all component base UOMs
    const baseUomsQuery = `
      SELECT id, item_name, item_order, is_active, created_by, created_date
      FROM public.sdp_component_base_uom
      WHERE is_active = true
      ORDER BY item_order, item_name;
    `;
    const baseUomsResult = await pool.query(baseUomsQuery);

    return {
      periods: periodsResult.rows,
      regions: regionsResult.rows,
      material_types: materialTypesResult.rows,
      component_uoms: uomsResult.rows,
      packaging_materials: packagingMaterialsResult.rows,
      packaging_levels: packagingLevelsResult.rows,
      component_base_uoms: baseUomsResult.rows,
      total_count: {
        periods: periodsResult.rows.length,
        regions: regionsResult.rows.length,
        material_types: materialTypesResult.rows.length,
        component_uoms: uomsResult.rows.length,
        packaging_materials: packagingMaterialsResult.rows.length,
        packaging_levels: packagingLevelsResult.rows.length,
        component_base_uoms: baseUomsResult.rows.length
      }
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Get consolidated dashboard data for a CM code
 * @param {string} cmCode - The CM code
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Consolidated dashboard data
 */
async function getConsolidatedDashboardData(cmCode, options = {}) {
  try {
    const {
      include = [],
      period,
      search,
      component_id
    } = options;

    const result = {};

    // Helper function to safely execute queries
    const safeQuery = async (queryFn, key) => {
      try {
        if (include.includes(key)) {
          result[key] = await queryFn();
        }
      } catch (error) {
        console.error(`Error fetching ${key}:`, error.message);
        result[key] = { error: error.message };
      }
    };

    // 1. Get SKU details for CM
    await safeQuery(async () => {
      const query = `
        SELECT id, sku_code, site, sku_description, cm_code, cm_description, sku_reference, 
               is_active, created_by, created_date, period, purchased_quantity, sku_reference_check, 
               formulation_reference, dual_source_sku, skutype, bulk_expert, is_approved
        FROM public.sdp_skudetails
        WHERE cm_code = $1 AND is_active = true
        ORDER BY id DESC;
      `;
      const skuResult = await pool.query(query, [cmCode]);
      return skuResult.rows;
    }, 'skus');

    // 2. Get SKU descriptions for dropdowns
    await safeQuery(async () => {
      const query = `
        SELECT DISTINCT sku_description, cm_code
        FROM public.sdp_skudetails
        WHERE is_active = true
        ORDER BY sku_description;
      `;
      const descResult = await pool.query(query);
      return descResult.rows;
    }, 'descriptions');

    // 3. Get SKU references based on period and search
    await safeQuery(async () => {
      let query = `
        SELECT DISTINCT sku_code, sku_description
        FROM public.sdp_skudetails
        WHERE is_active = true
      `;
      const values = [];
      let paramIndex = 1;

      if (period) {
        query += ` AND period = $${paramIndex++}`;
        values.push(period);
      }

      if (search) {
        query += ` AND (sku_code ILIKE $${paramIndex++} OR sku_description ILIKE $${paramIndex++})`;
        values.push(`%${search}%`);
        values.push(`%${search}%`);
      }

      query += ` ORDER BY sku_code`;
      const refResult = await pool.query(query, values);
      return refResult.rows;
    }, 'references');

    // 4. Get component audit logs
    await safeQuery(async () => {
      if (!component_id) {
        return [];
      }
      const query = `
        SELECT id, component_id, action, details, created_by, created_date
        FROM public.sdp_component_audit_log
        WHERE component_id = $1
        ORDER BY created_date DESC;
      `;
      const auditResult = await pool.query(query, [component_id]);
      return auditResult.rows.map(row => ({
        action: row.action,
        timestamp: row.created_date,
        details: row.details
      }));
    }, 'audit_logs');

    // 5. Get component data by code
    await safeQuery(async () => {
      if (!component_id) {
        return { components_with_evidence: [] };
      }
      const query = `
        SELECT cd.*, ce.file_path, ce.file_name, ce.upload_date
        FROM public.sdp_component_details cd
        LEFT JOIN public.sdp_component_evidence ce ON cd.id = ce.component_id
        WHERE cd.id = $1 AND cd.is_active = true
        ORDER BY ce.upload_date DESC;
      `;
      const compResult = await pool.query(query, [component_id]);
      
      const components_with_evidence = [];
      const componentMap = new Map();

      compResult.rows.forEach(row => {
        if (!componentMap.has(row.id)) {
          componentMap.set(row.id, {
            component_details: {
              id: row.id,
              sku_id: row.sku_id,
              component_name: row.component_name,
              material_type: row.material_type,
              packaging_type: row.packaging_type,
              weight: row.weight,
              weight_uom: row.weight_uom,
              is_active: row.is_active,
              created_by: row.created_by,
              created_date: row.created_date
            },
            evidence_files: []
          });
        }

        if (row.file_path) {
          componentMap.get(row.id).evidence_files.push({
            file_path: row.file_path,
            file_name: row.file_name,
            upload_date: row.upload_date
          });
        }
      });

      return { components_with_evidence: Array.from(componentMap.values()) };
    }, 'component_data');

    // 6. Get master data (reuse existing function)
    await safeQuery(async () => {
      return await getAllMasterData();
    }, 'master_data');

    return result;
  } catch (error) {
    throw error;
  }
}

/**
 * Universal status toggle function for SKU and Component
 * @param {string} type - The type of item ('sku' or 'component')
 * @param {number} id - The ID of the item
 * @param {boolean} isActive - The new active status
 * @returns {Promise<Object>} The updated item data
 */
async function toggleUniversalStatus(type, id, isActive) {
  try {
    // Validate type
    if (!['sku', 'component'].includes(type)) {
      throw new Error(`Invalid type: ${type}. Must be 'sku' or 'component'`);
    }

    // Validate id
    if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
      throw new Error(`Invalid ID: ${id}. Must be a positive integer`);
    }

    // Validate isActive
    if (typeof isActive !== 'boolean') {
      throw new Error(`Invalid is_active: ${isActive}. Must be a boolean`);
    }

    let result;

    if (type === 'sku') {
      // Update SKU status in sdp_skudetails table
      const query = `
        UPDATE public.sdp_skudetails 
        SET is_active = $1
        WHERE id = $2
        RETURNING id, sku_code, sku_description, is_active, created_date;
      `;
      const skuResult = await pool.query(query, [isActive, id]);
      
      if (skuResult.rows.length === 0) {
        throw new Error(`SKU with ID ${id} not found`);
      }

      result = {
        id: skuResult.rows[0].id,
        type: 'sku',
        is_active: skuResult.rows[0].is_active,
        updated_at: new Date().toISOString(),
        sku_code: skuResult.rows[0].sku_code,
        sku_description: skuResult.rows[0].sku_description
      };

    } else if (type === 'component') {
      // Update Component status in sdp_sku_component_mapping_details table
      const query = `
        UPDATE public.sdp_sku_component_mapping_details 
        SET is_active = $1
        WHERE id = $2
        RETURNING id, cm_code, sku_code, component_code, version, component_packaging_type_id, period_id, component_valid_from, component_valid_to, is_active, created_by, created_at;
      `;
      const compResult = await pool.query(query, [isActive, id]);
      
      if (compResult.rows.length === 0) {
        throw new Error(`Component mapping with ID ${id} not found`);
      }

      result = {
        id: compResult.rows[0].id,
        type: 'component',
        is_active: compResult.rows[0].is_active,
        updated_at: new Date().toISOString(),
        cm_code: compResult.rows[0].cm_code,
        sku_code: compResult.rows[0].sku_code,
        component_code: compResult.rows[0].component_code,
        version: compResult.rows[0].version,
        component_packaging_type_id: compResult.rows[0].component_packaging_type_id,
        period_id: compResult.rows[0].period_id,
        component_valid_from: compResult.rows[0].component_valid_from,
        component_valid_to: compResult.rows[0].component_valid_to,
        created_by: compResult.rows[0].created_by,
        created_at: compResult.rows[0].created_at
      };
    }

    return result;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getActiveYears,
  getSkuDetailsByCMCode,
  getAllSkuDetails,
  updateIsActiveStatus,
  getAllSkuDescriptions,
  insertSkuDetail,
  updateSkuDetailBySkuCode,
  removeSkuFromComponentDetails,
  removeSkuFromAllComponentDetails,
  addSkuToSpecificComponents,
  checkSkuCodeExists,
  getAllMasterData,
  getConsolidatedDashboardData,
  toggleUniversalStatus
}; 