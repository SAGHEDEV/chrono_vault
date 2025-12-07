import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { FaRegCopy } from "react-icons/fa";
import { Check } from "lucide-react";

function ShareLinkModal({
    open,
    setOpen,
    id,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
    id: string;
}) {
    const [copied, setCopied] = useState(false);
    const [url, setUrl] = useState("");

    useEffect(() => {
        if (typeof window !== "undefined") {
            setUrl(window.location.host);
        }
    }, []);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(`${url}/view/${id}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 10000);
        } catch (err) {
            // Optionally handle error
        }
    };

    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl brutalist-border shadow-[8px_8px_0px_0px_rgba(10,10,10,1)]">
                    <DialogTitle className="w-0 h-0" />
                    <div className="w-full flex flex-col items-center justify-center gap-6">
                        {/* Header */}
                        <div className="w-full">
                            <h3 className="text-3xl font-black text-center uppercase text-[#0A0A0A] tracking-tight">
                                Share Vault File!
                            </h3>
                            <p className="text-sm font-bold text-gray-700 text-center mt-2">
                                Share this link with others to access your file when it's ready for viewing.
                            </p>
                        </div>

                        {/* Link Container */}
                        <div className="w-full max-w-[400px] p-4 rounded-2xl bg-[#E3F2FD] brutalist-border shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] flex items-center gap-3">
                            <div className="flex-1 truncate font-mono text-sm font-bold text-[#0A0A0A]">
                                {`${url}/view/${id}`}
                            </div>
                            <button
                                className={`px-4 py-2 rounded-2xl brutalist-border font-black text-xs uppercase tracking-wide transition-all cursor-pointer flex items-center gap-2 ${copied
                                        ? "bg-[#4FC3F7] text-black shadow-[2px_2px_0px_0px_rgba(10,10,10,1)]"
                                        : "bg-[#1A73E8] text-white hover:bg-[#0B2A4A] shadow-[3px_3px_0px_0px_rgba(10,10,10,1)] active:shadow-[1px_1px_0px_0px_rgba(10,10,10,1)] active:translate-x-[2px] active:translate-y-[2px]"
                                    }`}
                                onClick={handleCopy}
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        <span>Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <FaRegCopy className="w-4 h-4" />
                                        <span>Copy</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default ShareLinkModal;