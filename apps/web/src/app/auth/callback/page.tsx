"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/auth/supabase";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorDesc = searchParams.get("error_description") || searchParams.get("error");
    if (errorDesc) {
      setError(errorDesc);
      setTimeout(() => {
        router.replace("/login");
      }, 3000);
      return;
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        const next = searchParams.get("next") || "/dashboard";
        const safeNext = next.startsWith("/") ? next : "/dashboard";
        router.replace(safeNext);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white space-y-4">
        <span className="text-sm text-red-400 font-semibold tracking-wider">
          Authentication Error: {error}
        </span>
        <span className="text-xs text-slate-400">Redirecting to login...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white space-y-4">
      <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">
        Establishing Session...
      </span>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white space-y-4">
        <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
