import { useEffect } from 'react';
import { socket } from '../lib/socket';
import { useAuth } from './useAuth';


export const useMyRoomsSocket = (onRoomUpdate: (payload: any) => void) => {
    const { user, loading } = useAuth();

    useEffect(() => {
        if (loading) return;

        const connect = async () => {
            if (user) {
                const token = await user.getIdToken();
                socket.auth = { token };
            }
            // Ensure clean state
            if (socket.connected) socket.disconnect();
            socket.connect();
        };

        connect();

        const onConnectError = (err: Error) => {
            console.error('MyRooms socket error:', err.message);
        };

        const onUpdate = (payload: any) => {
            if (onRoomUpdate) onRoomUpdate(payload);
        };

        socket.on('connect_error', onConnectError);
        socket.on('MY_ROOM_UPDATE', onUpdate);

        return () => {
            socket.off('connect_error', onConnectError);
            socket.off('MY_ROOM_UPDATE', onUpdate);
            socket.disconnect();
        };
    }, [onRoomUpdate, user, loading]);
};
