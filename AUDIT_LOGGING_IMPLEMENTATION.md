# 🔍 Comprehensive Audit Logging System Implementation

## 📋 Overview

This document explains the complete audit logging system implemented for the Sustainability API. The system maintains a complete audit trail of all changes made to SKU details and component mappings, ensuring full traceability and compliance.

## 🗄️ Database Table Structure

### Audit Log Table: `sdp_sku_component_mapping_details_auditlog`

```sql
CREATE TABLE IF NOT EXISTS public.sdp_sku_component_mapping_details_auditlog (
    id SERIAL PRIMARY KEY,
    
    -- Original mapping table fields (for reference)
    cm_code VARCHAR(255) NOT NULL,
    sku_code VARCHAR(255) NOT NULL,
    component_code VARCHAR(255),
    version INTEGER,
    component_packaging_type_id VARCHAR(255),
    period_id INTEGER,
    component_valid_from TIMESTAMP,
    component_valid_to TIMESTAMP,
    created_by VARCHAR(255),
    
    -- Audit specific fields
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('INSERT', 'UPDATE', 'DELETE')),
    action_reason VARCHAR(255) NOT NULL,
    old_values TEXT, -- JSON string of old values
    new_values TEXT, -- JSON string of new values
    changed_by VARCHAR(255) NOT NULL,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    change_summary TEXT
);
```

## 🔧 Core Audit Functions

### 1. `logComponentMappingDeletion(deletedMapping, action, reason, user)`
- **Purpose**: Logs component mapping deletions
- **Parameters**:
  - `deletedMapping`: The mapping record that was deleted
  - `action`: Always 'DELETE'
  - `reason`: Why the deletion occurred (e.g., 'REPLACED', 'INTERNAL_SKU_CONVERSION')
  - `user`: Who performed the deletion

### 2. `logComponentMappingInsertion(insertedMapping, action, reason, user)`
- **Purpose**: Logs component mapping insertions
- **Parameters**:
  - `insertedMapping`: The new mapping record
  - `action`: Always 'INSERT'
  - `reason`: Why the insertion occurred (e.g., 'NEW_MAPPING', 'REPLACED_MAPPING')
  - `user`: Who performed the insertion

### 3. `logSkuDetailUpdate(oldData, newData, changedFields, user)`
- **Purpose**: Logs SKU detail field changes
- **Parameters**:
  - `oldData`: Original SKU data before changes
  - `newData`: Updated SKU data after changes
  - `changedFields`: Array of field names that changed
  - `user`: Who performed the update

### 4. `logBulkComponentMappingOperation(operations, action, reason, user)`
- **Purpose**: Handles bulk operations (multiple insertions/deletions)
- **Parameters**:
  - `operations`: Array of operations to log
  - `action`: 'INSERT' or 'DELETE'
  - `reason`: Why the bulk operation occurred
  - `user`: Who performed the operation

## 📊 Audit Logging Scenarios

### Scenario 1: Component Replacement (DELETE + INSERT)
**When**: SKU update with new components
**Process**:
1. Delete existing mappings with reason: `'REPLACED'`
2. Insert new mappings with reason: `'REPLACED_MAPPING'`
**Audit Log**: 
- DELETE records for old mappings
- INSERT records for new mappings

### Scenario 2: Internal SKU Conversion
**When**: SKU type changes to 'internal'
**Process**: Delete all component mappings
**Audit Log**: DELETE records with reason: `'INTERNAL_SKU_CONVERSION'`

### Scenario 3: External SKU with Components
**When**: SKU type changes to 'external' with components
**Process**: DELETE old + INSERT new
**Audit Log**: 
- DELETE records with reason: `'EXTERNAL_SKU_UPDATE'`
- INSERT records with reason: `'EXTERNAL_SKU_UPDATE'`

### Scenario 4: SKU Field Updates
**When**: Description, reference, site, etc. changes
**Process**: Compare old vs new data
**Audit Log**: UPDATE record with reason: `'SKU_DETAIL_UPDATE'`

### Scenario 5: New SKU Creation
**When**: New SKU created with components
**Process**: Insert component mappings
**Audit Log**: INSERT records with reason: `'NEW_SKU_COMPONENT'`

## 🚀 API Endpoints

### 1. Get Audit Log Data
**Endpoint**: `GET /audit-log`
**Purpose**: Retrieve audit log data with filtering and pagination
**Query Parameters**:
- `cm_code`: Filter by CM code
- `sku_code`: Filter by SKU code
- `component_code`: Filter by component code
- `action_type`: Filter by action type (INSERT/UPDATE/DELETE)
- `action_reason`: Filter by action reason
- `start_date`: Filter from date
- `end_date`: Filter to date
- `limit`: Number of records per page (default: 100)
- `offset`: Page offset (default: 0)

**Response Example**:
```json
{
  "success": true,
  "message": "Audit log data retrieved successfully",
  "data": {
    "records": [...],
    "pagination": {
      "total": 150,
      "limit": 100,
      "offset": 0,
      "has_more": true
    },
    "filters_applied": {...}
  }
}
```

