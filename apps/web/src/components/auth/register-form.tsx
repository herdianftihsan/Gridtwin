'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { AuthService } from '../../lib/auth/auth-service';
import { PasswordField } from './password-field';
import { GoogleButton } from './google-button';
import {
  formItemVariants,
  errorShakeVariants,
  buttonMotionProps,
} from './auth-motion';

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!name.trim()) {
      setAuthError('Please enter your full name.');
      return;
    }
    if (!email || !email.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    const { error } = await AuthService.signUpWithEmail(name, email, password);
    setIsLoading(false);

    if (error) {
      setAuthError(error);
      return;
    }

    router.push('/projects');
  };

  return (
    <div className="space-y-6">
      <motion.div variants={formItemVariants} className="space-y-2 text-left">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Create your GridTwin account</h2>
        <p className="text-sm text-slate-500">Start modelling your energy decisions with confidence.</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {authError && (
          <motion.div
            key={authError}
            variants={errorShakeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="p-3.5 rounded-lg bg-red-50 border-l-4 border-red-500 flex items-start gap-3 text-left shadow-sm"
          >
            <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs text-red-700 font-medium leading-relaxed">{authError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-4">
        <motion.div variants={formItemVariants} className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Full name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            disabled={isLoading}
            required
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all shadow-sm"
          />
        </motion.div>

        <motion.div variants={formItemVariants} className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            disabled={isLoading}
            required
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all shadow-sm"
          />
        </motion.div>

        <motion.div variants={formItemVariants}>
          <PasswordField
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={isLoading}
            required
          />
        </motion.div>

        <motion.div variants={formItemVariants}>
          <PasswordField
            label="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            disabled={isLoading}
            required
          />
        </motion.div>

        <motion.div variants={formItemVariants} className="pt-2">
          <motion.button
            type="submit"
            disabled={isLoading}
            {...buttonMotionProps}
            className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
          >
            {isLoading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Creating account...</span>
              </span>
            ) : (
              'Create account'
            )}
          </motion.button>
        </motion.div>
      </form>

      <motion.div variants={formItemVariants} className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-slate-400">or</span>
        </div>
      </motion.div>

      <motion.div variants={formItemVariants}>
        <GoogleButton label="Continue with Google" />
      </motion.div>

      <motion.div variants={formItemVariants} className="space-y-3 text-center">
        <p className="text-xs text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-slate-900 hover:text-sky-600 transition-colors">
            Sign in
          </Link>
        </p>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          By creating an account, you agree to our Terms and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}