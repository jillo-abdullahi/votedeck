import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlusIcon, Link as LinkIcon, ArrowLeft } from "lucide-react";
import { QrCodeIcon, type QrCodeIconHandle } from "../icons/QrCodeIcon";
import { ClipboardIcon, type ClipboardIconHandle } from "../icons/ClipboardIcon";
import { ModalHeader } from "@/components/ModalHeader";
import { CheckIcon, type CheckIconHandle } from "../icons/CheckIcon";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { QrCodeIcon as QrCodeIconLucide } from 'lucide-react'

interface InviteModalProps {
    isOpen: boolean;
    onClose: () => void;
    roomUrl: string;
}

export const InviteModal: React.FC<InviteModalProps> = ({
    isOpen,
    onClose,
    roomUrl,
}) => {
    const [copied, setCopied] = useState(false);
    const [showQr, setShowQr] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const qrCodeRef = useRef<QrCodeIconHandle>(null);
    const clipboardRef = useRef<ClipboardIconHandle>(null);
    const checkRef = useRef<CheckIconHandle>(null);

    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(roomUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            inputRef.current?.select();
        });
    };

    const handleClose = () => {
        setShowQr(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={handleClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-slate-900 rounded-3xl shadow-2xl border border-slate-800/50 p-8 animate-in zoom-in-95 duration-300 flex flex-col gap-6 overflow-hidden">
                {/* Header */}
                <ModalHeader
                    title={showQr ? "Scan QR Code" : "Invite players"}
                    subtitle={showQr ? "Point your camera to join instantly" : "Invite your friends to join the game"}
                    icon={showQr ? <QrCodeIconLucide className="w-12 h-12 text-blue-500" /> : <UserPlusIcon className="w-12 h-12 text-blue-500" />}
                    onClose={handleClose}
                />

                <div className="relative min-h-[200px]">
                    <AnimatePresence mode="wait">
                        {!showQr ? (
                            <motion.div
                                key="link-view"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                <div className="space-y-2 group">
                                    <div className="flex items-center justify-start gap-2 text-slate-400 mb-1">
                                        <LinkIcon size={14} className="text-blue-400" />
                                        <label className="text-sm font-bold uppercase tracking-wider text-slate-500">
                                            Game url
                                        </label>
                                    </div>

                                    <div className="relative">
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            readOnly
                                            value={roomUrl}
                                            autoFocus
                                            onFocus={(e) => e.currentTarget.select()}
                                            className="w-full bg-slate-800/50 border-2 border-blue-500/30 rounded-2xl py-4 px-4 text-lg text-blue-100 focus:outline-none focus:border-blue-500 transition-all shadow-inner font-mono"
                                            onClick={(e) => e.currentTarget.select()}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <Button
                                        variant="ghost"
                                        size="lg"
                                        className="group"
                                        onClick={() => setShowQr(true)}
                                        onMouseEnter={() => qrCodeRef.current?.startAnimation()}
                                        onMouseLeave={() => qrCodeRef.current?.stopAnimation()}
                                    >
                                        <QrCodeIcon className="w-6 h-6 mr-2 text-slate-400 group-hover:text-blue-400" ref={qrCodeRef} />
                                        QR Code
                                    </Button>
                                    <Button
                                        onClick={handleCopy}
                                        size="lg"
                                        variant={copied ? "success" : "default"}
                                        className="flex-1"
                                        onMouseEnter={() => {
                                            if (copied) checkRef.current?.startAnimation();
                                            else clipboardRef.current?.startAnimation();
                                        }}
                                        onMouseLeave={() => {
                                            if (copied) checkRef.current?.stopAnimation();
                                            else clipboardRef.current?.stopAnimation();
                                        }}
                                    >
                                        {copied ? (
                                            <>
                                                <CheckIcon className="w-5 h-5 mr-2" ref={checkRef} />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <ClipboardIcon className="w-5 h-5 mr-2" ref={clipboardRef} />
                                                Copy link
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="qr-view"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-col items-center gap-6"
                            >
                                <div className="p-6 bg-white rounded-3xl shadow-xl shadow-blue-500/10 border-4 border-blue-500/20 relative group">
                                    <QRCodeSVG
                                        value={roomUrl}
                                        size={200}
                                        level="H"
                                        includeMargin={false}
                                        fgColor="#0f172a" // slate-900
                                        imageSettings={{
                                            src: "/logo.png", // Assuming logo exists, or omit
                                            height: 40,
                                            width: 40,
                                            excavate: true,
                                        }}
                                    />
                                    <div className="absolute inset-0 border-2 border-blue-500/10 rounded-2xl pointer-events-none group-hover:border-blue-500/30 transition-colors" />
                                </div>

                                <Button
                                    variant="ghost"
                                    onClick={() => setShowQr(false)}
                                    className="text-slate-400 hover:text-white"
                                >
                                    <ArrowLeft size={16} className="mr-2" />
                                    Back to link
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
