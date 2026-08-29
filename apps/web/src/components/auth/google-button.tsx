'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AuthService } from '../../lib/auth/auth-service';

export function GoogleButton({ label = 'Continue with Google' }: { label?: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await AuthService.signInWithGoogle();
    setIsLoading(false);
  };

  return (
    <motion.button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      whileHover={{ scale: 1.012, y: -1 }}
      whileTap={{ scale: 0.985, y: 0 }}
      transition={{ duration: 0.12, ease: 'easeOut' }}
      className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-500 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
    >
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
      </svg>
      <span>{isLoading ? 'Connecting to Google...' : label}</span>
    </motion.button>
  );
}