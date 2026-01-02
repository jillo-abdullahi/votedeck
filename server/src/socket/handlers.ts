import type { Server as SocketIOServer, Socket } from 'socket.io';
import type { JoinRoomPayload, CastVotePayload, UpdateNamePayload, UpdateSettingsPayload } from '../types/index.js';
import { roomStore } from '../store/roomStore.js';

/**
 * Helper to broadcast personalized room states to all users in a room
 */
async function broadcastRoomState(io: SocketIOServer, roomId: string) {
    const room = await roomStore.getRoom(roomId);
    if (!room) return;

    // Fetch all active sockets in this room
    const sockets = await io.in(roomId).fetchSockets();

    // Send personalized state to each socket
    for (const socket of sockets) {
        const userId = (socket as any).userId;
        const personalizedState = await roomStore.getRoomState(roomId, userId);
        if (personalizedState) {
            socket.emit('ROOM_STATE', personalizedState);
        }
    }
}

export function setupSocketHandlers(io: SocketIOServer) {
    io.on('connection', (socket: Socket) => {
        console.log(`Socket connected: ${socket.id}`);

        /**
         * JOIN_ROOM
         */
        socket.on('JOIN_ROOM', async (payload: JoinRoomPayload) => {
            const { roomId, userId, name } = payload;

            const room = await roomStore.getRoom(roomId);
            if (!room) {
                socket.emit('ERROR', { message: 'Room not found' });
                return;
            }

            // Map socket to user/room for disconnection handling
            await roomStore.mapSocket(socket.id, userId, roomId);

            // Add user to room
            const success = await roomStore.addUser(roomId, {
                id: userId,
                name,
                socketId: socket.id,
            });

            if (!success) {
                socket.emit('ERROR', { message: 'Failed to join room' });
                return;
            }

            // Join socket room
            socket.join(roomId);

            // Broadcast updated room state
            await broadcastRoomState(io, roomId);

            console.log(`User ${name} (${userId}) joined room ${roomId}`);
        });

        /**
         * CAST_VOTE
         */
        socket.on('CAST_VOTE', async (payload: CastVotePayload) => {
            const userInfo = await roomStore.getUserBySocketId(socket.id);
            if (!userInfo) {
                socket.emit('ERROR', { message: 'User not found in any room' });
                return;
            }

            const { user, roomId } = userInfo;
            const { value } = payload;

            const success = await roomStore.castVote(roomId, user.id, value);
            if (!success) {
                socket.emit('ERROR', { message: 'Failed to cast vote' });
                return;
            }

            await broadcastRoomState(io, roomId);
        });

        /**
         * REVEAL
         */
        socket.on('REVEAL', async () => {
            const userId = (socket as any).userId;
            const role = (socket as any).role;

            const userInfo = await roomStore.getUserBySocketId(socket.id);
            if (!userInfo) {
                socket.emit('ERROR', { message: 'User not found' });
                return;
            }

            const { roomId } = userInfo;
            const room = await roomStore.getRoom(roomId);

            if (!room) {
                socket.emit('ERROR', { message: 'Room not found' });
                return;
            }

            // Role check
            if (role !== 'host' && room.adminId !== userId && room.revealPolicy !== 'everyone') {
                socket.emit('ERROR', { message: 'Only the host can reveal votes' });
                return;
            }

            const success = await roomStore.revealVotes(roomId);
            if (!success) {
                socket.emit('ERROR', { message: 'Failed to reveal votes' });
                return;
            }

            await broadcastRoomState(io, roomId);
        });

        /**
         * RESET
         */
        socket.on('RESET', async () => {
            const userId = (socket as any).userId;
            const role = (socket as any).role;

            const userInfo = await roomStore.getUserBySocketId(socket.id);
            if (!userInfo) {
                socket.emit('ERROR', { message: 'User not found' });
                return;
            }

            const { roomId } = userInfo;
            const room = await roomStore.getRoom(roomId);

            if (!room) {
                socket.emit('ERROR', { message: 'Room not found' });
                return;
            }

            // Role check
            if (role !== 'host' && room.adminId !== userId && room.revealPolicy !== 'everyone') {
                socket.emit('ERROR', { message: 'Only the host can reset the vote' });
                return;
            }

            const success = await roomStore.resetVotes(roomId);
            if (!success) {
                socket.emit('ERROR', { message: 'Failed to reset votes' });
                return;
            }

            await broadcastRoomState(io, roomId);
        });

        /**
         * UPDATE_NAME
         */
        socket.on('UPDATE_NAME', async (payload: UpdateNamePayload) => {
            const userInfo = await roomStore.getUserBySocketId(socket.id);
            if (!userInfo) return;

            const { user, roomId } = userInfo;
            const { name } = payload;

            await roomStore.updateUser(roomId, user.id, { name });
            await broadcastRoomState(io, roomId);
        });

        /**
         * UPDATE_SETTINGS
         */
        socket.on('UPDATE_SETTINGS', async (payload: UpdateSettingsPayload) => {
            const userId = (socket as any).userId;
            const role = (socket as any).role;

            const userInfo = await roomStore.getUserBySocketId(socket.id);
            if (!userInfo) return;

            const { roomId } = userInfo;
            const room = await roomStore.getRoom(roomId);

            if (!room || (role !== 'host' && room.adminId !== userId)) return;

            await roomStore.updateSettings(roomId, payload);
            await broadcastRoomState(io, roomId);
        });

        /**
         * LEAVE_ROOM
         */
        socket.on('LEAVE_ROOM', async () => {
            const userInfo = await roomStore.getUserBySocketId(socket.id);
            if (!userInfo) return;

            const { user, roomId } = userInfo;

            await roomStore.removeUser(roomId, user.id);
            await roomStore.unmapSocket(socket.id);
            socket.leave(roomId);

            await broadcastRoomState(io, roomId);
        });

        /**
         * disconnect
         */
        socket.on('disconnect', async () => {
            const userInfo = await roomStore.getUserBySocketId(socket.id);
            if (userInfo) {
                const { user, roomId } = userInfo;

                await roomStore.removeUser(roomId, user.id);
                await roomStore.unmapSocket(socket.id);

                await broadcastRoomState(io, roomId);
            }
        });
    });
}
