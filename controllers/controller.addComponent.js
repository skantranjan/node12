const { insertComponentDetail, checkDuplicateComponent } = require('../models/model.addComponent');
const { insertMultipleEvidenceFiles } = require('../models/model.addEvidence');
const { getPeriodById } = require('../models/model.getPeriods');
const { uploadFilesToBlob } = require('../utils/azureBlobStorage');

/**
 * Controller to add a new component detail with file uploads
 */
async function addComponentController(request, reply) {
  try {
    console.log('🔍 ===== ADD COMPONENT API - DATA RECEIVED =====');
    console.log('Content-Type:', request.headers['content-type']);
    console.log('Request body keys:', Object.keys(request.body || {}));
    
    const componentData = {};
    const files = {
      'Weight': [],
      'weightUOM': [],
      'Packaging Type': [],
      'Material Type': [],
      'PackagingEvidence': []
    };

    // Since we have attachFieldsToBody: true, data is in request.body
    if (request.body) {
      console.log('\n📋 === PROCESSING REQUEST BODY ===');
      
      // Extract component data from request.body
      Object.keys(request.body).forEach(key => {
        console.log(`\n🔍 Processing key: ${key}`);
        
        if (key.endsWith('_files')) {
          // This is a file field - map to specific categories
          const categoryKey = key.replace('_files', '');
          let category = categoryKey;
          
          // Map generic category names to specific ones
          if (categoryKey === 'category1') category = 'Weight';
          else if (categoryKey === 'category2') category = 'weightUOM';
          else if (categoryKey === 'category3') category = 'Packaging Type';
          else if (categoryKey === 'category4') category = 'Material Type';
          else if (categoryKey === 'packaging_evidence' || categoryKey === 'PackagingEvidence') category = 'PackagingEvidence';
          
          console.log(`📁 File field detected: ${key} -> mapped to ${category}`);
          
          if (files.hasOwnProperty(category)) {
            // Handle file data
            const fileData = request.body[key];
            console.log(`📄 File data for ${key} (mapped to ${category}):`);
            console.log(`   - Type: ${typeof fileData}`);
            console.log(`   - Is Array: ${Array.isArray(fileData)}`);
            console.log(`   - Has filename: ${fileData && fileData.filename ? 'YES' : 'NO'}`);
            console.log(`   - Has _buf: ${fileData && fileData._buf ? 'YES' : 'NO'}`);
            console.log(`   - Has toBuffer: ${fileData && fileData.toBuffer ? 'YES' : 'NO'}`);
            
            if (Array.isArray(fileData)) {
              console.log(`   - Processing as ARRAY with ${fileData.length} items`);
              fileData.forEach((file, index) => {
                console.log(`     📎 File ${index + 1}: ${file.filename}`);
                console.log(`       - MimeType: ${file.mimetype}`);
                console.log(`       - Has _buf: ${file._buf ? 'YES' : 'NO'}`);
                console.log(`       - _buf size: ${file._buf ? file._buf.length : 'N/A'} bytes`);
                
                // Properly extract file buffer
                let fileBuffer = null;
                if (file._buf) {
                  fileBuffer = file._buf;
                  console.log(`       ✅ Using _buf (${fileBuffer.length} bytes)`);
                } else if (file.data) {
                  fileBuffer = file.data;
                  console.log(`       ✅ Using data (${fileBuffer.length} bytes)`);
                } else if (file.buffer) {
                  fileBuffer = file.buffer;
                  console.log(`       ✅ Using buffer (${fileBuffer.length} bytes)`);
                } else if (file.toBuffer && typeof file.toBuffer === 'function') {
                  fileBuffer = file.toBuffer();
                  console.log(`       ✅ Using toBuffer() (${fileBuffer.length} bytes)`);
                }
                
                if (fileBuffer && Buffer.isBuffer(fileBuffer)) {
                  files[category].push({
                    filename: file.filename,
                    mimetype: file.mimetype,
                    data: fileBuffer
                  });
                  console.log(`       ✅ Added file: ${file.filename} (${fileBuffer.length} bytes) to ${category}`);
                } else {
                  console.log(`       ❌ Invalid file data for ${file.filename} in ${category}`);
                  console.log(`         - Buffer type: ${typeof fileBuffer}`);
                  console.log(`         - Is Buffer: ${Buffer.isBuffer(fileBuffer)}`);
                }
              });
            } else if (fileData && fileData.filename) {
              console.log(`   - Processing as SINGLE FILE: ${fileData.filename}`);
              console.log(`     - MimeType: ${fileData.mimetype}`);
              console.log(`     - Has _buf: ${fileData._buf ? 'YES' : 'NO'}`);
              console.log(`     - _buf size: ${fileData._buf ? fileData._buf.length : 'N/A'} bytes`);
              
              // Handle single file
              let fileBuffer = null;
              if (fileData._buf) {
                fileBuffer = fileData._buf;
                console.log(`     ✅ Using _buf (${fileBuffer.length} bytes)`);
              } else if (fileData.data) {
                fileBuffer = fileData.data;
                console.log(`     ✅ Using data (${fileBuffer.length} bytes)`);
              } else if (fileData.buffer) {
                fileBuffer = fileData.buffer;
                console.log(`     ✅ Using buffer (${fileBuffer.length} bytes)`);
              } else if (fileData.toBuffer && typeof fileData.toBuffer === 'function') {
                fileBuffer = fileData.toBuffer();
                console.log(`     ✅ Using toBuffer() (${fileBuffer.length} bytes)`);
              }
              
              if (fileBuffer && Buffer.isBuffer(fileBuffer)) {
                files[category].push({
                  filename: fileData.filename,
                  mimetype: fileData.mimetype,
                  data: fileBuffer
                });
                console.log(`     ✅ Added file: ${fileData.filename} (${fileBuffer.length} bytes) to ${category}`);
              } else {
                console.log(`     ❌ Invalid file data for ${fileData.filename} in ${category}`);
                console.log(`       - Buffer type: ${typeof fileBuffer}`);
                console.log(`       - Is Buffer: ${Buffer.isBuffer(fileBuffer)}`);
              }
            } else {
              console.log(`   ⚠️ No valid file data found for ${key}`);
            }
          }
        } else {
          // This is a regular field - extract the value properly
          const fieldData = request.body[key];
          console.log(`📝 Form field: ${key}`);
          console.log(`   - Type: ${typeof fieldData}`);
          console.log(`   - Value: ${fieldData && typeof fieldData === 'object' ? fieldData.value : fieldData}`);
          
          if (fieldData && typeof fieldData === 'object' && fieldData.value !== undefined) {
            componentData[key] = fieldData.value;
            console.log(`   ✅ Extracted value: ${fieldData.value}`);
          } else if (typeof fieldData === 'string' || typeof fieldData === 'number') {
            componentData[key] = fieldData;
            console.log(`   ✅ Direct value: ${fieldData}`);
          }
        }
      });
    }

    // Handle PackagingEvidence files from separate object structure
    console.log('\n🔍 === PACKAGING EVIDENCE REQUEST BODY CHECK ===');
    console.log('Request body keys:', Object.keys(request.body));
    console.log('Packagingfile exists:', !!request.body.Packagingfile);
    if (request.body.Packagingfile) {
      console.log('Packagingfile keys:', Object.keys(request.body.Packagingfile));
      console.log('Packagingfile.files exists:', !!request.body.Packagingfile.files);
      console.log('Packagingfile.files type:', typeof request.body.Packagingfile.files);
      console.log('Packagingfile.files length:', request.body.Packagingfile.files ? request.body.Packagingfile.files.length : 'N/A');
    }
    
    if (request.body.Packagingfile && request.body.Packagingfile.files) {
      console.log('\n📦 === PROCESSING PACKAGING EVIDENCE FILES ===');
      console.log('PackagingEvidence files found:', request.body.Packagingfile.files.length);
      
      const packagingFiles = request.body.Packagingfile.files;
      
      if (Array.isArray(packagingFiles)) {
        packagingFiles.forEach((file, index) => {
          console.log(`📦 Processing PackagingEvidence file ${index + 1}: ${file.filename}`);
          console.log(`   - MimeType: ${file.mimetype}`);
          console.log(`   - Has _buf: ${file._buf ? 'YES' : 'NO'}`);
          console.log(`   - _buf size: ${file._buf ? file._buf.length : 'N/A'} bytes`);
          
          // Properly extract file buffer
          let fileBuffer = null;
          if (file._buf) {
            fileBuffer = file._buf;
            console.log(`   ✅ Using _buf (${fileBuffer.length} bytes)`);
          } else if (file.data) {
            fileBuffer = file.data;
            console.log(`   ✅ Using data (${fileBuffer.length} bytes)`);
          } else if (file.buffer) {
            fileBuffer = file.buffer;
            console.log(`   ✅ Using buffer (${fileBuffer.length} bytes)`);
          } else if (file.toBuffer && typeof file.toBuffer === 'function') {
            fileBuffer = file.toBuffer();
            console.log(`   ✅ Using toBuffer() (${fileBuffer.length} bytes)`);
          }
          
          if (fileBuffer && Buffer.isBuffer(fileBuffer)) {
            files['PackagingEvidence'].push({
              filename: file.filename,
              mimetype: file.mimetype,
              data: fileBuffer
            });
            console.log(`   ✅ Added PackagingEvidence file: ${file.filename} (${fileBuffer.length} bytes)`);
          } else {
            console.log(`   ❌ Invalid file data for ${file.filename} in PackagingEvidence`);
            console.log(`     - Buffer type: ${typeof fileBuffer}`);
            console.log(`     - Is Buffer: ${Buffer.isBuffer(fileBuffer)}`);
          }
        });
      } else if (packagingFiles.filename) {
        // Handle single file
        console.log(`📦 Processing single PackagingEvidence file: ${packagingFiles.filename}`);
        console.log(`   - MimeType: ${packagingFiles.mimetype}`);
        console.log(`   - Has _buf: ${packagingFiles._buf ? 'YES' : 'NO'}`);
        console.log(`   - _buf size: ${packagingFiles._buf ? packagingFiles._buf.length : 'N/A'} bytes`);
        
        let fileBuffer = null;
        if (packagingFiles._buf) {
          fileBuffer = packagingFiles._buf;
          console.log(`   ✅ Using _buf (${fileBuffer.length} bytes)`);
        } else if (packagingFiles.data) {
          fileBuffer = packagingFiles.data;
          console.log(`   ✅ Using data (${fileBuffer.length} bytes)`);
        } else if (packagingFiles.buffer) {
          fileBuffer = packagingFiles.buffer;
          console.log(`   ✅ Using buffer (${fileBuffer.length} bytes)`);
        } else if (packagingFiles.toBuffer && typeof packagingFiles.toBuffer === 'function') {
          fileBuffer = packagingFiles.toBuffer();
          console.log(`   ✅ Using toBuffer() (${fileBuffer.length} bytes)`);
        }
        
        if (fileBuffer && Buffer.isBuffer(fileBuffer)) {
          files['PackagingEvidence'].push({
            filename: packagingFiles.filename,
            mimetype: packagingFiles.mimetype,
            data: fileBuffer
          });
          console.log(`   ✅ Added PackagingEvidence file: ${packagingFiles.filename} (${fileBuffer.length} bytes)`);
        } else {
          console.log(`   ❌ Invalid file data for ${packagingFiles.filename} in PackagingEvidence`);
          console.log(`     - Buffer type: ${typeof fileBuffer}`);
          console.log(`     - Is Buffer: ${Buffer.isBuffer(fileBuffer)}`);
        }
      }
    }

    console.log('\n📊 === FINAL PROCESSED DATA ===');
    console.log('Component Data Keys:', Object.keys(componentData));
    console.log('Component Type related fields:');
    console.log('  - material_type_id:', componentData.material_type_id);
    console.log('  - component_type:', componentData.component_type);
    console.log('  - materialTypeId:', componentData.materialTypeId);
    console.log('  - componentType:', componentData.componentType);
    console.log('Files by Category:');
    Object.keys(files).forEach(cat => {
      console.log(`  ${cat}: ${files[cat].length} files`);
      if (files[cat].length > 0) {
        files[cat].forEach(file => {
          console.log(`    - ${file.filename} (${file.mimetype}) - ${file.data.length} bytes`);
        });
      }
    });
    
    // Special check for PackagingEvidence
    console.log('\n🔍 === PACKAGING EVIDENCE CHECK ===');
    console.log('PackagingEvidence files count:', files['PackagingEvidence'] ? files['PackagingEvidence'].length : 0);
    if (files['PackagingEvidence'] && files['PackagingEvidence'].length > 0) {
      console.log('PackagingEvidence file details:');
      files['PackagingEvidence'].forEach((file, index) => {
        console.log(`  File ${index + 1}: ${file.filename} (${file.mimetype}) - ${file.data.length} bytes`);
      });
    } else {
      console.log('❌ No PackagingEvidence files found in files object');
    }

    // Validate required fields
    const validationErrors = [];
    
    // 1. Component Type validation (material_type_id)
    // Check for multiple possible field names for Component Type
    const componentTypeValue = componentData.material_type_id || componentData.component_type || componentData.materialTypeId || componentData.componentType;
    
    if (!componentTypeValue || componentTypeValue.toString().trim() === '') {
      validationErrors.push({
        field: 'material_type_id',
        message: 'A value is required for Component Type'
      });
    } else {
      // Update the componentData with the correct field name for database
      componentData.material_type_id = componentTypeValue;
    }
    
    // 2. Component Code validation
    if (!componentData.component_code || componentData.component_code.trim() === '') {
      validationErrors.push({
        field: 'component_code',
        message: 'A value is required for Component Code'
      });
    }
    
    // 3. Component Description validation
    if (!componentData.component_description || componentData.component_description.trim() === '') {
      validationErrors.push({
        field: 'component_description',
        message: 'A value is required for Component Description'
      });
    }
    
    // 4. Component validity date - From validation
    if (!componentData.component_valid_from) {
      validationErrors.push({
        field: 'component_valid_from',
        message: 'A value is required for Component validity date - From'
      });
    }
    
    // 5. Component validity date - To validation
    if (!componentData.component_valid_to) {
      validationErrors.push({
        field: 'component_valid_to',
        message: 'A value is required for Component validity date - To'
      });
    }
    
    // 6. Additional required fields validation
    if (!componentData.cm_code) {
      validationErrors.push({
        field: 'cm_code',
        message: 'A value is required for CM Code'
      });
    }
    
    if (!componentData.year) {
      validationErrors.push({
        field: 'year',
        message: 'A value is required for Year'
      });
    }
    
    if (!componentData.sku_code) {
      validationErrors.push({
        field: 'sku_code',
        message: 'A value is required for SKU Code'
      });
    }
    
    // Return validation errors if any
    if (validationErrors.length > 0) {
      return reply.code(400).send({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    // 7. Duplicate record check
    try {
      const isDuplicate = await checkDuplicateComponent({
        cm_code: componentData.cm_code,
        sku_code: componentData.sku_code,
        component_code: componentData.component_code,
        component_valid_from: componentData.component_valid_from,
        component_valid_to: componentData.component_valid_to
      });
      
      if (isDuplicate) {
        return reply.code(400).send({
          success: false,
          message: 'Duplicate record check - duplicate records must not exist for the combination of 3PM Code, SKU Code, Component Code, Component Validity Date - From, and Component Validity Date - To',
          errors: [
            {
              field: 'duplicate_record',
              message: 'A record with the same CM Code, SKU Code, Component Code, Component Validity Date - From, and Component Validity Date - To already exists'
            }
          ]
        });
      }
    } catch (error) {
      console.error('❌ Error checking for duplicate records:', error);
      return reply.code(500).send({
        success: false,
        message: 'Error checking for duplicate records',
        error: error.message
      });
    }

    // Get year name from sdp_period table
    let yearName = null;
    try {
      const periodData = await getPeriodById(componentData.year);
      if (periodData) {
        yearName = periodData.period;
        componentData.periods = componentData.year; // Use the same year ID value
        console.log(`✅ Found year name: ${yearName} for year ID: ${componentData.year}`);
      } else {
        console.log(`⚠️ No period found for year ID: ${componentData.year}`);
      }
    } catch (error) {
      console.error('❌ Error fetching period data:', error);
    }

    // Set default values for timestamps if not provided
    if (!componentData.created_date) {
      componentData.created_date = new Date();
    }

    if (!componentData.last_update_date) {
      componentData.last_update_date = new Date();
    }

    // Set default value for is_active if not provided
    if (componentData.is_active === undefined) {
      componentData.is_active = true;
    }

    console.log('\n📁 === AZURE FOLDER CREATION ===');
    console.log(`📂 Year: ${yearName || componentData.year}`);
    console.log(`📂 CM Code: ${componentData.cm_code}`);
    console.log(`📂 SKU Code: ${componentData.sku_code}`);
    console.log(`📂 Component Code: ${componentData.component_code}`);
    
    // Show folder structure that will be created
    const categories = ["Weight", "weightUOM", "Packaging Type", "Material Type", "PackagingEvidence"];
    console.log('\n📁 === FOLDER STRUCTURE TO BE CREATED ===');
    categories.forEach(category => {
      const folderPath = `${yearName || componentData.year}/${componentData.cm_code}/${componentData.sku_code}/${componentData.component_code}/${category}/`;
      console.log(`📁 ${folderPath}`);
    });

    // Upload files to Azure Blob Storage
    console.log('\n🚀 === STARTING AZURE UPLOAD ===');
    const uploadResults = await uploadFilesToBlob(
      files,
      yearName || componentData.year, // Use year name if available, otherwise use year ID
      componentData.cm_code,
      componentData.sku_code,
      componentData.component_code
    );

    // Virtual folder creation removed - not needed when uploading actual files

    // Insert component data into database
    console.log('\n💾 === SAVING COMPONENT TO DATABASE ===');
    const insertedComponent = await insertComponentDetail(componentData);
    console.log(`✅ Component saved with ID: ${insertedComponent.id}`);

    // Save evidence file records to sdp_evidence table
    const evidenceFiles = [];
    
    console.log('\n📄 === PROCESSING EVIDENCE FILES ===');
    console.log('Upload Results:', JSON.stringify(uploadResults, null, 2));
    console.log('Component ID:', insertedComponent.id);
    
    // Collect all uploaded files for evidence table
    Object.keys(uploadResults.uploadedFiles).forEach(category => {
      console.log(`📄 Processing category: ${category}`);
      uploadResults.uploadedFiles[category].forEach(uploadedFile => {
        console.log(`📄 Processing file: ${uploadedFile.originalName}`);
        evidenceFiles.push({
          component_id: insertedComponent.id,
          evidence_file_name: uploadedFile.originalName,
          evidence_file_url: uploadedFile.blobUrl,
          category: category, // Save the category name
          created_by: componentData.created_by || componentData.user_id,
          created_date: new Date()
        });
      });
    });

    // Also collect files from the original files object (even if Azure upload failed)
    Object.keys(files).forEach(category => {
      if (files[category] && files[category].length > 0) {
        console.log(`📄 Processing original files for category: ${category}`);
        files[category].forEach(file => {
          console.log(`📄 Processing original file: ${file.filename}`);
          evidenceFiles.push({
            component_id: insertedComponent.id,
            evidence_file_name: file.filename,
            evidence_file_url: `pending-azure-upload/${file.filename}`, // Placeholder URL
            category: category, // Save the category name
            created_by: componentData.created_by || componentData.user_id,
            created_date: new Date()
          });
        });
      }
    });

    console.log('\n💾 === SAVING EVIDENCE RECORDS ===');
    console.log('Evidence files to insert:', evidenceFiles.length);
    console.log('Evidence files data:', JSON.stringify(evidenceFiles, null, 2));

    // Insert evidence records if there are any files
    let evidenceRecords = [];
    if (evidenceFiles.length > 0) {
      try {
        evidenceRecords = await insertMultipleEvidenceFiles(evidenceFiles);
        console.log(`✅ Saved ${evidenceRecords.length} evidence records to database`);
      } catch (error) {
        console.error('❌ Error saving evidence records:', error);
      }
    } else {
      console.log('⚠️ No evidence files to save (upload may have failed)');
    }

    console.log('\n✅ === API RESPONSE ===');
    const responseData = {
      success: true,
      message: 'Component detail added successfully with file uploads',
      data: {
        component: insertedComponent,
        fileUploads: uploadResults,
        evidenceRecords: evidenceRecords,
        yearInfo: {
          yearId: componentData.year,
          yearName: yearName,
          periods: componentData.year
        },
        categories: {
          'Weight': files['Weight'].length,
          'weightUOM': files['weightUOM'].length,
          'Packaging Type': files['Packaging Type'].length,
          'Material Type': files['Material Type'].length,
          'PackagingEvidence': files['PackagingEvidence'].length
        }
      }
    };
    
    console.log('📤 === RESPONSE SENT TO UI ===');
    console.log('Status Code: 201');
    console.log('Response Body:');
    console.log(JSON.stringify(responseData, null, 2));
    
    reply.code(201).send(responseData);

  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ 
      success: false, 
      message: 'Failed to add component detail', 
      error: error.message 
    });
  }
}

module.exports = { addComponentController }; 