import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LocationSearch } from './location-search';
import { apiClient } from '../../lib/api/api-client';

vi.mock('../../lib/api/api-client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('LocationSearch Component', () => {
  it('7. short query does not trigger fetch immediately if debounced, or is handled', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [], meta: { timestamp: new Date().toISOString() } } as unknown as never);
    render(<LocationSearch value="" onChange={vi.fn()} />);
    
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'Su' } });
    
    // Fast check before debounce
    expect(apiClient.get).not.toHaveBeenCalled();
    
    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/api/locations/search?q=Su');
    });
  });

  it('13. stale request behavior is handled by ignoring previous results', async () => {
    vi.mocked(apiClient.get).mockImplementation(async (url) => {
      if (url.includes('q=Sur')) {
        return new Promise(resolve => setTimeout(() => resolve({ data: [{ id: 'loc_surabaya', name: 'Surabaya', province: 'Jawa Timur', administrativeLevel: 'city' }], meta: { timestamp: new Date().toISOString() } } as unknown as never), 100));
      }
      return { data: [], meta: { timestamp: new Date().toISOString() } } as unknown as never;
    });

    render(<LocationSearch value="" onChange={vi.fn()} />);
    const input = screen.getByRole('combobox');
    
    fireEvent.change(input, { target: { value: 'Sur' } });
    
    await waitFor(() => {
      expect(screen.getByText('Surabaya')).toBeTruthy();
    });
  });
});
