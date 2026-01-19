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
import { Check, SpadeIcon, RefreshCcw, UserIcon, UsersIcon } from "lucide-react";

import { InviteModal } from "@/components/modals/InviteModal";
import { DisplayNameModal } from "@/components/modals/DisplayNameModal";
import { RoomSettingsModal } from "@/components/modals/RoomSettingsModal";
import { RecoveryCodeModal } from "@/components/modals/RecoveryCodeModal";
import { ErrorModal } from "@/components/modals/ErrorModal";
import { LeaveRoomModal } from "@/components/modals/LeaveRoomModal";
import { useSocket } from "@/hooks/useSocket";
import { RevealSummary } from "@/components/RevealSummary";
import { CountdownOverlay } from "@/components/CountdownOverlay";
import { motion, AnimatePresence } from "framer-motion";
import { SettingsIcon, type SettingsIconHandle } from "@/components/icons/SettingsIcon";
import { ClipboardIcon, type ClipboardIconHandle } from "@/components/icons/ClipboardIcon";
import { UserMenu } from "@/components/UserMenu";

import { NotFoundView } from "@/components/NotFoundView";

import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/context/ToastContext";
import { userManager } from "@/lib/user";
import { InfoText } from "@/components/InfoText";

export const RoomPage: React.FC = () => {
    const { roomId } = useParams({ from: "/room/$roomId" });
    const { name: searchName } = useSearch({ from: "/room/$roomId" });
    const userPlusRef = useRef<UserPlusHandle>(null);
    const logoutRef = useRef<LogoutIconHandle>(null);
    const settingsRef = useRef<SettingsIconHandle>(null);
    const clipboardRef = useRef<ClipboardIconHandle>(null);
    const navigate = useNavigate();


    const { user, loading: isAuthLoading, updateUserProfile, signInAnonymous } = useAuth();

    // Use auth name or search param or fallback
    // Priority: Firebase Name -> URL Search Name -> "Guest" (conceptually)
    // Actually if user is logged in, use user.displayName.
    // If not logged in, we wait for input.
    const name = user?.displayName || searchName;

    // userManager sync (optional, maybe not needed if we rely on user object, keeping for socket fallback if any)
    React.useEffect(() => {
        if (user?.uid) userManager.setUserId(user.uid);
        if (user?.displayName) userManager.setUserName(user.displayName);
    }, [user]);

    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    // Open name modal if not loading and no name (and no user)
    // If user exists, we have name. If user doesn't exist, we need name (which triggers anonymous login)
    const [isDisplayNameModalOpen, setIsDisplayNameModalOpen] = useState(false);

    React.useEffect(() => {
        if (!isAuthLoading && !name) {
            setIsDisplayNameModalOpen(true);
        } else if (name) {
            setIsDisplayNameModalOpen(false);
        }
    }, [isAuthLoading, name]);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
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
        isRoomClosed,
        countdownAction
    } = useSocket(roomId, name, user?.uid, !isAuthLoading);

    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [blockingError, setBlockingError] = useState("");

    // Toast socket errors
    const { error: toastError } = useToast();
    React.useEffect(() => {
        if (socketError) {
            // Ignore "Room not found" as it's handled by UI redirection/view
            if (socketError === "Room not found") return;

            // Check for Blocking Errors
            // Note: "Room is full" is handled by a full-page view, so we don't need the modal for it.
            if (socketError.includes("limit")) {
                setBlockingError(socketError);
                setIsErrorModalOpen(true);
            } else if (!socketError.includes("Room is full")) {
                // Non-blocking errors (connection blips etc) - excluding "Room is full" to avoid double toast/modal
                toastError(socketError);
            }
        }
    }, [socketError, toastError]);

    // Use backend-driven countdown state
    // When countdownAction is present, we are counting down.
    // When it is null (cleared by revealed state or timeout), we are done.
    const isCountingDown = !!countdownAction;

    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

    const isAdmin = roomState?.adminId === userId;

    const handleExitGame = () => {
        setIsLeaveModalOpen(true);
    };

    const confirmLeaveGame = () => {
        // Just leave the room context, do not logout
        leaveRoom();
        navigate({ to: "/" });
    };

    const handleInvite = () => {
        setIsInviteModalOpen(true);
    };

    const handleNameSubmit = async (newName: string) => {
        setIsDisplayNameModalOpen(false);

        try {
            if (!user) {
                // Anonymous sign in
                await signInAnonymous();
                // After sign in, user might not be set immediately in scope, but context logic handles it.
                // However, we need to update profile. 
                // Since signInAnonymous sets state in context, we might race.
                // Better to rely on auth.currentUser here or await context update?
                // Actually auth.currentUser is reliable after await.
                await updateUserProfile({ displayName: newName });
            } else {
                // Update existing profile (change name)
                await updateUserProfile({ displayName: newName });
            }

            // Note: useAuth hook should pick up change or we might need to force refresh
            // But Socket will reconnect with new token if it changes (rare for name change)
            // Actually name is passed to socket connect via ref, so updating local 'name' var via auth change is key.
            // 'user' object update triggers re-render, 'name' derived from 'user.displayName' updates.
        } catch (err) {
            console.error("Failed to update name/login:", err);
            toastError("Failed to update name");
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

    const handleSettingsSubmit = (settings: { name: string; votingSystem: VotingSystemId; revealPolicy: RevealPolicy; enableCountdown: boolean }) => {
        updateSettings(settings);
        setIsSettingsModalOpen(false);
    };

    const myVote = (userId && roomState?.votes[userId]) || null;

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

    // Show loading while checking auth
    if (isAuthLoading) {
        return (
            <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center justify-center p-6">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <div className="text-xl font-medium text-slate-400">
                        Joining room...
                    </div>
                </div>
            </div>
        );
    }

    if (socketError === "Room not found") {
        return <NotFoundView />;
    }

    if (isRoomClosed) {
        return (
            <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-slate-800/30 p-8 rounded-2xl border border-slate-700/30 max-w-md w-full animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
                        <UserIcon size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">Room Closed</h2>
                    <p className="text-slate-400 mb-8">
                        The host has closed this room. You can return to the home page or create a new game.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Button
                            size="lg"
                            variant="ghost"
                            onClick={() => navigate({ to: "/" })}
                        >
                            Back to Home
                        </Button>
                        <Button
                            size="lg"
                            onClick={() => navigate({ to: "/create" })}
                        >
                            Start New Game
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (socketError?.includes("Room is full")) {
        return (
            <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-slate-800/30 p-8 rounded-2xl border border-slate-700/30 max-w-md w-full animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 bg-yellow-500/10 text-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6">
                        <UserIcon size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">Room is Full</h2>
                    <p className="text-slate-400 mb-8">
                        This room has reached its maximum capacity. You can return to the home page or create a new game.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Button
                            size="lg"
                            variant="ghost"
                            onClick={() => navigate({ to: "/" })}
                        >
                            Back to Home
                        </Button>
                        <Button
                            size="lg"
                            onClick={() => navigate({ to: "/create" })}
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
                    initialValue={name || ""}
                    isLoading={isAuthLoading} // Prevent submission while verifying session
                />
                {!isDisplayNameModalOpen && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <div className="text-xl font-medium text-slate-400">
                            {socketError ? `Error: ${socketError}` : "Connecting..."}
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
                        photoURL={user?.photoURL}
                    />

                    {/* Invite Button */}
                    <div className="hidden sm:block">
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

                </div>
            </Header>

            {/* Game Top Bar */}
            <div className="w-full bg-blue-500/3 mt-2 rounded-xl border border-blue-500/20 px-2 py-2 animate-in fade-in slide-in-from-top-2 duration-700">
                <div className="w-full mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <RoomAvatar isAdmin={isAdmin} size="sm" className="shrink-0" />
                        <h2 className="text-md font-semibold text-slate-200 max-w-[140px] sm:max-w-xs md:max-w-xl truncate">
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

                        <div className="h-4 w-px bg-slate-700 hidden sm:block" />

                        <div className="flex items-center gap-1.5 text-slate-400" title="Players in room">
                            <UsersIcon size={14} />
                            <span className="text-xs font-medium">{roomState.users.length} / 25</span>
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
                                <LogoutIcon ref={logoutRef} size={16} className="ml-0.5" />
                            </Button>
                        </Tooltip>
                    </div>
                </div>
            </div>

            <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-4">
                <PokerTable
                    users={roomState.users}
                    votes={roomState.votes}
                    revealed={roomState.revealed && !isCountingDown}
                    overlay={
                        <AnimatePresence mode="wait">
                            {isCountingDown && countdownAction && (
                                <CountdownOverlay duration={countdownAction.duration} />
                            )}
                        </AnimatePresence>
                    }
                >
                    <AnimatePresence mode="wait">
                        {roomState.revealed && !isCountingDown ? (

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
                                    const currentAdmin = roomState.users.find(u => u.id === roomState.adminId);
                                    return (
                                        <>
                                            <div className="flex gap-2 flex-col items-center">
                                                <Button
                                                    onClick={handleReset}
                                                    disabled={!canReset}
                                                    size={'lg'}
                                                    className="group disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <RefreshCcw className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                                                    <span className="hidden sm:inline">Start New Vote</span>
                                                    <span className="sm:hidden">Restart</span>
                                                </Button>
                                                {!canReset && (
                                                    <InfoText text={
                                                        <>
                                                            <span>Only the host, </span>
                                                            <span className="inline-block truncate max-w-[80px] align-bottom font-semibold" title={currentAdmin?.name}>
                                                                {currentAdmin?.name}
                                                            </span>
                                                            <span>, can start new vote.</span>
                                                        </>
                                                    } />
                                                )}
                                            </div>
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
                                            <div className="flex flex-col sm:flex-row items-center gap-3 text-blue-400 animate-pulse">
                                                <SpadeIcon className="w-6 h-6" />
                                                <span className="font-medium tracking-wide text-md text-center sm:text-left">Pick your cards!</span>
                                            </div>
                                        );
                                    }

                                    let disabledReason: React.ReactNode = "";
                                    if (!canIReveal) {
                                        disabledReason = <>
                                            <span>Only the host, </span>
                                            <span className="inline-block truncate max-w-[80px] align-bottom font-semibold" title={currentAdmin?.name}>
                                                {currentAdmin?.name}
                                            </span>
                                            <span>, can reveal votes.</span>
                                        </>;
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
                                <span className="text-xs font-bold text-slate-300 uppercase tracking-[0.2em]">
                                    Choose your card here
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <VotingDeck
                        selectedValue={myVote}
                        onVote={handleVote}
                        revealed={roomState.revealed && !isCountingDown}
                        votingSystem={roomState.votingSystem}
                    >
                        {roomState.revealed && !isCountingDown && (
                            <div className="w-full">
                                <RevealSummary
                                    votes={roomState.votes}
                                    votingSystem={roomState.votingSystem}
                                    isVisible={roomState.revealed && !isCountingDown}
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
                onClose={() => navigate({ to: "/" })}
                onSubmit={handleNameSubmit}
                initialValue={name || ""}
                isLoading={isAuthLoading}
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
                        enableCountdown: roomState.enableCountdown,
                    }}
                    canChangeVotingSystem={!hasVotes}
                />
            )}

            <RecoveryCodeModal
                isOpen={isRecoveryModalOpen}
                onClose={() => setIsRecoveryModalOpen(false)}
                recoveryCode={newRecoveryCode}
            />
            <ErrorModal
                isOpen={isErrorModalOpen}
                onClose={() => {
                    setIsErrorModalOpen(false);
                    navigate({ to: "/" });
                }}
                title="Cannot Join Room"
                message={blockingError}
            />
            <LeaveRoomModal
                isOpen={isLeaveModalOpen}
                onClose={() => setIsLeaveModalOpen(false)}
                onConfirm={confirmLeaveGame}
            />
        </PageLayout>
    );
};
