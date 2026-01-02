import React, { useState, useRef } from "react";
import { useParams, useSearch, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Participants } from "@/components/Participants";
import { VotingDeck } from "@/components/VotingDeck";
import { Controls } from "@/components/Controls";
import type { VoteValue, VotingSystemId, RevealPolicy } from "@/types";
import {
    UserPlusIcon,
    type UserPlusHandle,
} from "@/components/icons/UserPlusIcon";
import {
    LogoutIcon,
    type LogoutIconHandle,
} from "@/components/icons/LogoutIcon";
import { Tooltip } from "@/components/ui/tooltip";
import { SpadeIcon } from "lucide-react";

import { InviteModal } from "@/components/modals/InviteModal";
import { DisplayNameModal } from "@/components/modals/DisplayNameModal";
import { RoomSettingsModal } from "@/components/modals/RoomSettingsModal";
import { RecoveryCodeModal } from "@/components/modals/RecoveryCodeModal";
import { useSocket } from "@/hooks/useSocket";
import { RevealSummary } from "@/components/RevealSummary";
import { motion, AnimatePresence } from "framer-motion";
import { SettingsIcon, type SettingsIconHandle } from "@/components/icons/SettingsIcon";
import { UserMenu } from "@/components/UserMenu";

import { NotFoundView } from "@/components/NotFoundView";

import { authApi } from "@/lib/api";
import { userManager } from "@/lib/user";

