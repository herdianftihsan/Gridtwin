import { describe, it, expect, vi, beforeEach } from 'vitest';
import { aiService } from '../ai.service.js';
import { projectService } from '../project.service.js';
import { intentParserService } from '../../ai/intent-parser.service.js';
import { scenarioRepository } from '../../repositories/scenario.repository.js';
import { simulationResultRepository } from '../../repositories/simulation-result.repository.js';
import * as simulateModule from '../../simulation/simulate.js';
import * as optimizeModule from '../../optimization/optimize.js';
import { SimulationContext } from '../../simulation/types.js';

describe('Phase 9: AI Deterministic Execution Verification', () => {
  const userId = 'user-1';
  const projectId = 'proj-1';
  
  const mockProject = {
    id: projectId,
    user_id: userId,
    building_type: 'Ruko' as const,
    location: 'Surabaya',
    roof_area: 50,
    monthly_bill: 5_000_000,
    budget: 50_000_000,
    objective: 'save_money' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const expectedContext: SimulationContext = {
    building_type: mockProject.building_type,
    location: mockProject.location,
    roof_area: mockProject.roof_area,
    monthly_bill: Number(mockProject.monthly_bill),
    budget: mockProject.budget,
    objective: mockProject.objective,
  };

  const mockSimulationResult = {
    baseline: { monthly_kwh: 1000, monthly_cost: 5000000 },
    energy: { monthly_demand_kwh: 900, solar_yield_monthly: 100, grid_import_monthly: 800, wasted_surplus_monthly: 0 },
    financial: { capex: 10000000, new_monthly_cost: 4000000, monthly_savings: 1000000, payback_years: 10 },
    environmental: { co2_reduction_kg_yr: 1000, co2_reduction_pct: 10 },
    grid: { independence_pct: 10 },
    assumptions: { tariff: 1500, psh: 4.5 },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.spyOn(projectService, 'assertOwnership').mockResolvedValue(mockProject as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.spyOn(scenarioRepository, 'create').mockResolvedValue({ id: 'scen-1' } as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.spyOn(simulationResultRepository, 'create').mockResolvedValue({} as any);
  });

  it('1. solar change is perfectly deterministic via simulate()', async () => {
    vi.spyOn(intentParserService, 'parseWhatIfIntent').mockResolvedValue({
      action: 'simulate',
      solar_kwp: 5,
    });
    
    const simulateSpy = vi.spyOn(simulateModule, 'simulate').mockReturnValue(mockSimulationResult);

    const result = await aiService.handleWhatIf(userId, { project_id: projectId, message: 'Solar jadi 5 kWp' });

    expect(simulateSpy).toHaveBeenCalledTimes(1);
    expect(simulateSpy).toHaveBeenCalledWith(
      { solar_kwp: 5, battery_kwh: 0, ac_units: 0, is_led_upgraded: false, refrigerator_units: 0, water_pump_upgraded: false },
      expectedContext
    );
    expect(result.simulation_result).toEqual(mockSimulationResult);
  });

  it('2. battery change is perfectly deterministic via simulate()', async () => {
    vi.spyOn(intentParserService, 'parseWhatIfIntent').mockResolvedValue({
      action: 'simulate',
      battery_kwh: 10,
    });
    
    const simulateSpy = vi.spyOn(simulateModule, 'simulate').mockReturnValue(mockSimulationResult);

    const result = await aiService.handleWhatIf(userId, { project_id: projectId, message: 'Pakai baterai 10 kWh' });

    expect(simulateSpy).toHaveBeenCalledWith(
      { solar_kwp: 0, battery_kwh: 10, ac_units: 0, is_led_upgraded: false, refrigerator_units: 0, water_pump_upgraded: false },
      expectedContext
    );
    expect(result.simulation_result).toEqual(mockSimulationResult);
  });

  it('3. budget change overrides context budget and calls optimize()', async () => {
    vi.spyOn(intentParserService, 'parseWhatIfIntent').mockResolvedValue({
      action: 'optimize',
      budget: 100_000_000,
    });
    
    const optimizeSpy = vi.spyOn(optimizeModule, 'optimize').mockReturnValue({
      configuration: { solar_kwp: 8, battery_kwh: 5, ac_units: 1, is_led_upgraded: true, refrigerator_units: 0, water_pump_upgraded: false },
      simulation_result: mockSimulationResult,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      scores: { final_score: 1, weights: {} as any, normalized: {} as any },
    });

    const result = await aiService.handleWhatIf(userId, { project_id: projectId, message: 'Budget 100 juta' });

    expect(optimizeSpy).toHaveBeenCalledTimes(1);
    expect(optimizeSpy).toHaveBeenCalledWith({
      ...expectedContext,
      budget: 100_000_000,
    });
    
    expect(result.simulation_result).toEqual(mockSimulationResult);
  });

  it('4. efficiency opportunity change routes to simulate() accurately', async () => {
    vi.spyOn(intentParserService, 'parseWhatIfIntent').mockResolvedValue({
      action: 'simulate',
      is_led_upgraded: true,
      ac_units: 2,
    });
    
    const simulateSpy = vi.spyOn(simulateModule, 'simulate').mockReturnValue(mockSimulationResult);

    const result = await aiService.handleWhatIf(userId, { project_id: projectId, message: 'Ganti 2 AC dan LED' });

    expect(simulateSpy).toHaveBeenCalledWith(
      { solar_kwp: 0, battery_kwh: 0, ac_units: 2, is_led_upgraded: true, refrigerator_units: 0, water_pump_upgraded: false },
      expectedContext
    );
    expect(result.simulation_result).toEqual(mockSimulationResult);
  });
});
