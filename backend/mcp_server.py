"""
BidSync Model Context Protocol (MCP) Server & ERP Ledger Integration
Provides standardized MCP tools to query real-time market price benchmarks,
historical procurement ledgers, and vendor reliability metrics.
"""
from typing import Dict, Any, List
import datetime

# ERP Ledger Pricing Database Seed
LEDGER_BENCHMARKS = {
    "VULTR-CLOUD-H100": {
        "sku": "VULTR-CLOUD-H100",
        "category": "Compute",
        "description": "NVIDIA H100 80GB SXM5 GPU Node / hr",
        "unit": "GPU-Hour",
        "median_price": 3.25,
        "p25": 2.95,
        "p75": 3.80,
        "volatility": 0.08,
        "historical_contracts_analyzed": 142
    },
    "VULTR-BARE-E32": {
        "sku": "VULTR-BARE-E32",
        "category": "Compute",
        "description": "Dual AMD EPYC 32-Core 256GB RAM 10Gbps Bare Metal",
        "unit": "Monthly Instance",
        "median_price": 450.00,
        "p25": 410.00,
        "p75": 495.00,
        "volatility": 0.04,
        "historical_contracts_analyzed": 380
    },
    "NVME-BLK-TIER1": {
        "sku": "NVME-BLK-TIER1",
        "category": "Storage",
        "description": "High IOPS Tier-1 NVMe Block Storage (per TB/mo)",
        "unit": "TB-Month",
        "median_price": 40.00,
        "p25": 36.00,
        "p75": 48.00,
        "volatility": 0.03,
        "historical_contracts_analyzed": 612
    },
    "BW-TRANSIT-10G": {
        "sku": "BW-TRANSIT-10G",
        "category": "Bandwidth",
        "description": "Dedicated 10Gbps Unmetered IP Transit (per Gbps/mo)",
        "unit": "Gbps-Month",
        "median_price": 65.00,
        "p25": 55.00,
        "p75": 80.00,
        "volatility": 0.06,
        "historical_contracts_analyzed": 210
    },
    "SR-SYSARCH-ENG": {
        "sku": "SR-SYSARCH-ENG",
        "category": "Engineering",
        "description": "Lead Distributed Systems Architect / Migration Eng",
        "unit": "Engineer-Hour",
        "median_price": 185.00,
        "p25": 160.00,
        "p75": 220.00,
        "volatility": 0.05,
        "historical_contracts_analyzed": 540
    },
    "SLA-247-PLAT": {
        "sku": "SLA-247-PLAT",
        "category": "Support",
        "description": "24/7/365 Tier-3 Enterprise Mission Critical SLA",
        "unit": "Monthly SLA",
        "median_price": 3500.00,
        "p25": 3000.00,
        "p75": 4200.00,
        "volatility": 0.02,
        "historical_contracts_analyzed": 188
    }
}

class MCPErpPricingToolRunner:
    """MCP Tool Runner for ERP ledger pricing queries and anomaly flagging."""

    @staticmethod
    def get_available_tools() -> List[Dict[str, Any]]:
        return [
            {
                "name": "query_erp_market_benchmark",
                "description": "Query institutional ERP pricing ledger for market baseline and quantile boundaries (p25, median, p75).",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "sku_code": {"type": "string", "description": "SKU identifier or keyword"},
                        "category": {"type": "string", "description": "Commodity or Service Category"},
                        "volume_quantity": {"type": "number", "description": "Procurement volume for tier discounts"}
                    },
                    "required": ["sku_code"]
                }
            },
            {
                "name": "audit_vendor_markup_anomaly",
                "description": "Checks vendor proposed unit price against market baseline; flags markups exceeding 15%.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "sku_code": {"type": "string"},
                        "proposed_unit_price": {"type": "number"}
                    },
                    "required": ["sku_code", "proposed_unit_price"]
                }
            }
        ]

    @staticmethod
    def execute_tool(tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        if tool_name == "query_erp_market_benchmark":
            sku = arguments.get("sku_code", "").upper()
            matched = LEDGER_BENCHMARKS.get(sku)
            if not matched:
                # Fuzzy fallback matching
                for key, val in LEDGER_BENCHMARKS.items():
                    if key in sku or sku in key or val["category"].upper() in sku:
                        matched = val
                        break
            if not matched:
                # Default generic baseline
                matched = {
                    "sku": sku or "CUSTOM-SKU",
                    "category": arguments.get("category", "General"),
                    "description": "Enterprise Procurement Line Item",
                    "unit": "Unit",
                    "median_price": 100.00,
                    "p25": 85.00,
                    "p75": 115.00,
                    "volatility": 0.05,
                    "historical_contracts_analyzed": 50
                }
            
            # Apply volume discount curves
            qty = arguments.get("volume_quantity", 1)
            volume_discount = 0.0
            if qty >= 1000:
                volume_discount = 0.15
            elif qty >= 100:
                volume_discount = 0.08
            elif qty >= 20:
                volume_discount = 0.04

            adjusted_median = round(matched["median_price"] * (1.0 - volume_discount), 2)
            adjusted_p25 = round(matched["p25"] * (1.0 - volume_discount), 2)
            adjusted_p75 = round(matched["p75"] * (1.0 - volume_discount), 2)

            return {
                "status": "SUCCESS",
                "sku_code": matched["sku"],
                "category": matched["category"],
                "description": matched["description"],
                "unit_of_measure": matched["unit"],
                "median_unit_price": adjusted_median,
                "p25_unit_price": adjusted_p25,
                "p75_unit_price": adjusted_p75,
                "volume_discount_applied": volume_discount,
                "anomaly_threshold_price": round(adjusted_median * 1.15, 2),
                "queried_at": datetime.datetime.utcnow().isoformat() + "Z"
            }

        elif tool_name == "audit_vendor_markup_anomaly":
            sku = arguments.get("sku_code", "")
            proposed_price = arguments.get("proposed_unit_price", 0.0)
            bench = MCPErpPricingToolRunner.execute_tool("query_erp_market_benchmark", {"sku_code": sku})
            median = bench["median_unit_price"]
            threshold = bench["anomaly_threshold_price"]
            
            markup_pct = round(((proposed_price - median) / median) * 100.0, 2) if median > 0 else 0.0
            is_anomaly = proposed_price > threshold

            return {
                "sku_code": sku,
                "proposed_unit_price": proposed_price,
                "market_median_price": median,
                "markup_percentage": markup_pct,
                "is_anomaly": is_anomaly,
                "anomaly_threshold_exceeded": is_anomaly,
                "flag_reason": f"Vendor unit price (${proposed_price:,.2f}) exceeds market baseline (${median:,.2f}) by {markup_pct:.1f}%, exceeding the 15.0% threshold." if is_anomaly else "Within acceptable market bandwidth."
            }

        raise ValueError(f"Unknown MCP tool: {tool_name}")
