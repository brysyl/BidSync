"""
BidSync Pydantic v2 Core Data Models & RFP Schemas
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime
from uuid import UUID, uuid4

class OrgType(str, Enum):
    BUYER = "BUYER"
    VENDOR = "VENDOR"
    AUDITOR = "AUDITOR"

class RFPStatus(str, Enum):
    DRAFT = "DRAFT"
    INGESTED = "INGESTED"
    ANALYZING = "ANALYZING"
    BENCHMARKED = "BENCHMARKED"
    BIDDING = "BIDDING"
    NEGOTIATING = "NEGOTIATING"
    AWARDED = "AWARDED"
    CANCELLED = "CANCELLED"

class AgentName(str, Enum):
    RFP_PARSER = "Agent 1: RFP Parser"
    PRICE_BENCHMARKER = "Agent 2: Price Benchmarker"
    BID_GENERATOR = "Agent 3: Strategic Bid Generator"
    CONTRACT_NEGOTIATOR = "Agent 4: Contract Negotiator"

class ModelProvider(str, Enum):
    GEMINI_3_PRO = "GEMINI_3_PRO"
    VULTR_SERVERLESS = "VULTR_SERVERLESS_INFERENCE"
    MCP_TOOL_RUNNER = "MCP_TOOL_RUNNER"

class RFPLineItem(BaseModel):
    item_id: str = Field(..., description="Unique SKU code or identifier")
    category: str = Field(..., description="Compute, Storage, Bandwidth, Engineering, etc.")
    description: str = Field(..., description="Detailed technical specification")
    quantity: float = Field(..., gt=0, description="Required quantity")
    unit_of_measure: str = Field(..., description="Unit such as GPU-Hour, TB-Month, Engineer-Hour")
    target_unit_budget: Optional[float] = Field(None, description="Target price per unit if specified")

class RFPRequirements(BaseModel):
    title: str = Field(..., description="RFP Title")
    buyer_organization: str = Field(..., description="Issuing organization")
    executive_summary: str = Field(..., description="Project summary")
    total_budget_cap: float = Field(..., description="Maximum budget allocated")
    delivery_deadline_days: int = Field(..., description="Target completion timeline in days")
    sla_availability_target: float = Field(default=99.99, description="Target uptime percentage e.g. 99.99%")
    compliance_standards: List[str] = Field(default_factory=list, description="SOC2 Type II, HIPAA, ISO27001, FedRAMP, etc.")
    line_items: List[RFPLineItem] = Field(..., description="Itemized procurement requirements")
    key_deliverables: List[str] = Field(default_factory=list, description="Mandatory milestone deliverables")
    penalty_clauses: Optional[str] = Field(None, description="Late delivery or SLA penalty terms")

class BenchmarkItemResult(BaseModel):
    item_id: str
    description: str
    quantity: float
    unit_of_measure: str
    median_unit_price: float
    p25_unit_price: float
    p75_unit_price: float
    total_market_baseline: float
    vendor_unit_price: Optional[float] = None
    markup_percentage: Optional[float] = None
    is_anomaly: bool = False
    flag_reason: Optional[str] = None

class BenchmarkReport(BaseModel):
    rfp_id: str
    total_market_baseline_cost: float
    target_budget_cap: float
    budget_feasibility_score: float = Field(..., description="0-100 feasibility relative to market")
    benchmarked_items: List[BenchmarkItemResult]
    anomalies_detected: int
    recommendations: List[str]

class BidProposal(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    rfp_id: str
    vendor_id: str
    vendor_name: str
    total_bid_amount: float
    market_baseline_cost: float
    savings_percentage: float
    compliance_score: float = Field(..., ge=0, le=100)
    delivery_timeline_days: int
    sla_guarantee_percent: float
    line_items_breakdown: List[Dict[str, Any]]
    has_markup_anomaly: bool = False
    anomaly_flags: List[str] = Field(default_factory=list)
    strategy_summary: str
    status: str = "GENERATED"
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class NegotiationRound(BaseModel):
    round_number: int
    party: str # "BUYER_AGENT" | "VENDOR_AGENT"
    clause_targeted: str
    proposed_concession: str
    reasoning: str
    impact_cost_delta: float
    status: str # "PROPOSED" | "COUNTERED" | "ACCEPTED"

class ContractTerms(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    rfp_id: str
    bid_id: str
    buyer_name: str
    vendor_name: str
    total_contract_value: float
    delivery_timeline_days: int
    sla_guarantee_percent: float
    payment_terms: str
    dispute_resolution_log: List[NegotiationRound]
    terms_markdown: str
    audit_hash: str
    signed_buyer: bool = False
    buyer_signed_at: Optional[datetime] = None
    signed_vendor: bool = False
    vendor_signed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AgentExecutionLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    rfp_id: str
    agent_name: AgentName
    model_provider: ModelProvider
    model_identifier: str
    status: str
    input_summary: str
    output_summary: str
    reasoning_trace: Optional[str] = None
    latency_ms: int
    token_usage: Dict[str, int] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
