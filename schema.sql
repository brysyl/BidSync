-- ==============================================================================
-- BidSync Enterprise PostgreSQL Database Schema
-- Multi-Agent B2B Procurement and RFP Negotiation Architecture
-- Optimized for PostgreSQL 16+ on Vultr Cloud & Coolify Orchestration
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum Types
CREATE TYPE org_type_enum AS ENUM ('BUYER', 'VENDOR', 'AUDITOR');
CREATE TYPE rfp_status_enum AS ENUM ('DRAFT', 'INGESTED', 'ANALYZING', 'BENCHMARKED', 'BIDDING', 'NEGOTIATING', 'AWARDED', 'CANCELLED');
CREATE TYPE bid_status_enum AS ENUM ('GENERATED', 'SUBMITTED', 'REVISED', 'ACCEPTED', 'REJECTED', 'SUPERSEDED');
CREATE TYPE agent_status_enum AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'FLAGGED_ANOMALY');
CREATE TYPE contract_status_enum AS ENUM ('DRAFTING', 'IN_NEGOTIATION', 'PENDING_SIGNATURES', 'EXECUTED', 'VOIDED');

-- 1. Organizations Table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type org_type_enum NOT NULL DEFAULT 'VENDOR',
    duns_number VARCHAR(20),
    tax_id VARCHAR(50),
    industry VARCHAR(100),
    contact_email VARCHAR(255) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. RFPs (Requests for Proposals) Table
CREATE TABLE rfps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    category VARCHAR(100) NOT NULL,
    raw_document_url TEXT,
    document_hash VARCHAR(64),
    requirements_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    budget_cap NUMERIC(15, 2) NOT NULL,
    target_delivery_days INT NOT NULL,
    sla_penalty_clause TEXT,
    status rfp_status_enum NOT NULL DEFAULT 'DRAFT',
    deadline TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Market Pricing Benchmarks (MCP Ledger Cache)
CREATE TABLE market_benchmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(100) NOT NULL,
    sku_code VARCHAR(100) NOT NULL,
    item_description TEXT NOT NULL,
    unit_of_measure VARCHAR(50) NOT NULL,
    median_unit_price NUMERIC(15, 2) NOT NULL,
    p25_unit_price NUMERIC(15, 2) NOT NULL,
    p75_unit_price NUMERIC(15, 2) NOT NULL,
    volatility_index NUMERIC(4, 2) DEFAULT 0.05,
    sample_size INT DEFAULT 100,
    source VARCHAR(100) DEFAULT 'MCP_ERP_LEDGER_FEED',
    last_synced_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bids Table
