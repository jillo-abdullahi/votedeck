import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getRoomsId } from "@/lib/api/generated";
import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { ModalHeader } from "@/components/ModalHeader";
import { LogIn } from "lucide-react";

interface JoinRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({ isOpen, onClose }) => {
    const [roomId, setRoomId] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const cleanRoomId = roomId.trim();

        if (!cleanRoomId) {
            setError("Please enter a Game ID");
            setLoading(false);
            return;
        }

        try {
            // Validate room exists using the generated fetcher
            await getRoomsId(cleanRoomId);

            // Navigate to room
            await navigate({ to: "/room/$roomId", params: { roomId: cleanRoomId } });
            onClose();
        } catch (err: any) {
            // Error handling remains same
            if (err.response?.status === 404) {
                setError("Game not found. Please check the ID and try again.");
            } else {
                setError("Failed to join game. Please try again.");
            }
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
                        className="relative bg-slate-900 border-2 border-slate-800/50 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-8 pb-4">
                            <ModalHeader
                                title="Join Game"
                                subtitle="Enter the Game ID to join an existing game"
                                icon={<LogIn className="w-8 h-8 text-blue-500" />}
                                onClose={onClose}
                            />
                        </div>

                        <form onSubmit={handleJoin} className="px-8 pb-8 flex flex-col gap-6">
                            <div className="space-y-2">
                                <Input
                                    placeholder="GAME ID"
                                    value={roomId}
                                    onChange={(e) => setRoomId(e.target.value)}
                                    autoFocus
                                />
                                {error && <p className="text-red-400 text-sm text-center font-medium">{error}</p>}
                            </div>

                            <Button
                                type="submit"
                                size={'lg'}
                                className="w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                                disabled={!roomId.trim() || loading}
                            >
                                {loading ? "Joining..." : "Join Game"}
                            </Button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
