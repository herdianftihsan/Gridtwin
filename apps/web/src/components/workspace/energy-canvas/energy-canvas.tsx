'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { mapSimulationToCanvas } from './energy-status';
import { NodeKey, NodePosition, EnergyCanvasProps } from './types';
import { EnergyConnection } from './energy-connection';
import { EnergyBalanceDock } from './energy-balance-dock';
import { SolarNode } from './nodes/solar-node';
import { BuildingNode } from './nodes/building-node';
import { BatteryNode } from './nodes/battery-node';
import { GridNode } from './nodes/grid-node';
import { HvacNode } from './nodes/hvac-node';
import { LightingNode } from './nodes/lighting-node';

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
  result,
  project,
  buildingType,
  location,
  isSimulating = false,
}: EnergyCanvasProps) {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0.85);
  const [positions] = useState<Record<NodeKey, NodePosition>>(DEFAULT_POSITIONS);

  const displayLocation = location ?? project?.location ?? 'Surabaya';
  const displayBuilding = buildingType ?? project?.building_type ?? 'Commercial Ruko';

  const viewModel = useMemo(
    () => mapSimulationToCanvas(result, project, displayBuilding, displayLocation),
    [result, project, displayBuilding, displayLocation]
  );

  const calculateAutoFit = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    if (clientWidth === 0 || clientHeight === 0) return;

    const paddingX = clientWidth < 640 ? 24 : 48;
    const paddingY = clientWidth < 640 ? 80 : 90;
    const scaleX = (clientWidth - paddingX) / VIRTUAL_WIDTH;
    const scaleY = (clientHeight - paddingY) / VIRTUAL_HEIGHT;
    setZoom(Math.min(Math.max(Math.min(scaleX, scaleY), 0.35), 1.05));
  }, []);

  useEffect(() => {
    calculateAutoFit();
    if (typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(calculateAutoFit);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [calculateAutoFit]);

  const selectedNode = selectedNodeId ? viewModel.nodes[selectedNodeId as NodeKey] : null;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[580px] sm:h-[640px] bg-slate-50/70 border border-slate-200/90 rounded-3xl overflow-hidden select-none shadow-xs flex flex-col justify-between p-4 sm:p-5"
    >
      {/* Top Bar Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 z-20 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-white/90 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-2xs">
          <span className="text-xs sm:text-sm font-bold tracking-tight text-slate-900">
            Energy Canvas
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            ({displayLocation})
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-[11px] font-semibold text-slate-600 bg-white/90 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-2xs pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>Grid Import</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Solar Generation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <span>Battery Dispatch</span>
          </div>
        </div>
      </div>

      {/* Scaled Interactive Canvas Area */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-60 pointer-events-none" />

        <motion.div
          animate={{ scale: zoom }}
          transition={{ duration: 0.1 }}
          style={{ width: `${VIRTUAL_WIDTH}px`, height: `${VIRTUAL_HEIGHT}px` }}
          className="relative shrink-0 origin-center"
        >
          {/* SVG Connection Cables */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox={`0 0 ${VIRTUAL_WIDTH} ${VIRTUAL_HEIGHT}`}>
            {viewModel.connections.map((conn) => (
              <EnergyConnection
                key={conn.id}
                connection={conn}
                sourcePos={positions[conn.from]}
                targetPos={positions[conn.to]}
                reducedMotion={shouldReduceMotion ?? false}
              />
            ))}
          </svg>

          {/* Nodes */}
          <SolarNode
            telemetry={viewModel.nodes.solar}
            position={positions.solar}
            isSelected={selectedNodeId === 'solar'}
            onSelect={setSelectedNodeId}
          />
          <BuildingNode
            telemetry={viewModel.nodes.building}
            position={positions.building}
            isSelected={selectedNodeId === 'building'}
            onSelect={setSelectedNodeId}
          />
          <BatteryNode
            telemetry={viewModel.nodes.battery}
            position={positions.battery}
            isSelected={selectedNodeId === 'battery'}
            onSelect={setSelectedNodeId}
          />
          <GridNode
            telemetry={viewModel.nodes.grid}
            position={positions.grid}
            isSelected={selectedNodeId === 'grid'}
            onSelect={setSelectedNodeId}
          />
          <HvacNode
            telemetry={viewModel.nodes.ac}
            position={positions.ac}
            isSelected={selectedNodeId === 'ac'}
            onSelect={setSelectedNodeId}
          />
          <LightingNode
            telemetry={viewModel.nodes.led}
            position={positions.led}
            isSelected={selectedNodeId === 'led'}
            onSelect={setSelectedNodeId}
          />
        </motion.div>
      </div>

      {/* Bottom Energy Balance Summary Dock */}
      <EnergyBalanceDock summary={viewModel.summary} />

      {/* Selected Node Inspector Drawer */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="absolute bottom-20 left-4 right-4 sm:right-auto sm:w-80 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-lg z-30 text-left"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                {selectedNode.label} TELEMETRY
              </span>
              <button
                type="button"
                onClick={() => setSelectedNodeId(null)}
                aria-label="Close Inspector"
                className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-1.5 pt-2 text-xs">
              {selectedNode.details.map((d) => (
                <div key={d.label} className="flex justify-between text-slate-600">
                  <span>{d.label}</span>
                  <span className="font-semibold text-slate-900">{d.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending Update Overlay */}
      {isSimulating && (
        <div className="absolute inset-0 bg-white/35 backdrop-blur-[1px] flex items-center justify-center z-40 transition-opacity">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-950 text-white text-xs font-semibold shadow-xl">
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Recalculating Energy Flows...</span>
          </div>
        </div>
      )}
    </div>
  );
}