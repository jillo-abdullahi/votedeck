import React, { useState, useRef } from "react";
import { UserAvatar } from "./UserAvatar";
import { ChevronDown, Pencil } from "lucide-react";
import { DisplayNameModal } from "./modals/DisplayNameModal";
import { userManager } from "@/lib/user";
import { usePostAuthLogout } from "@/lib/api/generated";
import { Link } from "@tanstack/react-router";
import { LayoutGridIcon, type LayoutGridHandle } from "./icons/LayoutGridIcon";
import { Button } from "@/components/ui/button";
import { LogoutIcon, type LogoutIconHandle } from "./icons/LogoutIcon";
import { JoinRoomModal } from "./modals/JoinRoomModal";
import { UsersIcon, type UsersHandle } from "./icons/UsersIcon";
import { PlusIcon, type PlusIconHandle } from "./icons/PlusIcon";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/context/ToastContext";

interface UserMenuProps {
    name: string;
    onNameChange?: (newName: string) => void;
    role?: string;
    onLogout?: () => void;
    photoURL?: string | null;
}

export const UserMenu: React.FC<UserMenuProps> = ({ name, onNameChange, role, onLogout, photoURL }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isNameModalOpen, setIsNameModalOpen] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

    const { updateUserProfile, signOut, user } = useAuth();

    // We keep this for now to clear cookies if backend uses them, but wrapped in try/catch safely
    const { mutateAsync: logoutBackend } = usePostAuthLogout();


    const layoutGridRef = useRef<LayoutGridHandle>(null);
    const logoutRef = useRef<LogoutIconHandle>(null);
    const joinRef = useRef<UsersHandle>(null);
    const plusRef = useRef<PlusIconHandle>(null);

    const { success, error } = useToast();

    const handleNameSubmit = async (newName: string) => {
        setIsNameModalOpen(false);

        // Optimistic update for local storage
        userManager.setUserName(newName);

        // Update Firebase Profile if logged in
        if (user) {
            try {
                await updateUserProfile({ displayName: newName });
                success("Name updated successfully");
            } catch (err) {
                console.error("Failed to update user profile:", err);
                error("Failed to update name");
            }
        }

        if (onNameChange) {
            onNameChange(newName);
        }
    };

    const handleLogout = async () => {
        try {
            // Firebase Sign Out (Primary)
            await signOut();

            // Backend Sign Out (Cleanup)
            try {
                await logoutBackend();
            } catch (err) {
                // Ignore backend logout errors if token is already gone or invalid
                console.warn("Backend logout warning", err);
            }
        } catch (error) {
            console.error("Logout failed", error);
        }

        // Clear local state
        userManager.setUserId("");
        userManager.setUserName("");

        if (onLogout) {
            onLogout();
        }
        // Force full reload to verify state is cleared and navbar updates
        window.location.href = "/";
    };

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex cursor-pointer items-center gap-3 hover:opacity-80 transition-opacity group"
            >
                <UserAvatar name={name || "Guest"} size={32} src={photoURL} />
                <div className="flex items-center gap-2">
                    <span className="text-white font-bold hidden sm:block text-lg truncate max-w-[120px]">
                        {name || "Guest"}
                    </span>
                    <ChevronDown
                        className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                </div>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 ring-1 ring-black/5">
                        <div className="p-4 border-b border-slate-800 flex items-center gap-4">
                            <div className="relative group/avatar cursor-pointer">
                                <UserAvatar name={name || "Guest"} size={role ? 48 : 32} src={photoURL} />
                            </div>
                            <div className="flex-1 flex flex-col justify-center items-start">
                                <div
                                    onClick={() => {
                                        setIsNameModalOpen(true);
                                        setIsOpen(false);
                                    }}
                                    className="flex items-center gap-2 group/name cursor-pointer hover:opacity-80 transition-opacity min-w-0"
                                >
                                    <span className="text-white font-bold text-lg truncate max-w-[150px]">
                                        {name || "Guest"}
                                    </span>
                                    <Pencil className="w-3.5 h-3.5 text-white/50 group-hover/name:text-white transition-colors shrink-0" />
                                </div>
                                {role && (
                                    <div className="text-slate-400 text-sm font-medium">
                                        {role}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="border-b border-slate-800/50">
                            {/* Start New Game (Mobile Only) */}
                            <Link
                                to="/create"
                                onMouseEnter={() => plusRef.current?.startAnimation()}
                                onMouseLeave={() => plusRef.current?.stopAnimation()}
                                onClick={() => setIsOpen(false)}
                                className="sm:hidden w-full flex items-center px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white font-medium transition-colors"
                            >
                                <PlusIcon ref={plusRef} className="w-6 h-6 mr-5 text-slate-400" />
                                <span className="text-[16px]">New Game</span>
                            </Link>

                            <Link
                                to="/my"
                                onClick={() => setIsOpen(false)}
                                className="w-full flex items-center px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white font-medium transition-colors"
                                onMouseEnter={() => layoutGridRef.current?.startAnimation()}
                                onMouseLeave={() => layoutGridRef.current?.stopAnimation()}
                            >
                                <LayoutGridIcon ref={layoutGridRef} className="w-6 h-6 mr-5 text-slate-400" />
                                <span className="text-[16px]">My Games</span>
                            </Link>

                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    setIsJoinModalOpen(true);
                                }}
                                className="w-full cursor-pointer flex items-center px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white font-medium transition-colors text-left"
                                onMouseEnter={() => joinRef.current?.startAnimation()}
                                onMouseLeave={() => joinRef.current?.stopAnimation()}
                            >
                                <UsersIcon ref={joinRef} className="w-6 h-6 mr-5 text-slate-400" size={24} />
                                <span className="text-[16px]">Join a game</span>
                            </button>
                        </div>

                        <div className="p-2">
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleLogout}
                                onMouseEnter={() => logoutRef.current?.startAnimation()}
                                onMouseLeave={() => logoutRef.current?.stopAnimation()}
                                className="w-full rounded-md font-medium"
                            >
                                <LogoutIcon ref={logoutRef} className="w-4 h-4 mr-2" />
                                <span className="text-[16px]">Sign out</span>
                            </Button>

                        </div>

                    </div>
                </>
            )}

            <DisplayNameModal
                isOpen={isNameModalOpen}
                onClose={() => setIsNameModalOpen(false)}
                onSubmit={handleNameSubmit}
                initialValue={name || ""}
            />

            <JoinRoomModal
                isOpen={isJoinModalOpen}
                onClose={() => setIsJoinModalOpen(false)}
            />
        </div>
    );
};
