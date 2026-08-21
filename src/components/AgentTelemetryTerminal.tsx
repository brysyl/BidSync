import React, { useState } from "react";
import {
  Terminal,
  Activity,
  Cpu,
  Clock,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";
import { TelemetryLog } from "../types";

interface AgentTelemetryTerminalProps {
  logs: TelemetryLog[];
  activeAgentStage: number; // 1, 2, 3, 4
  streamingMessage?: string;
  onClearLogs: () => void;
}

export const AgentTelemetryTerminal: React.FC<AgentTelemetryTerminalProps> = ({
  logs,
  activeAgentStage,
  streamingMessage,
  onClearLogs,
}) => {
  const [filter, setFilter] = useState<string>("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredLogs = logs.filter((log) => {
    if (filter === "ALL") return true;
    if (filter === "GEMINI") return log.model_provider.includes("GEMINI");
    if (filter === "VULTR") return log.model_provider.includes("VULTR");
    if (filter === "MCP") return log.model_provider.includes("MCP");
    return true;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const agentSteps = [
    {
      step: 1,
      name: "RFP Parser",
      provider: "Gemini 3 Pro",
      tech: "Long-Context Reasoning",
    },
    {
      step: 2,
      name: "Price Benchmarker",
      provider: "MCP Tool Runner",
      tech: "ERP Ledger v4.2",
    },
    {
      step: 3,
      name: "Strategic Bid Gen",
      provider: "Vultr Serverless",
      tech: "Llama-3.3-70B REST",
    },
    {
      step: 4,
      name: "Contract Negotiator",
      provider: "Gemini Multi-Turn",
      tech: "SHA-256 Audit Engine",
    },
  ];

  return (
    <div className="space-y-4">
      {/* 4-Stage Visual State Machine Workflow */}
      <div className="bg-[#D6D5D1] border border-[#141414] p-4 text-[#141414]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#141414] text-[#E4E3E0] uppercase">
              STATE MACHINE TOPOLOGY
            </span>
            <h2 className="text-xl font-bold uppercase tracking-tight text-[#141414] mt-1">
              Autonomous 4-Agent Orchestration Pipeline
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#141414]">
            <div className="w-2 h-2 rounded-full bg-green-600 shadow-[0_0_6px_rgba(22,163,74,0.6)] animate-pulse"></div>
            <span>WORKER: REDIS QUEUE v7.0 (ACTIVE)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {agentSteps.map((s) => {
            const isActive = activeAgentStage === s.step;
            const isCompleted = activeAgentStage > s.step || logs.some((l) => l.agent_name.includes(s.name));

            return (
              <div
                key={s.step}
                className={`p-3 border border-[#141414] transition-all font-mono ${
                  isActive
                    ? "bg-[#141414] text-[#E4E3E0] shadow-md scale-[1.01]"
                    : isCompleted
                    ? "bg-[#E4E3E0] text-[#141414]"
                    : "bg-[#D6D5D1]/80 text-[#141414]/60"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 border border-[#141414] uppercase ${
                      isActive ? "bg-[#E4E3E0] text-[#141414]" : "bg-[#D6D5D1] text-[#141414]"
                    }`}
                  >
                    STAGE 0{s.step}
                  </span>
                  {isActive ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 animate-pulse uppercase">
                      <RefreshCw className="w-3 h-3 animate-spin" /> RUNNING
                    </span>
                  ) : isCompleted ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-green-700 uppercase">
                      <CheckCircle2 className="w-3 h-3" /> READY
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase opacity-50">IDLE</span>
                  )}
                </div>

                <h4 className="text-xs font-bold uppercase mt-1">{s.name}</h4>
                <div className="mt-2 text-[10px] flex items-center justify-between opacity-80 border-t border-[#141414]/20 pt-1">
                  <span>{s.provider}</span>
                  <span>{s.tech}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Terminal Shell */}
      <div className="bg-[#141414] border-2 border-[#141414] text-[#E4E3E0] font-mono text-xs shadow-xl">
        {/* Terminal Header */}
        <div className="bg-[#1A1A1A] px-4 py-2.5 border-b border-[#333333] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 bg-[#E4E3E0]/40 inline-block"></span>
              <span className="w-2.5 h-2.5 bg-[#E4E3E0]/60 inline-block"></span>
              <span className="w-2.5 h-2.5 bg-[#E4E3E0] inline-block"></span>
            </div>
            <div className="h-4 w-px bg-[#444444] mx-1"></div>
            <div className="flex items-center gap-1.5 text-[#E4E3E0] font-bold uppercase text-xs">
              <Terminal className="w-4 h-4 text-green-400" />
              <span>BidSync Telemetry Console (Live SSE Stream)</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#141414] border border-[#333333] text-[10px]">
              {(["ALL", "GEMINI", "VULTR", "MCP"] as const).map((tag) => (
                <button
                  key={tag}
                  onClick={() => setFilter(tag)}
                  className={`px-2.5 py-1 uppercase font-bold transition-all ${
                    filter === tag
                      ? "bg-[#E4E3E0] text-[#141414]"
                      : "text-[#E4E3E0]/70 hover:text-white"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <button
              onClick={onClearLogs}
              className="px-2 py-1 text-[10px] uppercase font-bold text-[#E4E3E0]/70 hover:text-white hover:bg-[#333333] border border-[#333333] transition-all"
            >
              CLEAR
            </button>
          </div>
        </div>

        {/* Live SSE Banner */}
        {streamingMessage && (
          <div className="px-4 py-2 bg-[#222222] border-b border-[#333333] text-green-400 flex items-center justify-between text-xs animate-pulse">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-green-400" />
              <span>{streamingMessage}</span>
            </div>
            <span className="text-[10px] font-mono uppercase bg-green-900/60 text-green-300 px-2 py-0.5 border border-green-700">
              STREAMING ACTIVE
            </span>
          </div>
        )}

        {/* Terminal Body */}
        <div className="p-4 space-y-3 max-h-[520px] overflow-y-auto bg-[#141414] text-[#E4E3E0]">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-[#E4E3E0]/40 font-mono">
              <Activity className="w-8 h-8 mx-auto mb-2 text-[#E4E3E0]/30 animate-pulse" />
              <p className="uppercase text-xs font-bold">Waiting for agent pipeline execution...</p>
              <p className="text-[11px] text-[#E4E3E0]/30 mt-1">
                Click &quot;RUN PIPELINE&quot; in header to trigger live autonomous execution.
              </p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              return (
                <div
                  key={log.id}
                  className="p-3 bg-[#1A1A1A] border border-[#333333] hover:border-[#666666] transition-all space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-[#E4E3E0] text-[#141414] uppercase">
                        {log.model_provider}
                      </span>

                      <span className="font-bold text-white text-xs uppercase">{log.agent_name}</span>
                      <span className="text-[#666666]">•</span>
                      <span className="text-[#AAAAAA] text-[11px] font-mono">{log.model_identifier}</span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-[#AAAAAA]">
                      <span className="flex items-center gap-1 text-amber-400 font-bold">
                        <Clock className="w-3 h-3" />
                        <span>{log.latency_ms}ms</span>
                      </span>

                      {log.token_usage?.total ? (
                        <span className="flex items-center gap-1 text-green-400 font-bold">
                          <Cpu className="w-3 h-3" />
                          <span>{log.token_usage.total} tokens</span>
                        </span>
                      ) : null}

                      <button
                        onClick={() => handleCopy(JSON.stringify(log, null, 2), log.id)}
                        className="text-[#888888] hover:text-white p-1"
                        title="Copy Log Payload"
                      >
                        {copiedId === log.id ? (
                          <Check className="w-3.5 h-3.5 text-green-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="text-[#E4E3E0] text-xs leading-relaxed pl-2 border-l-2 border-green-500 font-mono">
                    {log.summary}
                  </div>

                  <div className="text-[10px] text-[#888888] text-right font-mono">
                    TIMESTAMP: {new Date(log.timestamp).toLocaleTimeString()} UTC
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

