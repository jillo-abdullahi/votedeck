import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api";
import { userManager } from "@/lib/user";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ModalHeader } from "@/components/ModalHeader";
import { KeyRound } from "lucide-react";
import { LoginIcon, type LoginIconHandle } from "@/components/icons/LoginIcon";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const loginIconRef = useRef<LoginIconHandle>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const { userId, accessToken, name } = await authApi.restore(code.trim());

            userManager.setUserId(userId);
            userManager.setAccessToken(accessToken);
            userManager.setUserName(name);


            onClose();
            window.location.reload();
        } catch (err: any) {
            setError("Invalid sign-in key. Please check and try again.");
        } finally {
            setLoading(false);
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
                        className="relative bg-slate-800 border-2 border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-8 pt-6 pb-4">
                            <ModalHeader
                                title="Welcome Back"
                                subtitle="Enter your sign-in key to access your account"
                                icon={<KeyRound className="w-10 h-10 text-blue-500" />}
                                onClose={onClose}
                            />
                        </div>

                        <form onSubmit={handleLogin} className="px-8 pb-8 flex flex-col gap-6">
                            <div className="space-y-2">
                                <Input
                                    placeholder="Sign-in key"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    autoFocus
                                />
                                {error && <p className="text-red-400 text-sm text-center font-medium">{error}</p>}
                            </div>

                            <Button
                                type="submit"
                                size={'lg'}
                                className="w-full disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"
                                disabled={!code.trim() || loading}
                                onMouseEnter={() => loginIconRef.current?.startAnimation()}
                                onMouseLeave={() => loginIconRef.current?.stopAnimation()}
                            >
                                {loading ? (
                                    "Verifying..."
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <LoginIcon ref={loginIconRef} className="w-5 h-5" /> Sign in
                                    </span>
                                )}
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-slate-700/50" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-slate-800 px-2 text-slate-400/60 font-semibold">First time here?</span>
                                </div>
                            </div>

                            <Button
                                type="button"
                                size={'lg'}
                                variant="outline"
                                className="w-full"
                                asChild
                            >
                                <Link to="/create" onClick={onClose}>
                                    Start a new game
                                </Link>
                            </Button>
                        </form>
                    </motion.div>
                </div>
            )
            }
        </AnimatePresence >
    );
};
