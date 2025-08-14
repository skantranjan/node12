# Universal Status Toggle API

## Overview

The Universal Status Toggle API (`PATCH /toggle-status`) consolidates two existing status APIs into one endpoint, providing a unified way to toggle the active/inactive status of both SKUs and Components.

## Endpoint

```
PATCH /toggle-status
```

## Authentication

- **Type**: Bearer Token
- **Header**: `Authorization: Bearer <token>`

## Request Body

```json
{
  "type": "sku" | "component",
  "id": number,
  "is_active": boolean
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | Yes | Type of item to toggle ('sku' or 'component') |
| `id` | number | Yes | ID of the item to toggle |
| `is_active` | boolean | Yes | New active status (true/false) |

## Request Examples

### SKU Status Change
```json
{
  "type": "sku",
  "id": 123,
  "is_active": false
}
```

### Component Status Change
```json
{
  "type": "component",
  "id": 456,
  "is_active": true
}
```

## Success Response

```json
{
  "success": true,
  "message": "Status updated successfully",
  "data": {
    "id": 123,
    "type": "sku",
    "is_active": false,
    "updated_at": "2024-01-15T10:30:00Z",
    "sku_code": "SKU123",
    "sku_description": "Sample SKU"
  }
}
```

### SKU Response Data
```json
{
  "id": number,
  "type": "sku",
  "is_active": boolean,
  "updated_at": string,
  "sku_code": string,
  "sku_description": string
}
```

### Component Response Data (Updated)
```json
{
  "id": number,
  "type": "component",
  "is_active": boolean,
  "updated_at": string,
  "cm_code": string,
  "sku_code": string,
  "component_code": string,
  "version": number,
  "component_packaging_type_id": string,
  "period_id": number,
  "component_valid_from": string,
  "component_valid_to": string,
  "created_by": string,
  "created_at": string
}
```

## Error Responses

### 400 Bad Request - Validation Errors

**Invalid Type:**
```json
{
  "success": false,
  "message": "Invalid type provided. Must be 'sku' or 'component'",
  "error": "VALIDATION_ERROR"
}
```

**Invalid ID:**
```json
{
  "success": false,
  "message": "Invalid ID: -1. Must be a positive integer",
  "error": "VALIDATION_ERROR"
}
```

**Missing Required Fields:**
```json
{
  "success": false,
  "message": "Type is required",
  "error": "VALIDATION_ERROR"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "SKU with ID 999 not found",
  "error": "NOT_FOUND"
}
```

```json
{
  "success": false,
  "message": "Component mapping with ID 999 not found",
  "error": "NOT_FOUND"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Failed to update status",
  "error": "Database connection error"
}
```

## Validation Rules

### Type Validation
- Must be exactly `"sku"` or `"component"`
- Case-sensitive
- No other values allowed

### ID Validation
- Must be a positive integer
- Must be greater than 0
- Must exist in the database

### is_active Validation
- Must be a boolean value (true/false)
- Cannot be null or undefined
- Cannot be a string or number

## Business Logic

### SKU Status Change
- Updates `is_active` field in `sdp_skudetails` table
- Returns current timestamp as `updated_at`
- Returns SKU details including code and description

### Component Status Change (Updated)
- Updates `is_active` field in `sdp_sku_component_mapping_details` table
- Returns current timestamp as `updated_at`
- Returns comprehensive component mapping details including:
  - CM code, SKU code, component code
  - Version, packaging type, period information
  - Validity dates and creation details

## Database Tables Used

| Type | Table | Purpose |
|------|-------|---------|
| **SKU** | `sdp_skudetails` | SKU master data and status |
| **Component** | `sdp_sku_component_mapping_details` | Component mapping relationships and status |

## Audit Logging

The API logs all status changes for audit purposes:
```
Status change: sku ID 123 set to inactive
Status change: component mapping ID 456 set to active
```

## Testing Scenarios

### 1. Valid SKU Status Change
```bash
curl -X PATCH "http://localhost:3000/toggle-status" \
  -H "Authorization: Bearer Qw8!zR2@pL6" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "sku",
    "id": 123,
    "is_active": false
  }'
```

### 2. Valid Component Status Change
```bash
curl -X PATCH "http://localhost:3000/toggle-status" \
  -H "Authorization: Bearer Qw8!zR2@pL6" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "component",
    "id": 456,
    "is_active": true
  }'
```

### 3. Invalid Type (Error)
```bash
curl -X PATCH "http://localhost:3000/toggle-status" \
  -H "Authorization: Bearer Qw8!zR2@pL6" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "invalid_type",
    "id": 123,
    "is_active": false
  }'
```

### 4. Invalid ID (Error)
```bash
curl -X PATCH "http://localhost:3000/toggle-status" \
  -H "Authorization: Bearer Qw8!zR2@pL6" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "sku",
    "id": -1,
    "is_active": false
  }'
```

### 5. Missing Required Fields (Error)
```bash
curl -X PATCH "http://localhost:3000/toggle-status" \
  -H "Authorization: Bearer Qw8!zR2@pL6" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "sku",
    "is_active": false
  }'
```

## Migration from Existing APIs

### Before (2 APIs)
```javascript
// SKU Status Change
PATCH /sku-details/123/is-active
{ "is_active": false }

// Component Status Change  
PATCH /component-status-change/456
{ "is_active": true }
```

### After (1 API)
```javascript
// Universal Status Toggle
PATCH /toggle-status
{ 
  "type": "sku", 
  "id": 123, 
  "is_active": false 
}

PATCH /toggle-status
{ 
  "type": "component", 
  "id": 456, 
  "is_active": true 
}
```

## Benefits

1. **Reduced API Count**: From 2 APIs to 1
2. **Consistent Behavior**: Same endpoint for both operations
3. **Easier Maintenance**: One endpoint to manage
4. **Better Error Handling**: Unified approach
5. **Audit Logging**: Centralized tracking
6. **Type Safety**: Clear validation rules
7. **Proper Table Usage**: Component status now updates mapping table instead of component details

## Frontend Integration

### JavaScript Example
```javascript
async function toggleStatus(type, id, isActive) {
  try {
    const response = await fetch('/toggle-status', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        type: type, // 'sku' or 'component'
        id: id,
        is_active: isActive
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Status updated:', result.data);
      return result.data;
    } else {
      console.error('Error:', result.message);
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Failed to toggle status:', error);
    throw error;
  }
}

// Usage
toggleStatus('sku', 123, false);
toggleStatus('component', 456, true);
```

## Monitoring

- Track status change frequency by type
- Monitor error rates and types
- Log response times
- Alert on validation failures
- Track user actions for audit purposes

## Security Considerations

- Bearer token authentication required
- Input validation prevents SQL injection
- Type checking prevents invalid operations
- Audit logging for compliance
- Error messages don't expose sensitive data
