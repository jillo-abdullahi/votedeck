import { useEffect, useState, useCallback } from 'react';
import { socket } from '../lib/socket';
import { userManager } from '../lib/user';
import type { RoomState, VoteValue } from '../types';

export const useSocket = (roomId: string | undefined, name: string | undefined) => {
    const [roomState, setRoomState] = useState<RoomState | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const userId = userManager.getUserId();

    useEffect(() => {
        if (!roomId || !name) return;

        // Connect socket
        socket.connect();

        const onConnect = () => {
            setIsConnected(true);
            setError(null);
            // Join room once connected
            socket.emit('JOIN_ROOM', { roomId, userId, name });
        };

        const onDisconnect = () => {
            setIsConnected(false);
        };

        const onRoomState = (state: RoomState) => {
            setRoomState(state);
        };

        const onError = (err: { message: string }) => {
            setError(err.message);
        };

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('ROOM_STATE', onRoomState);
        socket.on('ERROR', onError);

        // If already connected, join immediately
        if (socket.connected) {
            onConnect();
        }

        return () => {
            socket.emit('LEAVE_ROOM');
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('ROOM_STATE', onRoomState);
            socket.off('ERROR', onError);
            socket.disconnect();
        };
    }, [roomId, name, userId]);

    const castVote = useCallback((value: VoteValue) => {
        socket.emit('CAST_VOTE', { value });
    }, []);

    const revealVotes = useCallback(() => {
        socket.emit('REVEAL');
    }, []);

    const resetVotes = useCallback(() => {
        socket.emit('RESET');
    }, []);

    const leaveRoom = useCallback(() => {
        socket.emit('LEAVE_ROOM');
        socket.disconnect();
    }, []);

    const updateName = useCallback((newName: string) => {
        socket.emit('UPDATE_NAME', { name: newName });
    }, []);

    const updateSettings = useCallback((settings: { name?: string; votingSystem?: string; revealPolicy?: string }) => {
        socket.emit('UPDATE_SETTINGS', settings);
    }, []);

    return {
        roomState,
        isConnected,
        error,
        userId,
        castVote,
        revealVotes,
        resetVotes,
        leaveRoom,
        updateName,
        updateSettings,
    };
};
