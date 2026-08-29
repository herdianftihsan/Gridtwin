'use client';

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { formContainerVariants } from './auth-motion';

export function AuthPageTransition({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className="w-full max-w-[420px] space-y-8">{children}</div>;
  }

  return (
    <motion.div
      variants={formContainerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full max-w-[420px] space-y-8"
    >
      {children}
    </motion.div>
  );
}