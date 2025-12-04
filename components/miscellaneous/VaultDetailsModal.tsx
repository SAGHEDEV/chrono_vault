import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Lock,
    Unlock,
    Calendar,
    Clock,
    File,
    Shield,
    Users,
    Copy,
    Check,
    Download,
    ExternalLink,
    Info,
    Database,
    Key,
} from "lucide-react";
import { VaultType } from "@/types/index.t";
import DownloadFileButton from './DownloadFileButton';

interface VaultDetailsModalProps {
    open: boolean;
    onClose: () => void;
    vault: VaultType | null;
}

const VaultDetailsModal: React.FC<VaultDetailsModalProps> = ({
    open,
    onClose,
    vault,
}) => {
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'files' | 'access' | 'technical'>('files');

    if (!vault) return null;

    // Copy to clipboard handler
    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    // Format date
    const formatDate = (dateString: string) => {
        if (dateString === "N/A") return "No time lock";
        try {
            return new Date(dateString).toLocaleString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return dateString;
        }
    };

    // Get file extension
    const getFileExtension = (fileName: string) => {
        const parts = fileName.split('.');
        return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : 'FILE';
    };

    // Format address for display
    const formatAddress = (address: string) => {
        if (!address) return 'N/A';
        return `${address.slice(0, 8)}...${address.slice(-6)}`;
    };

    // Calculate time until unlock
    const getTimeUntilUnlock = () => {
        if (vault.unlockDate === "N/A" || vault.status === "unlocked") {
            return null;
        }

        const now = Date.now();
        const unlockTime = Date.parse(vault.unlockDate);
        const diff = unlockTime - now;

        if (diff <= 0) return "Unlocked";

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const timeUntilUnlock = getTimeUntilUnlock();

    // Render Files Section
    const renderFilesSection = () => {
        const isLocked = vault.status === "locked";

        return (
            <div className="space-y-4">
                <div className="brutalist-border rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(10,10,10,1)]">
                    <div className="bg-[#1A73E8] px-4 py-3 border-b-4 border-black">
                        <h3 className="font-black text-white uppercase flex items-center gap-2 tracking-wide">
                            <File className="w-5 h-5" />
                            Files in Vault
                        </h3>
                    </div>
                    <div className={`divide-y-4 divide-black max-h-96 overflow-y-auto bg-white relative ${isLocked ? 'blur-sm cursor-not-allowed select-none' : ''}`}>
                        {vault.files.map((file, index) => (
                            <div
                                key={file.id || index}
                                className={`p-4 transition-colors ${isLocked ? 'pointer-events-none' : 'hover:bg-[#E3F2FD]'}`}
                            >
                                <div className="flex items-start gap-4 flex-wrap">
                                    <div className='flex items-start gap-4'>
                                        {/* File Icon */}
                                        <div className="w-12 h-12 bg-[#E3F2FD] rounded-2xl brutalist-border flex items-center justify-center flex-shrink-0">
                                            <File className="w-6 h-6 text-[#1A73E8]" />
                                        </div>

                                        {/* File Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="w-full max-w-[210px] font-black text-[#0A0A0A] truncate uppercase">
                                                    {file.name}
                                                </h4>
                                                <Badge variant="outline" className="text-xs font-black brutalist-border rounded-full bg-[#4FC3F7] text-black">
                                                    {getFileExtension(file.name)}
                                                </Badge>
                                            </div>

                                            {/* Seal ID */}
                                            <div className="flex items-center gap-2 mt-2">
                                                <Shield className="w-3 h-3 text-gray-600" />
                                                <span className="text-xs font-bold text-gray-600 uppercase">Seal ID:</span>
                                                <code className="text-xs font-mono font-bold text-[#0A0A0A] truncate">
                                                    {file.sealId.slice(0, 16)}...
                                                </code>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleCopy(file.sealId, `seal-${index}`)}
                                                    className="h-6 w-6 p-0 rounded-full cursor-pointer"
                                                    disabled={isLocked}
                                                >
                                                    {copiedField === `seal-${index}` ? (
                                                        <Check className="w-3 h-3 text-[#4FC3F7]" />
                                                    ) : (
                                                        <Copy className="w-3 h-3" />
                                                    )}
                                                </Button>
                                            </div>

                                            {/* Blob ID */}
                                            <div className="flex items-center gap-2 mt-1">
                                                <Database className="w-3 h-3 text-gray-600" />
                                                <span className="text-xs font-bold text-gray-600 uppercase">Blob ID:</span>
                                                <code className="text-xs font-mono font-bold text-[#0A0A0A] truncate">
                                                    {file.blobId.slice(0, 16)}...
                                                </code>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleCopy(file.blobId, `blob-${index}`)}
                                                    className="h-6 w-6 p-0 rounded-full cursor-pointer"
                                                    disabled={isLocked}
                                                >
                                                    {copiedField === `blob-${index}` ? (
                                                        <Check className="w-3 h-3 text-[#4FC3F7]" />
                                                    ) : (
                                                        <Copy className="w-3 h-3" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Download Button */}
                                    {vault.status === "unlocked" && (
                                        <DownloadFileButton
                                            sealId={file.sealId}
                                            vaultId={file.id}
                                            quiltId={file.blobId}
                                            identifier={file.name}
                                        />
                                    )}
                                </div>
                            </div>
                        ))}

                        {vault.files.length === 0 && (
                            <div className="p-8 text-center text-gray-500">
                                <File className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p className="text-sm font-bold uppercase">No files in this vault</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Render Access Control Section
    const renderAccessControlSection = () => (
        <div className="space-y-4">
            {/* Owner */}
            <div className="brutalist-border rounded-2xl p-4 bg-[#E3F2FD] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)]">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-[#1A73E8] rounded-full brutalist-border flex items-center justify-center">
                        <Key className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="font-black text-[#0A0A0A] uppercase">Vault Owner</h3>
                        <p className="text-xs font-bold text-gray-700">Full access and control</p>
                    </div>
                </div>
                <div className="flex items-center justify-between bg-white rounded-2xl brutalist-border px-4 py-3">
                    <code className="text-sm font-mono font-bold text-[#0A0A0A]">
                        {formatAddress(vault?.owner as string)}
                    </code>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(vault?.owner as string, 'owner')}
                        className="rounded-full cursor-pointer"
                    >
                        {copiedField === 'owner' ? (
                            <Check className="w-4 h-4 text-[#4FC3F7]" />
                        ) : (
                            <Copy className="w-4 h-4" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Time Lock */}
            <div className="brutalist-border rounded-2xl p-4 bg-white shadow-[4px_4px_0px_0px_rgba(10,10,10,1)]">
                <div className="flex items-center gap-3 mb-3">
                    <Clock className="w-5 h-5 text-[#1A73E8]" />
                    <h3 className="font-black text-[#0A0A0A] uppercase">Time Lock</h3>
                </div>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="font-bold text-gray-600 uppercase text-xs">Status:</span>
                        <span className="font-black text-[#0A0A0A]">
                            {vault.unlockDate === "N/A" ? "No time lock" : "Time-locked"}
                        </span>
                    </div>
                    {vault.unlockDate !== "N/A" && (
                        <>
                            <div className="flex justify-between">
                                <span className="font-bold text-gray-600 uppercase text-xs">Unlock Date:</span>
                                <span className="font-black text-[#0A0A0A]">
                                    {vault.unlockDate}
                                </span>
                            </div>
                            {timeUntilUnlock && (
                                <div className="flex justify-between">
                                    <span className="font-bold text-gray-600 uppercase text-xs">Time Remaining:</span>
                                    <span className="font-black text-[#1A73E8]">
                                        {timeUntilUnlock}
                                    </span>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Authorized Addresses */}
            <div className="brutalist-border rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(10,10,10,1)]">
                <div className="bg-[#1A73E8] px-4 py-3 border-b-4 border-black">
                    <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-white" />
                        <h3 className="font-black text-white uppercase tracking-wide">
                            Authorized Addresses ({vault.authorizedAddresses?.length || 0})
                        </h3>
                    </div>
                </div>
                <div className="divide-y-4 divide-black max-h-64 overflow-y-auto bg-white">
                    {vault.authorizedAddresses && vault.authorizedAddresses.length > 0 ? (
                        vault.authorizedAddresses.map((address, index) => (
                            <div
                                key={index}
                                className="px-4 py-3 flex items-center justify-between hover:bg-[#E3F2FD]"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-[#4FC3F7] rounded-full brutalist-border flex items-center justify-center">
                                        <span className="text-xs font-black text-black">
                                            {index + 1}
                                        </span>
                                    </div>
                                    <code className="text-sm font-mono font-bold text-[#0A0A0A]">
                                        {formatAddress(address)}
                                    </code>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopy(address, `auth-${index}`)}
                                    className="rounded-full cursor-pointer"
                                >
                                    {copiedField === `auth-${index}` ? (
                                        <Check className="w-4 h-4 text-[#4FC3F7]" />
                                    ) : (
                                        <Copy className="w-4 h-4" />
                                    )}
                                </Button>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p className="text-sm font-bold uppercase">No authorized addresses</p>
                            <p className="text-xs mt-1 font-bold">Anyone can access after time lock</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Access Info */}
            <div className="bg-[#E3F2FD] brutalist-border rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(10,10,10,1)]">
                <div className="flex gap-3">
                    <Info className="w-5 h-5 text-[#1A73E8] flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-black mb-1 text-[#0A0A0A] uppercase">Access Control Policy</p>
                        <p className="font-bold text-[#0B2A4A]">
                            {vault.authorizedAddresses && vault.authorizedAddresses.length > 0
                                ? "Only the owner and authorized addresses can access this vault."
                                : vault.unlockDate !== "N/A"
                                    ? "Anyone can access after the time lock expires."
                                    : "This vault has no access restrictions."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    // Render Technical Section
    const renderTechnicalSection = () => (
        <div className="space-y-4">
            {/* Vault ID */}
            <div className="brutalist-border rounded-2xl p-4 bg-white shadow-[4px_4px_0px_0px_rgba(10,10,10,1)]">
                <h3 className="font-black text-[#0A0A0A] uppercase mb-3 flex items-center gap-2">
                    <Database className="w-5 h-5 text-[#1A73E8]" />
                    Vault Information
                </h3>
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-black text-gray-600 uppercase mb-1 block">Vault ID</label>
                        <div className="w-full flex items-center gap-2 bg-[#E3F2FD] rounded-2xl brutalist-border px-3 py-2">
                            <code className="text-sm font-mono font-bold text-[#0A0A0A] flex-1 truncate max-w-[260px]">
                                {vault.id}
                            </code>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(vault.id, 'vaultId')}
                                className="rounded-full cursor-pointer"
                            >
                                {copiedField === 'vaultId' ? (
                                    <Check className="w-4 h-4 text-[#4FC3F7]" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(`https://suiscan.xyz/testnet/object/${vault.id}`, '_blank')}
                                className="rounded-full cursor-pointer"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-black text-gray-600 uppercase mb-1 block">Created</label>
                            <div className="bg-[#E3F2FD] rounded-2xl brutalist-border px-3 py-2">
                                <p className="text-sm font-black text-[#0A0A0A]">
                                    {vault.uploadDate}
                                </p>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-black text-gray-600 uppercase mb-1 block">Status</label>
                            <div className="bg-[#E3F2FD] rounded-2xl brutalist-border px-3 py-2">
                                <Badge
                                    variant={vault.status === "locked" ? "destructive" : "default"}
                                    className={`${vault.status === "unlocked" ? "bg-[#4FC3F7] text-black" : "bg-[#1A73E8] text-white"} font-black uppercase rounded-full`}
                                >
                                    {vault.status}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Encryption Details */}
            <div className="brutalist-border rounded-2xl p-4 bg-white shadow-[4px_4px_0px_0px_rgba(10,10,10,1)]">
                <h3 className="font-black text-[#0A0A0A] uppercase mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#1A73E8]" />
                    Encryption Details
                </h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b-2 border-black">
                        <span className="font-bold text-gray-600 uppercase text-xs">Encryption Type:</span>
                        <span className="font-black text-[#0A0A0A]">Seal (Threshold)</span>
                    </div>
                    <div className="flex justify-between py-2 border-b-2 border-black">
                        <span className="font-bold text-gray-600 uppercase text-xs">Storage:</span>
                        <span className="font-black text-[#0A0A0A]">Walrus Decentralized</span>
                    </div>
                    <div className="flex justify-between py-2 border-b-2 border-black">
                        <span className="font-bold text-gray-600 uppercase text-xs">Encrypted Files:</span>
                        <span className="font-black text-[#0A0A0A]">{vault.files.length}</span>
                    </div>
                    <div className="flex justify-between py-2">
                        <span className="font-bold text-gray-600 uppercase text-xs">Access Control:</span>
                        <span className="font-black text-[#0A0A0A]">On-Chain (Sui)</span>
                    </div>
                </div>
            </div>

            {/* Security Notice */}
            <div className="bg-[#E3F2FD] brutalist-border rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(10,10,10,1)]">
                <div className="flex gap-3">
                    <Shield className="w-5 h-5 text-[#1A73E8] flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-black mb-1 text-[#0A0A0A] uppercase">Security Guarantee</p>
                        <ul className="font-bold text-[#0B2A4A] space-y-1 list-disc list-inside">
                            <li>Files encrypted before upload</li>
                            <li>Threshold encryption with multiple key servers</li>
                            <li>Immutable on-chain access control</li>
                            <li>Decentralized storage on Walrus</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-full lg:max-w-[1200px] w-[90vw] max-h-[90vh] overflow-y-auto py-10 brutalist-border rounded-2xl">
                <DialogHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <DialogTitle className="text-2xl font-black uppercase flex items-center gap-3 text-[#0A0A0A]">
                                <div
                                    className={`w-12 h-12 rounded-2xl brutalist-border flex items-center justify-center ${vault.status === "locked" ? "bg-[#1A73E8]" : "bg-[#4FC3F7]"
                                        }`}
                                >
                                    {vault.status === "locked" ? (
                                        <Lock className="w-6 h-6 text-white" />
                                    ) : (
                                        <Unlock className="w-6 h-6 text-black" />
                                    )}
                                </div>
                                {vault.title}
                            </DialogTitle>
                            <DialogDescription className="mt-2 text-sm font-bold text-gray-700">
                                {vault.description}
                            </DialogDescription>
                        </div>
                        <Badge
                            variant={vault.status === "locked" ? "destructive" : "default"}
                            className={`${vault.status === "unlocked" ? "bg-[#4FC3F7] text-black" : "bg-[#1A73E8] text-white"
                                } text-xs px-3 py-1 font-black uppercase brutalist-border rounded-full shadow-[4px_4px_0px_0px_rgba(10,10,10,1)]`}
                        >
                            {vault.status}
                        </Badge>
                    </div>
                </DialogHeader>

                {/* Quick Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y-4 border-black">
                    <div className="text-center">
                        <File className="w-5 h-5 mx-auto mb-1 text-[#1A73E8]" />
                        <p className="text-2xl font-black text-[#0A0A0A]">{vault.files.length}</p>
                        <p className="text-xs font-bold text-gray-600 uppercase">Files</p>
                    </div>
                    <div className="text-center">
                        <Calendar className="w-5 h-5 mx-auto mb-1 text-[#1A73E8]" />
                        <p className="text-sm font-black text-[#0A0A0A]">
                            {vault.uploadDate}
                        </p>
                        <p className="text-xs font-bold text-gray-600 uppercase">Created</p>
                    </div>
                    <div className="text-center">
                        <Clock className="w-5 h-5 mx-auto mb-1 text-[#1A73E8]" />
                        <p className="text-sm font-black text-[#0A0A0A]">
                            {vault.unlockDate === "N/A" ? "No lock" : vault.unlockDate}
                        </p>
                        <p className="text-xs font-bold text-gray-600 uppercase">Unlocks</p>
                    </div>
                    <div className="text-center">
                        <Users className="w-5 h-5 mx-auto mb-1 text-[#1A73E8]" />
                        <p className="text-2xl font-black text-[#0A0A0A]">
                            {vault.authorizedAddresses?.length || 0}
                        </p>
                        <p className="text-xs font-bold text-gray-600 uppercase">Authorized</p>
                    </div>
                </div>

                {/* Time Until Unlock (for locked vaults) */}
                {vault.status === "locked" && timeUntilUnlock && (
                    <div className="bg-[#E3F2FD] brutalist-border p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(10,10,10,1)]">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-[#1A73E8] rounded-full brutalist-border flex items-center justify-center">
                                <Clock className="w-6 h-6 text-white animate-pulse" />
                            </div>
                            <div>
                                <p className="font-black text-[#0A0A0A] uppercase">Locked Vault</p>
                                <p className="text-sm font-bold text-[#0B2A4A]">
                                    Unlocks in <span className="font-black text-[#1A73E8]">{timeUntilUnlock}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabs - Mobile/Tablet Only */}
                <div className="mt-4 lg:hidden">
                    <div className="flex border-b-4 border-black gap-2">
                        <button
                            onClick={() => setActiveTab('files')}
                            className={`px-4 py-3 font-black text-sm uppercase tracking-wide transition-all cursor-pointer rounded-t-2xl ${activeTab === 'files'
                                ? 'bg-[#1A73E8] text-white brutalist-border border-b-0'
                                : 'bg-white text-[#0A0A0A] hover:bg-[#E3F2FD] brutalist-border border-b-0'
                                }`}
                        >
                            Files ({vault.files.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('access')}
                            className={`px-4 py-3 font-black text-sm uppercase tracking-wide transition-all cursor-pointer rounded-t-2xl ${activeTab === 'access'
                                ? 'bg-[#1A73E8] text-white brutalist-border border-b-0'
                                : 'bg-white text-[#0A0A0A] hover:bg-[#E3F2FD] brutalist-border border-b-0'
                                }`}
                        >
                            Access Control
                        </button>
                        <button
                            onClick={() => setActiveTab('technical')}
                            className={`px-4 py-3 font-black text-sm uppercase tracking-wide transition-all cursor-pointer rounded-t-2xl ${activeTab === 'technical'
                                ? 'bg-[#1A73E8] text-white brutalist-border border-b-0'
                                : 'bg-white text-[#0A0A0A] hover:bg-[#E3F2FD] brutalist-border border-b-0'
                                }`}
                        >
                            Technical
                        </button>
                    </div>

                    {/* Mobile/Tablet Tab Content */}
                    <div className="mt-4">
                        {activeTab === 'files' && renderFilesSection()}
                        {activeTab === 'access' && renderAccessControlSection()}
                        {activeTab === 'technical' && renderTechnicalSection()}
                    </div>
                </div>

                {/* Desktop: Side by Side Layout */}
                <div className="hidden lg:grid lg:grid-cols-3 lg:gap-4 mt-4">
                    {renderFilesSection()}
                    {renderAccessControlSection()}
                    {renderTechnicalSection()}
                </div>

                {/* Footer Actions */}
                <div className="flex gap-3 pt-4 border-t-4 border-black">
                    <Button variant="outline" onClick={onClose} className="flex-1 brutalist-btn rounded-2xl cursor-pointer">
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default VaultDetailsModal;