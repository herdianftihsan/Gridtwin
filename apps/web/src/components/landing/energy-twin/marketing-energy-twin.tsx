'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

type EnergyNodeType = 'solar' | 'building' | 'battery' | 'grid' | 'ac' | 'led' | null;

interface NodeDetail {
  id: NonNullable<EnergyNodeType>;
  title: string;
  badge: string;
  metric: string;
  roleDescription: string;
}

const NODE_DETAILS: Record<NonNullable<EnergyNodeType>, NodeDetail> = {
  solar: {
    id: 'solar',
    title: 'Solar PV Array',
    badge: 'Proposed Generation',
    metric: '4 kWp (405 kWh/mo)',
    roleDescription: 'Supplies daytime building loads directly and routes surplus energy to battery storage.',
  },
  building: {
    id: 'building',
    title: 'Building Load',
    badge: 'Anchor Demand',
    metric: '2,796 kWh/mo',
    roleDescription: 'Commercial Ruko consumption profile combining daytime cooling and baseline appliances.',
  },
  battery: {
    id: 'battery',
    title: 'Battery Storage',
    badge: 'Storage & Peak Shift',
    metric: '5 kWh Capacity',
    roleDescription: 'Stores daytime solar surplus to power evening loads, cutting nighttime PLN grid draw.',
  },
  grid: {
    id: 'grid',
    title: 'PLN Utility Grid',
    badge: 'Residual Supply',
    metric: '946 kWh/mo Draw',
    roleDescription: 'Supplies remaining electrical deficit under ESDM 2/2024 non-export regulation.',
  },
  ac: {
    id: 'ac',
    title: 'Inverter AC Units',
    badge: 'Efficiency Upgrade',
    metric: '2 Units (-144 kWh/mo)',
    roleDescription: 'Variable-speed cooling compressor reduces daytime building baseline demand by 30%.',
  },
  led: {
    id: 'led',
    title: 'Smart LED Lighting',
    badge: 'Efficiency Upgrade',
    metric: 'Upgraded (-60 kWh/mo)',
    roleDescription: 'High-efficiency solid-state luminaires reduce lighting energy consumption by 60%.',
  },
};

