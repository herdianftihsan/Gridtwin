import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { DecisionSummaryModal } from '../workspace/decision-summary-modal';
import { PublicDecisionBrief } from './public-decision-brief';
import { apiClient, ApiClientError } from '../../lib/api/api-client';
import type { Project, SimulationResult, PublicDecisionShareResponse } from '../../types/api';

vi.mock('../../lib/api/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
  ApiClientError: class ApiClientError extends Error {
    constructor(
      public code: string,
      message: string,
      public statusCode: number,
      public details?: Record<string, unknown>
    ) {
      super(message);
    }
  },
}));

const mockProject: Project = {
  id: 'proj-share-test',
  building_type: 'Ruko',
  location: 'Surabaya, Jawa Timur',
  monthly_bill: 4500000,
  budget: 50000000,
  objective: 'save_money',
};

const mockResult: SimulationResult = {
  configuration: {
    pv_kwp: 4,
    battery_kwh: 5,
    ac_units: 2,
    led_upgraded: true,
    refrigerator_units: 1,
    water_pump_upgraded: false,
  },
  baseline: {
    monthly_cost: 4500000,
    monthly_kwh: 3000,
  },
  energy: {
    monthly_demand_kwh: 2796,
    solar_yield_monthly: 405,
    grid_import_monthly: 946,
    wasted_surplus_monthly: 0,
  },
  financial: {
    capex: 60000000,
    new_monthly_cost: 3740625,
    monthly_savings: 759375,
    payback_years: 6.6,
  },
  environmental: {
    co2_reduction_kg_yr: 4801.38,
    co2_reduction_pct: 16.9,
  },
  grid: {
    independence_pct: 10.8,
  },
  assumptions: {
    tariff: 1500,
    psh: 4.5,
    performance_ratio: 0.75,
    battery_charge_efficiency: 0.95,
    battery_discharge_efficiency: 0.95,
    source_version: 'mvp-1.0',
  },
};

const mockPublicShareResponse: PublicDecisionShareResponse = {
  snapshot: {
    project: {
      building_type: 'Ruko',
      location: 'Surabaya, Jawa Timur',
    },
    scenario: {
      name: 'Rekomendasi Utama',
      is_recommended: true,
      scenario_type: 'recommended',
    },
    configuration: {
      pv_kwp: 4,
      battery_kwh: 5,
      ac_units: 2,
      led_upgraded: true,
      refrigerator_units: 1,
      water_pump_upgraded: false,
    },
    baseline: {
      monthly_cost: 4500000,
      monthly_kwh: 3000,
    },
    financial: {
      capex: 60000000,
      new_monthly_cost: 3740625,
      monthly_savings: 759375,
      annual_savings: 9112500,
      payback_years: 6.6,
      estimated_roi_10yr_pct: 52,
    },
    environmental: {
      co2_reduction_kg_yr: 4801.38,
      co2_reduction_pct: 16.9,
    },
    grid: {
      independence_pct: 10.8,
    },
    assumptions: {
      tariff: 1500,
      psh: 4.5,
      performance_ratio: 0.75,
      battery_charge_efficiency: 0.95,
      battery_discharge_efficiency: 0.95,
      source_version: 'mvp-1.0',
    },
    disclaimer: 'Asumsi Regulasi Utama (ESDM No. 2/2024).',
    generated_at: '2026-08-18T10:00:00.000Z',
  },
  created_at: '2026-08-18T10:00:00.000Z',
  expires_at: '2026-09-17T10:00:00.000Z',
};

