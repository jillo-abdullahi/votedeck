import React, { useState } from "react";
import { motion } from "motion/react";
import { PageLayout } from "@/components/PageLayout";
import { Link } from "@tanstack/react-router";
import { Header } from "../components/Header";
import { UserMenu } from "@/components/UserMenu";
import { useQueryClient } from "@tanstack/react-query";
import { useGetRoomsMy, getGetRoomsMyQueryKey, type GetRoomsMy200 } from "@/lib/api/generated";
import { RoomCard, type RoomWithMeta } from "@/components/RoomCard";
import { RoomCardSkeleton } from "@/components/RoomCardSkeleton";
import { ArrowRight, SpadeIcon, AlertCircle } from "lucide-react";
import { DeleteRoomModal } from "@/components/modals/DeleteRoomModal";
import { useMyRoomsSocket } from "@/hooks/useMyRoomsSocket";
import { Button } from "@/components/ui/button";
import { JoinRoomModal } from "@/components/modals/JoinRoomModal";
import { useAuth } from "@/hooks/useAuth";


export const MyRoomsPage: React.FC = () => {
    const queryClient = useQueryClient();
    // Auth Data
    const { user, loading: authLoading } = useAuth();

    const { data: roomsData, isLoading: loading, error: queryError } = useGetRoomsMy(undefined, {
        query: {
            enabled: !authLoading && !!user
        }
    });

    // State
    const [roomToDelete, setRoomToDelete] = useState<RoomWithMeta | null>(null);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

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
                                {f === 'all' ? 'All' : f === 'owned' ? 'Owned' : 'Joined'}
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

                {loading || authLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <RoomCardSkeleton key={i} />
                        ))}
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
                                    : "Games you joined but don't own will appear here."
                            }
                        </p>
                        {filter === 'joined' ? <Button size="lg" onClick={() => setIsJoinModalOpen(true)}>
                            <div className="inline-flex items-center gap-2">
                                Join a game
                                <ArrowRight size={18} />
                            </div>
                        </Button> :
                            <Button asChild size="lg">
                                <Link
                                    to="/create"
                                    className="inline-flex items-center gap-2"
                                >
                                    Create a game
                                    <ArrowRight size={18} />
                                </Link>
                            </Button>}

                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedRooms.map((room, index) => (
                            <RoomCard
                                key={room.id}
                                room={room}
                                currentUserId={user?.uid}
                                userName={userName}
                                index={index}
                                onDelete={(r) => setRoomToDelete(r)}
                            />
                        ))}
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
            <JoinRoomModal
                isOpen={isJoinModalOpen}
                onClose={() => setIsJoinModalOpen(false)}
            />
        </PageLayout>
    );
};
