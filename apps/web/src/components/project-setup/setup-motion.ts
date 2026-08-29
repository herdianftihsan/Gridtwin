import type { Variants, Transition } from 'motion/react';

export const LUXURY_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const SHAKE_EASE: [number, number, number, number] = [0.36, 0.07, 0.19, 0.97];

export const stepTransition: Transition = {
  duration: 0.35,
  ease: LUXURY_EASE,
};

// Step slide & crossfade animation (direction-aware)
export const stepVariants: Variants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 24 : -24,
  }),
  center: {
    opacity: 1,
    x: 0,
    transition: stepTransition,
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -24 : 24,
    transition: { duration: 0.2, ease: 'easeIn' },
  }),
};

// Objective Card interactive motion
export const objectiveCardVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: LUXURY_EASE } },
};

// Form validation error shake
export const errorShakeVariants: Variants = {
  initial: { opacity: 0, y: -4, x: 0 },
  animate: {
    opacity: 1,
    y: 0,
    x: [0, -6, 6, -4, 4, -2, 2, 0],
    transition: {
      x: { duration: 0.32, ease: SHAKE_EASE },
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

// Primary CTA button feedback
export const buttonMotionProps = {
  whileHover: { scale: 1.012, y: -1 },
  whileTap: { scale: 0.988, y: 0 },
  transition: { duration: 0.12, ease: LUXURY_EASE },
};