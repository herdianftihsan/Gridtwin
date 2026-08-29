'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { AuthService } from '../../lib/auth/auth-service';
import {
  formItemVariants,
  errorShakeVariants,
  buttonMotionProps,
  SMOOTH_EASE,
} from './auth-motion';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(59);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSuccess && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [isSuccess, countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !email.includes('@')) {
      setErrorMessage("We couldn't send the reset link. Please check your email and try again.");
      return;
    }

    setIsLoading(true);
    const { error } = await AuthService.sendPasswordResetEmail(email);
    setIsLoading(false);

    if (error) {
      setErrorMessage(error);
      return;
    }

    setIsSuccess(true);
    setCountdown(59);
    setCanResend(false);
  };

  const handleResend = async () => {
    if (!canResend) return;
    setIsLoading(true);
    await AuthService.sendPasswordResetEmail(email);
    setIsLoading(false);
    setCountdown(59);
    setCanResend(false);
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: SMOOTH_EASE }}
        className="space-y-6 text-center"
      >
        <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-800 shadow-sm">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Check your inbox</h2>
          <p className="text-sm text-slate-500">We&apos;ve sent a password reset link to your email address.</p>
        </div>

        <div className="inline-block px-4 py-2 rounded-md bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700">
          {email}
        </div>

        <div className="pt-2 space-y-3">
          <Link
            href="/login"
            className="block w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium transition-colors shadow-sm text-center"
          >
            Back to sign in
          </Link>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-500 space-y-1">
            <p>Didn&apos;t receive the email?</p>
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={isLoading}
                className="font-semibold text-slate-900 hover:text-sky-600 transition-colors cursor-pointer"
              >
                Resend email now
              </button>
            ) : (
              <p className="text-slate-400 font-mono">
                Resend email (0:{countdown < 10 ? `0${countdown}` : countdown})
              </p>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <motion.div variants={formItemVariants} className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
        <svg className="w-4 h-4 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span>GridTwin AI</span>
      </motion.div>

      <motion.div variants={formItemVariants} className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Reset your password</h2>
        <p className="text-sm text-slate-500">
          Enter your email and we&apos;ll send you a secure link to reset your password.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {errorMessage && (
          <motion.div
            key={errorMessage}
            variants={errorShakeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="p-3.5 rounded-lg bg-red-50 border-l-4 border-red-500 flex items-start gap-3 shadow-sm"
          >
            <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-red-700 font-medium leading-relaxed">{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-4">
        <motion.div variants={formItemVariants} className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Email address
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              disabled={isLoading}
              required
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all shadow-sm ${
                errorMessage ? 'border-red-500 focus:ring-red-500' : 'border-slate-200'
              }`}
            />
          </div>
        </motion.div>

        <motion.div variants={formItemVariants} className="pt-1">
          <motion.button
            type="submit"
            disabled={isLoading}
            {...buttonMotionProps}
            className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
          >
            {isLoading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Sending...</span>
              </span>
            ) : (
              'Send reset link →'
            )}
          </motion.button>
        </motion.div>
      </form>

      <motion.div variants={formItemVariants} className="text-center pt-2">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <span>←</span> Back to sign in
        </Link>
      </motion.div>
    </div>
  );
}