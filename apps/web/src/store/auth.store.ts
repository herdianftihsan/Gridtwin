import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  isInitialized: false,
  setSession: (session) => set({ session, user: session?.user ?? null, isLoading: false, isInitialized: true }),
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ user: null, session: null, isLoading: false, isInitialized: true }),
}));