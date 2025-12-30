import type { Room, RoomState, User, VotingSystemId } from '../types/index.js';
import { generateRoomId } from '../utils/roomId.js';

// In-memory storage for rooms
const rooms = new Map<string, Room>();

export const roomStore = {
    /**
     * Create a new room
     */
    createRoom(name: string, votingSystem: VotingSystemId): Room {
        const room: Room = {
            id: generateRoomId(),
            name,
            votingSystem,
            users: new Map(),
            votes: new Map(),
            revealed: false,
            createdAt: new Date(),
        };

        rooms.set(room.id, room);
        return room;
    },

    /**
     * Get room by ID
     */
    getRoom(roomId: string): Room | undefined {
        return rooms.get(roomId);
    },

    /**
     * Add user to room
     */
    addUser(roomId: string, user: User): boolean {
        const room = rooms.get(roomId);
        if (!room) return false;

        room.users.set(user.id, user);
        room.votes.set(user.id, null);
        return true;
    },

    /**
     * Remove user from room
     */
    removeUser(roomId: string, userId: string): boolean {
        const room = rooms.get(roomId);
        if (!room) return false;

        room.users.delete(userId);
        room.votes.delete(userId);
        return true;
    },

    /**
     * Get user by socket ID
     */
    getUserBySocketId(socketId: string): { user: User; roomId: string } | undefined {
        for (const [roomId, room] of rooms.entries()) {
            for (const user of room.users.values()) {
                if (user.socketId === socketId) {
                    return { user, roomId };
                }
            }
        }
        return undefined;
    },

    /**
     * Cast a vote
     */
    castVote(roomId: string, userId: string, value: string): boolean {
        const room = rooms.get(roomId);
        if (!room || room.revealed) return false;

        room.votes.set(userId, value);
        return true;
    },

    /**
     * Reveal all votes
     */
    revealVotes(roomId: string): boolean {
        const room = rooms.get(roomId);
        if (!room) return false;

        room.revealed = true;
        return true;
    },

    /**
     * Reset votes
     */
    resetVotes(roomId: string): boolean {
        const room = rooms.get(roomId);
        if (!room) return false;

        room.revealed = false;
        for (const userId of room.users.keys()) {
            room.votes.set(userId, null);
        }
        return true;
    },

    /**
     * Get room state for broadcasting
     */
    getRoomState(roomId: string): RoomState | undefined {
        const room = rooms.get(roomId);
        if (!room) return undefined;

        const users = Array.from(room.users.values()).map(user => ({
            id: user.id,
            name: user.name,
            hasVoted: room.votes.get(user.id) !== null,
        }));

        const votes: Record<string, string | null> = {};
        if (room.revealed) {
            for (const [userId, vote] of room.votes.entries()) {
                votes[userId] = vote;
            }
        }

        return {
            id: room.id,
            name: room.name,
            votingSystem: room.votingSystem,
            users,
            votes,
            revealed: room.revealed,
        };
    },
};
