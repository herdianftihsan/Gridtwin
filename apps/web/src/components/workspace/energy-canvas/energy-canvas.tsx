'use client';

import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { motion, useReducedMotion, PanInfo } from 'motion/react';
import { SimulationResult } from '../../../types/api';

interface EnergyCanvasProps {
  buildingType: string;
  location: string;
  result: SimulationResult;
  isSimulating?: boolean;
}

export type NodeKey = 'solar' | 'building' | 'battery' | 'grid' | 'ac' | 'led';

export interface NodePosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

const VIRTUAL_WIDTH = 980;
const VIRTUAL_HEIGHT = 600;

const DEFAULT_POSITIONS: Record<NodeKey, NodePosition> = {
  solar: { x: 390, y: 40, w: 200, h: 92 },
  building: { x: 375, y: 235, w: 230, h: 112 },
  battery: { x: 695, y: 245, w: 195, h: 92 },
  grid: { x: 390, y: 455, w: 200, h: 92 },
  ac: { x: 85, y: 155, w: 185, h: 78 },
  led: { x: 85, y: 345, w: 185, h: 78 },
};

export function EnergyCanvas({
  buildingType,
  location,
  result,
  isSimulating = false,
}: EnergyCanvasProps) {
  const shouldReduceMotion = useReducedMotion();
  const canvasViewportRef = useRef<HTMLDivElement>(null);

  const [positions, setPositions] = useState<Record<NodeKey, NodePosition>>(DEFAULT_POSITIONS);

  const [zoom, setZoom] = useState(0.75);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [initialFitZoom, setInitialFitZoom] = useState(0.75);

  const { configuration, energy } = result;
  const hasSolar = configuration.pv_kwp > 0;
  const hasBattery = configuration.battery_kwh > 0;
  const hasAc = configuration.ac_units > 0;
  const isLed = configuration.led_upgraded;
  const hasGridImport = energy.grid_import_monthly > 0;

  const calculateAutoFit = useCallback(() => {
    if (!canvasViewportRef.current) return;
    const { clientWidth, clientHeight } = canvasViewportRef.current;
    if (clientWidth === 0 || clientHeight === 0) return;

    const paddingX = clientWidth < 640 ? 24 : 48;
    const paddingY = clientWidth < 640 ? 70 : 80;

    const availableWidth = clientWidth - paddingX;
    const availableHeight = clientHeight - paddingY;

    const scaleX = availableWidth / VIRTUAL_WIDTH;
    const scaleY = availableHeight / VIRTUAL_HEIGHT;
    const fitScale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.32), 1.05);

    setZoom(fitScale);
    setInitialFitZoom(fitScale);
    setPan({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    calculateAutoFit();

    const resizeObserver = new ResizeObserver(() => {
      calculateAutoFit();
    });

    if (canvasViewportRef.current) {
      resizeObserver.observe(canvasViewportRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [calculateAutoFit]);

  const handleNodePan = useCallback(
    (key: NodeKey, info: PanInfo) => {
      setPositions((prev) => {
        const current = prev[key] || DEFAULT_POSITIONS[key];
        return {
          ...prev,
          [key]: {
            ...current,
            x: Math.round(current.x + info.delta.x / zoom),
            y: Math.round(current.y + info.delta.y / zoom),
          },
        };
      });
    },
    [zoom]
  );

  const handleResetLayout = () => {
    setPositions(DEFAULT_POSITIONS);
    setZoom(initialFitZoom);
    setPan({ x: 0, y: 0 });
  };

  const calculatePath = useMemo(() => {
    return (fromKey: NodeKey, toKey: NodeKey, curveOffset = 0) => {
      const from = positions[fromKey] || DEFAULT_POSITIONS[fromKey];
      const to = positions[toKey] || DEFAULT_POSITIONS[toKey];
      if (!from || !to) return '';

      const startX = from.x + from.w / 2;
      const startY = from.y + from.h / 2;
      const endX = to.x + to.w / 2;
      const endY = to.y + to.h / 2;

      if (curveOffset === 0) {
        return `M ${startX} ${startY} L ${endX} ${endY}`;
      }

      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;
      const dx = endX - startX;
      const dy = endY - startY;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const normalX = -dy / len;
      const normalY = dx / len;

      const ctrlX = midX + normalX * curveOffset;
      const ctrlY = midY + normalY * curveOffset;

      return `M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`;
    };
  }, [positions]);

  return (
    <div
      ref={canvasViewportRef}
      className="relative w-full h-[520px] sm:h-[580px] bg-slate-50/70 border border-slate-200/90 rounded-3xl overflow-hidden select-none shadow-xs flex flex-col justify-between"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 p-4 sm:p-5 z-30 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-white/90 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-2xs">
          <span className="text-xs sm:text-sm font-bold tracking-tight text-slate-900">
            Interactive Energy Canvas
          </span>
          <span className="text-[11px] text-slate-400 font-medium">({location})</span>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-[11px] font-semibold text-slate-600 bg-white/90 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-2xs pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>Grid Connection</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Solar PV</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <span>Battery Storage</span>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center overflow-hidden cursor-crosshair">
        <div className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-60 pointer-events-none" />

        <motion.div
          onPan={(_, info) => setPan((p) => ({ x: p.x + info.delta.x, y: p.y + info.delta.y }))}
          animate={{
            scale: zoom,
            x: pan.x,
            y: pan.y,
          }}
          transition={{ duration: 0.05 }}
          style={{
            width: `${VIRTUAL_WIDTH}px`,
            height: `${VIRTUAL_HEIGHT}px`,
          }}
          className="relative shrink-0 origin-center"
        >
          
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            viewBox={`0 0 ${VIRTUAL_WIDTH} ${VIRTUAL_HEIGHT}`}
          >
            {hasSolar && (
              <path
                d={calculatePath('solar', 'building', 0)}
                stroke="#F59E0B"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={shouldReduceMotion ? 'none' : '8 6'}
                className={shouldReduceMotion ? '' : 'animate-energy-flow'}
                fill="none"
              />
            )}

            {hasSolar && hasBattery && (
              <path
                d={calculatePath('solar', 'battery', 45)}
                stroke="#F59E0B"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray={shouldReduceMotion ? 'none' : '7 5'}
                className={shouldReduceMotion ? '' : 'animate-energy-flow'}
                fill="none"
              />
            )}

            {/* Battery Storage -> Building */}
            {hasBattery && (
              <path
                d={calculatePath('battery', 'building', 0)}
                stroke="#14B8A6"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={shouldReduceMotion ? 'none' : '8 6'}
                className={shouldReduceMotion ? '' : 'animate-energy-flow'}
                fill="none"
              />
            )}

            {hasGridImport && (
              <path
                d={calculatePath('grid', 'building', 0)}
                stroke="#6366F1"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={shouldReduceMotion ? 'none' : '8 6'}
                className={shouldReduceMotion ? '' : 'animate-energy-flow'}
                fill="none"
              />
            )}

            {/* Air Conditioner -> Building */}
            <path
              d={calculatePath('ac', 'building', -20)}
              stroke="#94A3B8"
              strokeWidth="2.5"
              strokeDasharray="6 5"
              fill="none"
            />

            <path
              d={calculatePath('led', 'building', 20)}
              stroke="#94A3B8"
              strokeWidth="2.5"
              strokeDasharray="6 5"
              fill="none"
            />
          </svg>

          

          {/* 1. Node: Solar PV */}
          <motion.div
            onPan={(_, info) => handleNodePan('solar', info)}
            style={{
              position: 'absolute',
              left: `${positions.solar.x}px`,
              top: `${positions.solar.y}px`,
              width: `${positions.solar.w}px`,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 1.05, cursor: 'grabbing' }}
            animate={{ opacity: hasSolar ? 1 : 0.55 }}
            className={`p-4 rounded-3xl bg-white border text-left shadow-sm cursor-grab z-10 select-none touch-none ${
              hasSolar ? 'border-amber-400 ring-4 ring-amber-400/10' : 'border-slate-200 border-dashed'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <span className="text-[10px] font-bold tracking-wider text-amber-700 uppercase">
                  SOLAR PV
                </span>
              </div>
              <span className="relative flex h-2.5 w-2.5">
                {hasSolar && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />}
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
              </span>
            </div>
            <div className="text-xl font-extrabold text-slate-900 mt-2">
              {configuration.pv_kwp} kWp
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              {hasSolar ? 'Proposed Asset' : 'Inactive'}
            </div>
          </motion.div>

          <motion.div
            onPan={(_, info) => handleNodePan('ac', info)}
            style={{
              position: 'absolute',
              left: `${positions.ac.x}px`,
              top: `${positions.ac.y}px`,
              width: `${positions.ac.w}px`,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 1.05, cursor: 'grabbing' }}
            className={`p-3.5 rounded-2xl bg-white border text-left shadow-2xs cursor-grab z-10 select-none touch-none ${
              hasAc ? 'border-slate-300' : 'border-slate-200 opacity-60'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                AIR CONDITIONER
              </span>
            </div>
            <div className="text-sm font-bold text-slate-900 mt-1">
              {configuration.ac_units} Units Inverter
            </div>
            <div className="text-[10px] text-slate-400">Efficiency upgrade</div>
          </motion.div>

          <motion.div
            onPan={(_, info) => handleNodePan('led', info)}
            style={{
              position: 'absolute',
              left: `${positions.led.x}px`,
              top: `${positions.led.y}px`,
              width: `${positions.led.w}px`,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 1.05, cursor: 'grabbing' }}
            className={`p-3.5 rounded-2xl bg-white border text-left shadow-2xs cursor-grab z-10 select-none touch-none ${
              isLed ? 'border-slate-300' : 'border-slate-200 opacity-60'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                SMART LED
              </span>
            </div>
            <div className="text-sm font-bold text-slate-900 mt-1">
              {isLed ? 'Upgraded' : 'Standard'}
            </div>
            <div className="text-[10px] text-slate-400">Lighting system</div>
          </motion.div>

          <motion.div
            onPan={(_, info) => handleNodePan('building', info)}
            style={{
              position: 'absolute',
              left: `${positions.building.x}px`,
              top: `${positions.building.y}px`,
              width: `${positions.building.w}px`,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 1.05, cursor: 'grabbing' }}
            className="p-5 rounded-3xl bg-white border-2 border-slate-950 shadow-lg text-left cursor-grab z-20 select-none touch-none"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-white">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                  BUILDING
                </span>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
            </div>
            <div className="text-lg font-black text-slate-950 mt-1.5 truncate">
              {buildingType || 'Commercial Ruko'}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              Demand: {Math.round(energy.monthly_demand_kwh)} kWh/mo
            </div>
          </motion.div>

          <motion.div
            onPan={(_, info) => handleNodePan('battery', info)}
            style={{
              position: 'absolute',
              left: `${positions.battery.x}px`,
              top: `${positions.battery.y}px`,
              width: `${positions.battery.w}px`,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 1.05, cursor: 'grabbing' }}
            animate={{ opacity: hasBattery ? 1 : 0.55 }}
            className={`p-4 rounded-3xl bg-white border text-left shadow-sm cursor-grab z-10 select-none touch-none ${
              hasBattery ? 'border-teal-400 ring-4 ring-teal-400/10' : 'border-slate-200 border-dashed'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-[10px] font-bold tracking-wider text-teal-700 uppercase">
                  BATTERY
                </span>
              </div>
              <span className="relative flex h-2.5 w-2.5">
                {hasBattery && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />}
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500" />
              </span>
            </div>
            <div className="text-xl font-extrabold text-slate-900 mt-2">
              {configuration.battery_kwh} kWh
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              {hasBattery ? 'Proposed Asset' : 'Inactive'}
            </div>
          </motion.div>

          <motion.div
            onPan={(_, info) => handleNodePan('grid', info)}
            style={{
              position: 'absolute',
              left: `${positions.grid.x}px`,
              top: `${positions.grid.y}px`,
              width: `${positions.grid.w}px`,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 1.05, cursor: 'grabbing' }}
            className="p-4 rounded-3xl bg-white border border-indigo-200 text-left shadow-sm cursor-grab z-10 select-none touch-none"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-[10px] font-bold tracking-wider text-indigo-700 uppercase">
                  PLN GRID
                </span>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            </div>
            <div className="text-sm font-bold text-slate-900 mt-2">
              Import: {Math.round(energy.grid_import_monthly)} kWh/mo
            </div>
            <div className="text-[10px] text-slate-400">Grid Connection</div>
          </motion.div>
        </motion.div>
      </div>

      <div className="absolute bottom-4 right-4 z-30 flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 shadow-md">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(z + 0.12, 1.6))}
          title="Zoom In"
          aria-label="Zoom In Canvas"
          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer font-bold text-base"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(z - 0.12, 0.35))}
          title="Zoom Out"
          aria-label="Zoom Out Canvas"
          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer font-bold text-base"
        >
          −
        </button>
        <div className="w-[1px] h-4 bg-slate-200 mx-0.5" />
        <button
          type="button"
          onClick={handleResetLayout}
          title="Reset Layout & Zoom"
          aria-label="Reset Canvas Layout"
          className="px-2.5 h-8 rounded-xl flex items-center justify-center text-xs font-semibold text-slate-700 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
        >
          Fit ⟲
        </button>
      </div>

      {isSimulating && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center z-40 transition-opacity">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-950 text-white text-xs font-semibold shadow-xl">
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Recalculating energy flow...</span>
          </div>
        </div>
      )}
    </div>
  );
}