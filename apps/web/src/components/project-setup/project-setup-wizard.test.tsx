import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ProjectSetupWizard } from './project-setup-wizard';
import { apiClient } from '../../lib/api/api-client';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('Phase 11: ProjectSetupWizard Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockPush.mockReset();
  });

  it('1. renders Step 1 (Building) on initial mount with default values', () => {
    render(<ProjectSetupWizard />);

    expect(screen.getByText('Describe your building')).toBeDefined();
    expect(screen.getByText('Location')).toBeDefined();
    expect(screen.getByText('Building Type')).toBeDefined();
    expect(screen.getByText('Continue')).toBeDefined();
  });

  it('2. advances through the 4 steps on valid user interactions', async () => {
    render(<ProjectSetupWizard />);

    // Step 1 -> Step 2
    fireEvent.click(screen.getByText('Continue'));
    expect(screen.getByText('Your energy baseline')).toBeDefined();

    // Step 2 -> Step 3
    fireEvent.click(screen.getByText('Continue'));
    expect(screen.getByText('Set your investment limit')).toBeDefined();

    // Step 3 -> Step 4
    fireEvent.click(screen.getByText('Continue'));
    expect(screen.getByText('What matters most to you?')).toBeDefined();
    expect(screen.getByText('Generate My Energy Twin')).toBeDefined();
  });

  it('3. submits the completed form to POST /api/projects and navigates on success', async () => {
    const mockCreatedProject = {
      id: 'proj-uuid-1234',
      building_type: 'Ruko',
      location: 'Surabaya',
      monthly_bill: 4500000,
      budget: 50000000,
      objective: 'save_money',
    };

    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: mockCreatedProject as never,
      meta: { timestamp: '2026-08-29T00:00:00Z' },
    });

    render(<ProjectSetupWizard />);

    // Navigate to step 4
    fireEvent.click(screen.getByText('Continue'));
    fireEvent.click(screen.getByText('Continue'));
    fireEvent.click(screen.getByText('Continue'));

    // Submit
    fireEvent.click(screen.getByText('Generate My Energy Twin'));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/api/projects', {
        building_type: 'Ruko',
        location: 'Surabaya',
        roof_area: undefined,
        monthly_bill: 4500000,
        budget: 50000000,
        objective: 'save_money',
      });
      expect(mockPush).toHaveBeenCalledWith('/projects/proj-uuid-1234');
    });
  });
});