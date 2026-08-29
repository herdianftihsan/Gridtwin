// apps/web/src/components/auth/auth-motion.ts
import type { Variants } from 'motion/react';

// Kurva transisi cubic-bezier
export const SMOOTH_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// 1. Animasi Panel Kiri (Meluncur dari Kiri ke Kanan)
export const leftPanelVariants: Variants = {
  initial: { opacity: 0, x: -60 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: SMOOTH_EASE,
      staggerChildren: 0.12,
    },
  },
};

// 2. Animasi Panel Kanan (Meluncur dari Kanan ke Kiri)
export const rightPanelVariants: Variants = {
  initial: { opacity: 0, x: 60 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: SMOOTH_EASE,
      staggerChildren: 0.08,
    },
  },
};

// 3. Elemen Internal Panel Kiri
export const leftItemVariants: Variants = {
  initial: { opacity: 0, x: -25 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: SMOOTH_EASE },
  },
};

// 4. Input & Elemen Form Panel Kanan
export const formItemVariants: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: SMOOTH_EASE },
  },
};

// 5. Container Wrapper Form (Page Transition)
export const formContainerVariants: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: SMOOTH_EASE,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

// 6. Animasi Error Shake
export const errorShakeVariants: Variants = {
  initial: { opacity: 0, y: -4, x: 0 },
  animate: {
    opacity: 1,
    y: 0,
    x: [0, -8, 8, -5, 5, -2, 2, 0],
    transition: {
      x: { duration: 0.35, ease: 'easeInOut' },
      opacity: { duration: 0.15 },
      y: { duration: 0.15 },
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: { duration: 0.15 },
  },
};

// 7. Props Interaksi Tombol (Hover & Press)
export const buttonMotionProps = {
  whileHover: { scale: 1.012, y: -1 },
  whileTap: { scale: 0.985, y: 0 },
  transition: { duration: 0.12, ease: SMOOTH_EASE },
};