import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CustodyRecord } from "@/types/index.t";
import { Copy, ExternalLink, User } from "lucide-react";
import { useState } from "react";

interface CustodyTrailModalProps {
  open: boolean;
  onClose: () => void;
  custodyTrail: CustodyRecord[];
  vaultName: string;
}

export default function CustodyTrailModal({ open, onClose, custodyTrail, vaultName }: CustodyTrailModalProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const formatAddress = (address: string) => {
    if (address.length > 16) {
      return `${address.slice(0, 8)}...${address.slice(-6)}`;
    }
    return address;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl brutalist-card border-3 border-black shadow-[8px_8px_0px_0px_rgba(26,115,232,1)] bg-white max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-[#0A0A0A] uppercase tracking-wide">
            Custody History
          </DialogTitle>
          <p className="text-[#0B2A4A] font-bold text-sm mt-2">
            Vault: <span className="text-[#1A73E8]">{vaultName}</span>
          </p>
        </DialogHeader>

        <div className="mt-6 space-y-4">
          {custodyTrail.length === 0 ? (
            <div className="text-center p-8 brutalist-card bg-[#E3F2FD]">
              <p className="text-[#0B2A4A] font-bold">No custody transfers yet</p>
            </div>
          ) : (
            custodyTrail.map((record, index) => {
              const isLatest = index === custodyTrail.length - 1;
              
              return (
                <div
                  key={index}
                  className={`brutalist-card p-5 ${
                    isLatest ? "bg-[#4FC3F7]" : "bg-white"
                  } border-3 border-black shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] rounded-2xl`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`w-12 h-12 flex items-center justify-center border-3 border-black rounded-2xl ${
                        isLatest ? "bg-[#1A73E8]" : "bg-[#E3F2FD]"
                      }`}
                    >
                      <User className={`w-6 h-6 ${isLatest ? "text-white" : "text-[#0A0A0A]"}`} strokeWidth={3} />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className={`text-xs font-black uppercase tracking-wide ${isLatest ? "text-[#0A0A0A]" : "text-[#0B2A4A]"}`}>
                            {isLatest ? "Current Owner" : `Transfer #${index + 1}`}
                          </p>
                          <p className={`text-sm font-bold mt-1 ${isLatest ? "text-[#0A0A0A]" : "text-[#0B2A4A]"}`}>
                            {record.transferred_at}
                          </p>
                        </div>
                      </div>

                      {/* Custodian Address */}
                      <div className="mb-3">
                        <p className="text-xs font-black uppercase text-[#0A0A0A] mb-1">Custodian:</p>
                        <div className="flex items-center gap-2">
                          <code className={`text-sm font-mono font-bold ${isLatest ? "text-[#0A0A0A]" : "text-[#0B2A4A]"}`}>
                            {formatAddress(record.custodian)}
                          </code>
                          <button
                            onClick={() => copyToClipboard(record.custodian, index * 2)}
                            className="p-1.5 hover:bg-[#E3F2FD] border-2 border-black rounded-lg transition-colors"
                            title="Copy address"
                          >
                            <Copy className="w-4 h-4 text-[#0A0A0A]" />
                          </button>
                        </div>
                        {copiedIndex === index * 2 && (
                          <p className="text-xs text-[#1A73E8] font-bold mt-1">✓ Copied!</p>
                        )}
                      </div>

                      {/* Transaction Digest */}
                      {record.transaction_digest && (
                        <div>
                          <p className="text-xs font-black uppercase text-[#0A0A0A] mb-1">Transaction:</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <code className={`text-sm font-mono font-bold ${isLatest ? "text-[#0A0A0A]" : "text-[#0B2A4A]"}`}>
                              {formatAddress(record.transaction_digest)}
                            </code>
                            <button
                              onClick={() => copyToClipboard(record.transaction_digest, index * 2 + 1)}
                              className="p-1.5 hover:bg-[#E3F2FD] border-2 border-black rounded-lg transition-colors"
                              title="Copy transaction digest"
                            >
                              <Copy className="w-4 h-4 text-[#0A0A0A]" />
                            </button>
                            <a
                              href={`https://testnet.suivision.xyz/txblock/${record.transaction_digest}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 hover:bg-[#E3F2FD] border-2 border-black rounded-lg transition-colors inline-flex items-center gap-1"
                              title="View on SuiVision"
                            >
                              <ExternalLink className="w-4 h-4 text-[#0A0A0A]" />
                            </a>
                          </div>
                          {copiedIndex === index * 2 + 1 && (
                            <p className="text-xs text-[#1A73E8] font-bold mt-1">✓ Copied!</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Connector line to next item */}
                  {index < custodyTrail.length - 1 && (
                    <div className="ml-6 mt-4 mb-0 h-4 w-0.5 bg-[#0A0A0A]"></div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="brutalist-btn bg-[#1A73E8] text-white px-6 py-2 font-black uppercase"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
