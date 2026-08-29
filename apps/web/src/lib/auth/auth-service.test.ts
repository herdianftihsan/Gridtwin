// apps/web/src/lib/auth/auth-service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './auth-service';
import { supabase } from './supabase';
import { useAuthStore } from '../../store/auth.store';

describe('Phase 10: Auth Service & UI Logic Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useAuthStore.getState().reset();
  });

  it('1. successfully signs in and populates auth store session', async () => {
    const mockSession = {
      access_token: 'valid-jwt-token',
      user: { id: 'usr-123', email: 'test@company.com' },
    };

    vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValueOnce({
      data: { session: mockSession, user: mockSession.user },
      error: null,
    } as never);

    const result = await AuthService.signInWithEmail('test@company.com', 'password123');

    expect(result.error).toBeNull();
    expect(result.data).toBeDefined();
    expect(useAuthStore.getState().session?.access_token).toBe('valid-jwt-token');
  });

  it('2. sanitizes invalid credentials into user-friendly message', async () => {
    vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValueOnce({
      data: { session: null, user: null },
      error: { message: 'Invalid login credentials', name: 'AuthApiError', status: 400 },
    } as never);

    const result = await AuthService.signInWithEmail('wrong@company.com', 'wrongpass');

    expect(result.data).toBeNull();
    expect(result.error).toBe('Invalid email or password. Please try again.');
  });

  it('3. successfully registers a new user with full_name metadata', async () => {
    vi.spyOn(supabase.auth, 'signUp').mockResolvedValueOnce({
      data: {
        user: { id: 'usr-new', email: 'new@company.com' },
        session: null,
      },
      error: null,
    } as never);

    const result = await AuthService.signUpWithEmail('Budi Kafe', 'new@company.com', 'password123');

    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'new@company.com',
      password: 'password123',
      options: { data: { full_name: 'Budi Kafe' } },
    });
    expect(result.error).toBeNull();
  });

  it('4. maps existing user error cleanly during registration', async () => {
    vi.spyOn(supabase.auth, 'signUp').mockResolvedValueOnce({
      data: { session: null, user: null },
      error: { message: 'User already registered', name: 'AuthApiError', status: 422 },
    } as never);

    const result = await AuthService.signUpWithEmail('Budi', 'existing@company.com', 'password123');

    expect(result.error).toBe('An account with this email already exists.');
  });

  it('5. initiates password reset email cleanly', async () => {
    vi.spyOn(supabase.auth, 'resetPasswordForEmail').mockResolvedValueOnce({
      data: {},
      error: null,
    } as never);

    const result = await AuthService.sendPasswordResetEmail('reset@company.com');

    expect(result.error).toBeNull();
    expect(result.data).toBe(true);
  });

  it('6. handles rate limiting on password reset gracefully', async () => {
    vi.spyOn(supabase.auth, 'resetPasswordForEmail').mockResolvedValueOnce({
      data: null,
      error: { message: 'over_email_send_rate_limit', name: 'AuthApiError', status: 429 },
    } as never);

    const result = await AuthService.sendPasswordResetEmail('spam@company.com');

    expect(result.error).toBe('Too many attempts. Please wait a few minutes before trying again.');
  });

  it('7. triggers Google OAuth with offline access and prompt options', async () => {
    vi.spyOn(supabase.auth, 'signInWithOAuth').mockResolvedValueOnce({
      data: { provider: 'google', url: 'https://accounts.google.com/o/oauth2' },
      error: null,
    } as never);

    const result = await AuthService.signInWithGoogle();

    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: 'google',
        options: expect.objectContaining({
          queryParams: { access_type: 'offline', prompt: 'consent' },
        }),
      })
    );
    expect(result.error).toBeNull();
  });
});