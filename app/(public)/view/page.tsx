"use client";

import { useState } from "react";
import { Download, User, XCircle } from "lucide-react";
import { FaFilePdf } from "react-icons/fa";

interface VaultFile {
  id: string;
  name: string;
  size: string;
  uploadDate: string;
  downloadUrl: string;
}

export default function FileViewPage() {
  // 🏛 Dummy vault metadata
  const vaultTitle = "Next-Gen Storage Research Vault";
  const vaultDescription =
    "Preliminary findings and supporting documents for next-gen storage. Dummy data for demo.";
  const ownerWallet =
    "0xf5565117d38f036cea62b1717817a8539603dd5d72abad09599e292a51da270f";

  // 📂 Multiple dummy files
  const files: VaultFile[] = [
    {
      id: "1",
      name: "research-report.pdf",
      size: "2.4 MB",
      uploadDate: "23 Sept 2025, 14:35 UTC",
      downloadUrl:
        "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    },
    {
      id: "2",
      name: "appendix-data.xlsx",
      size: "1.1 MB",
      uploadDate: "23 Sept 2025, 14:36 UTC",
      downloadUrl:
        "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    },
  ];

  /**
   * status can be:
   *  - "sealed"   -> vault is time-locked
   *  - "noAccess" -> user doesn't have permission
   *  - "unlocked" -> free to view/download
   */
  const [status, setStatus] = useState<"sealed" | "noAccess" | "unlocked">(
    "unlocked"
  );
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (file: VaultFile) => {
    try {
      setDownloadingId(file.id);
      const res = await fetch(file.downloadUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setDownloadingId(null);
    }
  };

  // 🟡 Overlay message
  const overlayContent = (() => {
    switch (status) {
      case "sealed":
        return {
          title: `The vault "${vaultTitle}" is currently sealed!`,
          desc: "This vault is under a time-lock and cannot be accessed until the set unlock time.",
        };
      case "noAccess":
        return {
          title: `You don't have read access to "${vaultTitle}"`,
          desc: "The owner has restricted access. Contact the owner to request permission.",
        };
      default:
        return null;
    }
  })();

  return (
    <main className="h-full flex items-center justify-center p-6 relative">
      {/* ===== Vault Content ===== */}
      <div className="w-full max-w-3xl bg-white border border-gray-200 rounded-2xl shadow-md p-8 space-y-8">
        {/* Debug Buttons for demo */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setStatus("sealed")}
            className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded"
          >
            Sealed
          </button>
          <button
            onClick={() => setStatus("noAccess")}
            className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded"
          >
            No Access
          </button>
          <button
            onClick={() => setStatus("unlocked")}
            className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded"
          >
            Unlocked
          </button>
        </div>

        {/* Vault Header */}
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold text-gray-900 break-words">
            {vaultTitle}
          </h1>
          <p className="text-gray-700 text-lg whitespace-pre-wrap">
            {vaultDescription}
          </p>
        </div>

        {/* Owner */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">Owner</p>
          <p className="font-medium flex items-center gap-2 text-gray-900">
            <User className="w-4 h-4" />
            <span className="font-mono max-w-[500px] truncate">{ownerWallet}</span>
          </p>
        </div>

        {/* ===== File List ===== */}
        <div className="space-y-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <FaFilePdf size={40} className="text-red-500" />
                <div>
                  <h2 className="font-semibold text-gray-900">{file.name}</h2>
                  <p className="text-sm text-gray-600">
                    {file.size} • {file.uploadDate}
                  </p>
                </div>
              </div>

              {status === "unlocked" && (
                <button
                  onClick={() => handleDownload(file)}
                  disabled={downloadingId === file.id}
                  className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-70"
                >
                  {downloadingId === file.id ? "Downloading…" : <Download className="w-5 h-5" />}
                  {downloadingId === file.id ? "" : "Download"}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ===== Overlay / Modal when sealed or noAccess ===== */}
      {overlayContent && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-center space-y-4 border border-gray-200">
            <XCircle className="w-12 h-12 mx-auto text-gray-500" />
            <h2 className="text-xl font-bold text-gray-900">
              {overlayContent.title}
            </h2>
            <p className="text-gray-600">{overlayContent.desc}</p>

            <div className="flex items-center justify-center gap-2 text-gray-700 text-sm mt-4">
              <User className="w-4 h-4" />
              <span className="font-mono max-w-[250px] truncate">{ownerWallet}</span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