## 🔍 Audit Log Analysis

### Common Action Reasons

| Action Reason | Description | When It Occurs |
|---------------|-------------|----------------|
| `REPLACED` | Component mappings replaced | SKU update with new components |
| `REPLACED_MAPPING` | New mappings after replacement | After component replacement |
| `INTERNAL_SKU_CONVERSION` | SKU converted to internal | SKU type changed to internal |
| `EXTERNAL_SKU_UPDATE` | External SKU updated | SKU type changed to external |
| `NEW_SKU_COMPONENT` | New SKU with components | SKU creation with components |
| `SKU_DETAIL_UPDATE` | SKU details modified | SKU field updates |

### Query Examples

#### 1. Get All Deletions for a Specific SKU
```sql
SELECT * FROM sdp_sku_component_mapping_details_auditlog 
WHERE sku_code = 'SKU001' AND action_type = 'DELETE'
ORDER BY changed_at DESC;
```

#### 2. Get Component Change History
```sql
SELECT * FROM sdp_sku_component_mapping_details_auditlog 
WHERE component_code = 'COMP001' 
ORDER BY changed_at DESC;
```

#### 3. Get Recent Changes by User
```sql
SELECT * FROM sdp_sku_component_mapping_details_auditlog 
WHERE changed_by = 'admin' 
AND changed_at >= NOW() - INTERVAL '7 days'
ORDER BY changed_at DESC;
```

#### 4. Get Replacement History
```sql
SELECT * FROM sdp_sku_component_mapping_details_auditlog 
WHERE action_reason LIKE '%REPLACED%'
ORDER BY changed_at DESC;
```

## 🛡️ Error Handling

### Audit Logging Failures
- **Non-blocking**: Audit logging failures don't break main operations
- **Logging**: All errors are logged to console for debugging
- **Graceful Degradation**: System continues to function even if audit logging fails

### Error Types Handled
- Database connection issues
- Table structure problems
- Data validation errors
- JSON serialization issues

## 📈 Performance Considerations

### Indexes Created
- Primary key on `id`
- Single column indexes on frequently queried fields
- Composite indexes for common query patterns
- Date-based indexes for time-range queries

### Query Optimization
- Pagination support for large datasets
- Efficient WHERE clause building
- Optimized ORDER BY clauses

## 🔐 Security Features

### Data Integrity
- All changes are logged with user identification
- Timestamp tracking for audit trail
- JSON storage of complete data snapshots

### Access Control
- User tracking for all operations
- Reason codes for change justification
- Complete change history preservation

## 📋 Implementation Checklist

### Database Setup
- [ ] Run `CREATE_AUDIT_LOG_TABLE.sql` script
- [ ] Verify table creation and indexes
- [ ] Test table permissions

### Code Integration
- [ ] Audit functions added to controller
- [ ] All CRUD operations updated with logging
- [ ] Error handling implemented
- [ ] User tracking integrated

### Testing
- [ ] Test component replacement scenarios
- [ ] Test SKU type conversions
- [ ] Test SKU field updates
- [ ] Test bulk operations
- [ ] Verify audit log data integrity

### Monitoring
- [ ] Console logging for audit operations
- [ ] Error tracking for failed audit logs
- [ ] Performance monitoring for large operations

## 🎯 Benefits

### 1. **Complete Traceability**
- Every change is logged with context
- Full history of all modifications
- User accountability for all actions

### 2. **Compliance & Auditing**
- Regulatory compliance support
- Internal audit capabilities
- Change justification tracking

### 3. **Debugging & Troubleshooting**
- Easy identification of problematic changes
- Rollback capability analysis
- Data integrity verification

### 4. **Business Intelligence**
- Change pattern analysis
- User activity monitoring
- System usage insights

## 🚨 Important Notes

### 1. **Data Volume**
- Audit logs can grow large over time
- Consider archiving strategies for old logs
- Monitor database performance

### 2. **Storage Requirements**
- JSON storage of complete data snapshots
- Plan for adequate storage capacity
- Regular cleanup of old audit data

### 3. **Performance Impact**
- Minimal impact on main operations
- Asynchronous logging where possible
- Efficient querying with proper indexes

## 🔄 Future Enhancements

### 1. **Advanced Filtering**
- Full-text search capabilities
- Complex query builders
- Export functionality

### 2. **Real-time Notifications**
- Change alerts for critical operations
- Email notifications for specific events
- Dashboard integration

### 3. **Analytics & Reporting**
- Change trend analysis
- User activity reports
- Compliance dashboards

---

## 📞 Support

For questions or issues with the audit logging system:
1. Check console logs for error messages
2. Verify database table structure
3. Test individual audit functions
4. Review this documentation

**Remember**: The audit logging system is designed to be robust and non-blocking, ensuring your main application continues to function even if audit logging encounters issues.
