import axios from 'axios';
import type { VotingSystemId, RoomState } from '../types';
import { userManager } from './user';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

// Add interceptor to attach JWT
api.interceptors.request.use((config) => {
    const token = userManager.getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add interceptor to handle 401s
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't retried yet, AND it's not the refresh endpoint itself
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
            originalRequest._retry = true;

            try {
                // Call refresh endpoint
                const { accessToken } = await authApi.refresh();

                // Update user manager with new token
                userManager.setAccessToken(accessToken);

                // Update header
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                // Retry original request
                return api(originalRequest);
            } catch (refreshError) {
                // If refresh fails, user is truly unauthorized
                // Redirect to home/login and clear any local state if needed
                if (window.location.pathname !== '/') {
                    // Optional: window.location.href = '/'; 
                }
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export interface CreateRoomResponse {
    roomId: string;
    joinUrl: string;
    accessToken: string;
    userId: string;
    recoveryCode?: string;
}

export interface AuthResponse {
    userId: string;
    accessToken: string;
    recoveryCode?: string;
}

export const authApi = {
    loginAnonymous: async (): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/anonymous');
        return response.data;
    },
    restore: async (recoveryCode: string): Promise<AuthResponse & { name: string }> => {
        const response = await api.post<AuthResponse & { name: string }>('/auth/restore', { recoveryCode });
        return response.data;
    },
    refresh: async (): Promise<{ accessToken: string }> => {
        const response = await api.post<{ accessToken: string }>('/auth/refresh');
        return response.data;
    }
};

export const roomsApi = {
    createRoom: async (name: string, votingSystem: VotingSystemId, adminName: string): Promise<CreateRoomResponse> => {
        const response = await api.post<CreateRoomResponse>('/rooms', { name, votingSystem, adminName });
        return response.data;
    },

    getRoom: async (id: string): Promise<RoomState> => {
        const response = await api.get<RoomState>(`/rooms/${id}`);
        return response.data;
    },

    getMyRooms: async (limit: number = 20, offset: number = 0): Promise<{ rooms: any[], total: number }> => {
        const response = await api.get<{ rooms: any[], total: number }>('/rooms/my', {
            params: { limit, offset }
        });
        return response.data;
    }
};
