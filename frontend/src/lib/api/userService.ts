// User Service - API calls cho user management
// Hiện tại dùng mock data, sau này chỉ cần thay apiClient.baseURL và các endpoint

import { apiClient } from './axios';

// Types
export interface User {
  id: number;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  bio?: string;
  role: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  bio?: string;
}

export interface UserPreferences {
  notification_preferences: boolean;
  default_theme: 'light' | 'dark' | 'system';
  email_notifications: boolean;
  [key: string]: any;
}

export interface InviteUserRequest {
  email: string;
  role: string;
}

export interface InviteUserResponse {
  message: string;
  invitation_token: string;
}

// Mock users database
const mockUsers: User[] = [
  {
    id: 1,
    email: 'admin@example.com',
    name: 'Admin User',
    first_name: 'Admin',
    last_name: 'User',
    role: 'admin',
    status: 'active',
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 2,
    email: 'user@example.com',
    name: 'Test User',
    first_name: 'Test',
    last_name: 'User',
    role: 'viewer',
    status: 'active',
    created_at: '2025-01-02T00:00:00Z',
  },
  {
    id: 3,
    email: 'dev@example.com',
    name: 'Developer User',
    first_name: 'Developer',
    last_name: 'User',
    role: 'Developer',
    status: 'active',
    created_at: '2025-01-03T00:00:00Z',
  },
];

const mockUserPreferences: Record<number, UserPreferences> = {
  1: {
    notification_preferences: true,
    default_theme: 'dark',
    email_notifications: true,
  },
  2: {
    notification_preferences: false,
    default_theme: 'light',
    email_notifications: false,
  },
};

// API Functions
export const userService = {
  // Get current user
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<User>('/api/v1/users/me');
      return response.data;
    } catch (error) {
      // Mock data fallback
      console.warn('API failed, using mock data:', error);
      const { useAuthStore } = await import('../store/authStore');
      const authUser = useAuthStore.getState()?.user;
      if (authUser) {
        const mockUser = mockUsers.find((u) => u.id === authUser.id);
        if (mockUser) return mockUser;
      }
      return mockUsers[0];
    }
  },

  // Update current user
  async updateCurrentUser(data: UpdateUserRequest): Promise<User> {
    try {
      const response = await apiClient.put<User>('/api/v1/users/me', data);
      return response.data;
    } catch (error) {
      // Mock data fallback
      console.warn('API failed, using mock data:', error);
      const { useAuthStore } = await import('../store/authStore');
      const authUser = useAuthStore.getState()?.user;
      if (authUser) {
        const mockUser = mockUsers.find((u) => u.id === authUser.id);
        if (mockUser) {
          Object.assign(mockUser, data);
          mockUser.name = `${data.first_name || mockUser.first_name || ''} ${data.last_name || mockUser.last_name || ''}`.trim();
          return mockUser;
        }
      }
      throw new Error('User not found');
    }
  },

  // Get user preferences
  async getUserPreferences(): Promise<UserPreferences> {
    try {
      const response = await apiClient.get<UserPreferences>('/api/v1/users/me/preferences');
      return response.data;
    } catch (error) {
      // Mock data fallback
      console.warn('API failed, using mock data:', error);
      const { useAuthStore } = await import('../store/authStore');
      const authUser = useAuthStore.getState()?.user;
      if (authUser && mockUserPreferences[authUser.id]) {
        return mockUserPreferences[authUser.id];
      }
      return {
        notification_preferences: true,
        default_theme: 'system',
        email_notifications: true,
      };
    }
  },

  // Update user preferences
  async updateUserPreferences(preferences: UserPreferences): Promise<UserPreferences> {
    try {
      const response = await apiClient.put<UserPreferences>('/api/v1/users/me/preferences', preferences);
      return response.data;
    } catch (error) {
      // Mock data fallback
      console.warn('API failed, using mock data:', error);
      const { useAuthStore } = await import('../store/authStore');
      const authUser = useAuthStore.getState()?.user;
      if (authUser) {
        mockUserPreferences[authUser.id] = preferences;
        return preferences;
      }
      throw new Error('User not found');
    }
  },

  // Get all users in tenant
  async getTenantUsers(): Promise<User[]> {
    try {
      const response = await apiClient.get<User[]>('/api/v1/tenant/users');
      return response.data;
    } catch (error) {
      // Mock data fallback
      console.warn('API failed, using mock data:', error);
      return mockUsers;
    }
  },

  // Invite user
  async inviteUser(data: InviteUserRequest): Promise<InviteUserResponse> {
    try {
      const response = await apiClient.post<InviteUserResponse>('/api/v1/users/invite', data);
      return response.data;
    } catch (error: any) {
      // If it's a 403 quota error from API, rethrow it
      if (error.response?.status === 403) {
        throw error;
      }

      // Mock data fallback
      console.warn('API failed, using mock data:', error);

      const newUser: User = {
        id: mockUsers.length + 1,
        email: data.email,
        name: data.email.split('@')[0],
        first_name: data.email.split('@')[0],
        role: data.role,
        status: 'active',
        created_at: new Date().toISOString(),
      };
      mockUsers.push(newUser);

      const token = `mock_invitation_token_${newUser.id}`;
      // Mock: Only log token in development, don't show in UI anymore
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        console.log('[INVITE LINK]: /accept-invite?token=' + token);
      }

      return {
        message: 'Invitation sent successfully',
        invitation_token: token,
      };
    }
  },

  // Update user role
  async updateUserRole(userId: number, role: string): Promise<User> {
    try {
      const response = await apiClient.put<User>(`/api/v1/tenant/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      // Mock data fallback
      console.warn('API failed, using mock data:', error);
      const user = mockUsers.find((u) => u.id === userId);
      if (user) {
        user.role = role;
        return user;
      }
      throw new Error('User not found');
    }
  },

  // Deactivate user
  async deactivateUser(userId: number): Promise<void> {
    try {
      await apiClient.delete(`/api/v1/tenant/users/${userId}`);
    } catch (error) {
      // Mock data fallback
      console.warn('API failed, using mock data:', error);
      const user = mockUsers.find((u) => u.id === userId);
      if (user) {
        user.status = 'inactive';
      }
    }
  },
};

// Export mockUsers để có thể update từ component
export { mockUsers };
