'use client';

import React from 'react';
import {
  ProjectSetupFormData,
  AVAILABLE_LOCATIONS,
  BUILDING_TYPES,
  BuildingType,
} from './types';

interface StepBuildingProps {
  formData: ProjectSetupFormData;
  updateFormData: (fields: Partial<ProjectSetupFormData>) => void;
  errors: Record<string, string>;
}

export function StepBuilding({ formData, updateFormData, errors }: StepBuildingProps) {
  return (
    <div className="space-y-6 text-left">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Describe your building
        </h2>
        <p className="text-sm text-slate-500">
          GridTwin uses these details to accurately model your energy potential.
        </p>
      </div>

      <div className="space-y-5">
        {/* Location Dropdown */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Location</label>
          <div className="relative">
            <select
              value={formData.location}
              onChange={(e) => updateFormData({ location: e.target.value })}
              className={`w-full appearance-none px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all cursor-pointer ${
                errors['location'] ? 'border-red-500' : 'border-slate-200'
              }`}
            >
              <option value="" disabled>Select location</option>
              {AVAILABLE_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {errors['location'] && <p className="text-xs text-red-500">{errors['location']}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Building Type</label>
          <div className="relative">
            <select
              value={formData.building_type}
              onChange={(e) => updateFormData({ building_type: e.target.value as BuildingType })}
              className={`w-full appearance-none px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all cursor-pointer ${
                errors['building_type'] ? 'border-red-500' : 'border-slate-200'
              }`}
            >
              <option value="" disabled>Select building type</option>
              {BUILDING_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {errors['building_type'] && <p className="text-xs text-red-500">{errors['building_type']}</p>}
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-semibold text-slate-700">Roof Area</label>
            <span className="text-[11px] text-slate-400">Optional</span>
          </div>
          <div className="relative">
            <input
              type="number"
              min="0"
              placeholder="0"
              value={formData.roof_area !== null ? formData.roof_area : ''}
              onChange={(e) => {
                const val = e.target.value === '' ? null : Number(e.target.value);
                updateFormData({ roof_area: val });
              }}
              className="w-full pr-10 pl-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all text-right"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
              m²
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Estimated available area for solar panels.</p>
        </div>
      </div>
    </div>
  );
}