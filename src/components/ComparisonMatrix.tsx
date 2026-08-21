import React, { useState } from "react";
import {
  Layers,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  Zap,
  Award,
} from "lucide-react";
import { BenchmarkReport, BidProposal } from "../types";

interface ComparisonMatrixProps {
  benchmarkReport: BenchmarkReport | null;
  bids: BidProposal[];
  selectedBidId: string | null;
  onSelectBid: (bidId: string) => void;
  onProceedToNegotiation: () => void;
}

export const ComparisonMatrix: React.FC<ComparisonMatrixProps> = ({
  benchmarkReport,
  bids,
  selectedBidId,
  onSelectBid,
  onProceedToNegotiation,
}) => {
  if (!benchmarkReport && bids.length === 0) {
    return (
      <div className="bg-[#D6D5D1] border border-[#141414] p-12 text-center text-[#141414]/60 font-mono">
        <Layers className="w-10 h-10 mx-auto mb-2 text-[#141414]" />
        <h3 className="text-xs font-bold uppercase text-[#141414]">No Benchmark or Bid Data Available</h3>
        <p className="text-[11px] mt-1">
          Run Stage 02 (Price Benchmarker) and Stage 03 (Bid Generator) to view comparative pricing.
        </p>
      </div>
    );
  }

  const items = benchmarkReport?.benchmarked_items || [];

  return (
    <div className="space-y-4">
      {/* Top Banner & Summary Cards */}
      <div className="bg-[#D6D5D1] border border-[#141414] p-4 text-[#141414]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#141414] text-[#E4E3E0] uppercase">
                STAGE 03: COMPARISON MATRIX & BENCHMARKS
              </span>
              <span className="text-xs text-[#141414]/70 font-mono">MCP Protocol & Vultr Inference</span>
            </div>
            <h2 className="text-xl font-bold text-[#141414] uppercase tracking-tight mt-1">
              Multi-Vendor Bid Analysis & Anomaly Detection
            </h2>
            <p className="text-xs font-technical-serif italic text-[#141414]/80 max-w-2xl mt-0.5">
              Side-by-side evaluation of strategic vendor counter-proposals against ERP institutional baseline pricing. Markups exceeding &gt;15% are flagged.
            </p>
          </div>

          {benchmarkReport && (
            <div className="flex items-center gap-2">
              <div className="bg-[#E4E3E0] p-2.5 border border-[#141414] text-center min-w-[120px]">
                <span className="text-[10px] font-mono uppercase text-[#141414]/70 block">Market Baseline</span>
                <span className="text-sm font-bold text-[#141414] font-mono">
                  ${benchmarkReport.total_market_baseline_cost.toLocaleString()}
                </span>
              </div>
              <div className="bg-[#E4E3E0] p-2.5 border border-[#141414] text-center min-w-[120px]">
                <span className="text-[10px] font-mono uppercase text-[#141414]/70 block">Feasibility</span>
                <span className="text-sm font-bold text-green-800 font-mono">
                  {benchmarkReport.budget_feasibility_score}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Vendor Proposals Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {bids.map((bid, index) => {
          const isSelected = selectedBidId === bid.id || (!selectedBidId && index === 0);

          return (
            <div
              key={bid.id}
              onClick={() => onSelectBid(bid.id)}
              className={`p-3.5 border border-[#141414] cursor-pointer transition-all ${
                isSelected
                  ? "bg-[#141414] text-[#E4E3E0] shadow-md"
                  : "bg-[#D6D5D1] text-[#141414] hover:bg-[#D6D5D1]/80"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-bold uppercase">{bid.vendor_name}</span>
                    {index === 0 && (
                      <span
                        className={`px-1.5 py-0.2 text-[9px] font-mono uppercase border ${
                          isSelected
                            ? "bg-[#E4E3E0] text-[#141414] border-[#E4E3E0]"
                            : "bg-[#141414] text-[#E4E3E0] border-[#141414]"
                        }`}
                      >
                        BEST MATCH
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] opacity-70 mt-0.5 line-clamp-1 font-technical-serif italic">
                    {bid.strategy_summary}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold font-mono">
                    ${bid.total_bid_amount.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-mono font-bold justify-end text-green-500">
                    <TrendingDown className="w-3 h-3" />
                    <span>{bid.savings_percentage}% SAVINGS</span>
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-1.5 mt-2.5 pt-2.5 border-t border-current/20 text-center font-mono text-xs">
                <div className={`p-1 border ${isSelected ? "bg-[#1A1A1A] border-[#333333]" : "bg-[#E4E3E0] border-[#141414]"}`}>
                  <span className="text-[9px] uppercase opacity-70 block">Delivery</span>
                  <span className="font-bold text-[11px]">{bid.delivery_timeline_days}d</span>
                </div>
                <div className={`p-1 border ${isSelected ? "bg-[#1A1A1A] border-[#333333]" : "bg-[#E4E3E0] border-[#141414]"}`}>
                  <span className="text-[9px] uppercase opacity-70 block">SLA</span>
                  <span className="font-bold text-[11px] text-cyan-400">{bid.sla_guarantee_percent}%</span>
                </div>
                <div className={`p-1 border ${isSelected ? "bg-[#1A1A1A] border-[#333333]" : "bg-[#E4E3E0] border-[#141414]"}`}>
                  <span className="text-[9px] uppercase opacity-70 block">Score</span>
                  <span className="font-bold text-[11px] text-green-400">{bid.compliance_score}%</span>
                </div>
              </div>

              {bid.has_markup_anomaly && (
                <div className="mt-2 text-[10px] font-mono uppercase text-amber-500 flex items-center gap-1 border border-amber-600/40 p-1 bg-amber-950/20">
                  <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                  <span>FLAGGED: MARKUP &gt;+15% BASELINE</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detailed SKU Breakdown Table */}
      <div className="bg-[#D6D5D1] border border-[#141414]">
        <div className="p-3 bg-[#E4E3E0] border-b border-[#141414] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-mono font-bold uppercase text-[#141414]">
              Itemized SKU Benchmark & Markup Audit
            </h3>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-[#141414] text-[#E4E3E0] uppercase">
              {items.length} Benchmarked SKUs
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-[#141414] flex items-center gap-1 text-[11px]">
              <span className="w-2 h-2 bg-green-600 inline-block"></span> WITHIN MARKET
            </span>
            <span className="text-[#141414] flex items-center gap-1 text-[11px]">
              <span className="w-2 h-2 bg-amber-600 inline-block"></span> &gt;15% ANOMALY
            </span>
          </div>
        </div>

        <div className="overflow-x-auto bg-[#E4E3E0]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#141414] text-[#E4E3E0] font-mono text-[10px] uppercase border-b border-[#141414]">
              <tr>
                <th className="p-2.5">SKU / Item</th>
                <th className="p-2.5">Category</th>
                <th className="p-2.5">Volume</th>
                <th className="p-2.5">P25 (Low)</th>
                <th className="p-2.5 font-bold">Market Median</th>
                <th className="p-2.5">P75 (High)</th>
                <th className="p-2.5 font-bold">Vendor Bid</th>
                <th className="p-2.5 text-right">Status / Anomaly</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141414]/20 text-[#141414] font-mono">
              {items.map((item, i) => {
                const selectedBid = bids.find((b) => b.id === selectedBidId) || bids[0];
                const matchingBidLine = selectedBid?.line_items_breakdown.find(
                  (l) => l.sku === item.item_id || l.description === item.description
                );
                const vendorUnit = matchingBidLine?.vendor_unit_price || item.vendor_unit_price;
                const markupPct = Number((((vendorUnit - item.median_unit_price) / item.median_unit_price) * 100).toFixed(1));
                const isOver15 = markupPct > 15.0;

                return (
                  <tr key={i} className={`hover:bg-[#D6D5D1]/80 transition-colors ${isOver15 ? "bg-amber-100/60" : ""}`}>
                    <td className="p-2.5 font-mono font-bold text-[#141414]">
                      <div>{item.item_id}</div>
                      <div className="text-[10px] text-[#141414]/70 font-normal mt-0.5">{item.description}</div>
                    </td>
                    <td className="p-2.5">
                      <span className="px-1.5 py-0.2 text-[10px] font-mono bg-[#D6D5D1] text-[#141414] border border-[#141414]">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-2.5 font-mono">
                      {item.quantity.toLocaleString()} {item.unit_of_measure}
                    </td>
                    <td className="p-2.5 font-mono opacity-80">${item.p25_unit_price.toFixed(2)}</td>
                    <td className="p-2.5 font-mono font-bold text-[#141414]">${item.median_unit_price.toFixed(2)}</td>
                    <td className="p-2.5 font-mono opacity-80">${item.p75_unit_price.toFixed(2)}</td>
                    <td className="p-2.5 font-mono font-bold text-[#141414]">${vendorUnit.toFixed(2)}</td>
                    <td className="p-2.5 text-right">
                      {isOver15 ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold bg-amber-600 text-white uppercase">
                          <AlertTriangle className="w-3 h-3" /> +{markupPct}% FLAG
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold bg-[#141414] text-[#E4E3E0] uppercase">
                          <CheckCircle2 className="w-3 h-3 text-green-400" /> {markupPct <= 0 ? `${Math.abs(markupPct)}% Under` : `+${markupPct}% OK`}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Action Bar */}
        <div className="p-3 bg-[#E4E3E0] border-t border-[#141414] flex flex-wrap items-center justify-between gap-3 font-mono">
          <div className="text-xs text-[#141414]">
            SELECTED PROPOSAL: <strong className="uppercase">{bids.find((b) => b.id === selectedBidId)?.vendor_name || bids[0]?.vendor_name || "Vultr Solutions"}</strong>
          </div>

          <button
            id="btn-proceed-to-negotiation"
            onClick={onProceedToNegotiation}
            className="flex items-center gap-2 px-4 py-1.5 bg-[#141414] hover:bg-[#333333] text-[#E4E3E0] text-xs font-mono uppercase font-bold transition-all border border-[#141414]"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>LAUNCH NEGOTIATION ARENA (AGENT 04)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

