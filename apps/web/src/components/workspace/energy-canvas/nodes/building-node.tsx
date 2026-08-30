import React from 'react';
import { motion } from 'motion/react';
import { NodeTelemetry, NodePosition } from '../types';

export function BuildingNode({ telemetry, position, isSelected, onSelect }: {
  telemetry: NodeTelemetry; position: NodePosition; isSelected: boolean; onSelect: (id: string) => void;
}) {
  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label={`${telemetry.label}: ${telemetry.sublabel}, Demand: ${telemetry.valueDisplay}`}
      aria-expanded={isSelected}
      onClick={() => onSelect('building')}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect('building')}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${position.w}px`,
      }}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      className={`p-5 rounded-3xl bg-white border-2 text-left shadow-lg cursor-pointer focus:outline-none focus:ring-3 focus:ring-sky-500 z-20 ${
        isSelected ? 'border-sky-600 ring-4 ring-sky-500/20' : 'border-slate-950'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
            {telemetry.label}
          </span>
        </div>
        <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
      </div>

      <div className="text-lg font-black text-slate-950 mt-1.5 truncate">
        {telemetry.sublabel}
      </div>
      <div className="text-xs font-semibold text-slate-500 mt-1">
        Demand: {telemetry.valueDisplay}
      </div>
    </motion.div>
  );
}