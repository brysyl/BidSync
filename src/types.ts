/**
 * BidSync Frontend TypeScript Type Definitions
 */

export interface RFPLineItem {
  item_id: string;
  category: string;
  description: string;
  quantity: number;
  unit_of_measure: string;
  target_unit_budget?: number;
}

export interface RFP {
  id: string;
  title: string;
  buyer_organization: string;
  executive_summary: string;
  total_budget_cap: number;
  delivery_deadline_days: number;
  sla_availability_target: number;
  compliance_standards: string[];
  line_items: RFPLineItem[];
  key_deliverables: string[];
  penalty_clauses: string;
  status: string;
  created_at: string;
}

export interface BenchmarkItem {
  item_id: string;
  category: string;
  description: string;
  quantity: number;
  unit_of_measure: string;
  median_unit_price: number;
  p25_unit_price: number;
  p75_unit_price: number;
  total_market_baseline: number;
  vendor_unit_price: number;
  markup_percentage: number;
  is_anomaly: boolean;
  flag_reason?: string;
}

export interface BenchmarkReport {
  rfp_id: string;
  total_market_baseline_cost: number;
  target_budget_cap: number;
  budget_feasibility_score: number;
  benchmarked_items: BenchmarkItem[];
  anomalies_detected: number;
  recommendations: string[];
}

export interface BidLineItemBreakdown {
  sku: string;
  description: string;
  quantity: number;
  unit_of_measure: string;
  market_median_unit: number;
  vendor_unit_price: number;
  total_price: number;
  markup_vs_market_pct: number;
}

export interface BidProposal {
  id: string;
  rfp_id: string;
  vendor_id: string;
  vendor_name: string;
  total_bid_amount: number;
  market_baseline_cost: number;
  savings_percentage: number;
  compliance_score: number;
  delivery_timeline_days: number;
  sla_guarantee_percent: number;
  line_items_breakdown: BidLineItemBreakdown[];
  has_markup_anomaly: boolean;
  anomaly_flags: string[];
  strategy_summary: string;
  status: string;
  timestamp: string;
}

export interface NegotiationRound {
  round_number: number;
  party: "BUYER_AGENT" | "VENDOR_AGENT";
  clause_targeted: string;
  proposed_concession: string;
  reasoning: string;
  impact_cost_delta: number;
  status: "PROPOSED" | "COUNTERED" | "ACCEPTED";
}

export interface Contract {
  id: string;
  rfp_id: string;
  bid_id: string;
  buyer_name: string;
  vendor_name: string;
  total_contract_value: number;
  delivery_timeline_days: number;
  sla_guarantee_percent: number;
  payment_terms: string;
  dispute_resolution_log: NegotiationRound[];
  terms_markdown: string;
  audit_hash: string;
  signed_buyer: boolean;
  buyer_signed_at?: string;
  buyer_signer_name?: string;
  signed_vendor: boolean;
  vendor_signed_at?: string;
  vendor_signer_name?: string;
  status: string;
  created_at: string;
}

export interface TelemetryLog {
  id: string;
  agent_name: string;
  model_provider: string;
  model_identifier: string;
  status: string;
  latency_ms: number;
  token_usage: { prompt?: number; completion?: number; total?: number };
  summary: string;
  timestamp: string;
}

export interface HealthStatus {
  status: string;
  service: string;
  timestamp: string;
  infrastructure: {
    platform: string;
    orchestration: string;
    database: string;
    cache: string;
    mcp_server: string;
  };
  agents: {
    agent_1_rfp_parser: string;
    agent_2_price_benchmarker: string;
    agent_3_bid_generator: string;
    agent_4_contract_negotiator: string;
  };
}

export type ViewTab =
  | "ingestion"
  | "telemetry"
  | "matrix"
  | "arena"
  | "contract"
  | "infrastructure";
