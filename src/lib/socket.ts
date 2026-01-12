import { io, Socket } from 'socket.io-client';

// Connect directly to backend (bypass Vite proxy to avoid EPIPE errors)
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const socket: Socket = io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
    transports: ['websocket'],
    path: '/socket.io'
});
