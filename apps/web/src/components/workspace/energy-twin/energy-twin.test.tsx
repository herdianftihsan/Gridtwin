import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { EnergyCanvas } from "../energy-canvas/energy-canvas";
import { mapSimulationToEnergyTwin } from "./energy-twin-view-model";
import { Project, SimulationResult } from "../../../types/api";
import { EnergyTwinScene, pointStyle, SCENE_ANCHORS, SCENE_SIZE } from "./energy-twin-scene";

const motionPreference = vi.hoisted(() => ({ reduced: false }));
vi.mock("motion/react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("motion/react")>()),
  useReducedMotion: () => motionPreference.reduced,
}));

const result: SimulationResult = {
  configuration: {
    pv_kwp: 6,
    battery_kwh: 8,
    ac_units: 2,
    led_upgraded: true,
    refrigerator_units: 1,
    water_pump_upgraded: false,
  },
  baseline: { monthly_cost: 4500000, monthly_kwh: 3000 },
  energy: {
    monthly_demand_kwh: 2700,
    solar_yield_monthly: 600,
    grid_import_monthly: 2100,
    wasted_surplus_monthly: 25,
  },
  financial: {
    capex: 100000000,
    new_monthly_cost: 3150000,
    monthly_savings: 1350000,
    payback_years: 6.2,
  },
  environmental: { co2_reduction_kg_yr: 8000, co2_reduction_pct: 25 },
  grid: { independence_pct: 22.2 },
  assumptions: {
    tariff: 1500,
    psh: 4.5,
    performance_ratio: 0.75,
    battery_charge_efficiency: 0.95,
    battery_discharge_efficiency: 0.95,
    source_version: "mvp-1.0",
  },
};

