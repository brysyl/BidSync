import React, { useState } from "react";
import {
  UploadCloud,
  FileText,
  Clock,
  DollarSign,
  Shield,
  Layers,
  ArrowRight,
  Sparkles,
  Code2,
  FileSpreadsheet,
} from "lucide-react";
import { RFP } from "../types";

interface RfpIngestionViewProps {
  currentRfp: RFP | null;
  allRfps: RFP[];
  onSelectRfp: (rfp: RFP) => void;
  onUploadCustomRfp: (title: string, rawText: string) => void;
  onProceedToAnalyze: () => void;
  isParsing: boolean;
}

export const RfpIngestionView: React.FC<RfpIngestionViewProps> = ({
  currentRfp,
  allRfps,
  onSelectRfp,
  onUploadCustomRfp,
  onProceedToAnalyze,
  isParsing,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customText, setCustomText] = useState("");
  const [isManualInput, setIsManualInput] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        onUploadCustomRfp(file.name.replace(".pdf", "").replace(".txt", ""), text || "Extracted PDF contents");
      };
      reader.readAsText(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        onUploadCustomRfp(file.name.replace(".pdf", "").replace(".txt", ""), text || "Extracted PDF contents");
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Sample Loaders */}
      <div className="bg-[#D6D5D1] border border-[#141414] p-4 text-[#141414]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#141414] text-[#E4E3E0] uppercase">
                STAGE 01: INGESTION & EXTRACTION
              </span>
              <span className="text-xs text-[#141414]/70 font-mono">Agent: Gemini 3 Pro Long-Context</span>
            </div>
            <h2 className="text-xl font-bold text-[#141414] uppercase tracking-tight mt-1">
              Enterprise RFP Ingestion & Requirements Parser
            </h2>
            <p className="text-xs font-technical-serif italic text-[#141414]/80 max-w-2xl mt-0.5">
              Upload unstructured enterprise RFP documents or select pre-loaded institutional procurement specifications to extract validated itemized schemas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-[#141414] uppercase tracking-wider">LOAD SAMPLE:</span>
            {allRfps.map((rfp) => (
              <button
                key={rfp.id}
                id={`btn-load-sample-${rfp.id}`}
                onClick={() => onSelectRfp(rfp)}
                className={`px-3 py-1 text-xs font-mono transition-all border border-[#141414] ${
                  currentRfp?.id === rfp.id
                    ? "bg-[#141414] text-[#E4E3E0] font-bold"
                    : "bg-[#E4E3E0] text-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0]"
                }`}
              >
                {rfp.title.length > 26 ? rfp.title.slice(0, 26) + "..." : rfp.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Drag & Drop Ingestion & Custom Text */}
        <div className="lg:col-span-5 space-y-4">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed border-[#141414] p-6 text-center transition-all bg-[#D6D5D1]/50 ${
              dragActive ? "bg-[#D6D5D1] scale-[1.01]" : ""
            }`}
          >
            <div className="w-10 h-10 bg-[#141414] text-[#E4E3E0] mx-auto flex items-center justify-center mb-2.5">
              <UploadCloud className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#141414]">
              Drag & Drop RFP PDF or Specification
            </h3>
            <p className="text-[11px] font-mono text-[#141414]/70 mt-1 mb-3">
              Supports .pdf, .docx, .txt (Up to 100MB Long Context)
            </p>

            <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-[#141414] hover:bg-[#333333] text-[#E4E3E0] text-xs font-mono uppercase tracking-wider border border-[#141414] transition-all">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Browse Local Files</span>
              <input
                type="file"
                accept=".pdf,.txt,.docx,.json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>

          {/* Manual / Custom Paste Toggle */}
          <div className="bg-[#D6D5D1] border border-[#141414] p-3.5">
            <button
              onClick={() => setIsManualInput(!isManualInput)}
              className="flex items-center justify-between w-full text-xs font-mono font-bold text-[#141414] uppercase hover:underline"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#141414]" />
                <span>Custom RFP Text / Paste Clauses</span>
              </div>
              <span className="text-[11px]">{isManualInput ? "▲ HIDE" : "▼ EXPAND"}</span>
            </button>

            {isManualInput && (
              <div className="mt-3 space-y-3 pt-3 border-t border-[#141414]">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#141414]/80 mb-1">
                    RFP Title / Project Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Multi-Cloud Bare-Metal GPU Compute"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full bg-[#E4E3E0] border border-[#141414] px-3 py-1.5 text-xs text-[#141414] font-mono focus:outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#141414]/80 mb-1">
                    Raw Document Text / Scope
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Paste enterprise RFP text including line items, SLA requirements, delivery deadlines..."
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    className="w-full bg-[#E4E3E0] border border-[#141414] p-2.5 text-xs text-[#141414] focus:outline-none focus:bg-white font-mono"
                  />
                </div>
                <button
                  id="btn-parse-custom-rfp"
                  disabled={!customText.trim() || isParsing}
                  onClick={() => onUploadCustomRfp(customTitle || "Custom Enterprise RFP", customText)}
                  className="w-full py-1.5 bg-[#141414] hover:bg-[#333333] disabled:opacity-50 text-[#E4E3E0] text-xs font-mono uppercase font-bold flex items-center justify-center gap-1.5 transition-all border border-[#141414]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Parse with Gemini 3 Pro</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Real-time Parsed Requirements Preview */}
        <div className="lg:col-span-7 space-y-4">
          {currentRfp ? (
            <div className="bg-[#D6D5D1] border border-[#141414]">
              {/* Header */}
              <div className="p-3 bg-[#E4E3E0] border-b border-[#141414] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-green-600"></div>
                  <h3 className="text-xs font-mono font-bold uppercase text-[#141414] truncate max-w-md">
                    {currentRfp.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowRawJson(!showRawJson)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-[#141414] text-[#E4E3E0] text-[10px] font-mono uppercase border border-[#141414]"
                  >
                    <Code2 className="w-3 h-3" />
                    <span>{showRawJson ? "Visual Grid" : "JSON Schema"}</span>
                  </button>
                </div>
              </div>

              {/* Quick Spec Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 border-b border-[#141414] bg-[#E4E3E0]">
                <div className="bg-[#D6D5D1] p-2 border border-[#141414]">
                  <div className="flex items-center gap-1 text-[#141414]/70 text-[10px] font-mono uppercase">
                    <DollarSign className="w-3 h-3 text-[#141414]" />
                    <span>Budget Cap</span>
                  </div>
                  <div className="text-sm font-bold text-[#141414] font-mono mt-0.5">
                    ${currentRfp.total_budget_cap.toLocaleString()}
                  </div>
                </div>

                <div className="bg-[#D6D5D1] p-2 border border-[#141414]">
                  <div className="flex items-center gap-1 text-[#141414]/70 text-[10px] font-mono uppercase">
                    <Clock className="w-3 h-3 text-[#141414]" />
                    <span>Timeline</span>
                  </div>
                  <div className="text-sm font-bold text-[#141414] font-mono mt-0.5">
                    {currentRfp.delivery_deadline_days} Days
                  </div>
                </div>

                <div className="bg-[#D6D5D1] p-2 border border-[#141414]">
                  <div className="flex items-center gap-1 text-[#141414]/70 text-[10px] font-mono uppercase">
                    <Shield className="w-3 h-3 text-[#141414]" />
                    <span>SLA Uptime</span>
                  </div>
                  <div className="text-sm font-bold text-green-800 font-mono mt-0.5">
                    {currentRfp.sla_availability_target}%
                  </div>
                </div>

                <div className="bg-[#D6D5D1] p-2 border border-[#141414]">
                  <div className="flex items-center gap-1 text-[#141414]/70 text-[10px] font-mono uppercase">
                    <Layers className="w-3 h-3 text-[#141414]" />
                    <span>Line Items</span>
                  </div>
                  <div className="text-sm font-bold text-[#141414] font-mono mt-0.5">
                    {currentRfp.line_items.length} SKUs
                  </div>
                </div>
              </div>

              {/* Content Body */}
              {showRawJson ? (
                <div className="p-4 bg-[#141414] text-[#E4E3E0] font-mono text-xs overflow-x-auto max-h-[380px]">
                  <pre>{JSON.stringify(currentRfp, null, 2)}</pre>
                </div>
              ) : (
                <div className="p-3 space-y-3 max-h-[420px] overflow-y-auto">
                  {/* Summary */}
                  <div>
                    <h4 className="text-[10px] font-mono font-bold text-[#141414] uppercase tracking-wider mb-1">
                      Executive Summary & Buyer
                    </h4>
                    <p className="text-xs text-[#141414] leading-relaxed bg-[#E4E3E0] p-2.5 border border-[#141414]">
                      <strong className="font-mono">{currentRfp.buyer_organization}:</strong>{" "}
                      <span className="font-technical-serif italic">{currentRfp.executive_summary}</span>
                    </p>
                  </div>

                  {/* Compliance Standards */}
                  <div>
                    <h4 className="text-[10px] font-mono font-bold text-[#141414] uppercase tracking-wider mb-1">
                      Required Compliance Standards
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {currentRfp.compliance_standards.map((comp, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-[10px] font-mono bg-[#E4E3E0] text-[#141414] border border-[#141414] uppercase"
                        >
                          ✓ {comp}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Itemized Line Items Table */}
                  <div>
                    <h4 className="text-[10px] font-mono font-bold text-[#141414] uppercase tracking-wider mb-1">
                      Itemized Procurement Line Items
                    </h4>
                    <div className="border border-[#141414] overflow-hidden bg-[#E4E3E0]">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#141414] text-[#E4E3E0] font-mono text-[10px] uppercase border-b border-[#141414]">
                          <tr>
                            <th className="p-2">SKU / Code</th>
                            <th className="p-2">Description</th>
                            <th className="p-2">Quantity</th>
                            <th className="p-2 text-right">Target Unit Budget</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#141414]/20 text-[#141414]">
                          {currentRfp.line_items.map((item, i) => (
                            <tr key={i} className="hover:bg-[#D6D5D1]/80">
                              <td className="p-2 font-mono text-[11px] font-bold text-[#141414]">
                                {item.item_id}
                              </td>
                              <td className="p-2 font-mono text-[11px]">{item.description}</td>
                              <td className="p-2 font-mono text-[11px]">
                                {item.quantity.toLocaleString()} {item.unit_of_measure}
                              </td>
                              <td className="p-2 font-mono text-right font-bold text-[#141414]">
                                {item.target_unit_budget ? `$${item.target_unit_budget.toFixed(2)}` : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Key Deliverables & Penalty Clauses */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="bg-[#E4E3E0] p-2.5 border border-[#141414]">
                      <span className="font-mono text-[10px] font-bold uppercase text-[#141414] block mb-1">
                        Key Deliverables:
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-[#141414]/90 text-[11px] font-mono">
                        {currentRfp.key_deliverables.map((del, i) => (
                          <li key={i}>{del}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-[#E4E3E0] p-2.5 border border-[#141414]">
                      <span className="font-mono text-[10px] font-bold uppercase text-[#141414] block mb-1">
                        SLA Penalty Terms:
                      </span>
                      <p className="text-[#141414]/90 text-[11px] font-mono leading-relaxed">
                        {currentRfp.penalty_clauses}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Action Bar */}
              <div className="p-3 bg-[#E4E3E0] border-t border-[#141414] flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-mono text-[#141414]">
                  STATUS: <strong className="text-green-800">VALIDATED & INGESTED</strong>
                </span>

                <button
                  id="btn-proceed-to-benchmark"
                  onClick={onProceedToAnalyze}
                  className="flex items-center gap-2 px-3.5 py-1.5 bg-[#141414] hover:bg-[#333333] text-[#E4E3E0] text-xs font-mono uppercase font-bold transition-all border border-[#141414]"
                >
                  <span>RUN AGENT 02 (MCP PRICE BENCHMARK)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#D6D5D1] border border-[#141414] p-12 text-center text-[#141414]/60 font-mono">
              <FileText className="w-10 h-10 mx-auto mb-2 text-[#141414]" />
              <p className="text-xs uppercase">No RFP loaded. Drag & drop a document or select a sample above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
