import { useEffect } from 'react';
import { socket } from '../lib/socket';
import { userManager } from '../lib/user';

interface RoomUpdatePayload {
    roomId: string;
    activeUsers: number;
}

export const useMyRoomsSocket = (onRoomUpdate: (payload: RoomUpdatePayload) => void) => {
    const token = userManager.getAccessToken();

    useEffect(() => {
        if (!token) return;

        socket.auth = { token };
        socket.connect();

        const onConnectError = async (err: Error) => {
            console.error('Socket connection error:', err.message);
            if (err.message.includes('Authentication error') || err.message.includes('Invalid token') || err.message.includes('jwt expired')) {
                try {
                    console.log('Attempting to refresh token...');
                    const { accessToken } = await import('../lib/api').then(m => m.authApi.refresh());
                    userManager.setAccessToken(accessToken);
                    socket.auth = { token: accessToken };
                    socket.connect();
                } catch (refreshErr) {
                    console.error('Failed to refresh token:', refreshErr);
                    userManager.setAccessToken(null);
                }
            }
        };

        socket.on('connect_error', onConnectError);
        socket.on('MY_ROOM_UPDATE', onRoomUpdate);

        return () => {
            socket.off('connect_error', onConnectError);
            socket.off('MY_ROOM_UPDATE', onRoomUpdate);
            // We disconnect when leaving the dashboard to save resources?
            // Yes, standard practice for this app so far.
            socket.disconnect();
        };
    }, [token, onRoomUpdate]);
};
