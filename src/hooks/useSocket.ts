import { useEffect, useState, useCallback, useRef } from 'react';
import { socket } from '../lib/socket';
import { userManager } from '../lib/user';
import type { RoomState, VoteValue } from '../types';

export const useSocket = (roomId: string | undefined, name: string | undefined) => {
    const [roomState, setRoomState] = useState<RoomState | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isRoomClosed, setIsRoomClosed] = useState(false);

    const userId = userManager.getUserId();
    const token = userManager.getAccessToken();

    // Track name in ref to avoid reconnecting when only name changes
    const nameRef = useRef(name);
    useEffect(() => {
        nameRef.current = name;
    }, [name]);

    useEffect(() => {
        // We only connect if we have a roomId, a name, and a token
        if (!roomId || !name || !token) return;

        // Set token for authentication
        socket.auth = { token };

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

        const onConnectError = async (err: Error) => {
            console.error('Socket connection error:', err.message);

            // Check if error is related to authentication
            if (err.message.includes('Authentication error') || err.message.includes('Invalid token') || err.message.includes('jwt expired')) {
                // If we're already connecting/refreshing, don't cascade error yet
                try {
                    console.log('Attempting to refresh token...');
                    // Use dynamic import to avoid circular dependency
                    const { authApi } = await import('../lib/api');
                    const { accessToken } = await authApi.refresh();

                    userManager.setAccessToken(accessToken);

                    // Update socket auth and reconnect
                    socket.auth = { token: accessToken };
                    socket.connect();
                    console.log('Token refreshed and socket reconnecting...');

                    // Clear any previous error if we successfully triggered a reconnect
                    setError(null);
                } catch (refreshErr) {
                    console.error('Failed to refresh token:', refreshErr);
                    // Explicitly disconnect to stop retrying with bad token
                    socket.disconnect();
                    setError('Authentication failed. Please reload the page.');
                    userManager.setAccessToken(null);
                }
            } else {
                setError(`Connection error: ${err.message}`);
            }
        };

        const onDisconnect = () => {
            setIsConnected(false);
        };

        const onRoomState = (state: RoomState) => {
            setRoomState(state);
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
        socket.on('ROOM_CLOSED', onRoomClosed);
        socket.on('ERROR', onError);

        // If already connected, join immediately
        if (socket.connected) {
            onConnect();
        }

        return () => {
            socket.emit('LEAVE_ROOM');
            socket.off('connect', onConnect);
            socket.off('connect_error', onConnectError);
            socket.off('disconnect', onDisconnect);
            socket.off('ROOM_STATE', onRoomState);
            socket.off('ROOM_CLOSED', onRoomClosed);
            socket.off('ERROR', onError);
            socket.disconnect();
        };
    }, [roomId, userId, token]); // Name removed to prevent reconnects on name change

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
        isRoomClosed,
        userId,
        castVote,
        revealVotes,
        resetVotes,
        leaveRoom,
        updateName,
        updateSettings,
    };
};
