import { SimulationResult, Project } from '../../../types/api';
import { CanvasViewModel, NodeKey, NodeTelemetry, ConnectionState } from './types';

export function mapSimulationToCanvas(
  result: SimulationResult,
  project?: Project | null,
  overrideBuildingType?: string,
  overrideLocation?: string
): CanvasViewModel {
  const { configuration, energy, financial, grid } = result;

  const hasSolar = configuration.pv_kwp > 0;
  const hasBattery = configuration.battery_kwh > 0;
  const hasAc = configuration.ac_units > 0;
  const isLed = configuration.led_upgraded;
  const hasRefrigerator = configuration.refrigerator_units > 0;
  const hasPump = configuration.water_pump_upgraded;
  const hasGridImport = energy.grid_import_monthly > 0;

  const buildingLabel = overrideBuildingType ?? project?.building_type ?? 'Commercial Ruko';
  const locationLabel = overrideLocation ?? project?.location ?? 'Surabaya';

  const nodes: Record<NodeKey, NodeTelemetry> = {
    solar: {
      id: 'solar',
      label: 'PANEL SURYA',
      sublabel: hasSolar ? 'Aset Usulan' : 'Slot Tidak Aktif',
      valueDisplay: `${configuration.pv_kwp} kWp`,
      isActive: hasSolar,
      statusBadge: hasSolar ? 'Produksi Aktif' : 'Tidak Dikonfigurasi',
      details: [
        { label: 'Kapasitas Terpasang', value: `${configuration.pv_kwp} kWp` },
        { label: 'Produksi Bulanan', value: `${Math.round(energy.solar_yield_monthly)} kWh/bln` },
        { label: 'Surplus Terbuang', value: `${Math.round(energy.wasted_surplus_monthly)} kWh/bln` },
      ],
    },
    building: {
      id: 'building',
      label: 'BEBAN BANGUNAN',
      sublabel: buildingLabel,
      valueDisplay: `${Math.round(energy.monthly_demand_kwh)} kWh/bln`,
      isActive: true,
      statusBadge: 'Permintaan Dasar',
      details: [
        { label: 'Lokasi', value: locationLabel },
        { label: 'Permintaan Pasca-Efisiensi', value: `${Math.round(energy.monthly_demand_kwh)} kWh/bln` },
        { label: 'Otonomi Jaringan', value: `${grid.independence_pct.toFixed(1)}%` },
      ],
    },
    battery: {
      id: 'battery',
      label: 'PENYIMPANAN BATERAI',
      sublabel: hasBattery ? 'Aset Usulan' : 'Slot Tidak Aktif',
      valueDisplay: `${configuration.battery_kwh} kWh`,
      isActive: hasBattery,
      statusBadge: hasBattery ? 'Pemindahan Beban Puncak' : 'Tidak Dikonfigurasi',
      details: [
        { label: 'Kapasitas Dapat Digunakan', value: `${configuration.battery_kwh} kWh` },
        { label: 'Efisiensi Siklus Penuh', value: '90.2% (Gabungan)' },
        { label: 'Peran Penyimpanan', value: 'Dukungan Beban Puncak Malam Hari' },
      ],
    },
    grid: {
      id: 'grid',
      label: 'JARINGAN PLN',
      sublabel: 'Koneksi Utilitas',
      valueDisplay: `${Math.round(energy.grid_import_monthly)} kWh/bln`,
      isActive: hasGridImport,
      statusBadge: hasGridImport ? 'Impor Aktif' : 'Nol Impor',
      details: [
        { label: 'Penarikan Jaringan Bulanan', value: `${Math.round(energy.grid_import_monthly)} kWh/bln` },
        { label: 'Biaya Listrik', value: `Rp ${(financial.new_monthly_cost / 1_000_000).toFixed(2)} Jt/bln` },
        { label: 'Kebijakan Net-Metering', value: 'Kredit Non-Ekspor (2024)' },
      ],
    },
    ac: {
      id: 'ac',
      label: 'PENDINGIN RUANGAN (AC)',
      sublabel: 'Peningkatan Efisiensi',
      valueDisplay: `${configuration.ac_units} Unit Inverter`,
      isActive: hasAc,
      statusBadge: hasAc ? 'Inverter Aktif' : 'Baseline Standar',
      details: [
        { label: 'Unit Ditingkatkan', value: `${configuration.ac_units} Unit Inverter` },
        { label: 'Dampak Efisiensi', value: 'Pengurangan Beban Termal 30%' },
      ],
    },
    led: {
      id: 'led',
      label: 'LED PINTAR',
      sublabel: 'Sistem Pencahayaan',
      valueDisplay: isLed ? 'Ditingkatkan' : 'Standar',
      isActive: isLed,
      statusBadge: isLed ? 'Efisiensi Tinggi' : 'Baseline Standar',
      details: [
        { label: 'Status Pencahayaan', value: isLed ? 'LED Solid-State Pintar' : 'Lampu Standar' },
        { label: 'Dampak Efisiensi', value: 'Pengurangan Beban Pencahayaan 60%' },
      ],
    },
    refrigerator: {
      id: 'refrigerator',
      label: 'PENDINGINAN',
      sublabel: 'Peningkatan Efisiensi',
      valueDisplay: `${configuration.refrigerator_units} Unit`,
      isActive: hasRefrigerator,
      statusBadge: hasRefrigerator ? 'Efisiensi Tinggi' : 'Baseline Standar',
      details: [
        { label: 'Unit Ditingkatkan', value: `${configuration.refrigerator_units} Unit Efisiensi Tinggi` },
        { label: 'Dampak Efisiensi', value: 'Pengurangan Beban 360 kWh/thn per Unit' },
      ],
    },
    pump: {
      id: 'pump',
      label: 'POMPA AIR',
      sublabel: 'Peningkatan Efisiensi',
      valueDisplay: hasPump ? 'Ditingkatkan' : 'Standar',
      isActive: hasPump,
      statusBadge: hasPump ? 'Pompa Pintar Aktif' : 'Baseline Standar',
      details: [
        { label: 'Status Pompa', value: hasPump ? 'Pompa Kecepatan Variabel' : 'Standar Kecepatan Tetap' },
        { label: 'Dampak Efisiensi', value: 'Pengurangan Beban 480 kWh/thn' },
      ],
    },
  };

  const connections: ConnectionState[] = [
    {
      id: 'solar-building',
      from: 'solar',
      to: 'building',
      isActive: hasSolar,
      color: '#F59E0B',
      flowDirection: 'forward',
      animated: hasSolar,
      label: 'Konsumsi Mandiri Surya',
    },
    {
      id: 'solar-battery',
      from: 'solar',
      to: 'battery',
      isActive: hasSolar && hasBattery,
      color: '#F59E0B',
      flowDirection: 'forward',
      animated: hasSolar && hasBattery,
      curveOffset: 45,
      label: 'Pengisian Baterai',
    },
    {
      id: 'battery-building',
      from: 'battery',
      to: 'building',
      isActive: hasBattery,
      color: '#14B8A6',
      flowDirection: 'forward',
      animated: hasBattery,
      label: 'Pengosongan Malam Hari',
    },
    {
      id: 'grid-building',
      from: 'grid',
      to: 'building',
      isActive: hasGridImport,
      color: '#6366F1',
      flowDirection: 'forward',
      animated: hasGridImport,
      label: 'Impor Jaringan PLN',
    },
    {
      id: 'ac-building',
      from: 'ac',
      to: 'building',
      isActive: hasAc,
      color: '#94A3B8',
      flowDirection: 'forward',
      animated: false,
      curveOffset: -40,
    },
    {
      id: 'led-building',
      from: 'led',
      to: 'building',
      isActive: isLed,
      color: '#94A3B8',
      flowDirection: 'forward',
      animated: false,
      curveOffset: -10,
    },
    {
      id: 'refrigerator-building',
      from: 'refrigerator',
      to: 'building',
      isActive: hasRefrigerator,
      color: '#94A3B8',
      flowDirection: 'forward',
      animated: false,
      curveOffset: 20,
    },
    {
      id: 'pump-building',
      from: 'pump',
      to: 'building',
      isActive: hasPump,
      color: '#94A3B8',
      flowDirection: 'forward',
      animated: false,
      curveOffset: 50,
    },
  ];

  return {
    nodes,
    connections,
    summary: {
      monthlyDemandKwh: energy.monthly_demand_kwh,
      solarYieldKwh: energy.solar_yield_monthly,
      gridImportKwh: energy.grid_import_monthly,
      wastedSurplusKwh: energy.wasted_surplus_monthly,
      independencePct: grid.independence_pct,
      hasSolar,
      hasBattery,
      hasGridImport,
    },
  };
}