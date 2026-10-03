import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { ProjectSetupWizard } from './project-setup-wizard';
import { apiClient } from '../../lib/api/api-client';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush }) }));
vi.mock('../../lib/api/api-client', () => ({
  apiClient: { post: vi.fn(), get: vi.fn() },
  ApiClientError: class ApiClientError extends Error {},
}));

const continueButton = () => screen.getByRole('button', { name: /Lanjutkan/ });

async function renderBudgetStep() {
  render(<ProjectSetupWizard />);
  fireEvent.change(screen.getByPlaceholderText('Search city, regency, or district...'), {
    target: { value: 'Surabaya' },
  });
  fireEvent.change(screen.getAllByRole('combobox')[1]!, { target: { value: 'Ruko' } });
  vi.mocked(apiClient.get).mockResolvedValue({
    data: [{ id: 'loc_surabaya', name: 'Surabaya', province: 'Jawa Timur', administrativeLevel: 'city' }],
  } as never);
  fireEvent.keyDown(screen.getByPlaceholderText('Search city, regency, or district...'), { key: 'Enter' });
  await waitFor(() => expect(screen.getByRole('option', { name: /Surabaya/ })).toBeDefined());
  fireEvent.click(screen.getByRole('option', { name: /Surabaya/ }));
  fireEvent.click(continueButton());
  await waitFor(() => expect(screen.getByText('Baseline energi Anda')).toBeDefined());
  fireEvent.change(screen.getByPlaceholderText('4.500.000'), { target: { value: '4500000' } });
  fireEvent.click(continueButton());
  await waitFor(() => expect(screen.getByText('Tentukan batas investasi Anda')).toBeDefined());
}

const enterBudget = (value: string) =>
  fireEvent.change(screen.getByRole('textbox'), { target: { value } });

describe('ProjectSetupWizard budget step', () => {
  beforeEach(() => vi.clearAllMocks());

  it('keeps building and energy progression working with a valid budget', async () => {
    await renderBudgetStep();
    enterBudget('1000000');
    fireEvent.click(continueButton());
    await waitFor(() => expect(screen.getByText('Apa yang paling penting bagi Anda?')).toBeDefined());
  });

  it('blocks a missing budget with a useful validation error', async () => {
    await renderBudgetStep();
    fireEvent.click(continueButton());
    expect(screen.getByText('Anggaran minimum adalah Rp 1.000.000.')).toBeDefined();
    expect(screen.queryByText('Apa yang paling penting bagi Anda?')).toBeNull();
  });

  it.each(['0', '-1', '999999', 'not-a-number'])('blocks invalid budget %j', async (value) => {
    await renderBudgetStep();
    enterBudget(value);
    fireEvent.click(continueButton());
    expect(screen.getByText('Anggaran minimum adalah Rp 1.000.000.')).toBeDefined();
    expect(screen.queryByText('Apa yang paling penting bagi Anda?')).toBeNull();
  });

  it('parses formatted currency and preserves the valid payload', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: { id: 'proj-new-123' }, error: null } as never);
    await renderBudgetStep();
    enterBudget('50000000');
    fireEvent.click(continueButton());
    await waitFor(() => expect(screen.getByText('Apa yang paling penting bagi Anda?')).toBeDefined());
    fireEvent.click(screen.getByRole('button', { name: /Hemat Uang/ }));
    fireEvent.click(screen.getByRole('button', { name: /Buat Energy Twin Saya/ }));
    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/api/projects', expect.objectContaining({ budget: 50000000 }));
      expect(mockPush).toHaveBeenCalledWith('/projects/proj-new-123');
    });
  });

  it('keeps the user on Budget instead of silently failing on invalid input', async () => {
    await renderBudgetStep();
    enterBudget('0');
    fireEvent.click(continueButton());
    expect(screen.getByText('Masukkan batas investasi maksimum Anda')).toBeDefined();
    expect(screen.getByText('Anggaran minimum adalah Rp 1.000.000.')).toBeDefined();
  });

  it('prevents duplicate project creation while the first request is pending', async () => {
    vi.mocked(apiClient.post).mockReturnValue(new Promise(() => {}) as never);
    await renderBudgetStep();
    enterBudget('50000000');
    fireEvent.click(continueButton());
    await waitFor(() => expect(screen.getByText('Apa yang paling penting bagi Anda?')).toBeDefined());
    fireEvent.click(screen.getByRole('button', { name: /Hemat Uang/ }));

    const createButton = screen.getByRole('button', { name: /Buat Energy Twin Saya/ });
    fireEvent.click(createButton);
    fireEvent.click(createButton);

    expect(apiClient.post).toHaveBeenCalledTimes(1);
  });

  it('does not invite a retry if creation returns no project ID', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: {}, error: null } as never);
    await renderBudgetStep();
    enterBudget('50000000');
    fireEvent.click(continueButton());
    await waitFor(() => expect(screen.getByText('Apa yang paling penting bagi Anda?')).toBeDefined());
    fireEvent.click(screen.getByRole('button', { name: /Hemat Uang/ }));
    fireEvent.click(screen.getByRole('button', { name: /Buat Energy Twin Saya/ }));

    expect(await screen.findByText(/Periksa Dashboard sebelum mencoba lagi/)).toBeDefined();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
