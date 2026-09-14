"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "../../store/auth.store";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { session, isInitialized } = useAuthStore();

  useEffect(() => {
    if (isInitialized && !session) {
      // Arahkan ke login dengan membawa path tujuan
      const redirectUrl = `/login?next=${encodeURIComponent(pathname)}`;
      router.replace(redirectUrl);
    }
  }, [isInitialized, session, pathname, router]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white space-y-4">
        <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">
          Memverifikasi Sesi Akun...
        </span>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}
