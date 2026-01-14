import React, { useState, useRef } from "react";
import { motion } from "motion/react";
import { PageLayout } from "@/components/PageLayout";
import { Link } from "@tanstack/react-router";
import { Header } from "../components/Header";
import { UserMenu } from "@/components/UserMenu";
import { useQueryClient } from "@tanstack/react-query";
import { useGetRoomsMy, getGetRoomsMyQueryKey, type GetRoomsMy200, type GetRoomsMy200RoomsItem } from "@/lib/api/generated";
import { Calendar, ArrowRight, SpadeIcon, Check, AlertCircle } from "lucide-react";
import { Trash2Icon, type Trash2IconHandle } from "@/components/icons/Trash2Icon";
import { DeleteRoomModal } from "@/components/modals/DeleteRoomModal";
import { useMyRoomsSocket } from "@/hooks/useMyRoomsSocket";
import { RoomAvatar } from "@/components/RoomAvatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Tooltip } from "@/components/ui/tooltip";
import { ClipboardIcon, type ClipboardIconHandle } from "@/components/icons/ClipboardIcon";


export const MyRoomsPage: React.FC = () => {
    const queryClient = useQueryClient();
    // Auth Data
    const { user, loading: authLoading } = useAuth();

    const { data: roomsData, isLoading: loading, error: queryError } = useGetRoomsMy(undefined, {
        query: {
            enabled: !authLoading && !!user
        }
    });

    // Define extended type for local usage
    type RoomWithMeta = GetRoomsMy200RoomsItem & { activeUsers?: number; adminId?: string };

    // State
    const [roomToDelete, setRoomToDelete] = useState<RoomWithMeta | null>(null);
    const [isCopied, setIsCopied] = useState<boolean>(false);
    const clipboardRef = useRef<ClipboardIconHandle>(null);
    const trashRef = useRef<Trash2IconHandle>(null);

    const userName = user?.displayName || user?.email?.split('@')[0];

    // Listen for real-time updates and update Query Cache
    useMyRoomsSocket((payload) => {
        queryClient.setQueryData(getGetRoomsMyQueryKey(), (old: GetRoomsMy200 | undefined) => {
            if (!old?.rooms) return old;
            return {
                ...old,
                rooms: old.rooms.map(room =>
                    room.id === payload.roomId
                        ? { ...room, activeUsers: payload.activeUsers }
                        : room
                )
            };
        });

        // Also update selected room if modal is open
        if (roomToDelete?.id === payload.roomId) {
            setRoomToDelete(prev => prev ? { ...prev, activeUsers: payload.activeUsers } : null);
        }
    });

    const [filter, setFilter] = useState<'all' | 'owned' | 'joined'>('all');

    // Derived state
    const rooms = (roomsData?.rooms || []) as RoomWithMeta[];
    const ownedRooms = rooms.filter(room => user?.uid === room.adminId);
    const joinedRooms = rooms.filter(room => user?.uid !== room.adminId);

    // Filtered list for display
    const displayedRooms = filter === 'all'
        ? rooms
        : filter === 'owned'
            ? ownedRooms
            : joinedRooms;

    const ownedRoomsCount = ownedRooms.length;

    // Error handling
    const error = queryError ? "Failed to load your rooms. Please try again." : null;

    return (
        <PageLayout>
            <Header>
                {userName ? (
                    <UserMenu name={userName} photoURL={user?.photoURL} />
                ) : null}
                <Button asChild className="hidden md:block">
                    <Link to="/create">
                        Start new game
                    </Link>
                </Button>
            </Header>

            <main className="w-full px-2 py-10 md:p-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl sm:text-3xl font-semibold">My Games</h1>
                        {(roomsData?.total || 0) > 0 && (
                            <span className="text-slate-400 bg-slate-800 px-3 py-1 rounded-full text-sm font-medium">
                                {roomsData?.total}
                            </span>
                        )}
                    </div>

                    {/* Filter Controls */}
                    <div className="flex bg-slate-800/50 p-1 gap-1 rounded-lg self-start md:self-auto">
                        {(['all', 'owned', 'joined'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`
                                    px-4 py-1.5 cursor-pointer rounded-md text-sm font-medium transition-all
                                    ${filter === f
                                        ? 'bg-slate-700 text-white shadow-sm'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                                    }
                                `}
                            >
                                {f === 'all' ? 'All' : f === 'owned' ? 'My Rooms' : 'Joined'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Game Limit Banner - Only show if OWNED games >= 10 */}
                {ownedRoomsCount >= 10 && filter !== 'joined' && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-center gap-4 text-yellow-200"
                    >
                        <AlertCircle size={32} className="text-yellow-500 shrink-0" />
                        <div className="border-l border-yellow-500/10 pl-4">
                            <h4 className="font-bold text-yellow-400">Game Limit Reached</h4>
                            <p className="text-sm text-yellow-200/80">
                                You have reached the maximum limit of 10 created games. Please delete some games to create a new one.
                            </p>
                        </div>
                    </motion.div>
                )}

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : error ? (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-xl text-center">
                        {error}
                    </div>
                ) : displayedRooms.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="text-center py-20 px-4 bg-slate-800/30 rounded-3xl border-2 border-dashed border-slate-700"
                    >
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                            <SpadeIcon size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                            No games found
                        </h3>
                        <p className="text-slate-400 mb-8 max-w-sm mx-auto">
                            {filter === 'all'
                                ? "You haven't created or joined any games yet."
                                : filter === 'owned'
                                    ? "You haven't created any games yet."
                                    : "You haven't joined any games yet."
                            }
                        </p>
                        <Button asChild size="lg">
                            <Link
                                to="/create"
                                className="inline-flex items-center gap-2"
                            >
                                Start new game
                                <ArrowRight size={18} />
                            </Link>
                        </Button>

                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedRooms.map((room, index) => {
                            const isAdmin = user?.uid === room.adminId;
                            // Fix date parsing if createdAt is optional
                            const date = room.createdAt ? new Date(room.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            }) : '';
                            const hasActiveUsers = (room.activeUsers || 0) > 0;

                            // Copy Handler
                            const handleCopy = (e: React.MouseEvent, id: string) => {
                                e.preventDefault();
                                e.stopPropagation();
                                navigator.clipboard.writeText(id);
                                setIsCopied(true);
                                setTimeout(() => setIsCopied(false), 2000);
                            };

                            return (
                                <Link
                                    key={room.id}
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
                                                        setRoomToDelete(room);
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
                        })}
                    </div>
                )}
            </main>
            {/* Modal handling */}
            <DeleteRoomModal
                isOpen={!!roomToDelete}
                onClose={() => setRoomToDelete(null)}
                onDeleted={() => {
                    queryClient.invalidateQueries({ queryKey: getGetRoomsMyQueryKey() });
                    setRoomToDelete(null);
                }}
                roomId={roomToDelete?.id || ''}
                roomName={roomToDelete?.name || ''}
                activeUsers={roomToDelete?.activeUsers || 0}
            />
        </PageLayout>
    );
};
