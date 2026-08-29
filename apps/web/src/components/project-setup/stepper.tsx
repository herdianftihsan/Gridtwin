'use client';

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { LUXURY_EASE } from './setup-motion';

interface StepperProps {
  currentStep: number;
}

const STEPS = [
  { step: 1, label: 'BUILDING' },
  { step: 2, label: 'ENERGY' },
  { step: 3, label: 'BUDGET' },
  { step: 4, label: 'OBJECTIVE' },
];

export function Stepper({ currentStep }: StepperProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="w-full pb-8">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {STEPS.map((s, index) => {
          const isCompleted = s.step < currentStep;
          const isCurrent = s.step === currentStep;

          return (
            <React.Fragment key={s.step}>
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.05 : 1,
                    backgroundColor: isCompleted
                      ? '#0F172A'
                      : isCurrent
                      ? '#FFFFFF'
                      : '#F8FAFC',
                    borderColor: isCurrent || isCompleted ? '#0F172A' : '#E2E8F0',
                  }}
                  transition={{ duration: 0.25, ease: LUXURY_EASE }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors ${
                    isCompleted
                      ? 'text-white'
                      : isCurrent
                      ? 'text-slate-900 shadow-sm'
                      : 'text-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <motion.svg
                      initial={shouldReduceMotion ? false : { scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </motion.svg>
                  ) : (
                    <span>{s.step}</span>
                  )}
                </motion.div>

                <span
                  className={`text-[10px] font-semibold tracking-wider transition-colors duration-200 ${
                    isCurrent || isCompleted ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>

              {index < STEPS.length - 1 && (
                <div className="flex-1 h-[2px] mx-2 -mt-5 bg-slate-200 overflow-hidden relative">
                  <motion.div
                    initial={false}
                    animate={{ width: s.step < currentStep ? '100%' : '0%' }}
                    transition={{ duration: 0.35, ease: LUXURY_EASE }}
                    className="absolute inset-y-0 left-0 bg-slate-900"
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}