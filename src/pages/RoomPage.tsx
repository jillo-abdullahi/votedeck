import React, { useState, useRef } from "react";
import { useParams, useSearch, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Participants } from "@/components/Participants";
import { VotingDeck } from "@/components/VotingDeck";
import { Controls } from "@/components/Controls";
import type { VoteValue } from "@/types";
import { Camera, Pencil, ChevronDown } from "lucide-react";
import {
    UserPlusIcon,
    type UserPlusHandle,
} from "@/components/icons/UserPlusIcon";
import {
    LogoutIcon,
    type LogoutIconHandle,
} from "@/components/icons/LogoutIcon";

import { InviteModal } from "@/components/InviteModal";
import { DisplayNameModal } from "@/components/DisplayNameModal";
import { useSocket } from "@/hooks/useSocket";
import { RevealSummary } from "@/components/RevealSummary";
import { motion, AnimatePresence } from "framer-motion";
import { UserAvatar } from "@/components/UserAvatar";

export const RoomPage: React.FC = () => {
    const { roomId } = useParams({ from: "/room/$roomId" });
    const { name } = useSearch({ from: "/room/$roomId" });
    const userPlusRef = useRef<UserPlusHandle>(null);
    const logoutRef = useRef<LogoutIconHandle>(null);
    const navigate = useNavigate();

    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isDisplayNameModalOpen, setIsDisplayNameModalOpen] = useState(!name);

    // Real-time room state management via socket
    const {
        roomState,
        userId,
        castVote,
        revealVotes,
        resetVotes,
        leaveRoom,
        error: socketError
    } = useSocket(roomId, name);

    const handleLeaveRoom = () => {
        // Remove user from room and navigate to landing page
        leaveRoom();
        navigate({ to: "/" });
    };

    const handleInvite = () => {
        setIsInviteModalOpen(true);
    };

    const handleNameSubmit = (newName: string) => {
        setIsDisplayNameModalOpen(false);
        // Update URL search params with the new name
        navigate({
            to: "/room/$roomId",
            params: { roomId },
            search: { name: newName },
            replace: true
        });
    };

    const myVote = roomState?.votes[userId] || null;

    const handleVote = (value: VoteValue) => {
        // Toggle vote: if clicking same value, clear it (send null or empty string)
        const newValue = myVote === value ? "" : value;
        castVote(newValue);
    };

    const handleReveal = () => {
        revealVotes();
    };

    const handleReset = () => {
        resetVotes();
    };

    // If room is not loaded yet
    if (!roomState) {
        return (
            <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center justify-center p-6">
                <DisplayNameModal
                    isOpen={isDisplayNameModalOpen}
                    onClose={() => navigate({ to: "/" })}
                    onSubmit={handleNameSubmit}
                />
                {!isDisplayNameModalOpen && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <div className="text-xl font-medium text-slate-400">
                            {socketError ? `Error: ${socketError}` : "Joining room..."}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    const canReveal = roomState.users.some((u) => u.hasVoted);

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-blue-500/30 flex flex-col">
            <Header>
                <div className="flex-1 flex items-center justify-center">
                    <h1 className="text-slate-400 font-medium text-lg truncate max-w-[200px] sm:max-w-xs px-4 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/50">
                        {roomState.name}
                    </h1>
                </div>

                <div className="flex items-center gap-6">
                    {/* Separator for desktop */}
                    <div className="hidden sm:block w-px h-8 bg-slate-800" />
                    {/* User Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="flex cursor-pointer items-center gap-3 hover:opacity-80 transition-opacity group"
                        >
                            <UserAvatar name={name || "Guest"} size={28} />
                            <div className="flex items-center gap-2">
                                <span className="text-white font-bold hidden sm:block text-lg">
                                    {name || "Guest"}
                                </span>
                                <ChevronDown
                                    className={`text-slate-400 transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""
                                        }`}
                                />
                            </div>
                        </button>

                        {/* Dropdown Menu */}
                        {isUserMenuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setIsUserMenuOpen(false)}
                                />
                                <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 ring-1 ring-black/5">
                                    <div className="p-4 border-b border-slate-700 flex items-center gap-4">
                                        {/* Avatar */}
                                        <div className="relative group/avatar cursor-pointer">
                                            <UserAvatar name={name || "Guest"} size={48} />
                                        </div>
                                        {/* User Info */}
                                        <div className="flex-1 flex flex-col justify-center items-start">
                                            <div className="flex items-center gap-2 group/name cursor-pointer hover:opacity-80 transition-opacity">
                                                <span className="text-white font-bold text-lg">
                                                    {name || "Guest"}
                                                </span>
                                                <Pencil className="w-3.5 h-3.5 text-white/50 group-hover/name:text-white transition-colors" />
                                            </div>
                                            <div className="text-slate-400 text-sm font-medium">
                                                Guest user
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        onClick={handleLeaveRoom}
                                        onMouseEnter={() => logoutRef.current?.startAnimation()}
                                        onMouseLeave={() => logoutRef.current?.stopAnimation()}
                                        className="w-full justify-start text-left px-4 py-4 text-red-400 hover:bg-slate-700 hover:text-red-300 font-medium h-auto rounded-none"
                                    >
                                        <LogoutIcon size={16} ref={logoutRef} />
                                        <span>Leave room</span>
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Invite Button */}
                    <Button
                        variant="outline"

                        onClick={handleInvite}
                        onMouseEnter={() => userPlusRef.current?.startAnimation()}
                        onMouseLeave={() => userPlusRef.current?.stopAnimation()}
                        className="bg-transparent border-2 border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500 hover:text-blue-300 rounded-xl px-5 py-3 font-bold text-base h-auto"
                    >
                        <UserPlusIcon size={18} ref={userPlusRef} />
                        <span className="ml-1">Invite players</span>
                    </Button>
                </div>
            </Header>

            <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
                {/* 1. Participants Section (Top) */}
                <section
                    aria-label="Participants"
                    className="w-full flex justify-center animate-in fade-in slide-in-from-top-4 duration-700"
                >
                    <Participants
                        users={roomState.users}
                        votes={roomState.votes}
                        revealed={roomState.revealed}
                        onInvite={handleInvite}
                    />
                </section>

                {/* 2. Active Area (Middle) - Fixed Height */}
                <section
                    aria-label="Active Area"
                    className="w-full min-h-[12rem] flex items-center justify-center rounded-3xl border-2 border-dashed border-slate-700 bg-slate-800/30 relative animate-in zoom-in-95 duration-700 delay-100 overflow-hidden"
                >
                    <AnimatePresence mode="wait">
                        {roomState.revealed ? (
                            <motion.div
                                key="summary"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="w-full h-full relative"
                            >
                                <RevealSummary
                                    votes={roomState.votes}
                                    votingSystem={roomState.votingSystem}
                                    isVisible={roomState.revealed}
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="controls"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="relative z-10"
                            >
                                <Controls
                                    revealed={roomState.revealed}
                                    onReveal={handleReveal}
                                    onReset={handleReset}
                                    canReveal={canReveal}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>
            </main>

            {/* 3. Voting Deck Section (Sticky Bottom) */}
            <section
                aria-label="Voting Deck"
                className="sticky bottom-0 z-50 w-full bg-slate-900/80 backdrop-blur-md border-t border-slate-800 pb-4 pt-2 animate-in slide-in-from-bottom-full duration-700 delay-200"
            >
                <div className="max-w-5xl mx-auto px-4">
                    <VotingDeck
                        selectedValue={myVote}
                        onVote={handleVote}
                        revealed={roomState.revealed}
                        votingSystem={roomState.votingSystem}
                        onReset={handleReset}
                    />
                </div>
            </section>

            <InviteModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                roomUrl={`${window.location.origin}/room/${roomId}`}
            />
        </div >
    );
};
