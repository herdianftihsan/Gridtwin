'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { apiClient, ApiClientError } from '../../lib/api/api-client';
import { Project } from '../../types/api';
import { Stepper } from './stepper';
import { StepBuilding } from './step-building';
import { StepEnergy } from './step-energy';
import { StepBudget } from './step-budget';
import { StepObjective } from './step-objective';
import { ProjectSetupFormData, INITIAL_FORM_DATA } from './types';
import {
  stepVariants,
  errorShakeVariants,
  buttonMotionProps,
} from './setup-motion';

export function ProjectSetupWizard() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = Forward, -1 = Backward
  const [formData, setFormData] = useState<ProjectSetupFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const updateFormData = (fields: Partial<ProjectSetupFormData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
    setErrors({});
    setApiError(null);
  };

  const validateStep = (currentStep: number): boolean => {
    const err: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.location) err['location'] = 'Please select a location.';
      if (!formData.building_type) err['building_type'] = 'Please select a building type.';
    } else if (currentStep === 2) {
      if (!formData.monthly_bill || formData.monthly_bill <= 0) {
        err['monthly_bill'] = 'Monthly bill must be greater than Rp 0.';
      }
    } else if (currentStep === 3) {
      if (!formData.budget || formData.budget < 1000000) {
        err['budget'] = 'Minimum budget is Rp 1.000.000.';
      }
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setDirection(1);
      setStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setDirection(-1);
    setStep((prev) => Math.max(prev - 1, 1));
    setErrors({});
    setApiError(null);
  };

  const handleSubmit = async () => {
    if (!validateStep(4) || isLoading) return;

    setIsLoading(true);
    setApiError(null);

    try {
      const payload = {
        building_type: formData.building_type,
        location: formData.location,
        roof_area: formData.roof_area || undefined,
        monthly_bill: formData.monthly_bill!,
        budget: formData.budget,
        objective: formData.objective,
      };

      const response = await apiClient.post<Project>('/api/projects', payload);

      if (response.data?.id) {
        router.push(`/projects/${response.data.id}`);
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        setApiError(err.message);
      } else {
        setApiError('An unexpected error occurred while creating your project.');
      }
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-[620px] mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm"
    >
      {/* Top Stepper */}
      <Stepper currentStep={step} />

      {/* Animated API Error Banner */}
      <AnimatePresence mode="wait">
        {apiError && (
          <motion.div
            key={apiError}
            variants={errorShakeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="mb-6 p-4 rounded-xl bg-red-50 border-l-4 border-red-500 text-xs text-red-700 font-medium shadow-sm"
          >
            {apiError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Directional Step Transition Container */}
      <div className="min-h-[340px] relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={shouldReduceMotion ? undefined : stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {step === 1 && (
              <StepBuilding
                formData={formData}
                updateFormData={updateFormData}
                errors={errors}
              />
            )}
            {step === 2 && (
              <StepEnergy
                formData={formData}
                updateFormData={updateFormData}
                errors={errors}
              />
            )}
            {step === 3 && (
              <StepBudget
                formData={formData}
                updateFormData={updateFormData}
                errors={errors}
              />
            )}
            {step === 4 && (
              <StepObjective
                formData={formData}
                updateFormData={updateFormData}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-8 mt-6 border-t border-slate-100">
        <button
          type="button"
          onClick={handleBack}
          disabled={step === 1 || isLoading}
          className={`text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors ${
            step === 1 ? 'invisible' : 'visible'
          }`}
        >
          ← Back
        </button>

        {step < 4 ? (
          <motion.button
            type="button"
            onClick={handleNext}
            {...buttonMotionProps}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium transition-colors shadow-sm cursor-pointer"
          >
            <span>Continue</span>
            <span>→</span>
          </motion.button>
        ) : (
          <motion.button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            {...buttonMotionProps}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Optimizing...</span>
              </span>
            ) : (
              <>
                <span>Generate My Energy Twin</span>
                <span>✨</span>
              </>
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}