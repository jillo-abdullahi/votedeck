import type { Server as SocketIOServer, Socket } from 'socket.io';
import type { JoinRoomPayload, CastVotePayload } from '../types/index.js';
import { roomStore } from '../store/roomStore.js';

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
            const roomState = roomStore.getRoomState(roomId);
            if (roomState) {
                io.to(roomId).emit('ROOM_STATE', roomState);
            }

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
            const roomState = roomStore.getRoomState(roomId);
            if (roomState) {
                io.to(roomId).emit('ROOM_STATE', roomState);
            }

            console.log(`User ${user.name} voted: ${value} in room ${roomId}`);
        });

        /**
         * REVEAL
         * Reveal all votes
         */
        socket.on('REVEAL', () => {
            const userInfo = roomStore.getUserBySocketId(socket.id);
            if (!userInfo) {
                socket.emit('ERROR', { message: 'User not found in any room' });
                return;
            }

            const { roomId } = userInfo;

            const success = roomStore.revealVotes(roomId);
            if (!success) {
                socket.emit('ERROR', { message: 'Failed to reveal votes' });
                return;
            }

            // Broadcast updated room state
            const roomState = roomStore.getRoomState(roomId);
            if (roomState) {
                io.to(roomId).emit('ROOM_STATE', roomState);
            }

            console.log(`Votes revealed in room ${roomId}`);
        });

        /**
         * RESET
         * Reset all votes
         */
        socket.on('RESET', () => {
            const userInfo = roomStore.getUserBySocketId(socket.id);
            if (!userInfo) {
                socket.emit('ERROR', { message: 'User not found in any room' });
                return;
            }

            const { roomId } = userInfo;

            const success = roomStore.resetVotes(roomId);
            if (!success) {
                socket.emit('ERROR', { message: 'Failed to reset votes' });
                return;
            }

            // Broadcast updated room state
            const roomState = roomStore.getRoomState(roomId);
            if (roomState) {
                io.to(roomId).emit('ROOM_STATE', roomState);
            }

            console.log(`Votes reset in room ${roomId}`);
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
            const roomState = roomStore.getRoomState(roomId);
            if (roomState) {
                io.to(roomId).emit('ROOM_STATE', roomState);
            }

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
                const roomState = roomStore.getRoomState(roomId);
                if (roomState) {
                    io.to(roomId).emit('ROOM_STATE', roomState);
                }

                console.log(`User ${user.name} disconnected from room ${roomId}`);
            }

            console.log(`Socket disconnected: ${socket.id}`);
        });
    });
}
