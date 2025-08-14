# Export Excel API Documentation

## Overview

The `POST /export-excel` API retrieves **ALL SKU data** for a specific CM code, including component mapping and details when available. This API ensures complete coverage - every SKU for the CM is returned, even those without component relationships.

## Key Features

### 1. **Complete SKU Coverage**
- **ALL SKUs**: Returns every SKU associated with the CM code
- **With Components**: Full mapping + component details when available
- **Without Components**: Basic SKU info when no component mappings exist
- **No Missing Data**: Ensures comprehensive Excel export

### 2. **Three-Table Integration**
- **`sdp_skudetails`**: Primary table (LEFT JOIN) - always returns data
- **`sdp_sku_component_mapping_details`**: Component mappings (LEFT JOIN) - may be NULL
- **`sdp_component_details`**: Component details (LEFT JOIN) - may be NULL

### 3. **Smart Data Handling**
- **SKUs with Components**: Full component information + mapping details
- **SKUs without Components**: SKU details only (mapping/component fields = NULL)
- **Perfect for Excel**: Each row represents a unique SKU-component relationship or SKU-only record

## Response Structure

```json
{
  "success": true,
  "count": 6,
  "cm_code": "cm001",
  "message": "Found 6 record(s) for CM: cm001",
  "data": [
    {
      // SKU Details (ALWAYS present)
      "sku_id": 1,
      "sku_code": "sku001",
      "sku_description": "Product A",
      "cm_code": "cm001",
      "cm_description": "Category 1",
      "sku_reference": "REF001",
      "sku_is_active": true,
      "sku_created_by": "user1",
      "sku_created_date": "2025-01-01T00:00:00.000Z",
      "period": "2025-2026",
      "purchased_quantity": "1000",
      "sku_reference_check": "CHECKED",
      "formulation_reference": "FORM001",
      "dual_source_sku": false,
      "site": "Site A",
      "skutype": "external",
      "bulk_expert": "Expert A",
      
      // Mapping Data (may be NULL if no components)
      "mapping_id": 1,
      "mapping_version": 1,
      "mapping_packaging_type_id": "pkg1",
      "mapping_period_id": 1,
      "mapping_valid_from": "2025-01-01T00:00:00.000Z",
      "mapping_valid_to": "2025-12-31T00:00:00.000Z",
      "mapping_is_active": true,
      "mapping_created_by": "user1",
      "mapping_created_at": "2025-01-01T00:00:00.000Z",
      "mapping_updated_at": "2025-01-01T00:00:00.000Z",
      
      // Component Details (may be NULL if no components)
      "component_id": 101,
      "component_code": "comp001",
      "component_formulation_reference": "COMP_FORM001",
      "material_type_id": "1",
      "components_reference": "COMP001",
      "component_description": "Component A",
      "component_valid_from": "2025-01-01T00:00:00.000Z",
      "component_valid_to": "2025-12-31T00:00:00.000Z",
      "component_material_group": "MATGROUP1",
      "component_quantity": "100",
      "component_uom_id": 1,
      "component_base_quantity": "50",
      "component_base_uom_id": "2",
      "percent_w_w": "75",
      "evidence": "evidence.pdf",
      "component_packaging_type_id": "PKG01",
      "component_packaging_material": "Plastic",
      "helper_column": "Helper info",
      "component_unit_weight": "20",
      "weight_unit_measure_id": "kg",
      "percent_mechanical_pcr_content": "15",
      "percent_mechanical_pir_content": "10",
      "percent_chemical_recycled_content": "5",
      "percent_bio_sourced": "8",
      "material_structure_multimaterials": "Multilayer PET/PE",
      "component_packaging_color_opacity": "Opaque White",
      "component_packaging_level_id": "Primary",
      "component_dimensions": "10x20x5",
      "packaging_specification_evidence": "spec_doc.pdf",
      "evidence_of_recycled_or_bio_source": "recycled_cert.pdf",
      "last_update_date": "2025-01-01T00:00:00.000Z",
      "category_entry_id": "CAT001",
      "data_verification_entry_id": "DV001",
      "user_id": "USR001",
      "signed_off_by": 1,
      "signed_off_date": "2025-01-01T00:00:00.000Z",
      "mandatory_fields_completion_status": "Complete",
      "evidence_provided": "Yes",
      "document_status": "Approved",
      "component_is_active": true,
      "component_created_by": "admin",
      "component_created_date": "2025-01-01T00:00:00.000Z",
      "year": "2025",
      "component_unit_weight_id": "WT123",
      "periods": "Q1"
    },
    {
      // SKU with NO components - only SKU data present
      "sku_id": 2,
      "sku_code": "sku002",
      "sku_description": "Product B (No Components)",
      "cm_code": "cm001",
      "cm_description": "Category 1",
      "sku_reference": "REF002",
      "sku_is_active": true,
      "sku_created_by": "user1",
      "sku_created_date": "2025-01-01T00:00:00.000Z",
      "period": "2025-2026",
      "purchased_quantity": "500",
      "sku_reference_check": "CHECKED",
      "formulation_reference": "FORM002",
      "dual_source_sku": false,
      "site": "Site B",
      "skutype": "internal",
      "bulk_expert": "Expert B",
      
      // All mapping and component fields are NULL
      "mapping_id": null,
      "mapping_version": null,
      "mapping_packaging_type_id": null,
      "mapping_period_id": null,
      "mapping_valid_from": null,
      "mapping_valid_to": null,
      "mapping_is_active": null,
      "mapping_created_by": null,
      "mapping_created_at": null,
      "mapping_updated_at": null,
      "component_id": null,
      "component_code": null,
      "component_formulation_reference": null,
      // ... all other component fields are null
    }
  ],
  "summary": {
    "total_records": 6,
    "unique_skus": 3,
    "skus_with_components": 2,
    "skus_without_components": 1,
    "unique_components": 2,
    "active_skus": 3,
    "active_mappings": 2,
    "active_components": 2
  }
}
```

## Data Scenarios

### **Scenario 1: SKU with Components**
- All fields populated
- Full component mapping and details
- Perfect for detailed analysis

### **Scenario 2: SKU without Components**
- SKU fields populated
- Mapping/component fields = NULL
- Essential for complete inventory

### **Scenario 3: SKU with Multiple Components**
- Multiple rows for same SKU
- Each row = unique component relationship
- Maintains data integrity

## Benefits

1. **Complete Coverage**: No SKUs are missed, even if they have no components
2. **Flexible Export**: Perfect for Excel with varying data completeness
3. **Audit Trail**: Complete picture of CM's SKU portfolio
4. **Data Analysis**: Can identify SKUs needing component setup
5. **Reporting**: Comprehensive CM overview for stakeholders

## Excel Export Strategy

### **Column Structure:**
- **Always Present**: SKU details (sku_code, sku_description, etc.)
- **Conditional**: Component data (NULL when not applicable)
- **Filtering**: Use `mapping_id IS NOT NULL` to separate SKUs with/without components

### **Recommended Sheets:**
1. **All SKUs**: Complete CM overview
2. **SKUs with Components**: Detailed component analysis
3. **SKUs without Components**: Inventory gaps identification
