import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  Download,
  Copy,
  Check,
  Lock,
  Sparkles,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Contract } from "../types";

interface ContractReviewSignProps {
  contract: Contract | null;
  onSignContract: (party: "BUYER" | "VENDOR", signerName: string) => void;
}

export const ContractReviewSign: React.FC<ContractReviewSignProps> = ({
  contract,
  onSignContract,
}) => {
  const [buyerSigner, setBuyerSigner] = useState("Eleanor Vance, VP of Global Procurement");
  const [vendorSigner, setVendorSigner] = useState("Marcus Sterling, Head of Cloud Infrastructure");
  const [copiedHash, setCopiedHash] = useState(false);

  const handleSign = (party: "BUYER" | "VENDOR") => {
    const signer = party === "BUYER" ? buyerSigner : vendorSigner;
    onSignContract(party, signer);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleCopyHash = () => {
    if (contract?.audit_hash) {
      navigator.clipboard.writeText(contract.audit_hash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  const handleDownloadMarkdown = () => {
    if (contract) {
      const blob = new Blob([contract.terms_markdown], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `BidSync-Contract-${contract.id}.md`;
      a.click();
    }
  };

  const handleDownloadAuditBundle = () => {
    if (contract) {
      const bundle = {
        contract_id: contract.id,
        audit_hash_sha256: contract.audit_hash,
        executed_at: new Date().toISOString(),
        total_contract_value: contract.total_contract_value,
        buyer: {
          name: contract.buyer_name,
          signed: contract.signed_buyer,
          signed_at: contract.buyer_signed_at,
          signer: contract.buyer_signer_name,
        },
        vendor: {
          name: contract.vendor_name,
          signed: contract.signed_vendor,
          signed_at: contract.vendor_signed_at,
          signer: contract.vendor_signer_name,
        },
        dispute_resolution_log: contract.dispute_resolution_log,
        full_terms: contract.terms_markdown,
      };
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `BidSync-Audit-Bundle-${contract.id}.json`;
      a.click();
    }
  };

  if (!contract) {
    return (
      <div className="bg-[#D6D5D1] border border-[#141414] p-12 text-center text-[#141414]/60 font-mono">
        <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-[#141414]" />
        <h3 className="text-xs font-bold uppercase text-[#141414]">No Contract Synthesized Yet</h3>
        <p className="text-[11px] mt-1">
          Complete the negotiation round in Stage 04 to synthesize and sign the audited contract.
        </p>
      </div>
    );
  }

  const isFullyExecuted = contract.signed_buyer && contract.signed_vendor;

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-[#D6D5D1] border border-[#141414] p-4 text-[#141414]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#141414] text-[#E4E3E0] uppercase">
                STAGE 05: CONTRACT REVIEW & CRYPTOGRAPHIC EXECUTION
              </span>
              <span className="text-xs text-[#141414]/70 font-mono">SHA-256 Audit Attestation</span>
            </div>
            <h2 className="text-xl font-bold text-[#141414] uppercase tracking-tight mt-1">
              Master Services Agreement & Digital Signatures
            </h2>
            <p className="text-xs font-technical-serif italic text-[#141414]/80 max-w-2xl mt-0.5">
              Audited terms synthesized by multi-agent consensus. Both parties digitally execute with tamper-evident cryptographic hash verification.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <button
              onClick={handleDownloadMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E4E3E0] hover:bg-[#FFFFFF] text-[#141414] text-xs font-bold uppercase border border-[#141414] transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .MD</span>
            </button>

            <button
              onClick={handleDownloadAuditBundle}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141414] hover:bg-[#333333] text-[#E4E3E0] text-xs font-bold uppercase border border-[#141414] transition-all"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Audit Bundle (.JSON)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cryptographic Execution Hash Banner */}
      <div className="bg-[#E4E3E0] border border-[#141414] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs text-[#141414]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#141414] text-[#E4E3E0] flex items-center justify-center border border-[#141414] flex-shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#141414]/70 uppercase font-bold">SHA-256 Execution Hash:</span>
              <span className="text-green-800 font-bold uppercase">VERIFIED ON-LEDGER</span>
            </div>
            <div className="text-[#141414] text-[11px] break-all select-all mt-0.5 font-mono">
              {contract.audit_hash}
            </div>
          </div>
        </div>

        <button
          onClick={handleCopyHash}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#D6D5D1] text-[#141414] hover:bg-[#E4E3E0] border border-[#141414] text-[11px] uppercase font-bold self-start sm:self-center"
        >
          {copiedHash ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedHash ? "COPIED" : "COPY HASH"}</span>
        </button>
      </div>

      {/* Dual Signature Approval Console */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Buyer Sign Box */}
        <div
          className={`p-4 border border-[#141414] transition-all ${
            contract.signed_buyer ? "bg-[#E4E3E0]" : "bg-[#D6D5D1]"
          }`}
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-[#141414]"></div>
              <h3 className="text-xs font-mono font-bold uppercase text-[#141414]">Buyer Party Execution</h3>
            </div>
            {contract.signed_buyer ? (
              <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold bg-green-800 text-white uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> SIGNED & ATTESTED
              </span>
            ) : (
              <span className="text-[10px] font-mono text-amber-800 font-bold uppercase">PENDING SIGNATURE</span>
            )}
          </div>

          <div className="text-xs text-[#141414] font-bold mb-3 font-mono">
            {contract.buyer_name}
          </div>

          {contract.signed_buyer ? (
            <div className="bg-[#D6D5D1] p-2.5 border border-[#141414] space-y-1 text-xs font-mono text-[#141414]">
              <div className="text-green-800 font-bold uppercase">Digital Signature Verified:</div>
              <div>SIGNER: {contract.buyer_signer_name}</div>
              <div className="text-[10px] opacity-70">
                TIMESTAMP: {contract.buyer_signed_at ? new Date(contract.buyer_signed_at).toLocaleString() : "Just now"}
              </div>
            </div>
          ) : (
            <div className="space-y-2 font-mono">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#141414] mb-1">
                  Authorized Signer Title & Name
                </label>
                <input
                  type="text"
                  value={buyerSigner}
                  onChange={(e) => setBuyerSigner(e.target.value)}
                  className="w-full bg-[#E4E3E0] border border-[#141414] px-2.5 py-1.5 text-xs text-[#141414] focus:outline-none focus:bg-white"
                />
              </div>

              <button
                id="btn-sign-buyer"
                onClick={() => handleSign("BUYER")}
                className="w-full py-2 bg-[#141414] hover:bg-[#333333] text-[#E4E3E0] text-xs font-mono uppercase font-bold flex items-center justify-center gap-2 border border-[#141414] transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>EXECUTE AS BUYER (1-CLICK SIGN)</span>
              </button>
            </div>
          )}
        </div>

        {/* Vendor Sign Box */}
        <div
          className={`p-4 border border-[#141414] transition-all ${
            contract.signed_vendor ? "bg-[#E4E3E0]" : "bg-[#D6D5D1]"
          }`}
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-[#141414]"></div>
              <h3 className="text-xs font-mono font-bold uppercase text-[#141414]">Vendor Party Execution</h3>
            </div>
            {contract.signed_vendor ? (
              <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold bg-green-800 text-white uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> SIGNED & ATTESTED
              </span>
            ) : (
              <span className="text-[10px] font-mono text-amber-800 font-bold uppercase">PENDING SIGNATURE</span>
            )}
          </div>

          <div className="text-xs text-[#141414] font-bold mb-3 font-mono">
            {contract.vendor_name}
          </div>

          {contract.signed_vendor ? (
            <div className="bg-[#D6D5D1] p-2.5 border border-[#141414] space-y-1 text-xs font-mono text-[#141414]">
              <div className="text-green-800 font-bold uppercase">Digital Signature Verified:</div>
              <div>SIGNER: {contract.vendor_signer_name}</div>
              <div className="text-[10px] opacity-70">
                TIMESTAMP: {contract.vendor_signed_at ? new Date(contract.vendor_signed_at).toLocaleString() : "Just now"}
              </div>
            </div>
          ) : (
            <div className="space-y-2 font-mono">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#141414] mb-1">
                  Authorized Signer Title & Name
                </label>
                <input
                  type="text"
                  value={vendorSigner}
                  onChange={(e) => setVendorSigner(e.target.value)}
                  className="w-full bg-[#E4E3E0] border border-[#141414] px-2.5 py-1.5 text-xs text-[#141414] focus:outline-none focus:bg-white"
                />
              </div>

              <button
                id="btn-sign-vendor"
                onClick={() => handleSign("VENDOR")}
                className="w-full py-2 bg-[#141414] hover:bg-[#333333] text-[#E4E3E0] text-xs font-mono uppercase font-bold flex items-center justify-center gap-2 border border-[#141414] transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>EXECUTE AS VENDOR (1-CLICK SIGN)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Contract Executed Celebration Banner */}
      {isFullyExecuted && (
        <div className="bg-[#E4E3E0] border-2 border-green-800 p-3.5 flex flex-wrap items-center justify-between gap-3 text-[#141414] font-mono">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-800 text-white flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase text-green-900">Contract Fully Executed & Ledger Locked</h3>
              <p className="text-[11px] text-[#141414]/80">
                Both parties have cryptographically signed. Procurement contract is binding under Delaware Commercial Code.
              </p>
            </div>
          </div>

          <button
            onClick={handleDownloadAuditBundle}
            className="px-3.5 py-1.5 bg-green-800 hover:bg-green-900 text-white text-xs font-mono uppercase font-bold border border-green-950 transition-all"
          >
            DOWNLOAD FINAL SIGNED BUNDLE
          </button>
        </div>
      )}

      {/* Dynamic Contract Markdown Preview Container */}
      <div className="bg-[#D6D5D1] border border-[#141414]">
        <div className="p-3 bg-[#E4E3E0] border-b border-[#141414] flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-[#141414]" />
            <h3 className="text-xs font-bold uppercase text-[#141414]">Full Legal Agreement Text (Rendered Markdown)</h3>
          </div>
          <span className="text-[11px] text-[#141414]/70">REF: BIDSYNC-CTR-{contract.id.slice(-6).toUpperCase()}</span>
        </div>

        <div className="p-5 bg-[#E4E3E0] text-[#141414] text-xs leading-relaxed max-h-[500px] overflow-y-auto space-y-4 font-mono">
          <div className="whitespace-pre-wrap font-mono text-[#141414] leading-relaxed text-xs">
            {contract.terms_markdown}
          </div>
        </div>
      </div>
    </div>
  );
};

