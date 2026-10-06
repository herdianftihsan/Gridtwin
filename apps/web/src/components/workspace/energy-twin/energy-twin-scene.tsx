'use client';

import React, { useMemo, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { Project, SimulationResult } from '../../../types/api';
import { NodeKey } from '../energy-canvas/types';
import { EnergyTwinAsset, EnergyTwinFlow, mapSimulationToEnergyTwin } from './energy-twin-view-model';

export type EnergyTwinViewMode = 'classic' | '2.5d';

interface EnergyTwinSceneProps {
  result: SimulationResult;
  project?: Project | null;
  buildingType?: string;
  location?: string;
  onSelectNode: (id: NodeKey) => void;
  onClearSelection: () => void;
  selectedNodeId: NodeKey | null;
  viewMode: EnergyTwinViewMode;
  onViewModeChange: (mode: EnergyTwinViewMode) => void;
}

const LOAD_IDS: NodeKey[] = ['ac', 'led', 'refrigerator', 'pump'];

const anchorClass: Record<NodeKey, string> = {
  solar: 'energy-twin-anchor-solar', building: 'energy-twin-anchor-building', battery: 'energy-twin-anchor-battery', grid: 'energy-twin-anchor-grid',
  ac: 'energy-twin-anchor-ac', led: 'energy-twin-anchor-led', refrigerator: 'energy-twin-anchor-refrigerator', pump: 'energy-twin-anchor-pump',
};

function getAsset(assets: EnergyTwinAsset[], id: NodeKey): EnergyTwinAsset {
  return assets.find((asset) => asset.id === id)!;
}

function AnchorLabel({ asset, selected, dimmed, onSelect }: { asset: EnergyTwinAsset; selected: boolean; dimmed: boolean; onSelect: () => void }) {
  const { telemetry } = asset;
  return <button type="button" className={`energy-twin-anchor ${anchorClass[asset.id]} ${selected ? 'energy-twin-anchor-selected' : ''} ${dimmed ? 'energy-twin-anchor-dimmed' : ''} ${telemetry.isActive ? '' : 'energy-twin-anchor-inactive'}`} onClick={onSelect} aria-label={`${telemetry.label}: ${telemetry.valueDisplay}, ${telemetry.sublabel}`} aria-pressed={selected}><span className="energy-twin-anchor-line" aria-hidden="true" /><span className="energy-twin-anchor-copy"><strong>{telemetry.label}</strong><span>{telemetry.valueDisplay}</span></span></button>;
}

function SolarArray({ asset, selected, dimmed, onSelect }: { asset: EnergyTwinAsset; selected: boolean; dimmed: boolean; onSelect: () => void }) {
  const active = asset.telemetry.isActive;
  return <button type="button" className={`energy-twin-solar-array ${active ? '' : 'energy-twin-solar-array-inactive'} ${selected ? 'energy-twin-solar-array-selected' : ''} ${dimmed ? 'energy-twin-anchor-dimmed' : ''}`} onClick={onSelect} aria-label={`${asset.telemetry.label}: ${asset.telemetry.valueDisplay}`} aria-pressed={selected}><span className="energy-twin-panel-grid" aria-hidden="true">{Array.from({ length: active ? 12 : 1 }).map((_, index) => <i key={index} />)}</span><span className="energy-twin-solar-caption">{active ? `SOLAR PV · ${asset.telemetry.sublabel.replace('Kapasitas: ', '')}` : 'ROOFTOP · Solar belum terpasang'}</span></button>;
}

function BatteryCabinet({ asset, selected, dimmed, onSelect }: { asset: EnergyTwinAsset; selected: boolean; dimmed: boolean; onSelect: () => void }) {
  return <button type="button" className={`energy-twin-battery-cabinet ${asset.telemetry.isActive ? '' : 'energy-twin-asset-inactive'} ${selected ? 'energy-twin-battery-selected' : ''} ${dimmed ? 'energy-twin-anchor-dimmed' : ''}`} onClick={onSelect} aria-label={`${asset.telemetry.label}: ${asset.telemetry.valueDisplay}`} aria-pressed={selected}><span className="energy-twin-battery-light" aria-hidden="true" /><span className="energy-twin-battery-icon" aria-hidden="true">▥</span><strong>BATTERY</strong><span>{asset.telemetry.valueDisplay}</span></button>;
}

function GridInfrastructure({ asset, selected, dimmed, onSelect }: { asset: EnergyTwinAsset; selected: boolean; dimmed: boolean; onSelect: () => void }) {
  return <button type="button" className={`energy-twin-grid-infrastructure ${asset.telemetry.isActive ? '' : 'energy-twin-grid-inactive'} ${selected ? 'energy-twin-grid-selected' : ''} ${dimmed ? 'energy-twin-anchor-dimmed' : ''}`} onClick={onSelect} aria-label={`${asset.telemetry.label}: ${asset.telemetry.valueDisplay}`} aria-pressed={selected}><span className="energy-twin-utility-pole" aria-hidden="true"><i /><i /><i /></span><span className="energy-twin-meter" aria-hidden="true">⚡</span><span className="energy-twin-grid-copy"><strong>GRID / PLN</strong><span>{asset.telemetry.valueDisplay}</span></span></button>;
}

function FlowLayer({ flows, selectedNodeId, reducedMotion }: { flows: EnergyTwinFlow[]; selectedNodeId: NodeKey | null; reducedMotion: boolean }) {
  const activeFlows = flows.filter((flow) => flow.active);
  const paths: Record<string, string> = { 'solar-building': 'M 500 112 C 500 156 500 185 500 238', 'solar-battery': 'M 575 125 C 650 168 690 225 710 405', 'battery-building': 'M 680 430 C 620 400 565 350 540 300', 'grid-building': 'M 850 465 C 775 465 690 430 575 335', 'building-surplus': 'M 555 305 C 640 330 760 350 855 310' };
  return <svg className="energy-twin-flow-layer" viewBox="0 0 1000 620" role="img" aria-label="Arah aliran energi simulasi"><defs>{activeFlows.map((flow) => <marker key={flow.id} id={`energy-twin-arrow-${flow.id}`} markerWidth="8" markerHeight="8" refX="7" refY="4" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill={flow.color} /></marker>)}</defs>{activeFlows.map((flow) => { const connected = !selectedNodeId || flow.from === selectedNodeId || flow.to === selectedNodeId; return <path key={flow.id} d={paths[flow.id]} className={`energy-twin-flow ${flow.animated && !reducedMotion ? 'energy-twin-flow-animated' : ''} ${connected ? '' : 'energy-twin-flow-dimmed'}`} stroke={flow.color} markerEnd={`url(#energy-twin-arrow-${flow.id})`} />; })}</svg>;
}

function BuildingShell({ model, assets, selectedNodeId, onSelectNode }: { model: ReturnType<typeof mapSimulationToEnergyTwin>; assets: EnergyTwinAsset[]; selectedNodeId: NodeKey | null; onSelectNode: (id: NodeKey) => void }) {
  const dimmed = Boolean(selectedNodeId && selectedNodeId !== 'building');
  const loadAssets = LOAD_IDS.map((id) => getAsset(assets, id));
  return <div className={`energy-twin-building ${dimmed ? 'energy-twin-building-dimmed' : ''}`} style={{ '--energy-twin-floors': model.building.floors } as React.CSSProperties} aria-label={`Bangunan ${model.building.type} dengan ${model.building.floors} lantai`}><div className="energy-twin-roof-deck"><div className="energy-twin-roof-edge" /><SolarArray asset={getAsset(assets, 'solar')} selected={selectedNodeId === 'solar'} dimmed={Boolean(selectedNodeId && selectedNodeId !== 'solar')} onSelect={() => onSelectNode('solar')} /></div><div className="energy-twin-facade"><div className="energy-twin-facade-sign">{model.building.type.toUpperCase()} <span>{model.building.location}</span></div>{Array.from({ length: model.building.floors }).map((_, floor) => <div className="energy-twin-floor" key={floor}><span className="energy-twin-floor-number">{model.building.floors - floor}</span><div className="energy-twin-windows">{Array.from({ length: model.building.type === 'Office' ? 5 : 4 }).map((__, index) => <span key={index} className={floor === model.building.floors - 1 ? 'energy-twin-window-lit' : ''} />)}</div>{floor === model.building.floors - 1 && <span className="energy-twin-entrance" aria-hidden="true" />}{floor === 0 && <div className="energy-twin-interior-loads">{loadAssets.map((asset) => <button key={asset.id} type="button" className={`energy-twin-load-hotspot energy-twin-load-${asset.id} ${asset.telemetry.isActive ? '' : 'energy-twin-load-inactive'} ${selectedNodeId === asset.id ? 'energy-twin-load-selected' : ''}`} onClick={() => onSelectNode(asset.id)} aria-label={`${asset.telemetry.label}: ${asset.telemetry.valueDisplay}`} aria-pressed={selectedNodeId === asset.id}><i aria-hidden="true" /><span>{asset.telemetry.label.replace('PENDINGIN RUANGAN (AC)', 'AC').replace('LED PINTAR', 'LED').replace('PENDINGINAN', 'REF').replace('POMPA AIR', 'PUMP')}</span></button>)}</div>}</div>)}</div><div className="energy-twin-side-facade"><span className="energy-twin-side-window" /><span className="energy-twin-side-window" /><span className="energy-twin-side-window" /></div><span className="energy-twin-building-label">BUILDING LOAD <strong>{Math.round(model.summary.monthlyDemandKwh)} kWh/bln</strong></span></div>;
}

function AccessibleSummary({ model }: { model: ReturnType<typeof mapSimulationToEnergyTwin> }) {
  const solar = getAsset(model.assets, 'solar').telemetry.valueDisplay;
  const grid = getAsset(model.assets, 'grid').telemetry.valueDisplay;
  const battery = getAsset(model.assets, 'battery').telemetry.valueDisplay;
  return <p className="sr-only">Simulated Energy Flow untuk {model.building.type} di {model.building.location}. Solar menghasilkan {solar}. Beban bangunan menggunakan {Math.round(model.summary.monthlyDemandKwh)} kWh per bulan. Jaringan PLN memasok {grid}. Kapasitas baterai adalah {battery}. Surplus tidak terpakai sebesar {Math.round(model.summary.wastedSurplusKwh)} kWh per bulan.</p>;
}

export function EnergyTwinScene({ result, project, buildingType, location, onSelectNode, onClearSelection, selectedNodeId, viewMode, onViewModeChange }: EnergyTwinSceneProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const [showLegend, setShowLegend] = useState(true);
  const model = useMemo(() => mapSimulationToEnergyTwin(result, project, buildingType, location), [result, project, buildingType, location]);
  const assetsById = new Map(model.assets.map((asset) => [asset.id, asset]));
  if (viewMode === 'classic') return null;
  const selectedAsset = selectedNodeId ? assetsById.get(selectedNodeId) : null;
  const isDimmed = (id: NodeKey) => Boolean(selectedNodeId && selectedNodeId !== id);
  return <section className="energy-twin-scene-shell" aria-label="Energy Twin 2.5D"><div className="energy-twin-toolbar"><div><p className="energy-twin-eyebrow">Simulated energy flow</p><h2 className="energy-twin-title">Energy Twin · {model.building.type}</h2><p className="energy-twin-location">{model.building.location}</p></div><div className="energy-twin-toolbar-actions"><div className="energy-twin-segmented" role="group" aria-label="Mode tampilan Energy Twin"><button type="button" aria-pressed={false} onClick={() => onViewModeChange('classic')}>Classic</button><button type="button" aria-pressed={true} onClick={() => onViewModeChange('2.5d')}>2.5D</button></div><button type="button" className="energy-twin-legend-toggle" onClick={() => setShowLegend((visible) => !visible)} aria-expanded={showLegend}>{showLegend ? 'Sembunyikan legenda' : 'Tampilkan legenda'}</button></div></div><div className="energy-twin-stage"><div className="energy-twin-skyline" aria-hidden="true"><span /><span /><span /><span /></div><div className="energy-twin-ground" aria-hidden="true"><i /><i /><i /></div><BuildingShell model={model} assets={model.assets} selectedNodeId={selectedNodeId} onSelectNode={onSelectNode} /><FlowLayer flows={model.flows} selectedNodeId={selectedNodeId} reducedMotion={reducedMotion} /><AnchorLabel asset={getAsset(model.assets, 'solar')} selected={selectedNodeId === 'solar'} dimmed={isDimmed('solar')} onSelect={() => onSelectNode('solar')} /><BatteryCabinet asset={getAsset(model.assets, 'battery')} selected={selectedNodeId === 'battery'} dimmed={isDimmed('battery')} onSelect={() => onSelectNode('battery')} /><GridInfrastructure asset={getAsset(model.assets, 'grid')} selected={selectedNodeId === 'grid'} dimmed={isDimmed('grid')} onSelect={() => onSelectNode('grid')} /><div className="energy-twin-surplus-anchor"><span className="energy-twin-surplus-symbol">↗</span><span>WASTE / SURPLUS</span><strong>{Math.round(model.summary.wastedSurplusKwh)} kWh/bln</strong></div>{showLegend && <div className="energy-twin-legend" aria-label="Legenda energi"><span><i className="energy-twin-legend-swatch energy-twin-legend-solar" />Solar</span><span><i className="energy-twin-legend-swatch energy-twin-legend-grid" />Grid</span><span><i className="energy-twin-legend-swatch energy-twin-legend-battery" />Battery</span><span><i className="energy-twin-legend-swatch energy-twin-legend-load" />Loads</span></div>}<div className="energy-twin-scene-caption">{model.building.roofArea ? `${model.building.roofArea} m² roof area` : 'Modeled building system'}</div></div>{selectedAsset && <div className="energy-twin-inspector" role="status"><div className="energy-twin-inspector-header"><span>TELEMETRI {selectedAsset.telemetry.label}</span><button type="button" onClick={onClearSelection} aria-label="Tutup inspector telemetry">✕</button></div><div className="energy-twin-inspector-details">{selectedAsset.telemetry.details.map((detail) => <div key={detail.label}><span>{detail.label}</span><strong>{detail.value}</strong></div>)}</div></div>}<AccessibleSummary model={model} /></section>;
}
