import React, { useState, useRef } from "react";
import { UserAvatar } from "./UserAvatar";
import { ChevronDown, Pencil } from "lucide-react";
import { DisplayNameModal } from "./modals/DisplayNameModal";
import { RecoveryCodeModal } from "./modals/RecoveryCodeModal";
import { userManager } from "@/lib/user";
import { Link } from "@tanstack/react-router";
import { LayoutGridIcon, type LayoutGridHandle } from "./icons/LayoutGridIcon";
import { Button } from "@/components/ui/button";
import { KeyIcon, type KeyHandle } from "./icons/KeyIcon";
import { LogoutIcon, type LogoutIconHandle } from "./icons/LogoutIcon";
interface UserMenuProps {
    name: string;
    onNameChange?: (newName: string) => void;
    role?: string;
    onLogout?: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ name, onNameChange, role = "Guest user", onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isNameModalOpen, setIsNameModalOpen] = useState(false);
    const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);

    const layoutGridRef = useRef<LayoutGridHandle>(null);
    const keyRef = useRef<KeyHandle>(null);
    const logoutRef = useRef<LogoutIconHandle>(null);

    const handleNameSubmit = (newName: string) => {
        setIsNameModalOpen(false);
        userManager.setUserName(newName);
        if (onNameChange) {
            onNameChange(newName);
        }
    };

    const handleLogout = () => {
        userManager.setAccessToken(null);
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
                <UserAvatar name={name || "Guest"} size={32} />
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
                    <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 ring-1 ring-black/5">
                        <div className="p-4 border-b border-slate-700 flex items-center gap-4">
                            <div className="relative group/avatar cursor-pointer">
                                <UserAvatar name={name || "Guest"} size={48} />
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
                                <div className="text-slate-400 text-sm font-medium">
                                    {role}
                                </div>
                            </div>
                        </div>

                        <div className="border-b border-slate-700/50">
                            <Link
                                to="/my"
                                onClick={() => setIsOpen(false)}
                                className="w-full flex items-center px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-white font-medium transition-colors"
                                onMouseEnter={() => layoutGridRef.current?.startAnimation()}
                                onMouseLeave={() => layoutGridRef.current?.stopAnimation()}
                            >
                                <LayoutGridIcon ref={layoutGridRef} className="w-6 h-6 mr-5 text-slate-400" />
                                <span className="text-[16px]">My Games</span>
                            </Link>
                            <button
                                onClick={() => {
                                    setIsRecoveryModalOpen(true);
                                    setIsOpen(false);
                                }}
                                onMouseEnter={() => keyRef.current?.startAnimation()}
                                onMouseLeave={() => keyRef.current?.stopAnimation()}
                                className="w-full cursor-pointer flex items-center px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-white font-medium transition-colors"
                            >
                                <KeyIcon ref={keyRef} className="w-5 h-5 mr-5 text-slate-400" />
                                <span className="text-[16px]">My Sign-in Key</span>
                            </button>
                        </div>

                        <Button
                            variant="ghost"
                            onClick={handleLogout}
                            onMouseEnter={() => logoutRef.current?.startAnimation()}
                            onMouseLeave={() => logoutRef.current?.stopAnimation()}
                            className="w-full cursor-pointer justify-start text-left px-4 py-3 text-red-400 bg-transparent hover:bg-slate-700 hover:text-red-300 font-medium h-auto rounded-none"
                        >
                            <LogoutIcon ref={logoutRef} className="w-6 h-6 mr-2" />
                            <span className="text-[16px]">Sign out</span>
                        </Button>
                    </div>
                </>
            )}

            <DisplayNameModal
                isOpen={isNameModalOpen}
                onClose={() => setIsNameModalOpen(false)}
                onSubmit={handleNameSubmit}
                initialValue={name || ""}
            />

            <RecoveryCodeModal
                isOpen={isRecoveryModalOpen}
                onClose={() => setIsRecoveryModalOpen(false)}
                recoveryCode={userManager.getRecoveryCode()}
            />
        </div>
    );
};
