import type { Room, RoomState, User, VotingSystemId } from '../types/index.js';
import { generateRoomId } from '../utils/roomId.js';

// In-memory storage for rooms
const rooms = new Map<string, Room>();

export const roomStore = {
    /**
     * Create a new room
     */
    createRoom(name: string, votingSystem: VotingSystemId, adminId: string): Room {
        const room: Room = {
            id: generateRoomId(),
            name,
            adminId,
            votingSystem,
            revealPolicy: 'everyone', // Default policy
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

        const wasAdmin = room.adminId === userId;

        room.users.delete(userId);
        room.votes.delete(userId);

        // If the admin left, promote the next user and reset reveal policy
        if (wasAdmin && room.users.size > 0) {
            const nextAdmin = room.users.values().next().value as User;
            room.adminId = nextAdmin.id;

            // Automatically revert reveal policy to 'everyone' to prevent locking
            // especially in large rooms where the new admin might be unknown.
            room.revealPolicy = 'everyone';

            console.log(`User ${userId} (admin) left room ${roomId}. Promoted user ${nextAdmin.id} (${nextAdmin.name}) to admin and reset policy to 'everyone'.`);
        }

        // If the room is empty, we could delete it, but for now we'll keep it simple.
        return true;
    },

    /**
     * Update user information
     */
    updateUser(roomId: string, userId: string, updates: Partial<User>): boolean {
        const room = rooms.get(roomId);
        if (!room) return false;

        const user = room.users.get(userId);
        if (!user) return false;

        room.users.set(userId, { ...user, ...updates });
        return true;
    },

    /**
     * Update room settings
     */
    updateSettings(roomId: string, updates: Partial<Pick<Room, 'name' | 'votingSystem' | 'revealPolicy'>>): boolean {
        const room = rooms.get(roomId);
        if (!room) return false;

        if (updates.name !== undefined) room.name = updates.name;
        if (updates.votingSystem !== undefined) room.votingSystem = updates.votingSystem;
        if (updates.revealPolicy !== undefined) room.revealPolicy = updates.revealPolicy;

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

        // Allow unvoting by sending null or empty string
        const voteValue = (value === null || value === "") ? null : value;
        room.votes.set(userId, voteValue);
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
     * Get room state for broadcasting (optionally personalized for a user)
     */
    getRoomState(roomId: string, forUserId?: string): RoomState | undefined {
        const room = rooms.get(roomId);
        if (!room) return undefined;

        const users = Array.from(room.users.values()).map(user => ({
            id: user.id,
            name: user.name,
            hasVoted: room.votes.get(user.id) !== null,
        }));

        const votes: Record<string, string | null> = {};
        if (room.revealed) {
            // Everyone sees everything
            for (const [userId, vote] of room.votes.entries()) {
                votes[userId] = vote;
            }
        } else if (forUserId) {
            // User sees only their own vote
            const myVote = room.votes.get(forUserId);
            if (myVote) {
                votes[forUserId] = myVote;
            }
        }

        return {
            id: room.id,
            name: room.name,
            adminId: room.adminId,
            votingSystem: room.votingSystem,
            revealPolicy: room.revealPolicy,
            users,
            votes,
            revealed: room.revealed,
        };
    },
};
