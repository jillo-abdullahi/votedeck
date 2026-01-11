import { io, Socket } from 'socket.io-client';

// Connect to same origin (proxy handles forwarding)
const SOCKET_URL = '/';

export const socket: Socket = io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
    transports: ['polling'],
    path: '/socket.io'
});
