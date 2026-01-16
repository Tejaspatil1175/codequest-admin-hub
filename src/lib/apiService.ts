import api from './api';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface LoginRequest {
      email: string;
      password: string;
}

export interface RegisterRequest {
      username: string;
      email: string;
      password: string;
      teamName: string;
      role: 'admin';
}

export interface AuthResponse {
      success: boolean;
      token: string;
      user: {
            id: string;
            username: string;
            email: string;
            teamName: string;
            role: string;
      };
}

export interface CreateRoomRequest {
      roomName: string;
      initialPoints: number;
}

export interface RoomResponse {
      success: boolean;
      data: {
            _id: string;
            roomCode: string;
            roomName: string;
            initialPoints: number;
            adminId: string;
            status: string;
            participants: any[];
            questions: any[];
            createdAt: string;
      };
}

export interface QuestionRequest {
      title: string;
      description: string;
      inputFormat: string;
      outputFormat: string;
      constraints: string;
      examples: Array<{
            input: string;
            output: string;
            explanation: string;
      }>;
      testCases: Array<{
            input: string;
            expectedOutput: string;
            isHidden: boolean;
      }>;
      points: number;
      difficulty: 'easy' | 'medium' | 'hard';
      accessCode?: string;
}

export interface QuestionResponse {
      success: boolean;
      data: {
            _id: string;
            title: string;
            description: string;
            points: number;
            difficulty: string;
            accessCode?: string;
      };
}

// ============================================================================
// AUTHENTICATION APIs
// ============================================================================

export const apiService = {
      // Auth - Login
      async login(credentials: LoginRequest): Promise<AuthResponse> {
            const response = await api.post<AuthResponse>('/auth/login', credentials);
            return response.data;
      },

      // Auth - Register
      async register(userData: RegisterRequest): Promise<AuthResponse> {
            const response = await api.post<AuthResponse>('/auth/register', userData);
            return response.data;
      },

      // Auth - Get Current User
      async getCurrentUser(): Promise<AuthResponse['user']> {
            const response = await api.get<{ success: boolean; user: AuthResponse['user'] }>('/auth/me');
            return response.data.user;
      },

      // ============================================================================
      // ROOM MANAGEMENT APIs
      // ============================================================================

      // Create Room
      async createRoom(roomData: CreateRoomRequest): Promise<RoomResponse> {
            const response = await api.post<RoomResponse>('/admin/rooms', roomData);
            return response.data;
      },

      // Get My Rooms
      async getMyRooms(): Promise<{ success: boolean; data: RoomResponse['data'][] }> {
            const response = await api.get<{ success: boolean; data: RoomResponse['data'][] }>('/admin/my-rooms');
            return response.data;
      },

      // Close Room
      async closeRoom(roomId: string): Promise<{ success: boolean; message: string }> {
            const response = await api.put<{ success: boolean; message: string }>(`/admin/rooms/${roomId}/close`);
            return response.data;
      },

      // Reopen Room
      async reopenRoom(roomId: string): Promise<{ success: boolean; message: string }> {
            const response = await api.put<{ success: boolean; message: string }>(`/admin/rooms/${roomId}/reopen`);
            return response.data;
      },

      // Delete Room
      async deleteRoom(roomId: string): Promise<{ success: boolean; message: string }> {
            const response = await api.delete<{ success: boolean; message: string }>(`/admin/rooms/${roomId}`);
            return response.data;
      },

      // ============================================================================
      // QUESTION MANAGEMENT APIs
      // ============================================================================

      // Add Question to Room
      async addQuestion(roomId: string, questionData: QuestionRequest): Promise<QuestionResponse> {
            const response = await api.post<QuestionResponse>(`/rooms/${roomId}/questions`, questionData);
            return response.data;
      },

      // ============================================================================
      // PARTICIPANT MANAGEMENT APIs
      // ============================================================================

      // Get Room Participants
      async getRoomParticipants(roomId: string): Promise<{ success: boolean; data: any[] }> {
            const response = await api.get<{ success: boolean; data: any[] }>(`/admin/rooms/${roomId}/participants`);
            return response.data;
      },

      // Get Leaderboard
      async getLeaderboard(roomId: string): Promise<{ success: boolean; data: any[] }> {
            const response = await api.get<{ success: boolean; data: any[] }>(`/admin/rooms/${roomId}/leaderboard`);
            return response.data;
      },

      // Ban User
      async banUser(roomId: string, playerId: string): Promise<{ success: boolean; message: string }> {
            const response = await api.put<{ success: boolean; message: string }>(`/admin/rooms/${roomId}/ban/${playerId}`);
            return response.data;
      },

      // Unban User
      async unbanUser(roomId: string, playerId: string): Promise<{ success: boolean; message: string }> {
            const response = await api.put<{ success: boolean; message: string }>(`/admin/rooms/${roomId}/unban/${playerId}`);
            return response.data;
      },

      // ============================================================================
      // TRANSACTION MONITORING APIs
      // ============================================================================

      // Get All Room Transactions
      async getRoomTransactions(roomId: string): Promise<{ success: boolean; data: any[] }> {
            const response = await api.get<{ success: boolean; data: any[] }>(`/rooms/${roomId}/transactions/all`);
            return response.data;
      },
};
