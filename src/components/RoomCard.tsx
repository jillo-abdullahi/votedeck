import React, { useState, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { Tooltip } from "@/components/ui/tooltip";
import { ClipboardIcon, type ClipboardIconHandle } from "@/components/icons/ClipboardIcon";
import { Trash2Icon, type Trash2IconHandle } from "@/components/icons/Trash2Icon";
import { RoomAvatar } from "@/components/RoomAvatar";
import { Check, Calendar } from "lucide-react";
import { type GetRoomsMy200RoomsItem } from "@/lib/api/generated";

export type RoomWithMeta = GetRoomsMy200RoomsItem & {
    activeUsers?: number;
    adminId?: string;
};

interface RoomCardProps {
    room: RoomWithMeta;
    currentUserId?: string;
    userName?: string | null;
    index: number;
    onDelete: (room: RoomWithMeta) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, currentUserId, userName, index, onDelete }) => {
    const [isCopied, setIsCopied] = useState<boolean>(false);
    const clipboardRef = useRef<ClipboardIconHandle>(null);
    const trashRef = useRef<Trash2IconHandle>(null);

    const isAdmin = currentUserId === room.adminId;
    // Fix date parsing if createdAt is optional
    const date = room.createdAt ? new Date(room.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }) : '';
    const hasActiveUsers = (room.activeUsers || 0) > 0;

    const handleCopy = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(id);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <Link
            to="/room/$roomId"
            params={{ roomId: room.id! }}
            search={{ name: userName || undefined }}
            style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
            className="group flex flex-col justify-between bg-slate-800/30 hover:bg-slate-700/30 ring-1 ring-slate-700/30 hover:ring-blue-500/50 rounded-2xl p-4 transition-all hover:-translate-y-1 hover:shadow-xl relative animate-in fade-in duration-500"
        >
            {/* Top Section: Avatar + Info */}
            <div className="flex items-start gap-4 mb-6">
                <div className="shrink-0 transition-transform group-hover:scale-105 duration-300">
                    <RoomAvatar isAdmin={isAdmin} size="lg" />
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                        {room.name || "Untitled Game"}
                    </h3>
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-400">
                            {room.id}
                        </span>
                        <Tooltip content={isCopied ? "Copied!" : "Copy Game ID"}>
                            <button
                                className="w-6 h-6 flex items-center justify-center cursor-pointer hover:bg-slate-700/50 rounded-md transition-colors text-slate-400 hover:text-slate-200"
                                onMouseEnter={() => clipboardRef.current?.startAnimation()}
                                onMouseLeave={() => clipboardRef.current?.stopAnimation()}
                                onClick={(e) => handleCopy(e, room.id!)}
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
            </div>

            {/* Bottom Section: Meta + Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-700/30 mt-auto">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                    {isAdmin && (
                        <span className="font-bold uppercase tracking-wider bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded-[4px]">
                            Host
                        </span>
                    )}
                    <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        <span className="text-sm">{date}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {hasActiveUsers && (
                        <div className="flex items-center gap-1.5 text-green-400 mr-2" title={`${room.activeUsers} active users`}>
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-xs font-medium">{room.activeUsers}</span>
                        </div>
                    )}

                    {isAdmin && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onDelete(room);
                            }}
                            onMouseEnter={() => trashRef.current?.startAnimation()}
                            onMouseLeave={() => trashRef.current?.stopAnimation()}
                            className="w-8 h-8 flex items-center justify-center cursor-pointer bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
                            title="Delete room"
                        >
                            <Trash2Icon ref={trashRef} size={16} />
                        </button>
                    )}
                </div>
            </div>
        </Link>
    );
};
