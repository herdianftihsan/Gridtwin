"use client";

import Image from "next/image";
import React, { useId, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { Project, SimulationResult } from "../../../types/api";
import { NodeKey } from "../energy-canvas/types";
import {
  EnergyTwinAsset,
  EnergyTwinFlow,
  mapSimulationToEnergyTwin,
} from "./energy-twin-view-model";

export type EnergyTwinViewMode = "classic" | "2.5d";

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

const LOAD_IDS: NodeKey[] = ["led", "refrigerator", "pump"];
const ASSET_SRC = {
  building: "/energy-twin/buildings/building-ruko 1.png",
  solar: "/energy-twin/solar/solar-roof-transparent.png",
  battery: "/energy-twin/storage/battery-trimmed.png",
  grid: "/energy-twin/grid/grid-site.png",
  hvac: "/energy-twin/equipment/hvac-trimmed.png",
} as const;

type ScenePoint = { x: number; y: number };
type AssetFrame = ScenePoint & { width: number; height: number };
type SceneAnchor = {
  asset: AssetFrame;
  label: ScenePoint;
  input?: ScenePoint;
  output?: ScenePoint;
  solarInput?: ScenePoint;
  utilityInput?: ScenePoint;
};

// Local attachment points move with their image frame, including transparent padding.
function anchorFrame(asset: AssetFrame, points: Omit<SceneAnchor, "asset">): SceneAnchor {
  const absolute = Object.fromEntries(
    Object.entries(points).map(([key, point]) => [
      key,
      { x: asset.x + point.x, y: asset.y + point.y },
    ]),
  );
  return { asset, ...absolute } as SceneAnchor;
}

// All coordinates share the SVG viewBox. CSS converts these normalized values to stage percentages.
export const SCENE_ANCHORS: Record<NodeKey, SceneAnchor> = {
  building: anchorFrame(
    { x: 50, y: 40, width: 850, height: 567 },
    {
      label: { x: 440, y: 570 },
      solarInput: { x: 230, y: 275 },
      utilityInput: { x: 630, y: 350 },
      output: { x: 220, y: 325 },
    },
  ),
  solar: anchorFrame(
    { x: 50, y: 40, width: 850, height: 567 },
    { label: { x: 250, y: 55 }, output: { x: 230, y: 170 } },
  ),
  battery: anchorFrame(
    { x: 150, y: 440, width: 100, height: 130 },
    { label: { x: 50, y: 150 }, input: { x: 90, y: 95 }, output: { x: 90, y: 95 } },
  ),
  grid: anchorFrame(
    { x: 760, y: 310, width: 150, height: 200 },
    { label: { x: 75, y: 220 }, output: { x: 94, y: 122 } },
  ),
  ac: anchorFrame({ x: 690, y: 410, width: 72, height: 65 }, { label: { x: 20, y: 85 } }),
  led: { asset: { x: 0, y: 0, width: 0, height: 0 }, label: { x: 360, y: 345 } },
  refrigerator: { asset: { x: 0, y: 0, width: 0, height: 0 }, label: { x: 380, y: 465 } },
  pump: { asset: { x: 0, y: 0, width: 0, height: 0 }, label: { x: 615, y: 510 } },
};
export const SCENE_SIZE = { width: 1000, height: 760 };
const SURPLUS_ANCHOR = { x: 130, y: 335 };

export function pointStyle(point: ScenePoint): React.CSSProperties {
  return {
    left: `${(point.x / SCENE_SIZE.width) * 100}%`,
    top: `${(point.y / SCENE_SIZE.height) * 100}%`,
  };
}

function frameStyle(frame: AssetFrame): React.CSSProperties {
  return {
    ...pointStyle(frame),
    width: `${(frame.width / SCENE_SIZE.width) * 100}%`,
    height: `${(frame.height / SCENE_SIZE.height) * 100}%`,
  } as React.CSSProperties;
}

function getAsset(assets: EnergyTwinAsset[], id: NodeKey): EnergyTwinAsset {
  return assets.find((asset) => asset.id === id)!;
}

function AssetButton({
  asset,
  className,
  selected,
  dimmed,
  onSelect,
  children,
}: {
  asset: EnergyTwinAsset;
  className: string;
  selected: boolean;
  dimmed: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      style={frameStyle(SCENE_ANCHORS[asset.id].asset)}
      className={`energy-twin-image-button ${className} ${selected ? "energy-twin-image-selected" : ""} ${dimmed ? "energy-twin-image-dimmed" : ""} ${asset.telemetry.isActive ? "" : "energy-twin-image-inactive"}`}
      onClick={onSelect}
      aria-label={`${asset.telemetry.label}: ${asset.telemetry.valueDisplay}`}
      aria-pressed={selected}
    >
      {children}
    </button>
  );
}

function FlowLayer({
  flows,
  selectedNodeId,
  reducedMotion,
}: {
  flows: EnergyTwinFlow[];
  selectedNodeId: NodeKey | null;
  reducedMotion: boolean;
}) {
  const paths: Record<string, string> = {
    "solar-building": `M ${SCENE_ANCHORS.solar.output!.x} ${SCENE_ANCHORS.solar.output!.y} C 255 240 255 285 ${SCENE_ANCHORS.building.solarInput!.x} ${SCENE_ANCHORS.building.solarInput!.y}`,
    "grid-building": `M ${SCENE_ANCHORS.grid.output!.x} ${SCENE_ANCHORS.grid.output!.y} C 790 440 750 380 ${SCENE_ANCHORS.building.utilityInput!.x} ${SCENE_ANCHORS.building.utilityInput!.y}`,
    "building-surplus": `M ${SCENE_ANCHORS.building.output!.x} ${SCENE_ANCHORS.building.output!.y} C 220 380 180 370 ${SURPLUS_ANCHOR.x} ${SURPLUS_ANCHOR.y}`,
  };
  return (
    <svg
      className="energy-twin-flow-layer"
      viewBox={`0 0 ${SCENE_SIZE.width} ${SCENE_SIZE.height}`}
      role="img"
      aria-label="Arah aliran energi simulasi"
    >
      <defs>
        {flows
          .filter((flow) => flow.active)
          .map((flow) => (
            <marker
              key={flow.id}
              id={`energy-twin-arrow-${flow.id}`}
              markerWidth="4"
              markerHeight="4"
              refX="3"
              refY="2"
              orient="auto"
            >
              <path d="M0,0 L4,2 L0,4 Z" fill={flow.color} />
            </marker>
          ))}
      </defs>
      {flows
        .filter((flow) => flow.active)
        .map((flow) => {
          const connected =
            !selectedNodeId || flow.from === selectedNodeId || flow.to === selectedNodeId;
          return (
            <path
              key={flow.id}
              data-flow={flow.id}
              d={paths[flow.id]}
              vectorEffect="non-scaling-stroke"
              className={`energy-twin-flow ${flow.animated && !reducedMotion ? "energy-twin-flow-animated" : ""} ${connected ? "" : "energy-twin-flow-dimmed"}`}
              stroke={flow.color}
              markerEnd={`url(#energy-twin-arrow-${flow.id})`}
            />
          );
        })}
    </svg>
  );
}

function BuildingHotspots({
  assets,
  selectedNodeId,
  onSelectNode,
}: {
  assets: EnergyTwinAsset[];
  selectedNodeId: NodeKey | null;
  onSelectNode: (id: NodeKey) => void;
}) {
  return (
    <div className="energy-twin-building-loads" aria-label="Beban dan peralatan bangunan">
      {LOAD_IDS.map((id) => {
        const asset = getAsset(assets, id);
        return (
          <button
            type="button"
            key={id}
            style={pointStyle(SCENE_ANCHORS[id].label)}
            className={`energy-twin-load-hotspot energy-twin-load-${id} ${asset.telemetry.isActive ? "" : "energy-twin-load-inactive"} ${selectedNodeId === id ? "energy-twin-load-selected" : ""}`}
            onClick={() => onSelectNode(id)}
            aria-label={`${asset.telemetry.label}: ${asset.telemetry.valueDisplay}`}
            aria-pressed={selectedNodeId === id}
          >
            <i aria-hidden="true" />
            <span>
              {id === "ac"
                ? "HVAC"
                : id === "led"
                  ? "Lampu"
                  : id === "refrigerator"
                    ? "Pendinginan"
                    : "Pompa air"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function AnchoredLabel({
  asset,
  className = "",
  selected,
  dimmed,
  onSelect,
}: {
  asset: EnergyTwinAsset;
  className?: string;
  selected: boolean;
  dimmed: boolean;
  onSelect: () => void;
}) {
  const anchor = SCENE_ANCHORS[asset.id];
  const text =
    asset.id === "solar"
      ? "Panel Surya"
      : asset.id === "battery"
        ? "Baterai"
        : asset.id === "grid"
          ? "Jaringan PLN"
          : asset.id === "building"
            ? "Beban Bangunan"
            : "AC";
  const unconfigured =
    (asset.id === "solar" || asset.id === "battery") && !asset.telemetry.isActive;
  const value = unconfigured
    ? "Tidak dikonfigurasi"
    : asset.id === "ac" && !asset.telemetry.isActive
      ? "Standar"
      : asset.telemetry.valueDisplay;
  return (
    <button
      type="button"
      style={pointStyle(
        unconfigured && asset.id === "solar"
          ? { ...anchor.label, y: anchor.label.y + 50 }
          : anchor.label,
      )}
      className={`energy-twin-anchor-label ${className} ${selected ? "energy-twin-anchor-label-selected" : ""} ${dimmed ? "energy-twin-anchor-label-dimmed" : ""} ${asset.telemetry.isActive ? "" : "energy-twin-anchor-label-inactive"}`}
      onClick={onSelect}
      aria-label={`${asset.telemetry.label}: ${value}`}
      aria-pressed={selected}
    >
      <span>
        <strong>{text}</strong>
        <small className={unconfigured ? "energy-twin-equipment-status" : ""}>
          {unconfigured ? (
            <>
              <span className="energy-twin-status-full">{value}</span>
              <span className="energy-twin-status-short">Nonaktif</span>
            </>
          ) : (
            value
          )}
        </small>
      </span>
    </button>
  );
}

function AccessibleSummary({ model }: { model: ReturnType<typeof mapSimulationToEnergyTwin> }) {
  const solar = getAsset(model.assets, "solar").telemetry.valueDisplay;
  const grid = getAsset(model.assets, "grid").telemetry.valueDisplay;
  const battery = getAsset(model.assets, "battery").telemetry.valueDisplay;
  return (
    <p className="sr-only">
      Simulated Energy Flow untuk {model.building.type} di {model.building.location}. Solar
      menghasilkan {solar}. Beban bangunan menggunakan {Math.round(model.summary.monthlyDemandKwh)}{" "}
      kWh per bulan. Jaringan PLN memasok {grid}. Kapasitas baterai adalah {battery}. Surplus tidak
      terpakai sebesar {Math.round(model.summary.wastedSurplusKwh)} kWh per bulan.
    </p>
  );
}

export function EnergyTwinScene({
  result,
  project,
  buildingType,
  location,
  onSelectNode,
  onClearSelection,
  selectedNodeId,
  viewMode,
  onViewModeChange,
}: EnergyTwinSceneProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const [showLegend, setShowLegend] = useState(true);
  const environmentId = useId();
  const selectionTrigger = useRef<HTMLElement | null>(null);
  const selectNode = (id: NodeKey) => {
    selectionTrigger.current = document.activeElement as HTMLElement;
    onSelectNode(id);
  };
  const closeInspector = () => {
    onClearSelection();
    selectionTrigger.current?.focus({ preventScroll: true });
  };
  const model = useMemo(
    () => mapSimulationToEnergyTwin(result, project, buildingType, location),
    [result, project, buildingType, location],
  );
  if (viewMode === "classic") return null;
  const selectedAsset = selectedNodeId ? getAsset(model.assets, selectedNodeId) : null;
  const dimmed = (id: NodeKey) => Boolean(selectedNodeId && selectedNodeId !== id);
  const asset = (id: NodeKey) => getAsset(model.assets, id);
  const inspectedAsset = selectedAsset ?? asset("building");

  return (
    <section
      className="energy-twin-scene-shell"
      aria-label="Energy Twin 2.5D"
      onClickCapture={(event) => {
        const button = (event.target as HTMLElement).closest("button");
        if (button && !button.closest(".energy-twin-inspector")) selectionTrigger.current = button;
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && selectedAsset) {
          event.preventDefault();
          closeInspector();
        }
      }}
    >
      <div className="energy-twin-toolbar">
        <div>
          <p className="energy-twin-eyebrow">Aliran energi simulasi</p>
          <h2 className="energy-twin-title">Energy Twin · {model.building.type}</h2>
          <p className="energy-twin-location">{model.building.location}</p>
        </div>
        <div className="energy-twin-toolbar-actions">
          <div
            className="energy-twin-segmented"
            role="group"
            aria-label="Mode tampilan Energy Twin"
          >
            <button type="button" aria-pressed={false} onClick={() => onViewModeChange("classic")}>
              Classic
            </button>
            <button type="button" aria-pressed={true}>
              2.5D
            </button>
          </div>
          <button
            type="button"
            className="energy-twin-legend-toggle"
            onClick={() => setShowLegend((visible) => !visible)}
            aria-expanded={showLegend}
          >
            {showLegend ? "Sembunyikan legenda" : "Tampilkan legenda"}
          </button>
        </div>
      </div>
      <div className="energy-twin-stage energy-twin-asset-stage">
        <svg
          className="energy-twin-environment"
          viewBox={`0 0 ${SCENE_SIZE.width} ${SCENE_SIZE.height}`}
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <linearGradient id={`${environmentId}-paving`} x1="0" y1="0" x2="0.3" y2="1">
              <stop offset="0" stopColor="#e8ebe6" stopOpacity="0.12" />
              <stop offset="0.65" stopColor="#dedfd7" stopOpacity="0.55" />
              <stop offset="1" stopColor="#e9e7df" stopOpacity="0.25" />
            </linearGradient>
            <radialGradient id={`${environmentId}-shadow`}>
              <stop offset="0" stopColor="#39483d" stopOpacity="0.18" />
              <stop offset="1" stopColor="#39483d" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Paving follows the two ground-plane axes of the supplied building. */}
          <path
            d="M 110 432 Q 95 440 110 449 L 505 677 Q 520 686 535 677 L 930 449 Q 945 440 930 432 L 535 204 Q 520 195 505 204 Z"
            fill={`url(#${environmentId}-paving)`}
          />
          <g className="energy-twin-paving-seams">
            <path d="M 122 459 L 520 689 L 918 459" />
            <path d="M 159 470 L 520 678 L 881 470" />
            <path d="M 275 528 L 294 517 M 385 592 L 404 581 M 635 612 L 616 601 M 745 548 L 726 537" />
            <path d="M 124 420 L 202 375 M 838 386 L 916 431" />
          </g>
          <ellipse cx="510" cy="546" rx="285" ry="78" fill={`url(#${environmentId}-shadow)`} />
          {(["battery", "grid", "ac"] as const).map((id) => {
            const frame = SCENE_ANCHORS[id].asset;
            if (id === "battery" && !asset(id).telemetry.isActive) return null;
            return (
              <ellipse
                key={id}
                cx={frame.x + frame.width / 2}
                cy={frame.y + frame.height - 3}
                rx={frame.width * 0.6}
                ry={frame.width * 0.15}
                fill={`url(#${environmentId}-shadow)`}
              />
            );
          })}
          <g className="energy-twin-edge-planting">
            <path
              d="M 95 405 L 119 391 L 157 413 L 133 427 Z M 898 570 L 922 556 L 956 576 L 932 590 Z"
              fill="#b8c3b1"
              fillOpacity="0.5"
            />
            <path
              d="M 95 405 L 133 427 L 133 432 L 95 410 Z M 898 570 L 932 590 L 932 595 L 898 575 Z"
              fill="#a1afa0"
              fillOpacity="0.35"
            />
            <path
              d="M 123 410 C 99 403 100 385 107 380 C 117 384 124 395 123 410 C 118 390 122 372 130 369 C 138 380 135 399 123 410 C 136 388 145 387 150 392 C 147 403 135 408 123 410 Z"
              fill="#7d9778"
            />
            <path
              d="M 925 577 C 907 571 902 555 908 549 C 921 555 926 565 925 577 C 920 554 925 541 932 539 C 940 551 936 567 925 577 C 936 559 946 556 950 562 C 946 571 936 577 925 577 Z"
              fill="#8ba082"
            />
            <path
              d="M 123 410 L 129 382 M 925 577 L 931 550"
              stroke="#627c62"
              strokeWidth="1.2"
              fill="none"
            />
          </g>
        </svg>
        <AssetButton
          asset={asset("building")}
          className="energy-twin-building-image"
          selected={selectedNodeId === "building"}
          dimmed={dimmed("building")}
          onSelect={() => onSelectNode("building")}
        >
          <Image
            src={ASSET_SRC.building}
            alt=""
            fill
            sizes="(max-width: 640px) 82vw, 540px"
            priority
          />
        </AssetButton>
        {result.configuration.pv_kwp > 0 && (
          <div className="energy-twin-solar-image" style={frameStyle(SCENE_ANCHORS.solar.asset)}>
            <Image
              src={ASSET_SRC.solar}
              alt="Panel solar terpasang di atap"
              fill
              sizes="(max-width: 640px) 85vw, 720px"
            />
          </div>
        )}
        {asset("battery").telemetry.isActive && (
          <AssetButton
            asset={asset("battery")}
            className="energy-twin-battery-image"
            selected={selectedNodeId === "battery"}
            dimmed={dimmed("battery")}
            onSelect={() => selectNode("battery")}
          >
            <Image src={ASSET_SRC.battery} alt="" fill sizes="150px" />
          </AssetButton>
        )}
        <AssetButton
          asset={asset("grid")}
          className="energy-twin-grid-image"
          selected={selectedNodeId === "grid"}
          dimmed={dimmed("grid")}
          onSelect={() => onSelectNode("grid")}
        >
          <Image src={ASSET_SRC.grid} alt="" fill sizes="180px" />
        </AssetButton>
        <AssetButton
          asset={asset("ac")}
          className="energy-twin-hvac-image"
          selected={selectedNodeId === "ac"}
          dimmed={dimmed("ac")}
          onSelect={() => onSelectNode("ac")}
        >
          <Image src={ASSET_SRC.hvac} alt="" fill sizes="110px" />
        </AssetButton>
        <FlowLayer
          flows={model.flows}
          selectedNodeId={selectedNodeId}
          reducedMotion={reducedMotion}
        />
        <AnchoredLabel
          asset={asset("solar")}
          className="energy-twin-label-solar"
          selected={selectedNodeId === "solar"}
          dimmed={dimmed("solar")}
          onSelect={() => onSelectNode("solar")}
        />
        <AnchoredLabel
          asset={asset("building")}
          className="energy-twin-label-building"
          selected={selectedNodeId === "building"}
          dimmed={dimmed("building")}
          onSelect={() => onSelectNode("building")}
        />
        <AnchoredLabel
          asset={asset("battery")}
          className="energy-twin-label-battery"
          selected={selectedNodeId === "battery"}
          dimmed={dimmed("battery")}
          onSelect={() => onSelectNode("battery")}
        />
        <AnchoredLabel
          asset={asset("grid")}
          className="energy-twin-label-grid"
          selected={selectedNodeId === "grid"}
          dimmed={dimmed("grid")}
          onSelect={() => onSelectNode("grid")}
        />
        <AnchoredLabel
          asset={asset("ac")}
          className="energy-twin-label-hvac"
          selected={selectedNodeId === "ac"}
          dimmed={dimmed("ac")}
          onSelect={() => onSelectNode("ac")}
        />
        <BuildingHotspots
          assets={model.assets}
          selectedNodeId={selectedNodeId}
          onSelectNode={onSelectNode}
        />
        {model.summary.wastedSurplusKwh > 0 && (
          <span className="energy-twin-surplus" style={pointStyle(SURPLUS_ANCHOR)}>
            Surplus
          </span>
        )}
      </div>
      <div className="energy-twin-footer">
        {showLegend && (
          <div className="energy-twin-legend" aria-label="Legenda energi">
            <span>
              <i className="energy-twin-legend-swatch energy-twin-legend-solar" />
              Solar
            </span>
            <span>
              <i className="energy-twin-legend-swatch energy-twin-legend-grid" />
              Grid
            </span>
            <span>
              <i className="energy-twin-legend-swatch energy-twin-legend-battery" />
              Baterai
            </span>
            <span>
              <i className="energy-twin-legend-swatch energy-twin-legend-load" />
              Beban
            </span>
          </div>
        )}
        <div className="energy-twin-scene-caption">
          {model.building.roofArea
            ? `${model.building.roofArea} m² luas atap`
            : model.building.location}
        </div>
      </div>
      <div className="energy-twin-inspector-slot">
        <div className="energy-twin-inspector" role={selectedAsset ? "status" : undefined}>
          <div className="energy-twin-inspector-header">
            <span>Detail · {inspectedAsset.telemetry.label}</span>
            {selectedAsset && (
              <button type="button" onClick={closeInspector} aria-label="Tutup detail komponen">
                ×
              </button>
            )}
          </div>
          <div className="energy-twin-inspector-details">
            <div>
              <span>Status</span>
              <strong>{inspectedAsset.telemetry.statusBadge}</strong>
            </div>
            {inspectedAsset.telemetry.details.map((detail) => (
              <div key={detail.label}>
                <span>{detail.label}</span>
                <strong>{detail.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
      <AccessibleSummary model={model} />
    </section>
  );
}
