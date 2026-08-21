import React from "react";
import {
  Zap,
  CheckCircle2,
  ArrowRight,
  Scale,
  Sparkles,
  Bot,
} from "lucide-react";
import { NegotiationRound, Contract, BidProposal } from "../types";

interface NegotiationArenaProps {
  negotiationRounds: NegotiationRound[];
  contract: Contract | null;
  selectedBid: BidProposal | null;
  onRunNegotiation: () => void;
  onProceedToContract: () => void;
  isNegotiating: boolean;
}

export const NegotiationArena: React.FC<NegotiationArenaProps> = ({
  negotiationRounds,
  contract,
  selectedBid,
  onRunNegotiation,
  onProceedToContract,
  isNegotiating,
}) => {
  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-[#D6D5D1] border border-[#141414] p-4 text-[#141414]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#141414] text-[#E4E3E0] uppercase">
                STAGE 04: GAME-THEORETIC MULTI-AGENT NEGOTIATION
              </span>
              <span className="text-xs text-[#141414]/70 font-mono">Gemini 3 Pro & Vultr Solver</span>
            </div>
            <h2 className="text-xl font-bold text-[#141414] uppercase tracking-tight mt-1">
              Autonomous Clause & Commercial Terms Negotiator
            </h2>
            <p className="text-xs font-technical-serif italic text-[#141414]/80 max-w-2xl mt-0.5">
              Simulates multi-turn bargaining between Buyer rules (cashflow protection, strict SLA penalties) and Vendor parameters (committed reservation discounts, delivery milestones).
            </p>
          </div>

          <button
            id="btn-re-run-negotiation"
            onClick={onRunNegotiation}
            disabled={isNegotiating}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-[#141414] hover:bg-[#333333] disabled:opacity-50 text-[#E4E3E0] text-xs font-mono uppercase font-bold transition-all border border-[#141414]"
          >
            <Zap className={`w-3.5 h-3.5 ${isNegotiating ? "animate-spin" : ""}`} />
            <span>{isNegotiating ? "NEGOTIATING CLAUSES..." : "SIMULATE MULTI-TURN NEGOTIATION"}</span>
          </button>
        </div>
      </div>

      {/* Arena Grid: Buyer Agent vs Vendor Agent */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Buyer Agent Card */}
        <div className="bg-[#D6D5D1] border border-[#141414] p-3.5 text-[#141414]">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-8 h-8 bg-[#141414] text-[#E4E3E0] flex items-center justify-center border border-[#141414]">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-mono font-bold uppercase text-[#141414]">Buyer Autonomous Agent</h3>
                <span className="px-1.5 py-0.2 text-[9px] font-mono bg-[#E4E3E0] text-[#141414] border border-[#141414] uppercase">
                  Gemini 3 Pro
                </span>
              </div>
              <span className="text-[11px] font-technical-serif italic text-[#141414]/70">Representing: Apex Global Enterprises</span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs bg-[#E4E3E0] p-2.5 border border-[#141414] font-mono text-[#141414]">
            <div className="text-[10px] font-bold uppercase text-[#141414]">Target Bargaining Parameters:</div>
            <ul className="list-disc list-inside space-y-0.5 text-[#141414]/90 text-[11px]">
              <li>Enforce Net-45 payment schedule with 5% completion holdback</li>
              <li>Escalate SLA availability to 99.995% with automated penalty credits</li>
              <li>Maintain total contract ceiling under $700,000</li>
            </ul>
          </div>
        </div>

        {/* Vendor Agent Card */}
        <div className="bg-[#D6D5D1] border border-[#141414] p-3.5 text-[#141414]">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-8 h-8 bg-[#141414] text-[#E4E3E0] flex items-center justify-center border border-[#141414]">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-mono font-bold uppercase text-[#141414]">Vendor Autonomous Agent</h3>
                <span className="px-1.5 py-0.2 text-[9px] font-mono bg-[#E4E3E0] text-[#141414] border border-[#141414] uppercase">
                  Vultr Serverless (Llama-3.3-70B)
                </span>
              </div>
              <span className="text-[11px] font-technical-serif italic text-[#141414]/70">
                Representing: {selectedBid?.vendor_name || "Vultr Infrastructure"}
              </span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs bg-[#E4E3E0] p-2.5 border border-[#141414] font-mono text-[#141414]">
            <div className="text-[10px] font-bold uppercase text-[#141414]">Vendor Trade-Off Strategy:</div>
            <ul className="list-disc list-inside space-y-0.5 text-[#141414]/90 text-[11px]">
              <li>Offer additional $22,000 committed annual discount in exchange for 12-month lock</li>
              <li>Guarantee 99.995% SLA backed by dual-region high-availability infrastructure</li>
              <li>Accept milestone-based Net-45 disbursement schedule</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Round-by-Round Timeline */}
      <div className="bg-[#D6D5D1] border border-[#141414] p-4 text-[#141414] space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#141414]">
          <h3 className="text-xs font-mono font-bold uppercase text-[#141414] flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dispute Resolution & Clause Negotiation Log</span>
          </h3>
          <span className="text-xs font-mono text-green-800 font-bold flex items-center gap-1 uppercase">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% CLAUSES RESOLVED
          </span>
        </div>

        <div className="space-y-2.5">
          {negotiationRounds.map((rnd) => {
            const isBuyer = rnd.party === "BUYER_AGENT";

            return (
              <div
                key={rnd.round_number}
                className={`p-3 border border-[#141414] bg-[#E4E3E0] font-mono transition-all ${
                  isBuyer ? "border-l-4 border-l-[#141414]" : "border-r-4 border-r-[#141414]"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 bg-[#141414] text-[#E4E3E0] uppercase">
                      ROUND 0{rnd.round_number}
                    </span>
                    <span className="text-xs font-bold uppercase text-[#141414]">
                      {isBuyer ? "BUYER AGENT (Gemini)" : "VENDOR AGENT (Vultr)"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    {rnd.impact_cost_delta !== 0 && (
                      <span className="font-mono text-green-800 font-bold bg-[#D6D5D1] px-1.5 py-0.2 border border-[#141414]">
                        PRICE DELTA: -${Math.abs(rnd.impact_cost_delta).toLocaleString()}
                      </span>
                    )}
                    <span
                      className={`px-1.5 py-0.2 text-[10px] font-bold uppercase border ${
                        rnd.status === "ACCEPTED"
                          ? "bg-green-800 text-white border-green-900"
                          : rnd.status === "COUNTERED"
                          ? "bg-amber-700 text-white border-amber-800"
                          : "bg-[#141414] text-[#E4E3E0] border-[#141414]"
                      }`}
                    >
                      {rnd.status}
                    </span>
                  </div>
                </div>

                <div className="text-xs font-bold text-[#141414] mt-1">{rnd.clause_targeted}</div>
                <p className="text-xs text-[#141414]/90 mt-1 leading-relaxed">{rnd.proposed_concession}</p>
                <p className="text-[11px] font-technical-serif italic text-[#141414]/70 mt-1 border-t border-[#141414]/20 pt-1">
                  &ldquo;{rnd.reasoning}&rdquo;
                </p>
              </div>
            );
          })}
        </div>

        {/* Net Outcome Banner */}
        <div className="bg-[#E4E3E0] p-3.5 border border-[#141414] flex flex-wrap items-center justify-between gap-4 font-mono">
          <div>
            <span className="text-[10px] uppercase text-[#141414]/70 block">Negotiated Outcome:</span>
            <div className="text-sm font-bold text-[#141414] mt-0.5 uppercase">
              NET CONTRACT VALUE: <span className="text-green-800">${contract ? contract.total_contract_value.toLocaleString() : "$699,952.00"}</span>
            </div>
            <p className="text-[11px] text-[#141414]/70 mt-0.5">
              Includes $22,000 reservation discount + 99.995% SLA + Net-45 Terms.
            </p>
          </div>

          <button
            id="btn-proceed-to-contract-sign"
            onClick={onProceedToContract}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-[#141414] hover:bg-[#333333] text-[#E4E3E0] text-xs font-mono uppercase font-bold transition-all border border-[#141414]"
          >
            <span>REVIEW & CRYPTOGRAPHICALLY SIGN</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

