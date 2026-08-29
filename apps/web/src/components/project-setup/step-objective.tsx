'use client';

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ProjectSetupFormData, ProjectObjective } from './types';
import { objectiveCardVariants, LUXURY_EASE } from './setup-motion';

interface StepObjectiveProps {
  formData: ProjectSetupFormData;
  updateFormData: (fields: Partial<ProjectSetupFormData>) => void;
}

const OBJECTIVES: {
  id: ProjectObjective;
  title: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'save_money',
    title: 'Save Money',
    description: 'Focus on fastest payback and monthly bill reduction.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    id: 'reduce_co2',
    title: 'Reduce CO₂',
    description: 'Maximize environmental impact and carbon offsets.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'independence',
    title: 'Energy Independence',
    description: 'Prioritize backup power and grid autonomy.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

export function StepObjective({ formData, updateFormData }: StepObjectiveProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="space-y-6 text-left">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          What matters most to you?
        </h2>
        <p className="text-sm text-slate-500">
          Choose the primary goal for your energy transition.
        </p>
      </div>

      <div className="space-y-3">
        {OBJECTIVES.map((item, index) => {
          const isSelected = formData.objective === item.id;

          return (
            <motion.button
              key={item.id}
              type="button"
              variants={shouldReduceMotion ? undefined : objectiveCardVariants}
              initial="initial"
              animate="animate"
              transition={{ delay: index * 0.06 }}
              whileHover={shouldReduceMotion ? undefined : { scale: 1.008, y: -1 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.992 }}
              onClick={() => updateFormData({ objective: item.id })}
              className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                isSelected
                  ? 'border-slate-900 bg-slate-50/70 ring-1 ring-slate-900 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isSelected ? '#0F172A' : '#F1F5F9',
                  color: isSelected ? '#FFFFFF' : '#475569',
                }}
                transition={{ duration: 0.2, ease: LUXURY_EASE }}
                className="p-2.5 rounded-lg shrink-0 mt-0.5"
              >
                {item.icon}
              </motion.div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}