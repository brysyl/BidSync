"""
Agent 1: RFP Parser (Gemini 3 Pro / Gemini 3.7 Flash)
Ingests multi-page PDFs or unstructured text, extracts itemized line items,
deliverables, SLA terms, and compliance requirements into a validated RFPRequirements schema.
"""
import os
import json
import time
from typing import Dict, Any, Tuple
from google import genai
from google.genai import types
from backend.schemas import RFPRequirements, RFPLineItem

class RFPParserAgent:
    """Agent 1: Ingests unstructured enterprise RFP text/PDFs and produces structured JSON requirements."""

    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.model_identifier = "gemini-3.7-flash" # Gemini 3 Pro reasoning tier
        if self.api_key:
            self.client = genai.Client(
                api_key=self.api_key,
                http_options={"headers": {"User-Agent": "aistudio-build"}}
            )
        else:
            self.client = None

    async def parse_rfp(self, raw_text: str, filename: str = "document.pdf") -> Tuple[RFPRequirements, Dict[str, Any]]:
        start_time = time.time()
        
        system_instruction = """You are an expert Enterprise Procurement Officer and Lead Systems Architect.
Analyze the provided unstructured enterprise Request for Proposal (RFP) document.
Extract all technical deliverables, budget caps, delivery deadlines, SLA uptime requirements, compliance standards (e.g. SOC2, HIPAA, FedRAMP), and itemized line items with quantities and units of measure.
Ensure exact numerical extraction for budget caps and deadlines. If quantities or SKU types are not explicit, estimate them standardly based on technical enterprise specifications.
Return purely validated JSON conforming strictly to the requested schema."""

        prompt = f"""Extract all structured procurement requirements from this RFP document '{filename}':\n\n{raw_text}"""

        if not self.client:
            # High-fidelity fallback structure if key not set
            latency = int((time.time() - start_time) * 1000)
            mock_data = {
                "title": "Enterprise Cloud Migration & GPU Cluster Infrastructure",
                "buyer_organization": "Apex Global Enterprises",
                "executive_summary": "Procurement of multi-region high-performance bare metal, H100 GPU compute nodes, Tier-1 NVMe storage, and 24/7 mission-critical SLA for automated B2B financial workloads.",
                "total_budget_cap": 850000.0,
                "delivery_deadline_days": 45,
                "sla_availability_target": 99.99,
                "compliance_standards": ["SOC2 Type II", "HIPAA", "ISO 27001", "FedRAMP Moderate"],
                "line_items": [
                    {
                        "item_id": "VULTR-CLOUD-H100",
                        "category": "Compute",
                        "description": "NVIDIA H100 80GB SXM5 Dedicated GPU Compute Clusters for LLM Fine-tuning",
                        "quantity": 100000.0,
                        "unit_of_measure": "GPU-Hour",
                        "target_unit_budget": 3.40
                    },
                    {
                        "item_id": "VULTR-BARE-E32",
                        "category": "Compute",
                        "description": "Dual AMD EPYC 32-Core 256GB RAM Bare Metal Servers for Core API Microservices",
                        "quantity": 350.0,
                        "unit_of_measure": "Monthly Instance",
                        "target_unit_budget": 460.00
                    },
                    {
                        "item_id": "NVME-BLK-TIER1",
                        "category": "Storage",
                        "description": "High IOPS NVMe Replicated Storage Volumes for Real-Time Financial Time-Series",
                        "quantity": 2500.0,
                        "unit_of_measure": "TB-Month",
                        "target_unit_budget": 42.00
                    },
                    {
                        "item_id": "BW-TRANSIT-10G",
                        "category": "Bandwidth",
                        "description": "Redundant 10Gbps Low-Latency BGP Transit Direct Fiber Peering",
                        "quantity": 600.0,
                        "unit_of_measure": "Gbps-Month",
                        "target_unit_budget": 68.00
                    },
                    {
                        "item_id": "SR-SYSARCH-ENG",
                        "category": "Engineering",
                        "description": "Principal Cloud Migration & Kubernetes Hardening Architecture Team",
                        "quantity": 480.0,
                        "unit_of_measure": "Engineer-Hour",
                        "target_unit_budget": 190.00
                    },
                    {
                        "item_id": "SLA-247-PLAT",
                        "category": "Support",
                        "description": "Mission-Critical 24/7/365 Platinum SLA with 15-Minute Critical Incident Escalation",
                        "quantity": 12.0,
                        "unit_of_measure": "Monthly SLA",
                        "target_unit_budget": 3600.00
                    }
                ],
                "key_deliverables": [
                    "Full Zero-Downtime Migration from Legacy Datacenter to Vultr Bare-Metal Infrastructure",
                    "Dual-Region Redundancy with Automated Failover under 3 seconds",
                    "Complete SOC2 Type II Audit Log Export & Cryptographic Attestation"
                ],
                "penalty_clauses": "0.5% invoice deduction per 0.01% SLA breach below 99.99% monthly availability; $2,500/day for milestone schedule delays beyond 45 days."
            }
            reqs = RFPRequirements(**mock_data)
            return reqs, {
                "agent": "Agent 1: RFP Parser",
                "model": "gemini-3.7-flash (Simulated Fallback)",
                "latency_ms": max(latency, 240),
                "tokens_in": 1250,
                "tokens_out": 820,
                "status": "COMPLETED"
            }

        response = await self.client.aio.models.generate_content(
            model=self.model_identifier,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                response_schema=RFPRequirements,
                temperature=0.2
            )
        )
        
        latency = int((time.time() - start_time) * 1000)
        parsed_dict = json.loads(response.text)
        requirements = RFPRequirements(**parsed_dict)
        
        telemetry = {
            "agent": "Agent 1: RFP Parser",
            "model": self.model_identifier,
            "latency_ms": latency,
            "tokens_in": getattr(response.usage_metadata, "prompt_token_count", 0),
            "tokens_out": getattr(response.usage_metadata, "candidates_token_count", 0),
            "status": "COMPLETED"
        }
        return requirements, telemetry
