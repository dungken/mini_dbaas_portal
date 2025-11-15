// Invitation Service - API calls cho invitation flow
// Hiện tại dùng mock data, sau này chỉ cần thay apiClient.baseURL và các endpoint

import { apiClient } from './axios';

// Types
export interface InvitationDetails {
  email: string;
  tenant_name: string;
  role: string;
  valid: boolean;
}

export interface AcceptInviteRequest {
  token: string;
  first_name: string;
  last_name: string;
  password: string;
}

export interface AcceptInviteResponse {
  token: string;
  user: {
    id: number;
    tenant_id: number;
    role: string;
  };
}

// Mock invitations database
const mockInvitations: Record<string, InvitationDetails> = {
  'mock_invitation_token_1': {
    email: 'invited@example.com',
    tenant_name: 'Acme Corp',
    role: 'Developer',
    valid: true,
  },
};

// API Functions
export const invitationService = {
  // Get invitation details
  async getInvitationDetails(token: string): Promise<InvitationDetails> {
    try {
      const response = await apiClient.get<InvitationDetails>(`/auth/invite/details?token=${token}`);
      return response.data;
    } catch (error) {
      // Mock data fallback
      console.warn('API failed, using mock data:', error);
      const invitation = mockInvitations[token];
      if (!invitation) {
        throw new Error('Invalid or expired invitation token');
      }
      return invitation;
    }
  },

  // Accept invitation
  async acceptInvite(data: AcceptInviteRequest): Promise<AcceptInviteResponse> {
    try {
      const response = await apiClient.post<AcceptInviteResponse>('/auth/accept-invite', data);
      return response.data;
    } catch (error) {
      // Mock data fallback
      console.warn('API failed, using mock data:', error);

      const invitation = mockInvitations[data.token];
      if (!invitation) {
        throw new Error('Invalid or expired invitation token');
      }

      // Delete invitation after acceptance
      delete mockInvitations[data.token];

      return {
        token: `mock_jwt_token_new_user`,
        user: {
          id: 100,
          tenant_id: 1,
          role: invitation.role,
        },
      };
    }
  },
};

