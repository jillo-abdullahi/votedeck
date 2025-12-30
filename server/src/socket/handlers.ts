import type { Server as SocketIOServer, Socket } from 'socket.io';
import type { JoinRoomPayload, CastVotePayload, UpdateNamePayload, UpdateSettingsPayload } from '../types/index.js';
import { roomStore } from '../store/roomStore.js';

/**
 * Helper to broadcast personalized room states to all users in a room
 */
function broadcastRoomState(io: SocketIOServer, roomId: string) {
    const room = roomStore.getRoom(roomId);
    if (!room) return;

    room.users.forEach((user) => {
        const roomState = roomStore.getRoomState(roomId, user.id);
        if (roomState) {
            io.to(user.socketId).emit('ROOM_STATE', roomState);
        }
    });
}

export function setupSocketHandlers(io: SocketIOServer) {
    io.on('connection', (socket: Socket) => {
        console.log(`Socket connected: ${socket.id}`);

        /**
         * JOIN_ROOM
         * Add user to a room
         */
        socket.on('JOIN_ROOM', (payload: JoinRoomPayload) => {
            const { roomId, userId, name } = payload;

            const room = roomStore.getRoom(roomId);
            if (!room) {
                socket.emit('ERROR', { message: 'Room not found' });
                return;
            }

            // Add user to room
            const success = roomStore.addUser(roomId, {
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
            broadcastRoomState(io, roomId);

            console.log(`User ${name} (${userId}) joined room ${roomId}`);
        });

        /**
         * CAST_VOTE
         * Record a user's vote
         */
        socket.on('CAST_VOTE', (payload: CastVotePayload) => {
            const userInfo = roomStore.getUserBySocketId(socket.id);
            if (!userInfo) {
                socket.emit('ERROR', { message: 'User not found in any room' });
                return;
            }

            const { user, roomId } = userInfo;
            const { value } = payload;

            const success = roomStore.castVote(roomId, user.id, value);
            if (!success) {
                socket.emit('ERROR', { message: 'Failed to cast vote' });
                return;
            }

            // Broadcast updated room state
            broadcastRoomState(io, roomId);

            console.log(`User ${user.name} voted: ${value} (or cleared) in room ${roomId}`);
        });

        /**
         * REVEAL
         * Reveal all votes
         */
        socket.on('REVEAL', () => {
            const userInfo = roomStore.getUserBySocketId(socket.id);
            if (!userInfo) {
                socket.emit('ERROR', { message: 'User not found' });
                return;
            }

            const { roomId, user } = userInfo;
            const room = roomStore.getRoom(roomId);

            if (!room) {
                socket.emit('ERROR', { message: 'Room not found' });
                return;
            }

            // Check reveal policy
            if (room.revealPolicy === 'admin' && room.adminId !== user.id) {
                socket.emit('ERROR', { message: 'Only the administrator can reveal votes' });
                return;
            }

            const success = roomStore.revealVotes(roomId);
            if (!success) {
                socket.emit('ERROR', { message: 'Failed to reveal votes' });
                return;
            }

            // Broadcast updated room state
            broadcastRoomState(io, roomId);

            console.log(`Votes revealed in room ${roomId} by ${user.name}`);
        });

        /**
         * RESET
         * Reset all votes
         */
        socket.on('RESET', () => {
            const userInfo = roomStore.getUserBySocketId(socket.id);
            if (!userInfo) {
                socket.emit('ERROR', { message: 'User not found' });
                return;
            }

            const { roomId, user } = userInfo;
            const room = roomStore.getRoom(roomId);

            if (!room) {
                socket.emit('ERROR', { message: 'Room not found' });
                return;
            }

            // Resetting is also typically an admin-ish action, 
            // but we'll stay flexible unless specifically asked.
            // For now, let's keep it consistent with reveal if it's admin-only?
            // Actually, the user asked for reveal policy specifically.
            if (room.revealPolicy === 'admin' && room.adminId !== user.id) {
                socket.emit('ERROR', { message: 'Only the administrator can reset the vote' });
                return;
            }

            const success = roomStore.resetVotes(roomId);
            if (!success) {
                socket.emit('ERROR', { message: 'Failed to reset votes' });
                return;
            }

            // Broadcast updated room state
            broadcastRoomState(io, roomId);

            console.log(`Votes reset in room ${roomId} by ${user.name}`);
        });

        /**
         * UPDATE_NAME
         * Update a user's display name
         */
        socket.on('UPDATE_NAME', (payload: UpdateNamePayload) => {
            const userInfo = roomStore.getUserBySocketId(socket.id);
            if (!userInfo) {
                socket.emit('ERROR', { message: 'User not found' });
                return;
            }

            const { user, roomId } = userInfo;
            const { name } = payload;

            const success = roomStore.updateUser(roomId, user.id, { name });
            if (!success) {
                socket.emit('ERROR', { message: 'Failed to update name' });
                return;
            }

            // Broadcast updated room state
            broadcastRoomState(io, roomId);

            console.log(`User ${user.id} renamed to ${name} in room ${roomId}`);
        });

        /**
         * UPDATE_SETTINGS
         * Update room settings (Admin only)
         */
        socket.on('UPDATE_SETTINGS', (payload: UpdateSettingsPayload) => {
            const userInfo = roomStore.getUserBySocketId(socket.id);
            if (!userInfo) {
                socket.emit('ERROR', { message: 'User not found' });
                return;
            }

            const { user, roomId } = userInfo;
            const room = roomStore.getRoom(roomId);

            if (!room) {
                socket.emit('ERROR', { message: 'Room not found' });
                return;
            }

            // Admin check
            if (room.adminId !== user.id) {
                socket.emit('ERROR', { message: 'Only the administrator can change room settings' });
                return;
            }

            const success = roomStore.updateSettings(roomId, payload);
            if (!success) {
                socket.emit('ERROR', { message: 'Failed to update settings' });
                return;
            }

            // Broadcast updated room state
            broadcastRoomState(io, roomId);

            console.log(`Room ${roomId} settings updated by admin ${user.name}`);
        });

        /**
         * LEAVE_ROOM
         * Remove user from room
         */
        socket.on('LEAVE_ROOM', () => {
            const userInfo = roomStore.getUserBySocketId(socket.id);
            if (!userInfo) {
                return;
            }

            const { user, roomId } = userInfo;

            roomStore.removeUser(roomId, user.id);
            socket.leave(roomId);

            // Broadcast updated room state
            broadcastRoomState(io, roomId);

            console.log(`User ${user.name} left room ${roomId}`);
        });

        /**
         * disconnect
         * Handle socket disconnection
         */
        socket.on('disconnect', () => {
            const userInfo = roomStore.getUserBySocketId(socket.id);
            if (userInfo) {
                const { user, roomId } = userInfo;

                roomStore.removeUser(roomId, user.id);

                // Broadcast updated room state
                broadcastRoomState(io, roomId);

                console.log(`User ${user.name} disconnected from room ${roomId}`);
            }

            console.log(`Socket disconnected: ${socket.id}`);
        });
    });
}
