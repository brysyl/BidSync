import React from "react";
import {
  Cpu,
  Server,
  Activity,
  Layers,
  FileText,
  ShieldCheck,
  Zap,
  Play,
  RotateCw,
} from "lucide-react";
import { ViewTab, HealthStatus } from "../types";

interface HeaderProps {
  currentTab: ViewTab;
  setCurrentTab: (tab: ViewTab) => void;
  health: HealthStatus | null;
  isRunningPipeline: boolean;
  onRunFullPipeline: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  health,
  isRunningPipeline,
  onRunFullPipeline,
}) => {
  const tabs: { id: ViewTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "ingestion", label: "01. RFP INGESTION", icon: <FileText className="w-3.5 h-3.5" /> },
    { id: "telemetry", label: "02. AGENT TELEMETRY", icon: <Activity className="w-3.5 h-3.5" />, badge: "LIVE" },
    { id: "matrix", label: "03. PRICING MATRIX", icon: <Layers className="w-3.5 h-3.5" /> },
    { id: "arena", label: "04. NEGOTIATION ARENA", icon: <Zap className="w-3.5 h-3.5" /> },
    { id: "contract", label: "05. CONTRACT & SIGN", icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: "infrastructure", label: "DEPLOYMENT & MCP", icon: <Server className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="bg-[#E4E3E0] border-b-2 border-[#141414] text-[#141414] sticky top-0 z-40 select-none">
      {/* Top Technical Metadata Ribbon */}
      <div className="px-4 py-1.5 border-b border-[#141414] bg-[#D6D5D1] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-bold tracking-wider text-[#141414]">
            <div className="w-2 h-2 rounded-full bg-green-600 shadow-[0_0_8px_rgba(22,163,74,0.6)] animate-pulse"></div>
            <span>SYS: ACTIVE</span>
          </div>
          <span className="text-[#141414]/40">|</span>
          <div className="flex items-center gap-1.5 text-[#141414]">
            <Cpu className="w-3.5 h-3.5 text-[#141414]" />
            <span className="font-mono text-[11px] uppercase tracking-tight">Gemini 3 Pro + Vultr Llama-3.3-70B</span>
          </div>
          <span className="text-[#141414]/40 hidden md:inline">|</span>
          <div className="hidden md:flex items-center gap-1.5 text-[#141414]/80 text-[11px]">
            <span className="font-bold">MCP PROTOCOL v2024-11-05</span>
            <span className="opacity-60">(6 ERP Tools Synced)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 bg-[#E4E3E0] px-2.5 py-0.5 border border-[#141414] text-[11px] font-mono">
            <span className="opacity-60">DB:</span>
            <span className="font-bold text-green-700">POSTGRES 16</span>
            <span className="opacity-30">•</span>
            <span className="opacity-60">QUEUE:</span>
            <span className="font-bold text-blue-700">REDIS 7</span>
          </div>

          <div className="px-2.5 py-0.5 border border-[#141414] text-[11px] font-mono uppercase bg-[#141414] text-[#E4E3E0]">
            Vultr: 102.44.11.2
          </div>

          <button
            id="run-autonomous-pipeline-btn"
            onClick={onRunFullPipeline}
            disabled={isRunningPipeline}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono uppercase tracking-wider font-bold transition-all border border-[#141414] ${
              isRunningPipeline
                ? "bg-amber-600 text-white cursor-wait animate-pulse"
                : "bg-[#141414] text-[#E4E3E0] hover:bg-[#333333] active:translate-y-0.5"
            }`}
          >
            {isRunningPipeline ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>ORCHESTRATING 4 AGENTS...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>RUN PIPELINE</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main App Navigation Bar */}
      <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-4 bg-[#E4E3E0]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#141414] rounded-sm flex items-center justify-center text-[#E4E3E0] font-bold text-lg font-mono">
            B
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-[#141414] uppercase">BidSync</h1>
              <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#141414] text-[#E4E3E0]">
                RFP-CORE-9921
              </span>
            </div>
            <p className="text-[11px] font-technical-serif italic text-[#141414]/70 leading-none mt-0.5">
              Autonomous B2B Procurement, MCP Pricing Benchmarks & Contract Negotiation
            </p>
          </div>
        </div>

        {/* Tab Controls (Data Grid Toolbar) */}
        <nav className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono transition-colors border border-[#141414] whitespace-nowrap ${
                  isActive
                    ? "bg-[#141414] text-[#E4E3E0] font-bold shadow-none"
                    : "bg-[#D6D5D1]/80 text-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0]"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`px-1 py-0.2 text-[9px] font-mono uppercase ${
                      isActive ? "bg-green-600 text-white" : "bg-[#141414] text-[#E4E3E0]"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