export function MarketingEnergyTwin() {
  const shouldReduceMotion = useReducedMotion();
  const [activeNode, setActiveNode] = useState<EnergyNodeType>(null);

  const getPathOpacity = (connectedNodes: EnergyNodeType[]) => {
    if (!activeNode) return 0.9;
    return connectedNodes.includes(activeNode) ? 1 : 0.15;
  };

  const getNodeOpacity = (nodeId: EnergyNodeType) => {
    if (!activeNode) return 1;
    return activeNode === nodeId ? 1 : 0.4;
  };

  const activeDetail = activeNode ? NODE_DETAILS[activeNode] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8 select-none flex flex-col justify-between text-left space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs z-10">
        <div className="flex items-center gap-2.5 bg-slate-900/90 px-4 py-2 rounded-full border border-slate-700 shadow-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white font-bold tracking-tight">Interactive Energy Topology</span>
          <span className="text-slate-400 font-medium hidden sm:inline">· Arahkan kursor ke node untuk melihat aliran</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Solar PV</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-teal-400" /> Battery</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-400" /> PLN Grid</span>
        </div>
      </div>

      <div className="relative w-full h-[360px] sm:h-[400px] flex items-center justify-center my-2">
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <line
            x1="50"
            y1="23.5"
            x2="50"
            y2="41.5"
            stroke="#F59E0B"
            strokeWidth="0.8"
            strokeDasharray={shouldReduceMotion ? 'none' : '2 1.5'}
            opacity={getPathOpacity(['solar', 'building'])}
            className="transition-opacity duration-300"
          />

          <line
            x1="57"
            y1="18.5"
            x2="74"
            y2="26"
            stroke="#F59E0B"
            strokeWidth="0.75"
            strokeDasharray={shouldReduceMotion ? 'none' : '2 1.5'}
            opacity={getPathOpacity(['solar', 'battery'])}
            className="transition-opacity duration-300"
          />

          <line
            x1="75"
            y1="33"
            x2="57"
            y2="45.5"
            stroke="#14B8A6"
            strokeWidth="0.8"
            strokeDasharray={shouldReduceMotion ? 'none' : '2 1.5'}
            opacity={getPathOpacity(['battery', 'building'])}
            className="transition-opacity duration-300"
          />

          <line
            x1="50"
            y1="76.5"
            x2="50"
            y2="58.5"
            stroke="#6366F1"
            strokeWidth="0.8"
            strokeDasharray={shouldReduceMotion ? 'none' : '2 1.5'}
            opacity={getPathOpacity(['grid', 'building'])}
            className="transition-opacity duration-300"
          />

          <line
            x1="25"
            y1="33"
            x2="43"
            y2="45.5"
            stroke="#0EA5E9"
            strokeWidth="0.75"
            strokeDasharray={shouldReduceMotion ? 'none' : '2 1.5'}
            opacity={getPathOpacity(['ac', 'building'])}
            className="transition-opacity duration-300"
          />

          <line
            x1="25"
            y1="67"
            x2="43"
            y2="54.5"
            stroke="#0EA5E9"
            strokeWidth="0.75"
            strokeDasharray={shouldReduceMotion ? 'none' : '2 1.5'}
            opacity={getPathOpacity(['led', 'building'])}
            className="transition-opacity duration-300"
          />
        </svg>

        <div
          onMouseEnter={() => setActiveNode('solar')}
          onMouseLeave={() => setActiveNode(null)}
          style={{ opacity: getNodeOpacity('solar') }}
          className="absolute top-[16%] left-[50%] -translate-x-1/2 -translate-y-1/2 px-4 py-2.5 rounded-2xl bg-slate-900 border border-amber-500/60 text-center shadow-lg cursor-pointer hover:border-amber-400 hover:scale-105 transition-all z-20 min-w-[125px]"
        >
          <span className="text-[11px] text-amber-400 font-bold uppercase block tracking-wider">☀️ SOLAR PV</span>
          <span className="text-sm font-extrabold text-white">4 kWp</span>
        </div>

        <div
          onMouseEnter={() => setActiveNode('building')}
          onMouseLeave={() => setActiveNode(null)}
          style={{ opacity: getNodeOpacity('building') }}
          className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 p-4 rounded-3xl bg-slate-900 border-2 border-slate-500 text-center shadow-2xl cursor-pointer hover:border-sky-400 hover:scale-105 transition-all z-30 min-w-[155px]"
        >
          <span className="text-xs text-slate-300 font-bold uppercase block tracking-wider">🏢 RUKO LOAD</span>
          <span className="text-base font-black text-white">2,796 kWh/mo</span>
        </div>

        <div
          onMouseEnter={() => setActiveNode('battery')}
          onMouseLeave={() => setActiveNode(null)}
          style={{ opacity: getNodeOpacity('battery') }}
          className="absolute top-[28%] left-[82%] -translate-x-1/2 -translate-y-1/2 px-4 py-2.5 rounded-2xl bg-slate-900 border border-teal-500/60 text-center shadow-lg cursor-pointer hover:border-teal-400 hover:scale-105 transition-all z-20 min-w-[125px]"
        >
          <span className="text-[11px] text-teal-400 font-bold uppercase block tracking-wider">⚡ BATTERY</span>
          <span className="text-sm font-extrabold text-white">5 kWh</span>
        </div>

        <div
          onMouseEnter={() => setActiveNode('grid')}
          onMouseLeave={() => setActiveNode(null)}
          style={{ opacity: getNodeOpacity('grid') }}
          className="absolute top-[84%] left-[50%] -translate-x-1/2 -translate-y-1/2 px-4 py-2.5 rounded-2xl bg-slate-900 border border-indigo-500/60 text-center shadow-lg cursor-pointer hover:border-indigo-400 hover:scale-105 transition-all z-20 min-w-[135px]"
        >
          <span className="text-[11px] text-indigo-400 font-bold uppercase block tracking-wider">🔌 PLN GRID</span>
          <span className="text-sm font-extrabold text-white">946 kWh/mo</span>
        </div>

        <div
          onMouseEnter={() => setActiveNode('ac')}
          onMouseLeave={() => setActiveNode(null)}
          style={{ opacity: getNodeOpacity('ac') }}
          className="absolute top-[28%] left-[18%] -translate-x-1/2 -translate-y-1/2 px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-sky-500/60 text-center shadow-lg cursor-pointer hover:border-sky-400 hover:scale-105 transition-all z-20 min-w-[120px]"
        >
          <span className="text-[11px] text-sky-400 font-bold uppercase block tracking-wider">❄️ AC INVERTER</span>
          <span className="text-sm font-extrabold text-white">2 Units</span>
        </div>

        <div
          onMouseEnter={() => setActiveNode('led')}
          onMouseLeave={() => setActiveNode(null)}
          style={{ opacity: getNodeOpacity('led') }}
          className="absolute top-[72%] left-[18%] -translate-x-1/2 -translate-y-1/2 px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-sky-500/60 text-center shadow-lg cursor-pointer hover:border-sky-400 hover:scale-105 transition-all z-20 min-w-[120px]"
        >
          <span className="text-[11px] text-sky-400 font-bold uppercase block tracking-wider">💡 SMART LED</span>
          <span className="text-sm font-extrabold text-white">Upgraded</span>
        </div>
      </div>

      {activeDetail ? (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-between text-xs transition-all">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">{activeDetail.title}</span>
              <span className="text-xs text-sky-400 font-semibold">({activeDetail.badge})</span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{activeDetail.roleDescription}</p>
          </div>
          <span className="font-mono font-extrabold text-emerald-400 text-sm shrink-0 ml-4">{activeDetail.metric}</span>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-center text-xs">
          <div className="flex-1">
            <span className="text-xs text-slate-400 block font-semibold">Monthly Demand</span>
            <span className="font-extrabold text-white text-sm mt-0.5 block">2,796 kWh</span>
          </div>
          <div className="w-[1px] h-6 bg-slate-800" />
          <div className="flex-1">
            <span className="text-xs text-amber-400 block font-semibold">Solar Yield</span>
            <span className="font-extrabold text-amber-300 text-sm mt-0.5 block">405 kWh</span>
          </div>
          <div className="w-[1px] h-6 bg-slate-800" />
          <div className="flex-1">
            <span className="text-xs text-indigo-400 block font-semibold">PLN Draw</span>
            <span className="font-extrabold text-indigo-300 text-sm mt-0.5 block">946 kWh</span>
          </div>
          <div className="w-[1px] h-6 bg-slate-800" />
          <div className="flex-1">
            <span className="text-xs text-emerald-400 block font-semibold">Grid Autonomy</span>
            <span className="font-extrabold text-emerald-400 text-sm mt-0.5 block">66.2%</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}