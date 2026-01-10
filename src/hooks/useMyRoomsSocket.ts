import { useEffect } from 'react';
import { socket } from '../lib/socket';

interface RoomUpdatePayload {
    roomId: string;
    activeUsers: number;
}

export const useMyRoomsSocket = (onRoomUpdate: (payload: RoomUpdatePayload) => void) => {
    useEffect(() => {
        // Socket should automatically send cookies
        socket.connect();

        const onConnectError = (err: Error) => {
            console.error('Socket connection error:', err.message);
        };

        socket.on('connect_error', onConnectError);
        socket.on('MY_ROOM_UPDATE', onRoomUpdate);

        return () => {
            socket.off('connect_error', onConnectError);
            socket.off('MY_ROOM_UPDATE', onRoomUpdate);
            socket.disconnect();
        };
    }, [onRoomUpdate]);
};
