// src/stores/authStore.ts
// Global state for the logged-in user (persisted in localStorage)

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

interface User {
  id:             string;
  email:          string;
  username:       string;
  firstName:      string;
  lastName:       string;
  role:           string;
  avatarUrl?:     string;
  membershipPlan: string;
}

interface AuthState {
  user:         User | null;
  accessToken:  string | null;
  refreshToken: string | null;
  isLoading:    boolean;

  login:        (email: string, password: string) => Promise<any>;
  logout:       () => Promise<void>;
  register:     (data: any) => Promise<void>;
  updateUser:   (data: Partial<User>) => void;
  setTokens:    (access: string, refresh: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user:         null,
      accessToken:  null,
      refreshToken: null,
      isLoading:    false,

      // ── Login ────────────────────────────────────────────────────────────────
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });

          // Requires 2FA
          if (data.requires2FA) {
            set({ isLoading: false });
            return data;
          }

          // Store tokens
          localStorage.setItem('accessToken',  data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);

          set({
            user:         data.user,
            accessToken:  data.accessToken,
            refreshToken: data.refreshToken,
            isLoading:    false,
          });

          return data;
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      // ── Logout ───────────────────────────────────────────────────────────────
      logout: async () => {
        try {
          const refreshToken = get().refreshToken;
          await api.post('/auth/logout', { refreshToken });
        } catch {}
        localStorage.clear();
        set({ user: null, accessToken: null, refreshToken: null });
        window.location.href = '/login';
      },

      // ── Register ─────────────────────────────────────────────────────────────
      register: async (data) => {
        await api.post('/auth/register', data);
      },

      // ── Helpers ──────────────────────────────────────────────────────────────
      updateUser: (data) => set((state) => ({ user: state.user ? { ...state.user, ...data } : null })),

      setTokens: (access, refresh) => {
        localStorage.setItem('accessToken',  access);
        localStorage.setItem('refreshToken', refresh);
        set({ accessToken: access, refreshToken: refresh });
      },
    }),
    {
      name:    'taskearn-auth',    // localStorage key
      partialize: (s) => ({ user: s.user, accessToken: s.accessToken, refreshToken: s.refreshToken }),
    }
  )
);
