import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { FaRegCopy } from "react-icons/fa";

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
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogTitle className="w-0 h-0" />
                    <div className="w-full flex flex-col items-center justify-center gap-4">
                        <div>
                            <h3 className="text-3xl font-bold text-center">
                                Share Vault File!
                            </h3>
                            <p className="text-sm text-gray-600 text-center mt-1">
                                You can share this link to others to access your file when it is
                                ripe for view.
                            </p>
                        </div>
                        <div className="max-w-[400px] p-2 rounded-lg bg-gray-200 flex items-center gap-4">
                            <div className="w-full truncate">{`${url}/view/${id}`}</div>
                            <div
                                className="w-full max-w-fit p-2 hover:bg-gray-50 cursor-pointer rounded-full transition active:scale-95 flex items-center gap-2"
                                onClick={handleCopy}
                            >
                                <FaRegCopy />
                                <span className="text-xs">
                                    {copied ? "Copied!" : "Copy"}
                                </span>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default ShareLinkModal;