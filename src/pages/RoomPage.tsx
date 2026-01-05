import React, { useState, useRef } from "react";
import { RoomAvatar } from "@/components/RoomAvatar";
import { PageLayout } from "@/components/PageLayout";
import { useParams, useSearch, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";

import { PokerTable } from "@/components/PokerTable";
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
import { Check, SpadeIcon, RefreshCcw } from "lucide-react";

import { InviteModal } from "@/components/modals/InviteModal";
import { DisplayNameModal } from "@/components/modals/DisplayNameModal";
import { RoomSettingsModal } from "@/components/modals/RoomSettingsModal";
import { RecoveryCodeModal } from "@/components/modals/RecoveryCodeModal";
import { useSocket } from "@/hooks/useSocket";
import { RevealSummary } from "@/components/RevealSummary";
import { motion, AnimatePresence } from "framer-motion";
import { SettingsIcon, type SettingsIconHandle } from "@/components/icons/SettingsIcon";
import { ClipboardIcon, type ClipboardIconHandle } from "@/components/icons/ClipboardIcon";
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
    const clipboardRef = useRef<ClipboardIconHandle>(null);
    const navigate = useNavigate();

    // Use stored name as fallback if not in URL
    const name = searchName || userManager.getUserName();

    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isDisplayNameModalOpen, setIsDisplayNameModalOpen] = useState(!name);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
    const [newRecoveryCode, setNewRecoveryCode] = useState("");
    const [isCopied, setIsCopied] = useState(false);

    // Check for temporary recovery code (from Create Game flow)
    React.useEffect(() => {
        const tempCode = userManager.getTempRecoveryCode();
        if (tempCode) {
            setNewRecoveryCode(tempCode);
            setIsRecoveryModalOpen(true);
            userManager.setTempRecoveryCode(null);
        }
    }, []);

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
        error: socketError,
        isRoomClosed
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

    const handleCopyRoomId = () => {
        if (roomId) {
            navigator.clipboard.writeText(roomId);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    if (socketError === "Room not found") {
        return <NotFoundView />;
    }

    if (isRoomClosed) {
        return (
            <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl max-w-md w-full animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                            <line x1="12" y1="2" x2="12" y2="12"></line>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">Room Closed</h2>
                    <p className="text-slate-400 mb-8">
                        The host has closed this room. You can return to the home page or create a new game.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Button
                            onClick={() => navigate({ to: "/" })}
                            className="w-full bg-slate-700 hover:bg-slate-600 text-white"
                        >
                            Back to Home
                        </Button>
                        <Button
                            onClick={() => navigate({ to: "/create" })}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white"
                        >
                            Start New Game
                        </Button>
                    </div>
                </div>
            </div>
        );
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
        <PageLayout>
            <Header>
                <div className="flex items-center gap-6">
                    {/* User Profile Dropdown */}
                    <UserMenu
                        name={name || "Guest"}
                        role={isAdmin ? "Game Host" : "Guest user"}
                        onNameChange={handleNameSubmit}
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
            <div className="w-full bg-blue-500/3 mt-2 rounded-xl border border-blue-500/20 px-2 py-2 animate-in fade-in slide-in-from-top-2 duration-700">
                <div className="w-full mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <RoomAvatar isAdmin={isAdmin} size="sm" className="shrink-0" />
                        <h2 className="text-md font-semibold text-slate-200 max-w-md md:max-w-xl truncate">
                            {roomState.name.charAt(0).toUpperCase() + roomState.name.slice(1)}
                        </h2>

                        <div className="h-4 w-px bg-slate-700 hidden sm:block" />

                        <div className="flex items-center gap-1.5">
                            <span className="text-xs text-slate-400 hidden sm:inline-block">
                                {roomId}
                            </span>
                            <Tooltip content={isCopied ? "Copied!" : "Copy Room ID"}>
                                <button
                                    className="w-6 h-6 flex items-center justify-center cursor-pointer hover:bg-slate-700/50 rounded-md transition-colors text-slate-400 hover:text-slate-200"
                                    onMouseEnter={() => clipboardRef.current?.startAnimation()}
                                    onMouseLeave={() => clipboardRef.current?.stopAnimation()}
                                    onClick={handleCopyRoomId}
                                >
                                    {isCopied ? (
                                        <Check size={16} className="text-green-400" />
                                    ) : (
                                        <ClipboardIcon ref={clipboardRef} size={14} />
                                    )}
                                </button>
                            </Tooltip>
                        </div>
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
                                    className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full w-8 h-8"
                                >
                                    <SettingsIcon ref={settingsRef} size={20} />
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
                                className="text-red-400 hover:bg-red-400/10 hover:text-red-300 rounded-full w-8 h-8 flex items-center justify-center"
                            >
                                <LogoutIcon ref={logoutRef} size={16} />
                            </Button>
                        </Tooltip>
                    </div>
                </div>
            </div>

            <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-4">
                <PokerTable
                    users={roomState.users}
                    votes={roomState.votes}
                    revealed={roomState.revealed}
                >
                    <AnimatePresence mode="wait">
                        {roomState.revealed ? (

                            <motion.div
                                key="revealed-state"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="flex flex-col items-center gap-2"
                            >
                                {(() => {
                                    const canReset = roomState.revealPolicy === 'everyone' || isAdmin;
                                    return (
                                        <>
                                            <Button
                                                onClick={handleReset}
                                                disabled={!canReset}
                                                size={'lg'}
                                                className="group disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <RefreshCcw className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                                                Start New Vote
                                            </Button>
                                            {!canReset && (
                                                <p className="text-slate-500 text-[10px] italic">
                                                    Only host can start vote
                                                </p>
                                            )}
                                        </>
                                    );
                                })()}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="controls"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="relative z-10 w-full flex justify-center"
                            >
                                {(() => {
                                    const hasAnyVotes = roomState.users.some((u) => u.hasVoted);
                                    const canIReveal = roomState.revealPolicy === 'everyone' || isAdmin;
                                    const currentAdmin = roomState.users.find(u => u.id === roomState.adminId);

                                    if (!hasAnyVotes) {
                                        return (
                                            <div className="flex items-center gap-3 text-blue-400 animate-pulse">
                                                <SpadeIcon className="w-6 h-6" />
                                                <span className="font-medium tracking-wide text-md">Pick your cards!</span>
                                            </div>
                                        );
                                    }

                                    let disabledReason = "";
                                    if (!canIReveal) {
                                        disabledReason = `Only ${currentAdmin?.name || 'the host'} can reveal votes.`;
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
                </PokerTable>
            </main>

            {/* 3. Voting Deck Section (Sticky Bottom) */}
            <motion.section
                layout
                aria-label="Voting Deck"
                className="sticky bottom-0 z-40 w-full bg-slate-900/80 backdrop-blur-md border-t border-slate-800 pb-4 pt-4"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{
                    layout: { duration: 0.3, ease: "easeInOut" },
                    y: { duration: 0.7, delay: 0.2 }
                }}
            >
                <div className="max-w-5xl mx-auto px-4">
                    <AnimatePresence mode="wait">
                        {!roomState.revealed && (
                            <motion.div
                                key="title"
                                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                transition={{ duration: 0.2 }}
                                className="flex justify-center overflow-hidden"
                            >
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
                                    Choose your card here
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <VotingDeck
                        selectedValue={myVote}
                        onVote={handleVote}
                        revealed={roomState.revealed}
                        votingSystem={roomState.votingSystem}
                    >
                        {roomState.revealed && (
                            <div className="w-full">
                                <RevealSummary
                                    votes={roomState.votes}
                                    votingSystem={roomState.votingSystem}
                                    isVisible={roomState.revealed}
                                />
                            </div>
                        )}
                    </VotingDeck>
                </div>
            </motion.section>

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
        </PageLayout>
    );
};
