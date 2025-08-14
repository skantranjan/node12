# Consolidated Dashboard API

## Overview

The Consolidated Dashboard API (`GET /cm-dashboard/:cmCode`) combines multiple existing GET APIs into a single endpoint, allowing frontend applications to fetch multiple data types in one request. This reduces API calls and improves performance.

## Endpoint

```
GET /cm-dashboard/:cmCode
```

## Authentication

- **Type**: Bearer Token
- **Header**: `Authorization: Bearer <token>`

## Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `include` | string[] | Yes | Comma-separated list of data types to include |
| `period` | string | No | Period for filtering references |
| `search` | string | No | Search term for SKU references |
| `component_id` | string | No | Component ID for audit logs and component data |

## Include Options

| Option | Description | Corresponds to Original API |
|--------|-------------|------------------------------|
| `skus` | SKU details for the CM | `GET /sku-details/${cmCode}` |
| `descriptions` | SKU descriptions for dropdowns | `GET /sku-descriptions` |
| `references` | SKU reference options | `GET /getskureference/${period}/${cmCode}` |
| `audit_logs` | Component audit history | `GET /component-audit-log/${component.id}` |
| `component_data` | Component data by code | `GET /get-component-code-data?component_code=${code}` |
| `master_data` | Master data (periods, material types, etc.) | `GET /get-masterdata` |

## Request Examples

### 1. Full Data Load
```bash
GET /cm-dashboard/CM001?include=skus,descriptions,references,audit_logs,component_data,master_data
```

### 2. Partial Data Load
```bash
GET /cm-dashboard/CM001?include=skus,descriptions
```

### 3. Search Functionality
```bash
GET /cm-dashboard/CM001?include=references&search=SKU123
```

### 4. Period Filtering
```bash
GET /cm-dashboard/CM001?include=references&period=2025
```

### 5. Component Audit Logs
```bash
GET /cm-dashboard/CM001?include=audit_logs&component_id=1
```

### 6. Component Data
```bash
GET /cm-dashboard/CM001?include=component_data&component_id=1
```

## Response Structure

```json
{
  "success": boolean,
  "message": string,
  "data": {
    "skus"?: Array<SkuData>,
    "descriptions"?: Array<{sku_description: string, cm_code: string}>,
    "references"?: Array<{sku_code: string, sku_description: string}>,
    "audit_logs"?: Array<{action: string, timestamp: string, details: object}>,
    "component_data"?: {components_with_evidence: Array},
    "master_data"?: {
      "periods": Array<{id: number, period: string, is_active: boolean}>,
      "material_types": Array<{id: number, item_name: string, item_order: number, is_active: boolean}>,
      "component_uoms": Array<{id: number, item_name: string, item_order: number, is_active: boolean}>,
      "packaging_materials": Array<{id: number, item_name: string, item_order: number, is_active: boolean}>,
      "packaging_levels": Array<{id: number, item_name: string, item_order: number, is_active: boolean}>
    }
  }
}
```

## Data Types

### SkuData
```json
{
  "id": number,
  "sku_code": string,
  "site": string,
  "sku_description": string,
  "cm_code": string,
  "cm_description": string,
  "sku_reference": string,
  "is_active": boolean,
  "created_by": string,
  "created_date": string,
  "period": string,
  "purchased_quantity": number,
  "sku_reference_check": string,
  "formulation_reference": string,
  "dual_source_sku": string,
  "skutype": string,
  "bulk_expert": string
}
```

### Component Audit Log
```json
{
  "action": string,
  "timestamp": string,
  "details": object
}
```

### Component Data
```json
{
  "components_with_evidence": [
    {
      "component_details": {
        "id": number,
        "sku_id": string,
        "component_name": string,
        "material_type": string,
        "packaging_type": string,
        "weight": number,
        "weight_uom": string,
        "is_active": boolean,
        "created_by": string,
        "created_date": string
      },
      "evidence_files": [
        {
          "file_path": string,
          "file_name": string,
          "upload_date": string
        }
      ]
    }
  ]
}
```

## Error Handling

### 400 Bad Request
```json
{
  "success": false,
  "message": "CM code is required"
}
```

```json
{
  "success": false,
  "message": "Invalid include parameters: invalid_option. Valid options: skus, descriptions, references, audit_logs, component_data, master_data"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to retrieve consolidated dashboard data",
  "error": "Error details"
}
```

## Performance Optimizations

1. **Conditional Data Loading**: Only fetches requested data types
2. **Safe Query Execution**: Individual query failures don't affect other data types
3. **Parameterized Queries**: Prevents SQL injection
4. **Optimized Joins**: Efficient database queries for component data

## Caching Strategy

- **Master Data**: Consider caching for 1 hour (rarely changes)
- **SKU Descriptions**: Consider caching for 30 minutes
- **Component Data**: Consider caching for 15 minutes
- **Audit Logs**: No caching (real-time data)

## Migration Strategy

1. **Phase 1**: Deploy new API alongside existing endpoints
2. **Phase 2**: Update frontend to use new API for dashboard
3. **Phase 3**: Monitor performance and usage
4. **Phase 4**: Deprecate individual endpoints (optional)

## Testing Scenarios

### 1. Full Data Load
```bash
curl -X GET "http://localhost:3000/cm-dashboard/CM001?include=skus,descriptions,references,audit_logs,component_data,master_data" \
  -H "Authorization: Bearer Qw8!zR2@pL6"
```

### 2. Partial Data Load
```bash
curl -X GET "http://localhost:3000/cm-dashboard/CM001?include=skus,descriptions" \
  -H "Authorization: Bearer Qw8!zR2@pL6"
```

### 3. Search Functionality
```bash
curl -X GET "http://localhost:3000/cm-dashboard/CM001?include=references&search=SKU123" \
  -H "Authorization: Bearer Qw8!zR2@pL6"
```

### 4. Period Filtering
```bash
curl -X GET "http://localhost:3000/cm-dashboard/CM001?include=references&period=2025" \
  -H "Authorization: Bearer Qw8!zR2@pL6"
```

## Benefits

1. **Reduced API Calls**: Single request instead of multiple
2. **Better Performance**: Fewer network round trips
3. **Improved UX**: Faster page loads
4. **Flexible**: Request only needed data
5. **Backward Compatible**: Existing endpoints remain functional
6. **Error Resilient**: Individual failures don't break entire request

## Monitoring

- Track API response times
- Monitor database query performance
- Log include parameter usage patterns
- Alert on error rates
- Monitor cache hit rates (when implemented)
