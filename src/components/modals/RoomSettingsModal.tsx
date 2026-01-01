import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { ModalHeader } from "@/components/ModalHeader";
import { Settings, ChevronDown, Check } from "lucide-react";
import type { VotingSystemId, RevealPolicy } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

interface RoomSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (settings: { name: string; votingSystem: VotingSystemId; revealPolicy: RevealPolicy }) => void;
    initialSettings: {
        name: string;
        votingSystem: VotingSystemId;
        revealPolicy: RevealPolicy;
    };
    canChangeVotingSystem: boolean;
}

const VOTING_SYSTEMS = [
    {
        id: "fibonacci",
        label: "Fibonacci (0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ?, ☕)",
    },
    {
        id: "modified_fibonacci",
        label: "Modified Fibonacci (0, ½, 1, 2, 3, 5, 8, 13, 20, 40, 100, ?, ☕)",
    },
    { id: "tshirts", label: "T-shirts (XS, S, M, L, XL, ?, ☕)" },
    { id: "powers_2", label: "Powers of 2 (0, 1, 2, 4, 8, 16, 32, 64, ?, ☕)" },
];

const REVEAL_POLICIES = [
    { id: "everyone", label: "Everyone", description: "Anyone in the room can reveal votes and start new rounds." },
    { id: "admin", label: "Only Me", description: "Only you can reveal votes and start new rounds." },
];

export const RoomSettingsModal: React.FC<RoomSettingsModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialSettings,
    canChangeVotingSystem,
}) => {
    const [name, setName] = useState(initialSettings.name);
    const [votingSystem, setVotingSystem] = useState<VotingSystemId>(initialSettings.votingSystem);
    const [revealPolicy, setRevealPolicy] = useState<RevealPolicy>(initialSettings.revealPolicy);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setName(initialSettings.name);
            setVotingSystem(initialSettings.votingSystem);
            setRevealPolicy(initialSettings.revealPolicy);
        }
    }, [isOpen, initialSettings]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSubmit({ name, votingSystem, revealPolicy });
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
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
                        className="relative bg-slate-800 border-2 border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-8 pb-4">
                            <ModalHeader
                                title="Room Settings"
                                subtitle="Configure your planning session"
                                icon={<Settings className="w-10 h-10 text-blue-500" />}
                                onClose={onClose}
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto px-8 custom-scrollbar">
                            <form onSubmit={handleSubmit} className="space-y-6 py-2">
                                {/* Room Name */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-start">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Room Name</label>
                                    </div>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl py-3 px-4 text-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner"
                                        required
                                    />
                                </div>

                                {/* Voting System */}
                                <div className="space-y-2 relative">
                                    <div className="flex items-center justify-start">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Voting System</label>
                                    </div>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            disabled={!canChangeVotingSystem}
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                            className={`w-full cursor-pointer bg-slate-900 border-2 border-slate-700 rounded-xl py-3 px-4 text-left text-white flex items-center justify-between group transition-all shadow-inner ${!canChangeVotingSystem ? "opacity-60 cursor-not-allowed" : "hover:border-slate-600 focus:border-blue-500"
                                                }`}
                                        >
                                            <span className="truncate pr-4">
                                                {VOTING_SYSTEMS.find((s) => s.id === votingSystem)?.label}
                                            </span>
                                            <ChevronDown className={`text-slate-500 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                                        </button>

                                        {!canChangeVotingSystem && (
                                            <p className="text-[10px] text-slate-500 mt-1 ml-1 italic w-full text-left">
                                                Finish the current round to change the voting system.
                                            </p>
                                        )}

                                        <AnimatePresence>
                                            {isDropdownOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border-2 border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50"
                                                >
                                                    {VOTING_SYSTEMS.map((sys) => (
                                                        <button
                                                            key={sys.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setVotingSystem(sys.id as VotingSystemId);
                                                                setIsDropdownOpen(false);
                                                            }}
                                                            className={`w-full cursor-pointer text-left px-4 py-3 hover:bg-slate-800 transition-colors flex items-center border-b border-slate-800 last:border-0 ${votingSystem === sys.id ? "bg-blue-600/10 text-blue-400 font-medium" : "text-slate-300"
                                                                }`}
                                                        >
                                                            <span className="text-sm">{sys.label}</span>
                                                            {votingSystem === sys.id && <Check className="ml-auto w-4 h-4 text-blue-500" />}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                        {isDropdownOpen && (
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsDropdownOpen(false);
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Reveal Policy */}
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center justify-start">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Reveal & Reset Permissions</label>
                                    </div>
                                    <div className="grid gap-3">
                                        {REVEAL_POLICIES.map((policy) => (
                                            <button
                                                key={policy.id}
                                                type="button"
                                                onClick={() => setRevealPolicy(policy.id as RevealPolicy)}
                                                className={`flex flex-col text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${revealPolicy === policy.id
                                                    ? "bg-blue-600/10 border-blue-500"
                                                    : "bg-slate-900 border-slate-700 hover:border-slate-600"
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between w-full mb-1">
                                                    <span className={`font-bold ${revealPolicy === policy.id ? "text-blue-400" : "text-white"}`}>
                                                        {policy.label}
                                                    </span>
                                                    {revealPolicy === policy.id && <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />}
                                                </div>
                                                <span className="text-sm text-slate-500 leading-relaxed">{policy.description}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-8 pt-4 flex gap-4">
                            <Button variant="ghost" size="lg" onClick={onClose} className="flex-1">
                                Cancel
                            </Button>
                            <Button type="submit" size="lg" onClick={handleSubmit} disabled={!name.trim()} className="flex-2 shadow-lg shadow-blue-500/20">
                                Save Changes
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
