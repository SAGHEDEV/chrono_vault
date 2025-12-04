"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Download, User, XCircle, Loader2, Clock, Lock, Unlock } from "lucide-react";
import { FaFilePdf } from "react-icons/fa";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { useCheckVaultAccess } from "@/hooks/useSealDecrypt";
import { useDecryptFile } from "@/hooks/useDecryptFile";
import ConnectWalletModal from "@/components/miscellaneous/ConnectWalletModal";

interface VaultFile {
  id: string;
  name: string;
  size: string;
  sealId: string;
  blobId: string;
}

interface VaultInfo {
  id: string;
  title: string;
  description: string;
  owner: string;
  unlockTime: number;
  createdAt: number;
  files: VaultFile[];
  authorizedAddresses: string[];
}

export default function FileViewPage() {
  const params = useParams();
  const vaultId = params.id as string;
  const currentAccount = useCurrentAccount();
  const client = useSuiClient();

  const [openConnectWallet, setOpenConnectWallet] = useState(currentAccount ? false : true)
  const [vaultInfo, setVaultInfo] = useState<VaultInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Use the hooks
  const {
    mutateAsync: checkAccess,
    data: accessData,
    isPending: isCheckingAccess
  } = useCheckVaultAccess();

  const {
    mutateAsync: decryptFile,
    isPending: isDecrypting
  } = useDecryptFile();

  // Fetch vault information
  useEffect(() => {
    async function fetchVaultInfo() {
      if (!vaultId || !client) return;

      try {
        setIsLoading(true);
        console.log("seen 0")
        // Fetch vault object from blockchain
        const vaultObject = await client.getObject({
          id: vaultId,
          options: {
            showContent: true,
            showOwner: true,
          },
        });
        console.log("seen 1")

        if (!vaultObject.data?.content || vaultObject.data.content.dataType !== "moveObject") {
          throw new Error("Vault not found");
        }

        const fields = vaultObject.data.content.fields as any;
        console.log("seen 2 ", fields)

        // Decode bytes to strings
        const decodeBytes = (bytes: number[]) => {
          if (!bytes || bytes.length === 0) return "";
          return new TextDecoder().decode(new Uint8Array(bytes));
        };

        const title = decodeBytes(fields.vault_name);
        const description = decodeBytes(fields.description);
        const sealIds = (fields.seal_ids || []).map((bytes: number[]) => decodeBytes(bytes));
        const blobIds = (fields.blob_ids || []).map((bytes: number[]) => decodeBytes(bytes));

        const vault: VaultInfo = {
          id: vaultId,
          title,
          description,
          owner: fields.owner,
          unlockTime: parseInt(fields.unlock_time || "0"),
          createdAt: parseInt(fields.created_at || "0"),
          authorizedAddresses: fields.authorized_addresses || [],
          files: sealIds.map((sealId: any, index: any) => ({
            id: sealId,
            name: `File_${index + 1}.pdf`,
            size: "Unknown",
            sealId,
            blobId: blobIds[index],
          })),
        };

        setVaultInfo(vault);

        // Check access after vault info is loaded
        if (currentAccount) {
          await checkAccess({ vaultId });
        }

      } catch (err: any) {
        console.error("Failed to fetch vault:", err);
        setError(err.message || "Failed to load vault");
      } finally {
        setIsLoading(false);
      }
    }

    fetchVaultInfo();
  }, [vaultId, client, currentAccount, checkAccess]);

  // Handle file download with decryption
  const handleDownload = async (file: VaultFile) => {
    if (!currentAccount || !vaultInfo) return;

    try {
      setDownloadingId(file.id);

      // Use the hook to decrypt the file
      const decryptedBlob = await decryptFile({
        sealId: file.sealId,
        blobId: file.blobId,
        vaultId: vaultInfo.id,
      });

      console.log("💾 Downloading decrypted file...");

      // Download the decrypted file
      const url = window.URL.createObjectURL(decryptedBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      console.log("✅ Download complete!");
    } catch (err: any) {
      console.error("Download failed:", err);
      alert(err.message || "Failed to download file");
    } finally {
      setDownloadingId(null);
    }
  };

  console.log(isLoading, isCheckingAccess)

  // Loading state
  if (isLoading || isCheckingAccess) {
    return (
      <main className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-gray-900 mx-auto mb-4" />
          <p className="text-gray-600">Loading vault...</p>
        </div>
      </main>
    );
  }

  // Error state
  if (error || !vaultInfo) {
    return (
      <main className="h-full flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Vault Not Found</h2>
          <p className="text-gray-600">{error || "This vault does not exist or has been deleted."}</p>
        </div>
      </main>
    );
  }

  // Determine access status
  const canAccess = accessData?.canAccess ?? false;
  const isTimeLocked = accessData?.isTimeLocked ?? false;
  const isAuthorized = accessData?.isAuthorized ?? false;

  // Calculate time remaining
  const timeRemaining = accessData?.timeRemaining || 0;
  const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));

  // Overlay content based on access status
  const overlayContent = (() => {
    if (isTimeLocked) {
      return {
        icon: <Lock className="w-12 h-12 mx-auto text-yellow-500" />,
        title: `"${vaultInfo.title}" is Time-Locked`,
        desc: vaultInfo.unlockTime > 0
          ? `This vault will unlock on ${new Date(vaultInfo.unlockTime).toLocaleString()}`
          : "This vault is currently locked",
        extra: daysRemaining > 0 ? `${daysRemaining} days remaining` : "Unlocking soon",
      };
    }

    if (!isAuthorized) {
      return {
        icon: <XCircle className="w-12 h-12 mx-auto text-red-500" />,
        title: `Access Denied to "${vaultInfo.title}"`,
        desc: currentAccount
          ? "You are not authorized to access this vault. Contact the owner to request permission."
          : "Please connect your wallet to access this vault.",
      };
    }

    return null;
  })();

  return (
    <main className="h-full flex items-center justify-center p-6 relative py-20">
      {/* ===== Vault Content ===== */}
      <div className="w-full max-w-3xl bg-white border border-gray-200 rounded-2xl shadow-md p-8 space-y-8">

        {/* Access Status Badge */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {canAccess ? (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
                  <Unlock className="w-4 h-4" />
                  <span>Access Granted</span>
                </div>
              ) : isTimeLocked ? (
                <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full text-sm font-medium">
                  <Clock className="w-4 h-4" />
                  <span>Time-Locked</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm font-medium">
                  <Lock className="w-4 h-4" />
                  <span>Access Denied</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Vault Header */}
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold text-gray-900 break-words">
            {vaultInfo.title}
          </h1>
          <p className="text-gray-700 text-lg whitespace-pre-wrap">
            {vaultInfo.description}
          </p>
        </div>

        {/* Vault Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Owner */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500 mb-2">Owner</p>
            <p className="font-medium flex items-center gap-2 text-gray-900">
              <User className="w-4 h-4" />
              <span className="font-mono text-sm truncate">
                {vaultInfo.owner.slice(0, 6)}...{vaultInfo.owner.slice(-4)}
              </span>
            </p>
          </div>

          {/* Created Date */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500 mb-2">Created</p>
            <p className="font-medium flex items-center gap-2 text-gray-900">
              <Clock className="w-4 h-4" />
              <span>{new Date(vaultInfo.createdAt).toLocaleDateString()}</span>
            </p>
          </div>

          {/* Unlock Time (if applicable) */}
          {vaultInfo.unlockTime > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-500 mb-2">Unlocks On</p>
              <p className="font-medium flex items-center gap-2 text-gray-900">
                <Lock className="w-4 h-4" />
                <span className="text-sm">
                  {new Date(vaultInfo.unlockTime).toLocaleString()}
                </span>
              </p>
            </div>
          )}

          {/* File Count */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500 mb-2">Files</p>
            <p className="font-medium flex items-center gap-2 text-gray-900">
              <FaFilePdf className="w-4 h-4" />
              <span>
                {vaultInfo.files.length}{" "}
                {vaultInfo.files.length === 1 ? "file" : "files"}
              </span>
            </p>
          </div>
        </div>

        {/* ===== File List ===== */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Files in this Vault</h2>
          {vaultInfo.files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <FaFilePdf size={40} className="text-red-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">{file.name}</h3>
                  <p className="text-sm text-gray-600">{file.size}</p>
                  {!canAccess && (
                    <p className="text-xs text-gray-500 mt-1">
                      🔒 Encrypted on Walrus
                    </p>
                  )}
                </div>
              </div>

              {canAccess && (
                <button
                  onClick={() => handleDownload(file)}
                  disabled={downloadingId === file.id}
                  className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {downloadingId === file.id ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Decrypting...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>Download</span>
                    </>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Authorized Addresses (if applicable) */}
        {vaultInfo.authorizedAddresses.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 mb-2">
              🔐 Access Restricted to {vaultInfo.authorizedAddresses.length}{" "}
              {vaultInfo.authorizedAddresses.length === 1 ? "address" : "addresses"}
            </p>
            <div className="space-y-1">
              {vaultInfo.authorizedAddresses.slice(0, 3).map((addr, i) => (
                <p key={i} className="text-xs font-mono text-blue-700">
                  {addr.slice(0, 10)}...{addr.slice(-8)}
                </p>
              ))}
              {vaultInfo.authorizedAddresses.length > 3 && (
                <p className="text-xs text-blue-600">
                  + {vaultInfo.authorizedAddresses.length - 3} more
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ===== Overlay when access is denied or locked ===== */}
      {overlayContent && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8 text-center space-y-4 border border-gray-200">
            {overlayContent.icon}
            <h2 className="text-2xl font-bold text-gray-900">
              {overlayContent.title}
            </h2>
            <p className="text-gray-600">{overlayContent.desc}</p>

            {overlayContent.extra && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-700">
                  {overlayContent.extra}
                </p>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-gray-700 text-sm mt-6 pt-6 border-t">
              <User className="w-4 h-4" />
              <span className="text-xs">Owner:</span>
              <span className="font-mono text-xs">
                {vaultInfo.owner.slice(0, 6)}...{vaultInfo.owner.slice(-4)}
              </span>
            </div>

            {!currentAccount && (
              <button
                onClick={() => {
                  setOpenConnectWallet(true)
                }}
                className="mt-4 w-full bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Connect Wallet to Access
              </button>
            )}
          </div>
        </div>
      )}
      {openConnectWallet && <ConnectWalletModal open={openConnectWallet} setOpen={setOpenConnectWallet} />}
    </main>
  );
}