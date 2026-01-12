import React, { useEffect, useState, useRef } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Link } from "@tanstack/react-router";
import { Header } from "../components/Header";
import { UserMenu } from "@/components/UserMenu";
import { useQueryClient } from "@tanstack/react-query";
import { useGetRoomsMy, getGetRoomsMyQueryKey, type GetRoomsMy200, type GetRoomsMy200RoomsItem } from "@/lib/api/generated";
import { Calendar, ArrowRight, SpadeIcon } from "lucide-react";
import { Trash2Icon, type Trash2IconHandle } from "@/components/icons/Trash2Icon";
import { DeleteRoomModal } from "@/components/modals/DeleteRoomModal";
import { useMyRoomsSocket } from "@/hooks/useMyRoomsSocket";
import { RoomAvatar } from "@/components/RoomAvatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export const MyRoomsPage: React.FC = () => {
    const queryClient = useQueryClient();
    const { data: roomsData, isLoading: loading, error: queryError } = useGetRoomsMy();

    // Define extended type for local usage
    type RoomWithMeta = GetRoomsMy200RoomsItem & { activeUsers?: number };

    // State
    const [roomToDelete, setRoomToDelete] = useState<RoomWithMeta | null>(null);
    const trashRef = useRef<Trash2IconHandle>(null);

    // Auth Data
    const { user } = useAuth();
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

    // Error handling
    const error = queryError ? "Failed to load your rooms. Please try again." : null;

    useEffect(() => {
        if (queryError) {
            // global interceptor handles 401
        }
    }, [queryError]);

    return (
        <PageLayout>
            <Header>
                {userName ? (
                    <UserMenu name={userName} photoURL={user?.photoURL} />
                ) : (
                    <Link
                        to="/"
                        className="text-slate-300 hover:text-white font-medium text-sm transition-colors"
                    >
                        Back to Home
                    </Link>
                )}
                <Button asChild>
                    <Link to="/create">
                        Start new game
                    </Link>
                </Button>
            </Header>

            <main className="w-full p-12">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-semibold">My Games</h1>
                    {(roomsData?.total || 0) > 0 && <span className="text-slate-400 bg-slate-800 px-3 py-1 rounded-full text-sm font-medium">
                        {roomsData?.total} {roomsData?.total === 1 ? "game" : "games"}
                    </span>}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : error ? (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-xl text-center">
                        {error}
                    </div>
                ) : (roomsData?.rooms?.length || 0) === 0 ? (
                    <div className="text-center py-20 bg-slate-800/30 rounded-3xl border-2 border-dashed border-slate-700">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                            <SpadeIcon size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                            No games found
                        </h3>
                        <p className="text-slate-400 mb-8 max-w-sm mx-auto">
                            You haven't created or joined any games yet. Start a new game to
                            get going!
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

                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {((roomsData?.rooms || []) as RoomWithMeta[]).map((room, index) => {
                            const isAdmin = true; // For "My Rooms", user is always admin implied
                            // Fix date parsing if createdAt is optional
                            const date = room.createdAt ? new Date(room.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            }) : '';
                            const hasActiveUsers = (room.activeUsers || 0) > 0;

                            return (
                                <Link
                                    key={room.id}
                                    to="/room/$roomId"
                                    params={{ roomId: room.id! }}
                                    search={{ name: userName || undefined }}
                                    style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
                                    className="group block bg-slate-800/30 hover:bg-slate-700/30 ring-1 ring-slate-700/30 hover:ring-blue-500/50 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-xl relative animate-in fade-in duration-500"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="transition-transform group-hover:scale-105 duration-300">
                                            <RoomAvatar isAdmin={isAdmin} size="md" />
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            {isAdmin && (
                                                <span className="text-xs font-bold uppercase tracking-wider bg-purple-500/10 text-purple-300 px-2 py-1 rounded">
                                                    Host
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-2 truncate group-hover:text-blue-400 transition-colors">
                                        {room.name || "Untitled Game"}
                                    </h3>

                                    <div className="flex items-center gap-4 text-sm text-slate-400 mt-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} />
                                            <span>{date}</span>
                                        </div>
                                        {hasActiveUsers && (
                                            <div className="flex items-center gap-1.5 text-green-400">
                                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                                <span className="text-xs font-medium">{room.activeUsers} active</span>
                                            </div>
                                        )}
                                    </div>

                                    {isAdmin && (
                                        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setRoomToDelete(room);
                                                }}
                                                onMouseEnter={() => trashRef.current?.startAnimation()}
                                                onMouseLeave={() => trashRef.current?.stopAnimation()}
                                                className="p-1 w-10 h-10 flex items-center justify-center cursor-pointer bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                                                title="Delete room"
                                            >
                                                <Trash2Icon ref={trashRef} size={20} />
                                            </button>
                                        </div>
                                    )}
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
