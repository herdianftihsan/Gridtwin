import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { AuthProvider } from "./auth-provider";
import { useAuthStore } from "../../store/auth.store";

const { getSession, onAuthStateChange } = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
}));

vi.mock("../../lib/auth/supabase", () => ({
  supabase: { auth: { getSession, onAuthStateChange } },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/login",
}));

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ session: null, user: null, isLoading: true, isInitialized: false });
    onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
  });

  it("releases protected routes to the normal unauthenticated redirect when session lookup rejects", async () => {
    getSession.mockRejectedValue(new Error("Session lookup failed"));
    render(<AuthProvider><div>Sign in</div></AuthProvider>);

    await waitFor(() => expect(useAuthStore.getState().isInitialized).toBe(true));
    expect(useAuthStore.getState().session).toBeNull();
  });
});
