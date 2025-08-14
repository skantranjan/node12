-- SQL Script to create the audit log table for sdp_sku_component_mapping_details
-- This table maintains a complete audit trail of all changes

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
    change_summary TEXT,
    
    -- Indexes for better query performance
    CONSTRAINT idx_audit_cm_code CHECK (cm_code IS NOT NULL AND cm_code != ''),
    CONSTRAINT idx_audit_sku_code CHECK (sku_code IS NOT NULL AND sku_code != ''),
    CONSTRAINT idx_audit_action_type CHECK (action_type IS NOT NULL AND action_type != ''),
    CONSTRAINT idx_audit_action_reason CHECK (action_reason IS NOT NULL AND action_reason != ''),
    CONSTRAINT idx_audit_changed_by CHECK (changed_by IS NOT NULL AND changed_by != ''),
    CONSTRAINT idx_audit_changed_at CHECK (changed_at IS NOT NULL)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_audit_cm_code ON public.sdp_sku_component_mapping_details_auditlog(cm_code);
CREATE INDEX IF NOT EXISTS idx_audit_sku_code ON public.sdp_sku_component_mapping_details_auditlog(sku_code);
CREATE INDEX IF NOT EXISTS idx_audit_component_code ON public.sdp_sku_component_mapping_details_auditlog(component_code);
CREATE INDEX IF NOT EXISTS idx_audit_action_type ON public.sdp_sku_component_mapping_details_auditlog(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_action_reason ON public.sdp_sku_component_mapping_details_auditlog(action_reason);
CREATE INDEX IF NOT EXISTS idx_audit_changed_at ON public.sdp_sku_component_mapping_details_auditlog(changed_at);
CREATE INDEX IF NOT EXISTS idx_audit_changed_by ON public.sdp_sku_component_mapping_details_auditlog(changed_by);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_audit_cm_sku ON public.sdp_sku_component_mapping_details_auditlog(cm_code, sku_code);
CREATE INDEX IF NOT EXISTS idx_audit_cm_sku_component ON public.sdp_sku_component_mapping_details_auditlog(cm_code, sku_code, component_code);
CREATE INDEX IF NOT EXISTS idx_audit_action_reason_date ON public.sdp_sku_component_mapping_details_auditlog(action_reason, changed_at);

-- Add comments for documentation
COMMENT ON TABLE public.sdp_sku_component_mapping_details_auditlog IS 'Audit log table for tracking all changes to sdp_sku_component_mapping_details table';
COMMENT ON COLUMN public.sdp_sku_component_mapping_details_auditlog.action_type IS 'Type of operation: INSERT, UPDATE, or DELETE';
COMMENT ON COLUMN public.sdp_sku_component_mapping_details_auditlog.action_reason IS 'Reason for the action (e.g., REPLACED, INTERNAL_SKU_CONVERSION, NEW_MAPPING)';
COMMENT ON COLUMN public.sdp_sku_component_mapping_details_auditlog.old_values IS 'JSON string containing the old values before the change';
COMMENT ON COLUMN public.sdp_sku_component_mapping_details_auditlog.new_values IS 'JSON string containing the new values after the change';
COMMENT ON COLUMN public.sdp_sku_component_mapping_details_auditlog.changed_by IS 'User or system that made the change';
COMMENT ON COLUMN public.sdp_sku_component_mapping_details_auditlog.change_summary IS 'Human-readable description of what changed';

-- Grant necessary permissions (adjust as needed for your database setup)
-- GRANT SELECT, INSERT ON public.sdp_sku_component_mapping_details_auditlog TO your_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE public.sdp_sku_component_mapping_details_auditlog_id_seq TO your_app_user;