describe("Energy Twin 2.5D", () => {
  it("maps existing result fields into building, assets, and supported flows", () => {
    const project: Project = {
      id: "project-1",
      building_type: "Office",
      location: "Surabaya",
      roof_area: 120,
      monthly_bill: 4500000,
      budget: 100000000,
      objective: "independence",
    };
    const model = mapSimulationToEnergyTwin(result, project);

    expect(model.building.floors).toBe(4);
    expect(model.building.roofArea).toBe(120);
    expect(model.assets.find((asset) => asset.id === "solar")?.telemetry.valueDisplay).toBe(
      "600 kWh/bln",
    );
    expect(model.assets.find((asset) => asset.id === "battery")?.telemetry.valueDisplay).toBe(
      "8 kWh",
    );
    expect(model.flows.find((flow) => flow.id === "grid-building")?.active).toBe(true);
    expect(model.flows.find((flow) => flow.id === "building-surplus")?.active).toBe(true);
  });

  it("quietly disables unsupported solar and grid flows", () => {
    const noSolar = {
      ...result,
      configuration: { ...result.configuration, pv_kwp: 0, battery_kwh: 0 },
      energy: {
        ...result.energy,
        solar_yield_monthly: 0,
        grid_import_monthly: 0,
        wasted_surplus_monthly: 0,
      },
    };
    const model = mapSimulationToEnergyTwin(noSolar);

    expect(model.flows.find((flow) => flow.id === "solar-building")?.active).toBe(false);
    expect(model.flows.find((flow) => flow.id === "solar-battery")?.active).toBe(false);
    expect(model.flows.find((flow) => flow.id === "grid-building")?.active).toBe(false);
    expect(model.flows.find((flow) => flow.id === "building-surplus")?.active).toBe(false);
  });

  it("switches from Classic to 2.5D without removing the classic mode control", () => {
    render(<EnergyCanvas result={result} />);

    fireEvent.click(screen.getByRole("button", { name: "2.5D" }));

    expect(screen.getByRole("region", { name: "Energy Twin 2.5D" })).toBeDefined();
    expect(screen.getByText("Energy Twin · Commercial Ruko")).toBeDefined();
    expect(screen.getByRole("button", { name: "Classic" }).getAttribute("aria-pressed")).toBe(
      "false",
    );
  });

  it("renders supplied visual assets and selects an asset through its accessible hotspot", () => {
    const { container } = render(<EnergyCanvas result={result} />);

    fireEvent.click(screen.getByRole("button", { name: "2.5D" }));

    expect(container.querySelector('img[src*="building-ruko"]')).not.toBeNull();
    expect(container.querySelector('img[src*="battery-trimmed"]')).not.toBeNull();
    expect(container.querySelector(".energy-twin-label-solar")).not.toBeNull();
    fireEvent.click(container.querySelector<HTMLButtonElement>(".energy-twin-label-battery")!);

    expect(screen.getByRole("status").textContent).toContain("Detail · PENYIMPANAN BATERAI");
    expect(
      container.querySelector(".energy-twin-label-battery")?.getAttribute("aria-pressed"),
    ).toBe("true");
  });

  it("keeps optional assets visibly inactive and hides their active flows when the result disables them", () => {
    const inactiveResult = {
      ...result,
      configuration: { ...result.configuration, pv_kwp: 0, battery_kwh: 0 },
      energy: {
        ...result.energy,
        solar_yield_monthly: 0,
        grid_import_monthly: 0,
        wasted_surplus_monthly: 0,
      },
    };
    const { container } = render(<EnergyCanvas result={inactiveResult} />);
    fireEvent.click(screen.getByRole("button", { name: "2.5D" }));

    expect(screen.getAllByText("Tidak dikonfigurasi")).toHaveLength(2);
    expect(container.querySelector(".energy-twin-label-battery")?.textContent).toContain("Baterai");
    expect(container.querySelector(".energy-twin-solar-image")).toBeNull();
    expect(container.querySelector(".energy-twin-battery-image")).toBeNull();
    expect(container.querySelector(".energy-twin-label-solar")?.className).toContain(
      "energy-twin-anchor-label-inactive",
    );
    expect(container.querySelector("#energy-twin-arrow-solar-building")).toBeNull();
  });

  it("does not invent battery directions from monthly totals", () => {
    const model = mapSimulationToEnergyTwin(result);
    expect(model.flows.filter((flow) => flow.active).map((flow) => flow.id)).toEqual([
      "solar-building",
      "grid-building",
      "building-surplus",
    ]);
  });

  it("maps scene coordinates consistently and keeps all anchors inside the stage", () => {
    expect(pointStyle({ x: 500, y: 380 })).toEqual({ left: "50%", top: "50%" });
    for (const anchor of Object.values(SCENE_ANCHORS)) {
      expect(anchor.asset.x + anchor.asset.width).toBeLessThanOrEqual(SCENE_SIZE.width);
      expect(anchor.asset.y + anchor.asset.height).toBeLessThanOrEqual(SCENE_SIZE.height);
      expect(anchor.label.x).toBeGreaterThan(0);
      expect(anchor.label.x).toBeLessThan(SCENE_SIZE.width);
      expect(anchor.label.y).toBeGreaterThan(0);
      expect(anchor.label.y).toBeLessThan(SCENE_SIZE.height);
    }
  });

  it("keeps directional routes and their anchors when reduced motion is enabled", () => {
    motionPreference.reduced = true;
    try {
      const { container } = render(
        <EnergyTwinScene
          result={result}
          selectedNodeId={null}
          onSelectNode={vi.fn()}
          onClearSelection={vi.fn()}
          viewMode="2.5d"
          onViewModeChange={vi.fn()}
        />,
      );
      expect(container.querySelectorAll(".energy-twin-flow")).toHaveLength(3);
      expect(container.querySelector(".energy-twin-flow-animated")).toBeNull();
      const flow = container.querySelector('[data-flow="grid-building"]')!;
      const origin = SCENE_ANCHORS.grid.output!;
      const end = SCENE_ANCHORS.building.utilityInput!;
      expect(flow.getAttribute("d")).toMatch(
        new RegExp(`^M ${origin.x} ${origin.y} .*${end.x} ${end.y}$`),
      );
      expect(flow.getAttribute("vector-effect")).toBe("non-scaling-stroke");
      expect(flow.getAttribute("marker-end")).toContain("grid-building");
    } finally {
      motionPreference.reduced = false;
    }
  });

  it("preserves selection and scenario values across mode switches, then restores focus on close", () => {
    const { container } = render(<EnergyCanvas result={result} />);
    fireEvent.click(screen.getByRole("button", { name: "2.5D" }));
    const label = container.querySelector<HTMLButtonElement>(".energy-twin-label-battery")!;
    label.focus();
    fireEvent.click(label);
    fireEvent.click(screen.getByRole("button", { name: "Classic" }));
    expect(screen.queryByRole("region", { name: "Energy Twin 2.5D" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "2.5D" }));
    expect(screen.getByRole("status").textContent).toContain("8 kWh");
    const restoredLabel = container.querySelector<HTMLButtonElement>(".energy-twin-label-battery")!;
    expect(restoredLabel.getAttribute("aria-pressed")).toBe("true");
    restoredLabel.focus();
    fireEvent.click(restoredLabel);
    fireEvent.click(screen.getByRole("button", { name: "Tutup detail komponen" }));
    expect(screen.queryByRole("status")).toBeNull();
    expect(document.activeElement).toBe(restoredLabel);
  });

  it("describes zero inverter upgrades as standard AC, not absent cooling", () => {
    const model = mapSimulationToEnergyTwin({
      ...result,
      configuration: { ...result.configuration, ac_units: 0 },
    });
    expect(model.assets.find((asset) => asset.id === "ac")?.telemetry.valueDisplay).toBe(
      "Standar (tanpa peningkatan inverter)",
    );
  });
});
