import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { CheckIcon, ShieldCheck, InfoIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ModalHeader } from "@/components/ModalHeader";
import { DownloadIcon, type DownloadHandle } from "@/components/icons/DownloadIcon";
import { ClipboardIcon, type ClipboardIconHandle } from "@/components/icons/ClipboardIcon";

interface RecoveryCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    recoveryCode: string;
}

export const RecoveryCodeModal: React.FC<RecoveryCodeModalProps> = ({ isOpen, onClose, recoveryCode }) => {
    const [copied, setCopied] = React.useState(false);
    const downloadRef = useRef<DownloadHandle>(null);
    const clipboardRef = useRef<ClipboardIconHandle>(null);

    const handleCopy = () => {
        navigator.clipboard.writeText(recoveryCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative bg-slate-800 border-2 border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-8 pb-4">
                            <ModalHeader
                                title="Sign-in Key"
                                subtitle="Your sign in key to access saved rooms"
                                icon={<ShieldCheck className="w-10 h-10 text-green-500" />}
                                onClose={onClose}
                            />
                        </div>

                        <div className="px-8 pb-8 flex flex-col gap-6">
                            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col items-center gap-2">
                                <code className="text-3xl font-mono text-blue-400 font-semibold tracking-wider select-all text-center break-all">
                                    {recoveryCode}
                                </code>
                            </div>

                            <div className="flex gap-3 bg-blue-500/5 p-4 rounded-xl">
                                <div className="flex items-center justify-start border-r-1 border-slate-700 pr-3">
                                    <InfoIcon className="w-8 h-8 text-slate-400" />
                                </div>
                                <p className="text-slate-400 text-sm leading-relaxed text-left px-2">
                                    Save this key somewhere safe. If you sign out or switch devices, you'll need this key to sign back in.
                                    <br />
                                    <span className="text-blue-400 font-medium">VoteDeck can't see or recover this key.</span>
                                </p>

                            </div>


                            <div className="flex gap-3 mt-2">
                                <Button
                                    size={'lg'}
                                    className="flex-1"
                                    variant="ghost"
                                    onClick={handleCopy}
                                    onMouseEnter={() => clipboardRef.current?.startAnimation()}
                                    onMouseLeave={() => clipboardRef.current?.stopAnimation()}
                                >
                                    {copied ? <CheckIcon className="mr-2 h-4 w-4 text-green-400" /> : <ClipboardIcon ref={clipboardRef} className="mr-2 h-4 w-4" />}
                                    {copied ? "Copied!" : "Copy"}
                                </Button>
                                <Button
                                    size={'lg'}
                                    className="flex-2"
                                    onMouseEnter={() => downloadRef.current?.startAnimation()}
                                    onMouseLeave={() => downloadRef.current?.stopAnimation()}
                                    onClick={() => {
                                        const blob = new Blob([recoveryCode], { type: 'text/plain' });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = 'votedeck-key.txt';
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                        URL.revokeObjectURL(url);
                                    }}
                                >
                                    <DownloadIcon ref={downloadRef} className="mr-2 h-5 w-5" />
                                    Download Key
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div >
            )}
        </AnimatePresence >
    );
};