CREATE TABLE bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfp_id UUID NOT NULL REFERENCES rfps(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    bid_amount NUMERIC(15, 2) NOT NULL,
    compliance_score NUMERIC(5, 2) NOT NULL CHECK (compliance_score >= 0 AND compliance_score <= 100),
    delivery_timeline_days INT NOT NULL,
    sla_guarantee_percent NUMERIC(5, 2) NOT NULL,
    line_items_breakdown JSONB NOT NULL DEFAULT '[]'::jsonb,
    anomaly_flags JSONB DEFAULT '[]'::jsonb,
    has_markup_anomaly BOOLEAN DEFAULT FALSE,
    strategy_summary TEXT,
    status bid_status_enum NOT NULL DEFAULT 'GENERATED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Agent Executions Table (Audit & Telemetry Log)
CREATE TABLE agent_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfp_id UUID NOT NULL REFERENCES rfps(id) ON DELETE CASCADE,
    bid_id UUID REFERENCES bids(id) ON DELETE SET NULL,
    agent_name VARCHAR(100) NOT NULL,
    model_provider VARCHAR(50) NOT NULL, -- e.g. 'GEMINI_3_PRO', 'VULTR_SERVERLESS_INFERENCE', 'MCP_TOOL_RUNNER'
    model_identifier VARCHAR(100) NOT NULL,
    status agent_status_enum NOT NULL DEFAULT 'PENDING',
    input_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    output_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    reasoning_trace TEXT,
    token_usage_input INT DEFAULT 0,
    token_usage_output INT DEFAULT 0,
    latency_ms INT NOT NULL DEFAULT 0,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Contracts Table
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfp_id UUID NOT NULL REFERENCES rfps(id) ON DELETE CASCADE,
    bid_id UUID NOT NULL REFERENCES bids(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES organizations(id),
    vendor_id UUID NOT NULL REFERENCES organizations(id),
    total_contract_value NUMERIC(15, 2) NOT NULL,
    terms_markdown TEXT NOT NULL,
    clause_breakdown JSONB NOT NULL DEFAULT '[]'::jsonb,
    signed_buyer BOOLEAN NOT NULL DEFAULT FALSE,
    buyer_signed_at TIMESTAMPTZ,
    buyer_signer_name VARCHAR(255),
    signed_vendor BOOLEAN NOT NULL DEFAULT FALSE,
    vendor_signed_at TIMESTAMPTZ,
    vendor_signer_name VARCHAR(255),
    audit_hash VARCHAR(64) NOT NULL, -- SHA-256 Cryptographic Execution Hash
    status contract_status_enum NOT NULL DEFAULT 'DRAFTING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for High Throughput Querying
CREATE INDEX idx_rfps_org_id ON rfps(org_id);
CREATE INDEX idx_rfps_status ON rfps(status);
CREATE INDEX idx_bids_rfp_id ON bids(rfp_id);
CREATE INDEX idx_bids_vendor_id ON bids(vendor_id);
CREATE INDEX idx_agent_executions_rfp_id ON agent_executions(rfp_id);
CREATE INDEX idx_agent_executions_timestamp ON agent_executions(timestamp DESC);
CREATE INDEX idx_contracts_rfp_bid ON contracts(rfp_id, bid_id);
CREATE INDEX idx_market_benchmarks_sku ON market_benchmarks(sku_code);

-- Seed Data: Baseline Organizations
INSERT INTO organizations (id, name, type, duns_number, tax_id, industry, contact_email) VALUES
('a1111111-1111-1111-1111-111111111111', 'Apex Global Enterprises', 'BUYER', '08-123-4567', 'US-8849201', 'Cloud Infrastructure & FinTech', 'procurement@apexglobal.corp'),
('b2222222-2222-2222-2222-222222222222', 'Vultr Infrastructure Solutions Ltd', 'VENDOR', '19-987-6543', 'US-9912034', 'High Performance Bare-Metal & Cloud', 'enterprise-bids@vultr-solutions.io'),
('c3333333-3333-3333-3333-333333333333', 'Nexus Systems Integrators', 'VENDOR', '22-456-7890', 'US-5544332', 'Managed Cloud & Cybersecurity', 'bids@nexussystems.tech'),
('d4444444-4444-4444-4444-444444444444', 'QuantumScale Cloud & AI', 'VENDOR', '33-789-0123', 'US-1122334', 'GPU Cluster & Data Engineering', 'deals@quantumscale.ai');

-- Seed Data: Market Pricing Benchmarks (MCP Ledger Feed)
INSERT INTO market_benchmarks (category, sku_code, item_description, unit_of_measure, median_unit_price, p25_unit_price, p75_unit_price, volatility_index) VALUES
('Compute', 'VULTR-CLOUD-H100', 'NVIDIA H100 80GB SXM5 GPU Node / hr', 'GPU-Hour', 3.25, 2.95, 3.80, 0.08),
('Compute', 'VULTR-BARE-E32', 'Dual AMD EPYC 32-Core 256GB RAM 10Gbps Server', 'Monthly Instance', 450.00, 410.00, 495.00, 0.04),
('Storage', 'NVME-BLK-TIER1', 'High IOPS Tier-1 NVMe Block Storage (per TB/mo)', 'TB-Month', 40.00, 36.00, 48.00, 0.03),
('Bandwidth', 'BW-TRANSIT-10G', 'Dedicated 10Gbps Unmetered IP Transit (per Gbps/mo)', 'Gbps-Month', 65.00, 55.00, 80.00, 0.06),
('Engineering', 'SR-SYSARCH-ENG', 'Lead Distributed Systems Architect / Migration Eng', 'Engineer-Hour', 185.00, 160.00, 220.00, 0.05),
('Support', 'SLA-247-PLAT', '24/7/365 Tier-3 Enterprise Mission Critical SLA', 'Monthly SLA', 3500.00, 3000.00, 4200.00, 0.02);
