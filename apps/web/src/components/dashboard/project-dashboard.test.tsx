import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ProjectDashboard } from './project-dashboard';
import { apiClient } from '../../lib/api/api-client';

vi.mock('../../lib/api/api-client', () => ({
  apiClient: { get: vi.fn(), delete: vi.fn() },
}));

describe('ProjectDashboard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('retries project loading in place after a request failure', async () => {
    vi.mocked(apiClient.get)
      .mockRejectedValueOnce(new Error('Network unavailable'))
      .mockResolvedValueOnce({ data: [], meta: { timestamp: '' } } as never);

    render(<ProjectDashboard />);
    await waitFor(() => expect(screen.getByText('Gagal memuat proyek')).toBeDefined());

    fireEvent.click(screen.getByRole('button', { name: 'Coba Lagi' }));
    await waitFor(() => expect(screen.getByText('Belum ada proyek')).toBeDefined());
    expect(apiClient.get).toHaveBeenCalledTimes(2);
  });
});
