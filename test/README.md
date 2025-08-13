# Generic API Test Implementation

This is a **separate test implementation** for a generic API that can fetch data from different tables dynamically.

## 🧪 Test Files

- `generic-api-test.js` - Core test functions
- `generic-api-routes-test.js` - Test routes
- `README.md` - This documentation

## 🚀 How to Use

### 1. Test Single Table Data

**GET** `/test-table/:tableName`

```bash
# Get all periods
GET /test-table/sdp_period

# Get periods with limit
GET /test-table/sdp_period?limit=5

# Get active material types
GET /test-table/sdp_material_type?is_active=true&limit=10&orderBy=item_name
```

### 2. Test Multiple Tables Data

**POST** `/test-generic-api`

```json
{
  "multiTables": [
    {
      "tableName": "sdp_period",
      "options": { "is_active": true, "limit": 3 }
    },
    {
      "tableName": "sdp_region",
      "options": { "limit": 5 }
    },
    {
      "tableName": "sdp_material_type",
      "options": { "is_active": true, "limit": 3 }
    }
  ]
}
```

### 3. Test Single Table with Options

**POST** `/test-generic-api`

```json
{
  "tableName": "sdp_period",
  "options": {
    "is_active": true,
    "limit": 5,
    "orderBy": "period"
  }
}
```

## 📋 Available Tables

- `sdp_period` - Periods/Years
- `sdp_region` - Regions
- `sdp_material_type` - Material Types
- `sdp_component_uom` - Component UOMs
- `sdp_component_packaging_material` - Packaging Materials
- `sdp_component_packaging_level` - Packaging Levels
- `sdp_component_base_uom` - Component Base UOMs
- `sdp_cm_codes` - CM Codes
- `sdp_skudetails` - SKU Details

## ⚙️ Query Options

- `is_active` - Filter by active status (boolean)
- `limit` - Limit number of records (number)
- `offset` - Offset for pagination (number)
- `orderBy` - Order by column (string)

## 🔒 Security Features

- ✅ **Table Name Validation** - Only allowed tables can be queried
- ✅ **SQL Injection Protection** - Parameterized queries
- ✅ **Bearer Token Authentication** - All routes protected
- ✅ **Error Handling** - Proper error responses

## 📝 Example Responses

### Single Table Response
```json
{
  "success": true,
  "message": "Data retrieved from sdp_period",
  "tableName": "sdp_period",
  "count": 3,
  "data": [
    { "id": 1, "period": "2024", "is_active": true },
    { "id": 2, "period": "2025", "is_active": true }
  ]
}
```

### Multiple Tables Response
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "sdp_period": [...],
    "sdp_region": [...],
    "sdp_material_type": [...]
  }
}
```

## 🧪 Running Tests

```javascript
const { testGenericAPI } = require('./test/generic-api-test');

// Run the test function
testGenericAPI();
```

## 🎯 Benefits

- ✅ **Flexible** - Query any allowed table
- ✅ **Efficient** - Get multiple tables in one call
- ✅ **Secure** - Protected against SQL injection
- ✅ **Reusable** - Same API for different tables
- ✅ **Testable** - Separate from production code

This test implementation allows you to experiment with the generic API concept without affecting your main application! 🚀
