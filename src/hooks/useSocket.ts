import { useEffect, useState, useCallback, useRef } from 'react';
import { socket } from '../lib/socket';
import { userManager } from '../lib/user';
import type { RoomState, VoteValue } from '../types';

export const useSocket = (roomId: string | undefined, name: string | undefined, enabled: boolean = true) => {
    const [roomState, setRoomState] = useState<RoomState | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isRoomClosed, setIsRoomClosed] = useState(false);
    const [countdownAction, setCountdownAction] = useState<{ duration: number } | null>(null);

    const userId = userManager.getUserId();
    // Token is now handled via HTTP-only cookies

    // Track name in ref to avoid reconnecting when only name changes
    const nameRef = useRef(name);
    useEffect(() => {
        nameRef.current = name;
    }, [name]);

    const hasName = !!name;

    useEffect(() => {
        // We only connect if we have a roomId and a name, and are enabled
        if (!roomId || !name || !enabled) return;

        // Connect socket
        socket.connect();

        const onConnect = () => {
            setIsConnected(true);
            setError(null);
            // Join room once connected
            // userId is still passed for legacy/mapping purposes, 
            // but server also gets it from JWT
            socket.emit('JOIN_ROOM', { roomId, userId, name: nameRef.current });
        };

        const onConnectError = (err: Error) => {
            console.error('Socket connection error:', err.message);

            // Check if error is related to authentication
            if (err.message.includes('Authentication error') || err.message.includes('Invalid token') || err.message.includes('jwt expired')) {
                // If auth fails, the cookie is likely invalid/expired.
                socket.disconnect();
                setError('Authentication failed. Please reload the page.');

                // Optional: Redirect to home if critical, but keeping error state is safer for now
                // window.location.href = '/'; 
            } else {
                setError(`Connection error: ${err.message}`);
            }
        };

        const onDisconnect = () => {
            setIsConnected(false);
        };

        const onRoomState = (state: RoomState) => {
            setRoomState(state);
            // If room becomes revealed, clear any active countdown
            if (state.revealed) {
                setCountdownAction(null);
            }
        };

        const onCountdownStart = (payload: { duration: number }) => {
            setCountdownAction(payload);
        };

        const onRoomClosed = () => {
            setIsRoomClosed(true);
            socket.disconnect();
        };

        const onError = (err: { message: string }) => {
            setError(err.message);
        };

        socket.on('connect', onConnect);
        socket.on('connect_error', onConnectError);
        socket.on('disconnect', onDisconnect);
        socket.on('ROOM_STATE', onRoomState);
        socket.on('COUNTDOWN_START', onCountdownStart);
        socket.on('ROOM_CLOSED', onRoomClosed);
        socket.on('ERROR', onError);

        // If already connected, join immediately
        if (socket.connected) {
            onConnect();
        }

        return () => {
            if (socket.connected) {
                // Modified to pass payload only if really needed, but sticking to simple emit for now as per previous verified state
                socket.emit('LEAVE_ROOM');
            }
            socket.off('connect', onConnect);
            socket.off('connect_error', onConnectError);
            socket.off('disconnect', onDisconnect);
            socket.off('ROOM_STATE', onRoomState);
            socket.off('COUNTDOWN_START', onCountdownStart);
            socket.off('ROOM_CLOSED', onRoomClosed);
            socket.off('ERROR', onError);
            socket.disconnect();
        };
    }, [roomId, userId, hasName, enabled]); // Name removed to prevent reconnects on name change, but we need to connect when name becomes available

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

    const updateSettings = useCallback((settings: { name?: string; votingSystem?: string; revealPolicy?: string; enableCountdown?: boolean }) => {
        socket.emit('UPDATE_SETTINGS', settings);
    }, []);

    return {
        roomState,
        isConnected,
        error,
        isRoomClosed,
        userId,
        countdownAction,
        castVote,
        revealVotes,
        resetVotes,
        leaveRoom,
        updateName,
        updateSettings,
    };
};
