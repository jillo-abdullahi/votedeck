import React, { useState } from "react";
import { Button } from "@/components/ui/button";

import { motion, AnimatePresence } from "framer-motion";
import { ModalHeader } from "@/components/ModalHeader";
import { LogIn } from "lucide-react";
import { AiFillGoogleCircle } from "react-icons/ai";
import { signInWithPopup, signInAnonymously } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
    const [error, setError] = useState("");
    const [googleLoading, setGoogleLoading] = useState(false);
    const [guestLoading, setGuestLoading] = useState(false);

    const isLoading = googleLoading || guestLoading;

    const handleGoogleLogin = async () => {
        setError("");
        setGoogleLoading(true);

        try {
            await signInWithPopup(auth, googleProvider);
            onClose();
            // Auth listener will handle state update
        } catch (err: any) {
            console.error("Login failed", err);
            setError("Failed to sign in with Google. Please try again.");
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleGuestLogin = async () => {
        setError("");
        setGuestLoading(true);

        try {
            await signInAnonymously(auth);
            onClose();
        } catch (err) {
            console.error("Guest login failed", err);
            setError("Failed to sign in as guest.");
        } finally {
            setGuestLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-md"
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative bg-slate-900 border-2 border-slate-800/50 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-8 pt-8 pb-6">
                            <ModalHeader
                                title="Welcome Back"
                                subtitle="Sign in to access your account"
                                icon={<LogIn className="w-10 h-10 text-blue-500" />}
                                onClose={onClose}
                            />
                        </div>

                        <div className="px-8 pb-8 flex flex-col gap-4">
                            {error && <p className="text-red-400 text-sm text-center font-medium">{error}</p>}

                            <Button
                                onClick={handleGoogleLogin}
                                size={'lg'}
                                className="w-full relative overflow-hidden group"
                                disabled={isLoading}
                            >

                                <div className="flex items-center justtify-center gap-2">
                                    <AiFillGoogleCircle className="w-6 h-6" />
                                    <span className="relative flex items-center justify-center gap-2">
                                        {googleLoading ? "Signing in..." : "Sign in with Google"}
                                    </span>
                                </div>

                            </Button>

                            <div className="relative my-2">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-slate-800/50" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-slate-900 px-2 text-slate-400/60 font-semibold">or</span>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                size={'lg'}
                                className="w-full"
                                onClick={handleGuestLogin}
                                disabled={isLoading}
                            >
                                {guestLoading ? "Signing in..." : "Play as Guest"}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )
            }
        </AnimatePresence >
    );
};
