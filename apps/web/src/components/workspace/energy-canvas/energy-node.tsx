'use client';

import React from 'react';
import { motion } from 'motion/react';
import { NodeTelemetry, NodePosition } from './types';

interface EnergyNodeProps {
  telemetry: NodeTelemetry;
  position: NodePosition;
  isSelected: boolean;
  onSelect: (id: string) => void;
  icon: React.ReactNode;
  accentColorClass: string;
  ringColorClass: string;
}

export function EnergyNode({
  telemetry,
  position,
  isSelected,
  onSelect,
  icon,
  accentColorClass,
  ringColorClass,
}: EnergyNodeProps) {
  const { id, label, sublabel, valueDisplay, isActive, statusBadge } = telemetry;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(id);
    }
  };

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label={`${label}: ${valueDisplay}, ${sublabel} (${statusBadge ?? 'Active'})`}
      aria-expanded={isSelected}
      onClick={() => onSelect(id)}
      onKeyDown={handleKeyDown}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${position.w}px`,
      }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      animate={{ opacity: isActive ? 1 : 0.55 }}
      className={`p-4 rounded-3xl bg-white border text-left shadow-sm transition-all cursor-pointer focus:outline-none focus:ring-3 focus:ring-sky-500 z-10 select-none ${
        isSelected
          ? `border-slate-950 ring-4 ${ringColorClass} shadow-md`
          : isActive
          ? 'border-slate-200/90 hover:border-slate-300'
          : 'border-slate-200 border-dashed'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${accentColorClass}`}>
            {icon}
          </div>
          <span className="text-[10px] font-bold tracking-wider text-slate-700 uppercase">
            {label}
          </span>
        </div>
        <span className="relative flex h-2.5 w-2.5">
          {isActive && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current text-sky-400" />
          )}
          <span
            className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              isActive ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
          />
        </span>
      </div>

      <div className="text-xl font-extrabold text-slate-900 mt-2 tracking-tight">
        {valueDisplay}
      </div>
      <div className="text-[11px] text-slate-400 font-medium truncate">
        {sublabel}
      </div>
    </motion.div>
  );
}