describe('Shareable Decision Brief Frontend Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('DecisionSummaryModal Share & Revoke Flow', () => {
    it('opens modal and displays Bagikan Ringkasan button instead of PDF print export', () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: null } as never);

      render(
        <DecisionSummaryModal
          isOpen={true}
          onClose={vi.fn()}
          project={mockProject}
          result={mockResult}
          scenarioId="sc-123"
        />
      );

      expect(screen.getByText('Ringkasan Keputusan')).toBeDefined();
      expect(screen.getByRole('button', { name: /Bagikan Ringkasan/i })).toBeDefined();
      expect(screen.queryByText(/Ekspor Ringkasan Keputusan/i)).toBeNull();
    });

    it('shows confirmation when user clicks Bagikan Ringkasan', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: null } as never);

      render(
        <DecisionSummaryModal
          isOpen={true}
          onClose={vi.fn()}
          project={mockProject}
          result={mockResult}
          scenarioId="sc-123"
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /Bagikan Ringkasan/i }));

      expect(screen.getByText('Bagikan Ringkasan Keputusan?')).toBeDefined();
      expect(screen.getByText(/Siapa pun dengan tautan tersebut dapat melihat snapshot/i)).toBeDefined();
      expect(screen.getByRole('button', { name: 'Buat Tautan Berbagi' })).toBeDefined();
    });

    it('creates share link, displays share URL, and allows copying', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: null } as never);
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: {
          id: 'share-123',
          share_token: 'test-token-abc',
          share_url: 'https://gridtwin.ai/share/test-token-abc',
          expires_at: '2026-09-18T10:00:00.000Z',
          created_at: '2026-08-18T10:00:00.000Z',
        },
      } as never);

      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: { writeText: writeTextMock },
      });

      render(
        <DecisionSummaryModal
          isOpen={true}
          onClose={vi.fn()}
          project={mockProject}
          result={mockResult}
          scenarioId="sc-123"
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /Bagikan Ringkasan/i }));
      fireEvent.click(screen.getByRole('button', { name: 'Buat Tautan Berbagi' }));

      await waitFor(() => {
        expect(screen.getByText('Tautan Berbagi Aktif')).toBeDefined();
        const input = screen.getByDisplayValue('https://gridtwin.ai/share/test-token-abc') as HTMLInputElement;
        expect(input).toBeDefined();
      });

      // Click copy button
      const copyBtn = screen.getByRole('button', { name: 'Salin Link' });
      fireEvent.click(copyBtn);

      await waitFor(() => {
        expect(writeTextMock).toHaveBeenCalledWith('https://gridtwin.ai/share/test-token-abc');
        expect(screen.getByText('✓ Tersalin')).toBeDefined();
      });
    });

    it('allows revoking an existing share link with confirmation', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: null } as never);
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: {
          id: 'share-123',
          share_token: 'test-token-abc',
          share_url: 'https://gridtwin.ai/share/test-token-abc',
          expires_at: '2026-09-18T10:00:00.000Z',
          created_at: '2026-08-18T10:00:00.000Z',
        },
      } as never);
      vi.mocked(apiClient.delete).mockResolvedValueOnce({
        data: { id: 'share-123', is_revoked: true, revoked_at: '2026-08-18T11:00:00.000Z' },
      } as never);

      render(
        <DecisionSummaryModal
          isOpen={true}
          onClose={vi.fn()}
          project={mockProject}
          result={mockResult}
          scenarioId="sc-123"
        />
      );

      // Create first
      fireEvent.click(screen.getByRole('button', { name: /Bagikan Ringkasan/i }));
      fireEvent.click(screen.getByRole('button', { name: 'Buat Tautan Berbagi' }));

      await waitFor(() => expect(screen.getByText('Cabut Akses Tautan')).toBeDefined());

      // Trigger revocation
      fireEvent.click(screen.getByText('Cabut Akses Tautan'));

      expect(screen.getByText('Cabut Akses Tautan Berbagi?')).toBeDefined();
      expect(screen.getByRole('button', { name: 'Ya, Cabut Tautan Sekarang' })).toBeDefined();

      fireEvent.click(screen.getByRole('button', { name: 'Ya, Cabut Tautan Sekarang' }));

      await waitFor(() => {
        expect(apiClient.delete).toHaveBeenCalledWith('/api/projects/proj-share-test/shares/share-123');
        expect(screen.getByText('✓ Tautan Berhasil Dicabut')).toBeDefined();
      });
    });

    it('shows informative message when attempting to share in demo mode', () => {
      render(
        <DecisionSummaryModal
          isOpen={true}
          onClose={vi.fn()}
          project={{ ...mockProject, id: 'demo-ruko-1' }}
          result={mockResult}
          isDemo={true}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /Bagikan Ringkasan/i }));

      expect(screen.getByText('Fitur Berbagi Memerlukan Akun')).toBeDefined();
      expect(screen.getByRole('link', { name: 'Masuk ke Akun' })).toBeDefined();
    });
  });

  describe('Share Error State & Retry Behavior', () => {
    it('shows confirmation screen on Coba Lagi instead of directly retrying to prevent duplicates', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: null } as never);
      vi.mocked(apiClient.post).mockRejectedValueOnce(
        new ApiClientError('INTERNAL_ERROR', 'Gagal menyimpan tautan berbagi. Silakan coba lagi.', 500)
      );

      render(
        <DecisionSummaryModal
          isOpen={true}
          onClose={vi.fn()}
          project={mockProject}
          result={mockResult}
          scenarioId="sc-123"
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /Bagikan Ringkasan/i }));
      fireEvent.click(screen.getByRole('button', { name: 'Buat Tautan Berbagi' }));

      await waitFor(() => {
        expect(screen.getByText(/Gagal menyimpan tautan berbagi/i)).toBeDefined();
      });

      // Coba Lagi should navigate to confirmation, not directly call POST again
      const cobaLagiBtn = screen.getByRole('button', { name: 'Coba Lagi' });
      fireEvent.click(cobaLagiBtn);

      await waitFor(() => {
        expect(screen.getByText('Bagikan Ringkasan Keputusan?')).toBeDefined();
      });

      // Verify POST was only called once (from the first click, not again on retry)
      expect(apiClient.post).toHaveBeenCalledTimes(1);
    });

    it('shows clipboard error message when permission is denied', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: null } as never);
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: {
          id: 'share-456',
          share_token: 'token-xyz',
          share_url: 'https://gridtwin.ai/share/token-xyz',
          expires_at: '2026-09-18T10:00:00.000Z',
          created_at: '2026-08-18T10:00:00.000Z',
        },
      } as never);

      // Clipboard API rejects
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockRejectedValue(new DOMException('Permission denied', 'NotAllowedError')),
        },
      });

      render(
        <DecisionSummaryModal
          isOpen={true}
          onClose={vi.fn()}
          project={mockProject}
          result={mockResult}
          scenarioId="sc-123"
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /Bagikan Ringkasan/i }));
      fireEvent.click(screen.getByRole('button', { name: 'Buat Tautan Berbagi' }));

      await waitFor(() => {
        expect(screen.getByText('Tautan Berbagi Aktif')).toBeDefined();
      });

      const copyBtn = screen.getByRole('button', { name: 'Salin Link' });
      fireEvent.click(copyBtn);

      await waitFor(() => {
        expect(screen.getByText(/Izin clipboard ditolak/i)).toBeDefined();
        // Should not show Tersalin if clipboard failed
        expect(screen.queryByText('✓ Tersalin')).toBeNull();
      });
    });
  });

  describe('PublicDecisionBrief Page Component States', () => {
    it('displays loading state while resolving public snapshot', () => {
      vi.mocked(apiClient.get).mockImplementation(() => new Promise(() => {}));

      render(<PublicDecisionBrief token="test-token-123" />);

      expect(screen.getByText('Memuat Ringkasan Keputusan')).toBeDefined();
      expect(screen.getByText(/Mengambil snapshot terverifikasi/i)).toBeDefined();
    });

    it('successfully renders full decision brief snapshot without private fields', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockPublicShareResponse,
      } as never);

      render(<PublicDecisionBrief token="test-token-123" />);

      await waitFor(() => {
        expect(screen.getByText('Ringkasan Keputusan Investasi Energi')).toBeDefined();
        expect(screen.getByText(/Surabaya, Jawa Timur/i)).toBeDefined();
        expect(screen.getByText(/4\s*kWp/i)).toBeDefined();
        expect(screen.getByText(/5\s*kWh/i)).toBeDefined();
        expect(screen.getByText(/17%/)).toBeDefined();
      });

      // Verify no sensitive fields are leaked
      expect(screen.queryByText(/user_id/i)).toBeNull();
      expect(screen.queryByText(/owner@/i)).toBeNull();
    });

    it('renders revoked state when token has been revoked by owner', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce(
        new ApiClientError('NOT_FOUND', 'Tautan ringkasan telah dicabut oleh pemilik proyek.', 404, {
          reason: 'revoked',
        })
      );

      render(<PublicDecisionBrief token="revoked-token" />);

      await waitFor(() => {
        expect(screen.getByText('Tautan Berbagi Telah Dicabut')).toBeDefined();
        expect(screen.getByText(/Pemilik proyek telah mencabut akses ke ringkasan keputusan ini/i)).toBeDefined();
      });
    });

    it('renders expired state when link passed 30 days window', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce(
        new ApiClientError('NOT_FOUND', 'Tautan ringkasan telah kedaluwarsa.', 404, {
          reason: 'expired',
        })
      );

      render(<PublicDecisionBrief token="expired-token" />);

      await waitFor(() => {
        expect(screen.getByText('Masa Berlaku Tautan Telah Habis')).toBeDefined();
        expect(screen.getByText(/melewati batas waktu masa aktif/i)).toBeDefined();
      });
    });

    it('renders not found state for invalid tokens', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce(
        new ApiClientError('NOT_FOUND', 'Tautan ringkasan tidak ditemukan atau tidak valid.', 404)
      );

      render(<PublicDecisionBrief token="unknown-token" />);

      await waitFor(() => {
        expect(screen.getByText('Ringkasan Tidak Ditemukan')).toBeDefined();
      });
    });
  });
});
