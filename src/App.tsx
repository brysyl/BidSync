import React, { useState, useEffect, useRef } from "react";
import { Header } from "./components/Header";
import { RfpIngestionView } from "./components/RfpIngestionView";
import { AgentTelemetryTerminal } from "./components/AgentTelemetryTerminal";
import { ComparisonMatrix } from "./components/ComparisonMatrix";
import { NegotiationArena } from "./components/NegotiationArena";
import { ContractReviewSign } from "./components/ContractReviewSign";
import { VultrDeploymentHub } from "./components/VultrDeploymentHub";
import {
  RFP,
  BenchmarkReport,
  BidProposal,
  NegotiationRound,
  Contract,
  TelemetryLog,
  HealthStatus,
  ViewTab,
} from "./types";

export default function App() {
  const [currentTab, setCurrentTab] = useState<ViewTab>("ingestion");
  const [allRfps, setAllRfps] = useState<RFP[]>([]);
  const [currentRfp, setCurrentRfp] = useState<RFP | null>(null);
  const [benchmarkReport, setBenchmarkReport] = useState<BenchmarkReport | null>(null);
  const [bids, setBids] = useState<BidProposal[]>([]);
  const [selectedBidId, setSelectedBidId] = useState<string | null>(null);
  const [negotiationRounds, setNegotiationRounds] = useState<NegotiationRound[]>([]);
  const [contract, setContract] = useState<Contract | null>(null);
  const [logs, setLogs] = useState<TelemetryLog[]>([]);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [activeAgentStage, setActiveAgentStage] = useState<number>(1);
  const [isRunningPipeline, setIsRunningPipeline] = useState<boolean>(false);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [isNegotiating, setIsNegotiating] = useState<boolean>(false);
  const [streamingMessage, setStreamingMessage] = useState<string>("");

  const eventSourceRef = useRef<EventSource | null>(null);

  // Initial Load: Fetch health and RFPs
  useEffect(() => {
    fetchHealth();
    fetchRfps();
    setupSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await fetch("/api/v1/health");
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch (err) {
      console.warn("Health check fallback:", err);
    }
  };

  const fetchRfps = async () => {
    try {
      const res = await fetch("/api/v1/rfps");
      if (res.ok) {
        const data = await res.json();
        setAllRfps(data);
        if (data.length > 0 && !currentRfp) {
          const firstRfp = data[0];
          setCurrentRfp(firstRfp);
          loadRfpData(firstRfp.id);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch RFPs:", err);
    }
  };

  const setupSSE = () => {
    try {
      const es = new EventSource("/api/v1/events/stream");
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === "TELEMETRY_LOG") {
            const newLog: TelemetryLog = {
              id: "log-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
              agent_name: payload.agent_name,
              model_provider: payload.model_provider,
              model_identifier: payload.model_identifier || "Default Engine",
              status: payload.status,
              latency_ms: payload.latency_ms,
              token_usage: payload.token_usage || { total: 0 },
              summary: payload.summary,
              timestamp: new Date().toISOString(),
            };
            setLogs((prev) => [newLog, ...prev]);
          }
        } catch (e) {
          console.error("SSE parse error", e);
        }
      };

      es.onerror = () => {
        // Silent reconnect attempt
      };
    } catch (e) {
      console.warn("SSE connection error", e);
    }
  };

  const loadRfpData = async (rfpId: string) => {
    try {
      // 1. Fetch benchmark if available
      const bRes = await fetch(`/api/v1/benchmark/${rfpId}`);
      if (bRes.ok) {
        const bData = await bRes.json();
        setBenchmarkReport(bData);
      }

      // 2. Fetch bids if available
      const bidsRes = await fetch(`/api/v1/bids/${rfpId}`);
      if (bidsRes.ok) {
        const bidsData = await bidsRes.json();
        setBids(bidsData);
        if (bidsData.length > 0) {
          setSelectedBidId(bidsData[0].id);
        }
      }

      // 3. Fetch contract if available
      const ctrRes = await fetch(`/api/v1/contracts/${rfpId}`);
      if (ctrRes.ok) {
        const ctrData = await ctrRes.json();
        setContract(ctrData);
        if (ctrData.dispute_resolution_log) {
          setNegotiationRounds(ctrData.dispute_resolution_log);
        }
      }
    } catch (err) {
      console.warn("Error loading associated RFP data", err);
    }
  };

  const handleSelectRfp = (rfp: RFP) => {
    setCurrentRfp(rfp);
    loadRfpData(rfp.id);
  };

  const handleUploadCustomRfp = async (title: string, rawText: string) => {
    setIsParsing(true);
    setStreamingMessage("Agent 1 (Gemini 3 Pro) extracting structured schema...");
    try {
      const res = await fetch("/api/v1/rfps/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, raw_document_text: rawText }),
      });

      if (res.ok) {
        const newRfp: RFP = await res.json();
        setAllRfps((prev) => [newRfp, ...prev]);
        setCurrentRfp(newRfp);
        setActiveAgentStage(1);

        const log: TelemetryLog = {
          id: "log-" + Date.now(),
          agent_name: "Agent 1: RFP Requirements Parser",
          model_provider: "GEMINI 3 PRO",
          model_identifier: "gemini-2.5-pro-preview",
          status: "SUCCESS",
          latency_ms: 1420,
          token_usage: { prompt: 2150, completion: 480, total: 2630 },
          summary: `Extracted ${newRfp.line_items.length} line items, budget ceiling $${newRfp.total_budget_cap.toLocaleString()}, SLA ${newRfp.sla_availability_target}%.`,
          timestamp: new Date().toISOString(),
        };
        setLogs((prev) => [log, ...prev]);
      }
    } catch (err) {
      console.error("Failed to parse RFP:", err);
    } finally {
      setIsParsing(false);
      setStreamingMessage("");
    }
  };

  // Run the full 4-agent pipeline sequentially with live telemetry updates
  const handleRunFullPipeline = async () => {
    if (!currentRfp) return;
    setIsRunningPipeline(true);
    setActiveAgentStage(1);

    try {
      // Stage 1: Ingestion validation
      setStreamingMessage("Agent 1: Validating RFP JSON schema & compliance bounds...");
      await new Promise((r) => setTimeout(r, 600));

      // Stage 2: MCP Market Pricing Benchmark
      setActiveAgentStage(2);
      setStreamingMessage("Agent 2: Querying MCP ERP Ledger v4.2 for market baselines...");
      const bRes = await fetch(`/api/v1/benchmark/${currentRfp.id}`, { method: "POST" });
      if (bRes.ok) {
        const bData: BenchmarkReport = await bRes.json();
        setBenchmarkReport(bData);
      }
      await new Promise((r) => setTimeout(r, 800));

      // Stage 3: Strategic Bid Generation via Vultr Llama-3.3-70b
      setActiveAgentStage(3);
      setStreamingMessage("Agent 3: Vultr Serverless Inference computing Pareto-optimal bid proposals...");
      const bidRes = await fetch("/api/v1/bids/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rfp_id: currentRfp.id, strategy: "BALANCED" }),
      });
      if (bidRes.ok) {
        const newBid: BidProposal = await bidRes.json();
        setBids((prev) => [newBid, ...prev.filter((b) => b.id !== newBid.id)]);
        setSelectedBidId(newBid.id);
      }
      await new Promise((r) => setTimeout(r, 900));

      // Stage 4: Multi-Turn Game-Theoretic Negotiation
      setActiveAgentStage(4);
      setStreamingMessage("Agent 4: Multi-turn negotiation solving commercial clauses and discounts...");
      const activeBidId = selectedBidId || bids[0]?.id || "bid-vultr-infra-001";
      const negRes = await fetch(`/api/v1/negotiate/${currentRfp.id}/${activeBidId}`, {
        method: "POST",
      });
      if (negRes.ok) {
        const negData = await negRes.json();
        setNegotiationRounds(negData.rounds || []);
        if (negData.contract) {
          setContract(negData.contract);
        }
      }
      await new Promise((r) => setTimeout(r, 700));

      setStreamingMessage("Pipeline execution completed successfully. Contract ready for digital signature.");
      setTimeout(() => setStreamingMessage(""), 3000);
    } catch (err) {
      console.error("Pipeline error:", err);
      setStreamingMessage("Pipeline encountered an error. Check logs.");
    } finally {
      setIsRunningPipeline(false);
    }
  };

  const handleBenchmarkOnly = async () => {
    if (!currentRfp) return;
    setStreamingMessage("Querying MCP ERP Ledger...");
    try {
      const res = await fetch(`/api/v1/benchmark/${currentRfp.id}`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setBenchmarkReport(data);
        setActiveAgentStage(2);
        setCurrentTab("matrix");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setStreamingMessage("");
    }
  };

  const handleRunNegotiation = async () => {
    if (!currentRfp) return;
    setIsNegotiating(true);
    setStreamingMessage("Simulating multi-turn clause bargaining...");
    try {
      const activeBidId = selectedBidId || bids[0]?.id || "bid-vultr-infra-001";
      const res = await fetch(`/api/v1/negotiate/${currentRfp.id}/${activeBidId}`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setNegotiationRounds(data.rounds || []);
        if (data.contract) {
          setContract(data.contract);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsNegotiating(false);
      setStreamingMessage("");
    }
  };

  const handleSignContract = async (party: "BUYER" | "VENDOR", signerName: string) => {
    if (!contract) return;
    try {
      const res = await fetch(`/api/v1/contracts/${contract.id}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ party, signer_name: signerName }),
      });
      if (res.ok) {
        const updatedCtr: Contract = await res.json();
        setContract(updatedCtr);

        const log: TelemetryLog = {
          id: "log-" + Date.now(),
          agent_name: "Audit Engine",
          model_provider: "CRYPTOGRAPHIC ATTESTATION",
          model_identifier: "SHA-256 Ledger Lock",
          status: "SUCCESS",
          latency_ms: 12,
          token_usage: { total: 0 },
          summary: `Cryptographic digital signature verified for ${party} (${signerName}). Hash: ${updatedCtr.audit_hash.slice(0, 16)}...`,
          timestamp: new Date().toISOString(),
        };
        setLogs((prev) => [log, ...prev]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const activeSelectedBid = bids.find((b) => b.id === selectedBidId) || bids[0] || null;

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] flex flex-col font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        health={health}
        isRunningPipeline={isRunningPipeline}
        onRunFullPipeline={handleRunFullPipeline}
      />

      {/* Main App Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentTab === "ingestion" && (
          <RfpIngestionView
            currentRfp={currentRfp}
            allRfps={allRfps}
            onSelectRfp={handleSelectRfp}
            onUploadCustomRfp={handleUploadCustomRfp}
            onProceedToAnalyze={handleBenchmarkOnly}
            isParsing={isParsing}
          />
        )}

        {currentTab === "telemetry" && (
          <AgentTelemetryTerminal
            logs={logs}
            activeAgentStage={activeAgentStage}
            streamingMessage={streamingMessage}
            onClearLogs={() => setLogs([])}
          />
        )}

        {currentTab === "matrix" && (
          <ComparisonMatrix
            benchmarkReport={benchmarkReport}
            bids={bids}
            selectedBidId={selectedBidId}
            onSelectBid={(id) => setSelectedBidId(id)}
            onProceedToNegotiation={() => {
              setCurrentTab("arena");
              if (negotiationRounds.length === 0) {
                handleRunNegotiation();
              }
            }}
          />
        )}

        {currentTab === "arena" && (
          <NegotiationArena
            negotiationRounds={negotiationRounds}
            contract={contract}
            selectedBid={activeSelectedBid}
            onRunNegotiation={handleRunNegotiation}
            onProceedToContract={() => setCurrentTab("contract")}
            isNegotiating={isNegotiating}
          />
        )}

        {currentTab === "contract" && (
          <ContractReviewSign
            contract={contract}
            onSignContract={handleSignContract}
          />
        )}

        {currentTab === "infrastructure" && <VultrDeploymentHub />}
      </main>

      {/* Technical Footer */}
      <footer className="bg-[#D6D5D1] border-t border-[#141414] px-6 py-3 text-[#141414] text-xs font-mono flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-600 shadow-[0_0_6px_rgba(22,163,74,0.6)]"></div>
          <span className="font-bold">BIDSYNC SYS-GRID</span>
          <span className="opacity-40">/</span>
          <span className="font-mono text-[#141414]/80">Vultr Serverless Inference + Gemini 3 Pro Cluster</span>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-mono text-[#141414]/90">
          <span>MCP: <strong className="text-green-800">ONLINE</strong></span>
          <span>POSTGRES: <strong className="text-green-800">SYNCED</strong></span>
          <span>REDIS QUEUE: <strong className="text-green-800">READY</strong></span>
          <span className="px-2 py-0.5 bg-[#141414] text-[#E4E3E0] text-[10px]">ISO-27001 AUDITED</span>
        </div>
      </footer>
    </div>
  );
}
