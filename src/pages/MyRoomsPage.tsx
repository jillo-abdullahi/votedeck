import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { Header } from "../components/Header";
import { UserMenu } from "@/components/UserMenu";
import { roomsApi } from "../lib/api";
import { userManager } from "../lib/user";
import { Calendar, ArrowRight, User } from "lucide-react";
import { Trash2Icon, type Trash2IconHandle } from "@/components/icons/Trash2Icon";
import { DeleteRoomModal } from "@/components/modals/DeleteRoomModal";
import { useMyRoomsSocket } from "@/hooks/useMyRoomsSocket";
import { RoomAvatar } from "@/components/RoomAvatar";

interface RoomSummary {
    id: string;
    name: string;
    createdAt: string;
    adminId: string;
    activeUsers?: number;
}

export const MyRoomsPage: React.FC = () => {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState<RoomSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [roomToDelete, setRoomToDelete] = useState<RoomSummary | null>(null);

    const [userName, setUserName] = useState(userManager.getUserName());
    const userId = userManager.getUserId();
    const trashRef = useRef<Trash2IconHandle>(null);

    // Listen for real-time updates
    useMyRoomsSocket((payload) => {
        setRooms(prev => prev.map(room =>
            room.id === payload.roomId
                ? { ...room, activeUsers: payload.activeUsers }
                : room
        ));

        // Also update selected room if modal is open
        if (roomToDelete?.id === payload.roomId) {
            setRoomToDelete(prev => prev ? { ...prev, activeUsers: payload.activeUsers } : null);
        }
    });

    useEffect(() => {
        // Redirect if not logged in
        if (!userManager.getAccessToken()) {
            navigate({ to: "/" });
            return;
        }

        const fetchRooms = async () => {
            try {
                setLoading(true);
                const data = await roomsApi.getMyRooms();
                setRooms(data.rooms);
                setTotal(data.total);
            } catch (err) {
                console.error("Failed to fetch rooms:", err);
                setError("Failed to load your rooms. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-blue-500/30">
            <Header>
                {userName ? (
                    <UserMenu name={userName} onNameChange={setUserName} />
                ) : (
                    <Link
                        to="/"
                        className="text-slate-300 hover:text-white font-medium text-sm transition-colors"
                    >
                        Back to Home
                    </Link>
                )}
                <Link
                    to="/create"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-all active:scale-95 ml-4"
                >
                    Start new game
                </Link>
            </Header>

            <main className="max-w-5xl mx-auto px-6 py-12">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">My Games</h1>
                    <span className="text-slate-400 bg-slate-800 px-3 py-1 rounded-full text-sm font-medium">
                        {total} {total === 1 ? "game" : "games"}
                    </span>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : error ? (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-xl text-center">
                        {error}
                    </div>
                ) : rooms.length === 0 ? (
                    <div className="text-center py-20 bg-slate-800/30 rounded-3xl border-2 border-dashed border-slate-700">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                            <User size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                            No games found
                        </h3>
                        <p className="text-slate-400 mb-8 max-w-sm mx-auto">
                            You haven't created or joined any games yet. Start a new game to
                            get going!
                        </p>
                        <Link
                            to="/create"
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all"
                        >
                            Start new game
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {rooms.map((room) => {
                            const isAdmin = room.adminId === userId;
                            const date = new Date(room.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            });
                            const hasActiveUsers = (room.activeUsers || 0) > 0;

                            return (
                                <Link
                                    key={room.id}
                                    to="/room/$roomId"
                                    params={{ roomId: room.id }}
                                    search={{ name: userName }}
                                    className="group block bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-blue-500/50 rounded-xl p-6 transition-all hover:-translate-y-1 hover:shadow-xl relative"
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

            <DeleteRoomModal
                isOpen={!!roomToDelete}
                onClose={() => setRoomToDelete(null)}
                onDeleted={() => {
                    if (roomToDelete) {
                        setRooms(prev => prev.filter(r => r.id !== roomToDelete.id));
                        setTotal(prev => prev - 1);
                    }
                }}
                roomId={roomToDelete?.id || ''}
                roomName={roomToDelete?.name || ''}
                activeUsers={roomToDelete?.activeUsers || 0}
            />
        </div>
    );
};
