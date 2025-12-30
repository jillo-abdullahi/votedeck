import axios from 'axios';
import type { VotingSystemId, RoomState } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
    baseURL: API_URL,
});

export interface CreateRoomResponse {
    roomId: string;
    joinUrl: string;
}

export const roomsApi = {
    createRoom: async (name: string, votingSystem: VotingSystemId, adminId: string): Promise<CreateRoomResponse> => {
        const response = await api.post<CreateRoomResponse>('/rooms', { name, votingSystem, adminId });
        return response.data;
    },

    getRoom: async (id: string): Promise<RoomState> => {
        const response = await api.get<RoomState>(`/rooms/${id}`);
        return response.data;
    },
};