export const RoomPage: React.FC = () => {
    const { roomId } = useParams({ from: "/room/$roomId" });
    const { name: searchName } = useSearch({ from: "/room/$roomId" });
    const userPlusRef = useRef<UserPlusHandle>(null);
    const logoutRef = useRef<LogoutIconHandle>(null);
    const settingsRef = useRef<SettingsIconHandle>(null);
    const navigate = useNavigate();

    // Use stored name as fallback if not in URL
    const name = searchName || userManager.getUserName();

    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isDisplayNameModalOpen, setIsDisplayNameModalOpen] = useState(!name);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
    const [newRecoveryCode, setNewRecoveryCode] = useState("");

    // Handle anonymous login if we have a name but no token
    React.useEffect(() => {
        const checkAuth = async () => {
            const currentToken = userManager.getAccessToken();
            if (name && !currentToken && !isAuthenticating) {
                setIsAuthenticating(true);
                try {
                    const { accessToken, userId } = await authApi.loginAnonymous();
                    userManager.setAccessToken(accessToken);
                    userManager.setUserId(userId);
                } catch (err) {
                    console.error("Failed to login anonymously:", err);
                } finally {
                    setIsAuthenticating(false);
                }
            }
        };
        checkAuth();
    }, [name, isAuthenticating]);

    const {
        roomState,
        userId,
        castVote,
        revealVotes,
        resetVotes,
        leaveRoom,
        updateName,
        updateSettings,
        error: socketError
    } = useSocket(roomId, name);

    const isAdmin = roomState?.adminId === userId;

    const handleExitGame = () => {
        // Just leave the room context, do not logout
        leaveRoom();
        navigate({ to: "/" });
    };

    const handleInvite = () => {
        setIsInviteModalOpen(true);
    };

    const handleNameSubmit = async (newName: string) => {
        setIsDisplayNameModalOpen(false);

        // If we don't have a token yet, performing an anonymous login
        if (!userManager.getAccessToken()) {
            setIsAuthenticating(true);
            try {
                const { accessToken, userId, recoveryCode } = await authApi.loginAnonymous();
                userManager.setAccessToken(accessToken);
                userManager.setUserId(userId);
                userManager.setUserName(newName);
                if (recoveryCode) {
                    userManager.setRecoveryCode(recoveryCode);
                    setNewRecoveryCode(recoveryCode);
                    setIsRecoveryModalOpen(true);
                }
            } catch (err) {
                console.error("Failed to login anonymously during name submission:", err);
            } finally {
                setIsAuthenticating(false);
            }
        }

        // Update URL search params with the new name
        navigate({
            to: "/room/$roomId",
            params: { roomId },
            search: { name: newName },
            replace: true
        });

        // Also update the name on the server if already connected
        if (roomState) {
            updateName(newName);
        }
    };

    const handleSettingsSubmit = (settings: { name: string; votingSystem: VotingSystemId; revealPolicy: RevealPolicy }) => {
        updateSettings(settings);
        setIsSettingsModalOpen(false);
    };

    const myVote = roomState?.votes[userId] || null;

    const handleVote = (value: VoteValue) => {
        // Toggle vote: if clicking same value, clear it (send null or empty string)
        const newValue = myVote === value ? "" : value;
        castVote(newValue);
    };

    const handleReveal = () => {
        if (roomState?.revealPolicy === 'admin' && !isAdmin) return;
        revealVotes();
    };

    const handleReset = () => {
        if (roomState?.revealPolicy === 'admin' && !isAdmin) return;
        resetVotes();
    };

    // If room is not found
    if (socketError === "Room not found") {
        return <NotFoundView />;
    }

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
    const hasVotes = roomState.users.some((u) => u.hasVoted);

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-blue-500/30 flex flex-col">
            <Header>
                <div className="flex items-center gap-6">
                    {/* User Profile Dropdown */}
                    <UserMenu
                        name={name || "Guest"}
                        role={isAdmin ? "Game Host" : "Guest user"}
                        onNameChange={() => {
                            setIsDisplayNameModalOpen(true);
                        }}
                        onLogout={() => {
                            leaveRoom();
                        }}
                    />

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

            {/* Game Top Bar */}
            <div className="w-full bg-blue-500/3 border-b border-blue-500/20 py-2 px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-top-2 duration-700">
                <div className="w-full mx-auto flex items-center justify-between space-x-4">
                    <div className="flex items-center gap-2">
                        <SpadeIcon size={24} className="text-blue-500/60" />
                        <h2 className="text-lg font-semibold text-slate-200">
                            {roomState.name.charAt(0).toUpperCase() + roomState.name.slice(1)}
                        </h2>
                    </div>

                    <div className="flex items-center gap-2">
                        {isAdmin && (
                            <Tooltip content="Game settings">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsSettingsModalOpen(true)}
                                    onMouseEnter={() => settingsRef.current?.startAnimation()}
                                    onMouseLeave={() => settingsRef.current?.stopAnimation()}
                                    className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full w-10 h-10"
                                >
                                    <SettingsIcon ref={settingsRef} className="w-6 h-6" />
                                </Button>
                            </Tooltip>
                        )}

                        <Tooltip content="Leave game">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleExitGame}
                                onMouseEnter={() => logoutRef.current?.startAnimation()}
                                onMouseLeave={() => logoutRef.current?.stopAnimation()}
                                className="text-red-400 hover:bg-slate-700/50 hover:text-red-300 rounded-full w-10 h-10"
                            >
                                <LogoutIcon ref={logoutRef} className="w-5 h-5" />
                            </Button>
                        </Tooltip>
                    </div>
                </div>
            </div>

            <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
                {/* 1. Participants Section (Top) */}
                <section
                    aria-label="Participants"
                    className="w-full flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-700"
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
                                {(() => {
                                    const hasAnyVotes = roomState.users.some((u) => u.hasVoted);
                                    const canIReveal = roomState.revealPolicy === 'everyone' || isAdmin;
                                    const currentAdmin = roomState.users.find(u => u.id === roomState.adminId);

                                    let disabledReason = "";
                                    if (!hasAnyVotes) {
                                        disabledReason = "Waiting for first player to pick a card...";
                                    } else if (!canIReveal) {
                                        disabledReason = `Only ${currentAdmin?.name || 'the administrator'} can reveal votes.`;
                                    }

                                    return (
                                        <Controls
                                            onReveal={handleReveal}
                                            canReveal={canReveal && canIReveal}
                                            disabledReason={disabledReason}
                                        />
                                    );
                                })()}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>
            </main>

            {/* 3. Voting Deck Section (Sticky Bottom) */}
            <section
                aria-label="Voting Deck"
                className="sticky bottom-0 z-40 w-full bg-slate-900/80 backdrop-blur-md border-t border-slate-800 pb-4 pt-4 animate-in slide-in-from-bottom-full duration-700 delay-200"
            >
                <div className="max-w-5xl mx-auto px-4">
                    {!roomState.revealed && (
                        <div className="flex justify-center mb-4">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
                                Choose your card here
                            </span>
                        </div>
                    )}
                    <VotingDeck
                        selectedValue={myVote}
                        onVote={handleVote}
                        revealed={roomState.revealed}
                        votingSystem={roomState.votingSystem}
                        onReset={handleReset}
                        canReset={roomState.revealPolicy === 'everyone' || isAdmin}
                    />
                </div>
            </section>

            <InviteModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                roomUrl={`${window.location.origin}/room/${roomId}`}
            />

            <DisplayNameModal
                isOpen={isDisplayNameModalOpen}
                onClose={() => setIsDisplayNameModalOpen(false)}
                onSubmit={handleNameSubmit}
                initialValue={name || ""}
            />

            {roomState && (
                <RoomSettingsModal
                    isOpen={isSettingsModalOpen}
                    onClose={() => setIsSettingsModalOpen(false)}
                    onSubmit={handleSettingsSubmit}
                    initialSettings={{
                        name: roomState.name,
                        votingSystem: roomState.votingSystem,
                        revealPolicy: roomState.revealPolicy,
                    }}
                    canChangeVotingSystem={!hasVotes}
                />
            )}

            <RecoveryCodeModal
                isOpen={isRecoveryModalOpen}
                onClose={() => setIsRecoveryModalOpen(false)}
                recoveryCode={newRecoveryCode}
            />
        </div>
    );
};
