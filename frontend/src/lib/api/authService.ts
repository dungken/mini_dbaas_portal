// Auth Service - API calls cho authentication
// Hiện tại dùng mock data, sau này chỉ cần thay apiClient.baseURL và các endpoint

import { apiClient } from './axios';

// Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    tenant_id: number;
    role: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface RegisterResponse {
  message: string;
  user_id: number;
}

// Mock users database - 4 users với 4 role để test
const mockUsers = [
  {
    id: 1,
    email: 'superadmin@example.com',
    password: 'superadmin123', // In real app, this would be hashed
    name: 'Super Admin',
    tenant_id: 1,
    role: 'SuperAdmin',
    status: 'active',
  },
  {
    id: 2,
    email: 'tenantadmin@example.com',
    password: 'tenantadmin123',
    name: 'Tenant Admin',
    tenant_id: 1,
    role: 'TenantAdmin',
    status: 'active',
  },
  {
    id: 3,
    email: 'developer@example.com',
    password: 'developer123',
    name: 'Developer',
    tenant_id: 1,
    role: 'Developer',
    status: 'active',
  },
  {
    id: 4,
    email: 'viewer@example.com',
    password: 'viewer123',
    name: 'Viewer',
    tenant_id: 1,
    role: 'viewer',
    status: 'active',
  },
  // Giữ lại admin và user cũ để backward compatibility
  {
    id: 5,
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Admin User',
    tenant_id: 1,
    role: 'admin',
    status: 'active',
  },
  {
    id: 6,
    email: 'user@example.com',
    password: 'user123',
    name: 'Test User',
    tenant_id: 1,
    role: 'viewer',
    status: 'active',
  },
];

// API Functions
export const authService = {
  // Login
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
      return response.data;
    } catch (error) {
      // Mock data fallback
      console.warn('API failed, using mock data:', error);

      // Find user in mock database
      const user = mockUsers.find(
        (u) => u.email === credentials.email && u.password === credentials.password
      );

      if (!user) {
        throw new Error('Invalid email or password');
      }

      if (user.status !== 'active') {
        throw new Error('Account is not active. Please verify your email.');
      }

      // Generate mock JWT token (in real app, this comes from backend)
      const mockToken = `mock_jwt_token_${user.id}_${user.tenant_id}_${user.role}`;

      return {
        token: mockToken,
        user: {
          id: user.id,
          tenant_id: user.tenant_id,
          role: user.role,
        },
      };
    }
  },

  // Register
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await apiClient.post<RegisterResponse>('/auth/register', data);
      return response.data;
    } catch (error) {
      // Mock data fallback
      console.warn('API failed, using mock data:', error);

      // Check if email already exists
      const existingUser = mockUsers.find((u) => u.email === data.email);
      if (existingUser) {
        throw new Error('Email already exists');
      }

      // Create new mock user
      const newUser = {
        id: mockUsers.length + 1,
        email: data.email,
        password: data.password,
        name: data.name,
        tenant_id: 1,
        role: 'viewer',
        status: 'pending', // Needs email verification
      };

      mockUsers.push(newUser);

      console.log('[VERIFY TOKEN]: mock_verification_token_' + newUser.id);

      return {
        message: 'Registration successful. Please check your email for verification link.',
        user_id: newUser.id,
      };
    }
  },

  // Forgot password
  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      // Mock data fallback
      console.warn('API failed, using mock data:', error);

      const user = mockUsers.find((u) => u.email === email);
      if (!user) {
        // Don't reveal if user exists or not for security
        return {
          message: 'If the email exists, a password reset link has been sent.',
        };
      }

      const resetToken = `mock_reset_token_${user.id}`;
      console.log('[RESET TOKEN]:', resetToken);

      return {
        message: 'Password reset link has been sent to your email.',
      };
    }
  },

  // Verify email
  async verifyEmail(token: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.get(`/auth/verify-email?token=${token}`);
      return response.data;
    } catch (error) {
      // Mock data fallback
      console.warn('API failed, using mock data:', error);

      // In real app, token would be validated
      const userId = token.replace('mock_verification_token_', '');
      const user = mockUsers.find((u) => u.id.toString() === userId);

      if (!user) {
        throw new Error('Invalid verification token');
      }

      user.status = 'active';

      return {
        message: 'Email verified successfully.',
      };
    }
  },

  // Reset password
  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post('/auth/reset-password', {
        token,
        password,
      });
      return response.data;
    } catch (error) {
      // Mock data fallback
      console.warn('API failed, using mock data:', error);

      // In real app, token would be validated
      const userId = token.replace('mock_reset_token_', '');
      const user = mockUsers.find((u) => u.id.toString() === userId);

      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      user.password = password; // In real app, this would be hashed

      return {
        message: 'Password reset successfully.',
      };
    }
  },
};

