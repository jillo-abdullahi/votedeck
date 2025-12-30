// Domain types for VoteDeck backend

export type VotingSystemId = 'fibonacci' | 'modified_fibonacci' | 'tshirts' | 'powers_2';

export interface User {
    id: string;
    name: string;
    socketId: string;
}

export interface Room {
    id: string;
    name: string;
    votingSystem: VotingSystemId;
    users: Map<string, User>;
    votes: Map<string, string | null>;
    revealed: boolean;
    createdAt: Date;
}

export interface RoomState {
    id: string;
    name: string;
    votingSystem: VotingSystemId;
    users: Array<{
        id: string;
        name: string;
        hasVoted: boolean;
    }>;
    votes: Record<string, string | null>;
    revealed: boolean;
}

// Socket.IO event payloads
export interface JoinRoomPayload {
    roomId: string;
    userId: string;
    name: string;
}

export interface CastVotePayload {
    value: string;
}

export interface CreateRoomRequest {
    name: string;
    votingSystem: VotingSystemId;
}

export interface CreateRoomResponse {
    roomId: string;
    joinUrl: string;
}
