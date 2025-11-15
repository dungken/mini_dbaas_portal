import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  user: {
    id: number;
    tenant_id: number;
    role: string;
  } | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: { id: number; tenant_id: number; role: string }) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token, user) => {
        set({ token, user, isAuthenticated: true });
      },
      clearAuth: () => {
        set({ token: null, user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

