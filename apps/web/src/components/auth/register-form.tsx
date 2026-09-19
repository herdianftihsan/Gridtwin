"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { AuthService } from "../../lib/auth/auth-service";
import { supabase } from "../../lib/auth/supabase";
import { PasswordField } from "./password-field";
import { GoogleButton } from "./google-button";
import { formItemVariants, errorShakeVariants, buttonMotionProps } from "./auth-motion";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const nextRoute = nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/dashboard";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [, startTransition] = useTransition();
  const [isInitializing, setIsInitializing] = useState(true);

  React.useEffect(() => {
    let isMounted = true;
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && isMounted) {
        router.replace(nextRoute);
      } else if (isMounted) {
        setIsInitializing(false);
      }
    };
    checkSession();
    return () => { isMounted = false; };
  }, [router, nextRoute]);

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
        <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
          Loading authentication...
        </span>
      </div>
    );
  }

  const validateInputs = (): string | null => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || trimmedName.length < 2) {
      return "Harap masukkan nama lengkap Anda (minimal 2 karakter).";
    }
    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
      return "Harap masukkan alamat email yang valid.";
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return `Kata sandi minimal ${MIN_PASSWORD_LENGTH} karakter.`;
    }
    if (password !== confirmPassword) {
      return "Kata sandi tidak cocok.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    setAuthError(null);
    const validationError = validateInputs();
    if (validationError) {
      setAuthError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await AuthService.signUpWithEmail(
        name.trim(),
        email.trim().toLowerCase(),
        password,
      );

      if (error) {
        setAuthError(error);
        return;
      }

      startTransition(() => {
        router.replace(nextRoute);
      });
    } catch {
      setAuthError("Terjadi kesalahan jaringan yang tidak terduga. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const loginUrl =
    nextRoute !== "/dashboard" ? `/login?next=${encodeURIComponent(nextRoute)}` : "/login";

  return (
    <div className="space-y-6">
      <motion.div variants={formItemVariants} className="space-y-2 text-left">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Buat akun GridTwin Anda
        </h2>
        <p className="text-sm text-slate-500">
          Mulai buat model keputusan energi Anda dengan percaya diri.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {authError && (
          <motion.div
            key={authError}
            variants={errorShakeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            role="alert"
            aria-live="polite"
            className="p-3.5 rounded-lg bg-red-50 border-l-4 border-red-500 flex items-start gap-3 text-left shadow-xs"
          >
            <svg
              className="w-5 h-5 text-red-500 shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-xs text-red-700 font-medium leading-relaxed">{authError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <motion.div variants={formItemVariants} className="space-y-1.5 text-left">
          <label
            htmlFor="register-name"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
          >
            Nama lengkap
          </label>
          <input
            id="register-name"
            type="text"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Budi Santoso"
            disabled={isLoading}
            required
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all shadow-xs disabled:bg-slate-50 disabled:cursor-not-allowed"
          />
        </motion.div>

        <motion.div variants={formItemVariants} className="space-y-1.5 text-left">
          <label
            htmlFor="register-email"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
          >
            Alamat email
          </label>
          <input
            id="register-email"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@perusahaan.com"
            disabled={isLoading}
            required
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all shadow-xs disabled:bg-slate-50 disabled:cursor-not-allowed"
          />
        </motion.div>

        <motion.div variants={formItemVariants}>
          <PasswordField
            label="Kata Sandi"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimal 8 karakter"
            disabled={isLoading}
            autoComplete="new-password"
            required
          />
        </motion.div>

        <motion.div variants={formItemVariants}>
          <PasswordField
            label="Konfirmasi kata sandi"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Masukkan ulang kata sandi"
            disabled={isLoading}
            autoComplete="new-password"
            required
          />
        </motion.div>

        <motion.div variants={formItemVariants} className="pt-2">
          <motion.button
            type="submit"
            disabled={isLoading}
            aria-busy={isLoading}
            {...buttonMotionProps}
            className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-xs cursor-pointer"
          >
            {isLoading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Membuat akun...</span>
              </span>
            ) : (
              "Buat akun"
            )}
          </motion.button>
        </motion.div>
      </form>

      <motion.div variants={formItemVariants} className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-slate-400">atau</span>
        </div>
      </motion.div>

      <motion.div variants={formItemVariants}>
        <GoogleButton label="Lanjutkan dengan Google" nextUrl={nextRoute} onError={setAuthError} />
      </motion.div>

      <motion.div variants={formItemVariants} className="space-y-3 text-center">
        <p className="text-xs text-slate-500">
          Sudah punya akun?{" "}
          <Link
            href={loginUrl}
            className="font-semibold text-slate-900 hover:text-sky-600 transition-colors"
          >
            Masuk
          </Link>
        </p>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Dengan membuat akun, Anda menyetujui Ketentuan dan Kebijakan Privasi kami.
        </p>
      </motion.div>
    </div>
  );
}
