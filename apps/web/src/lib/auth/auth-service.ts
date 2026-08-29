import { supabase } from './supabase';
import { useAuthStore } from '../../store/auth.store';
import type { AuthError } from '@supabase/supabase-js';

export interface AuthResult<T = unknown> {
  data: T | null;
  error: string | null;
}

export class AuthService {
  private static mapAuthError(error: AuthError | Error): string {
    const msg = error.message.toLowerCase();
    if (msg.includes('invalid login credentials') || msg.includes('invalid_grant')) {
      return 'Invalid email or password. Please try again.';
    }
    if (msg.includes('user already registered') || msg.includes('user_already_exists')) {
      return 'An account with this email already exists.';
    }
    if (msg.includes('rate limit') || msg.includes('over_email_send_rate_limit')) {
      return 'Too many attempts. Please wait a few minutes before trying again.';
    }
    if (msg.includes('email not confirmed')) {
      return 'Please verify your email address before signing in.';
    }
    if (msg.includes('network') || msg.includes('fetch')) {
      return 'Network connection error. Please check your internet connection.';
    }
    return 'An unexpected error occurred. Please try again.';
  }

  static async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { data: null, error: this.mapAuthError(error) };
      }

      useAuthStore.getState().setSession(data.session);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: this.mapAuthError(err as Error) };
    }
  }

  static async signUpWithEmail(name: string, email: string, password: string): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: name.trim() },
        },
      });

      if (error) {
        return { data: null, error: this.mapAuthError(error) };
      }

      if (data.session) {
        useAuthStore.getState().setSession(data.session);
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: this.mapAuthError(err as Error) };
    }
  }

  static async sendPasswordResetEmail(email: string): Promise<AuthResult> {
    try {
      const redirectUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/login`
          : 'http://localhost:3000/login';

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });

      if (error) {
        return { data: null, error: this.mapAuthError(error) };
      }

      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: this.mapAuthError(err as Error) };
    }
  }

  static async signInWithGoogle(): Promise<AuthResult> {
    try {
      const redirectUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/projects`
          : 'http://localhost:3000/projects';

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });

      if (error) {
        return { data: null, error: this.mapAuthError(error) };
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: this.mapAuthError(err as Error) };
    }
  }

  static async signOut(): Promise<void> {
    await supabase.auth.signOut();
    useAuthStore.getState().reset();
  }
}