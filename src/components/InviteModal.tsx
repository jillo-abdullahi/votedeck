import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlusIcon } from "lucide-react";
import { QrCodeIcon, type QrCodeIconHandle } from "./icons/QrCodeIcon";
import { ClipboardIcon, type ClipboardIconHandle } from "./icons/ClipboardIcon";
import { ModalHeader } from "@/components/ModalHeader";
import { CheckIcon, type CheckIconHandle } from "./icons/CheckIcon";


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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-8 animate-in zoom-in-95 duration-300 flex flex-col gap-6">
                {/* Header */}
                <ModalHeader
                    title="Invite players"
                    subtitle="Invite your friends to join the game"
                    icon={<UserPlusIcon className="w-12 h-12 text-blue-500" />}
                    onClose={onClose}
                />


                {/* Content */}
                <div className="space-y-6">

                    <div className="space-y-2 group">
                        <div className="flex items-center justify-start gap-2 text-slate-400 mb-1">
                            <label className="text-md font-medium text-slate-400 ml-1">
                                Game url
                            </label>

                        </div>

                        <div className="relative">
                            {/* Visual grouping border/animation could go here but standard input styling works well too */}
                            <input
                                ref={inputRef}
                                type="text"
                                readOnly
                                value={roomUrl}
                                className="w-full bg-slate-900/50 border-2 border-blue-500/50 rounded-xl py-4 px-4 text-lg text-blue-100 focus:outline-none focus:border-blue-400 transition-colors shadow-inner font-mono"
                                onClick={(e) => e.currentTarget.select()}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button
                            variant="ghost"
                            size={'lg'}
                            className="px-4"
                            onMouseEnter={() => qrCodeRef.current?.startAnimation()}
                            onMouseLeave={() => qrCodeRef.current?.stopAnimation()}
                        >
                            <QrCodeIcon className="w-10 h-10" ref={qrCodeRef} />
                        </Button>
                        <Button
                            onClick={handleCopy}
                            size="lg"
                            variant={copied ? "success" : "default"}
                            className="flex-1"
                            onMouseEnter={() => {
                                if (copied) {
                                    checkRef.current?.startAnimation();
                                } else {
                                    clipboardRef.current?.startAnimation();
                                }
                            }}
                            onMouseLeave={() => {
                                if (copied) {
                                    checkRef.current?.stopAnimation();
                                } else {
                                    clipboardRef.current?.stopAnimation();
                                }
                            }}
                        >
                            {copied ? (
                                <>
                                    <CheckIcon className="w-5 h-5" ref={checkRef} />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <ClipboardIcon className="w-5 h-5" ref={clipboardRef} />
                                    Copy invitation link
                                </>
                            )}
                        </Button>


                    </div>

                </div>
            </div>
        </div>
    );
};
