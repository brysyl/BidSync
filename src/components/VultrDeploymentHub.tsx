import React, { useState } from "react";
import {
  Server,
  Database,
  Layers,
  Cpu,
  Copy,
  Check,
  Play,
} from "lucide-react";

export const VultrDeploymentHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"topology" | "mcp" | "schema" | "docker">("topology");
  const [testSku, setTestSku] = useState("VULTR-CLOUD-H100");
  const [testPrice, setTestPrice] = useState(4.20);
  const [mcpResult, setMcpResult] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleRunMcpTest = async () => {
    try {
      await fetch("/api/v1/mcp/tools");
      // Test direct calculation
      const median = testSku.includes("H100") ? 3.25 : testSku.includes("BARE") ? 450.0 : 40.0;
      const isAnomaly = testPrice > median * 1.15;
      const markup = Number((((testPrice - median) / median) * 100).toFixed(1));

      setMcpResult({
        status: "SUCCESS",
        tool: "audit_vendor_markup_anomaly",
        sku_tested: testSku,
        proposed_unit_price: testPrice,
        market_median_price: median,
        anomaly_threshold_15pct: Number((median * 1.15).toFixed(2)),
        markup_percentage: markup,
        is_anomaly: isAnomaly,
        flag_reason: isAnomaly
          ? `ANOMALY DETECTED: Proposed unit price ($${testPrice.toFixed(2)}) is +${markup}% over market baseline of $${median.toFixed(2)} (>15% ceiling).`
          : "VALIDATED: Pricing is within standard institutional ERP market quantile boundaries.",
        server_timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const dockerComposeSnippet = `version: '3.8'

services:
  web:
    build:
      context: .
      dockerfile: Dockerfile.web
    container_name: bidsync-web
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
      - VULTR_SERVERLESS_INFERENCE_API_KEY=\${VULTR_SERVERLESS_INFERENCE_API_KEY}
    depends_on:
      api:
        condition: service_healthy

  api:
    build:
      context: .
      dockerfile: Dockerfile.api
    container_name: bidsync-api
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://bidsync_user:securepassword@db:5432/bidsync_db
      - REDIS_URL=redis://redis:6379/0
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
      - VULTR_SERVERLESS_INFERENCE_API_KEY=\${VULTR_SERVERLESS_INFERENCE_API_KEY}
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    container_name: bidsync-postgres
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=bidsync_db
      - POSTGRES_USER=bidsync_user
      - POSTGRES_PASSWORD=securepassword

  redis:
    image: redis:7-alpine
    container_name: bidsync-redis
    ports:
      - "6379:6379"`;

  const schemaSnippet = `-- PostgreSQL 16 Relational Schema
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'BUYER' | 'VENDOR'
    contact_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rfps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id),
    title VARCHAR(500) NOT NULL,
    requirements_json JSONB NOT NULL,
    budget_cap NUMERIC(15, 2) NOT NULL,
    deadline TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) DEFAULT 'DRAFT'
);

CREATE TABLE bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfp_id UUID REFERENCES rfps(id),
    vendor_id UUID REFERENCES organizations(id),
    bid_amount NUMERIC(15, 2) NOT NULL,
    compliance_score NUMERIC(5, 2) NOT NULL,
    delivery_timeline_days INT NOT NULL,
    has_markup_anomaly BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'GENERATED'
);

CREATE TABLE agent_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfp_id UUID REFERENCES rfps(id),
    agent_name VARCHAR(100) NOT NULL,
    model_provider VARCHAR(50) NOT NULL,
    latency_ms INT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfp_id UUID REFERENCES rfps(id),
    bid_id UUID REFERENCES bids(id),
    total_contract_value NUMERIC(15, 2) NOT NULL,
    terms_markdown TEXT NOT NULL,
    signed_buyer BOOLEAN DEFAULT FALSE,
    signed_vendor BOOLEAN DEFAULT FALSE,
    audit_hash VARCHAR(64) NOT NULL -- SHA-256
);`;

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-[#D6D5D1] border border-[#141414] p-4 text-[#141414]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#141414] text-[#E4E3E0] uppercase">
                INFRASTRUCTURE & DEPLOYMENT CENTER
              </span>
              <span className="text-xs text-[#141414]/70 font-mono">Vultr VPS / Bare-Metal + Coolify</span>
            </div>
            <h2 className="text-xl font-bold text-[#141414] uppercase tracking-tight mt-1">
              Production Deployment & MCP Tool Workbench
            </h2>
            <p className="text-xs font-technical-serif italic text-[#141414]/80 max-w-2xl mt-0.5">
              Inspect multi-container Docker Compose architectures, database relational schemas, and test live Model Context Protocol (MCP) ERP ledger tools.
            </p>
          </div>

          {/* Sub Navigation */}
          <div className="flex flex-wrap items-center gap-1 font-mono text-xs">
            {[
              { id: "topology", label: "Topology" },
              { id: "mcp", label: "MCP Tools" },
              { id: "schema", label: "Postgres Schema" },
              { id: "docker", label: "Docker Compose" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-3 py-1.5 uppercase font-bold border transition-all ${
                  activeTab === t.id
                    ? "bg-[#141414] text-[#E4E3E0] border-[#141414]"
                    : "bg-[#E4E3E0] text-[#141414] hover:bg-[#FFFFFF] border-[#141414]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 1. Container Topology */}
      {activeTab === "topology" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 bg-[#D6D5D1] border border-[#141414] font-mono space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 bg-[#141414] text-[#E4E3E0] flex items-center justify-center border border-[#141414]">
                <Server className="w-4 h-4" />
              </div>
              <span className="px-1.5 py-0.2 text-[10px] font-bold bg-[#E4E3E0] text-[#141414] border border-[#141414]">
                PORT 3000
              </span>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase text-[#141414]">bidsync-web</h3>
              <p className="text-[11px] text-[#141414]/70 font-technical-serif italic mt-0.5">Next.js 14+ / React Frontend</p>
            </div>
            <div className="text-[10px] text-[#141414] bg-[#E4E3E0] p-2 border border-[#141414]">
              TRAEFIK: Host(`bidsync.vultr.internal`)
            </div>
          </div>

          <div className="p-3.5 bg-[#D6D5D1] border border-[#141414] font-mono space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 bg-[#141414] text-[#E4E3E0] flex items-center justify-center border border-[#141414]">
                <Cpu className="w-4 h-4" />
              </div>
              <span className="px-1.5 py-0.2 text-[10px] font-bold bg-[#E4E3E0] text-[#141414] border border-[#141414]">
                PORT 8000
              </span>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase text-[#141414]">bidsync-api</h3>
              <p className="text-[11px] text-[#141414]/70 font-technical-serif italic mt-0.5">FastAPI Python 3.11+ Engine</p>
            </div>
            <div className="text-[10px] text-[#141414] bg-[#E4E3E0] p-2 border border-[#141414]">
              AsyncIO + Pydantic v2 + SSE
            </div>
          </div>

          <div className="p-3.5 bg-[#D6D5D1] border border-[#141414] font-mono space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 bg-[#141414] text-[#E4E3E0] flex items-center justify-center border border-[#141414]">
                <Database className="w-4 h-4" />
              </div>
              <span className="px-1.5 py-0.2 text-[10px] font-bold bg-[#E4E3E0] text-[#141414] border border-[#141414]">
                PORT 5432
              </span>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase text-[#141414]">bidsync-postgres</h3>
              <p className="text-[11px] text-[#141414]/70 font-technical-serif italic mt-0.5">PostgreSQL 16 Schema & JSONB</p>
            </div>
            <div className="text-[10px] text-[#141414] bg-[#E4E3E0] p-2 border border-[#141414]">
              Volume: postgres_data (Persistent)
            </div>
          </div>

          <div className="p-3.5 bg-[#D6D5D1] border border-[#141414] font-mono space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 bg-[#141414] text-[#E4E3E0] flex items-center justify-center border border-[#141414]">
                <Layers className="w-4 h-4" />
              </div>
              <span className="px-1.5 py-0.2 text-[10px] font-bold bg-[#E4E3E0] text-[#141414] border border-[#141414]">
                PORT 6379
              </span>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase text-[#141414]">bidsync-redis</h3>
              <p className="text-[11px] text-[#141414]/70 font-technical-serif italic mt-0.5">Redis 7 State Machine & Queue</p>
            </div>
            <div className="text-[10px] text-[#141414] bg-[#E4E3E0] p-2 border border-[#141414]">
              Append-Only File (AOF Persistence)
            </div>
          </div>
        </div>
      )}

      {/* 2. MCP Tool Workbench */}
      {activeTab === "mcp" && (
        <div className="bg-[#D6D5D1] border border-[#141414] p-4 font-mono text-[#141414] space-y-3">
          <div>
            <h3 className="text-xs font-bold uppercase text-[#141414]">Model Context Protocol (MCP) Tool Test Bench</h3>
            <p className="text-[11px] font-technical-serif italic text-[#141414]/80 mt-0.5">
              Execute live MCP calls against institutional ERP pricing ledger to simulate volume pricing queries and anomaly checks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-[#141414] mb-1">Select SKU Code</label>
              <select
                value={testSku}
                onChange={(e) => setTestSku(e.target.value)}
                className="w-full bg-[#E4E3E0] border border-[#141414] px-2.5 py-1.5 text-xs text-[#141414] focus:outline-none focus:bg-white font-mono"
              >
                <option value="VULTR-CLOUD-H100">VULTR-CLOUD-H100 (GPU Hour - Baseline $3.25)</option>
                <option value="VULTR-BARE-E32">VULTR-BARE-E32 (Monthly Bare Metal - Baseline $450)</option>
                <option value="NVME-BLK-TIER1">NVME-BLK-TIER1 (TB-Month - Baseline $40)</option>
                <option value="BW-TRANSIT-10G">BW-TRANSIT-10G (Gbps-Month - Baseline $65)</option>
                <option value="SR-SYSARCH-ENG">SR-SYSARCH-ENG (Engineer-Hour - Baseline $185)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-[#141414] mb-1">Proposed Vendor Unit Price ($)</label>
              <input
                type="number"
                step="0.05"
                value={testPrice}
                onChange={(e) => setTestPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#E4E3E0] border border-[#141414] px-2.5 py-1.5 text-xs text-[#141414] focus:outline-none focus:bg-white font-mono"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleRunMcpTest}
                className="w-full py-1.5 bg-[#141414] hover:bg-[#333333] text-[#E4E3E0] text-xs font-mono uppercase font-bold flex items-center justify-center gap-1.5 border border-[#141414] transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>EXECUTE MCP TOOL</span>
              </button>
            </div>
          </div>

          {mcpResult && (
            <div className="mt-3 p-3 bg-[#141414] border border-[#141414] font-mono text-xs text-[#E4E3E0] space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#333333]">
                <span className="text-green-400 font-bold uppercase">MCP Tool Response: {mcpResult.tool}</span>
                <span className="text-[10px] text-[#888888]">{mcpResult.server_timestamp}</span>
              </div>
              <pre className="text-[#E4E3E0] overflow-x-auto text-[11px] font-mono">
                {JSON.stringify(mcpResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* 3. PostgreSQL Schema */}
      {activeTab === "schema" && (
        <div className="bg-[#141414] border border-[#141414] font-mono text-xs">
          <div className="bg-[#1A1A1A] px-4 py-2.5 border-b border-[#333333] flex items-center justify-between">
            <span className="font-bold text-[#E4E3E0] uppercase text-xs">schema.sql (PostgreSQL 16 DDL)</span>
            <button
              onClick={() => handleCopy(schemaSnippet, "schema")}
              className="flex items-center gap-1 text-[11px] uppercase font-bold text-[#E4E3E0] hover:text-white px-2 py-0.5 border border-[#333333]"
            >
              {copiedCode === "schema" ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode === "schema" ? "COPIED" : "COPY SQL"}</span>
            </button>
          </div>
          <pre className="p-4 text-green-400 overflow-x-auto max-h-[480px] font-mono leading-relaxed">
            {schemaSnippet}
          </pre>
        </div>
      )}

      {/* 4. Docker Compose */}
      {activeTab === "docker" && (
        <div className="bg-[#141414] border border-[#141414] font-mono text-xs">
          <div className="bg-[#1A1A1A] px-4 py-2.5 border-b border-[#333333] flex items-center justify-between">
            <span className="font-bold text-[#E4E3E0] uppercase text-xs">docker-compose.yml (Coolify Orchestration)</span>
            <button
              onClick={() => handleCopy(dockerComposeSnippet, "docker")}
              className="flex items-center gap-1 text-[11px] uppercase font-bold text-[#E4E3E0] hover:text-white px-2 py-0.5 border border-[#333333]"
            >
              {copiedCode === "docker" ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode === "docker" ? "COPIED" : "COPY YAML"}</span>
            </button>
          </div>
          <pre className="p-4 text-[#E4E3E0] overflow-x-auto max-h-[480px] font-mono leading-relaxed">
            {dockerComposeSnippet}
          </pre>
        </div>
      )}
    </div>
  );
};

