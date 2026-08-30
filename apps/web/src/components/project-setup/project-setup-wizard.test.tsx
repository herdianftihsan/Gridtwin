// apps/web/src/components/project-setup/project-setup-wizard.test.tsx
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

vi.mock('../../lib/api/api-client', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
  ApiClientError: class ApiClientError extends Error {
    constructor(public code: string, message: string, public status: number) {
      super(message);
    }
  },
}));

describe('Phase 11: ProjectSetupWizard Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. renders Step 1 (Building) on initial mount with default values', () => {
    render(<ProjectSetupWizard />);
    expect(screen.getByText('Describe your building')).toBeDefined();
    expect(screen.getByText('Location')).toBeDefined();
    expect(screen.getByText('Building Type')).toBeDefined();
  });

  it('2. advances through the 4 steps on valid user interactions', async () => {
    render(<ProjectSetupWizard />);

    // Step 1: Nilai awal sudah valid ('Surabaya' & 'Ruko'), klik Continue
    fireEvent.click(screen.getByText('Continue'));

    // Step 2: Energy baseline
    await waitFor(() => {
      expect(screen.getByText('Your energy baseline')).toBeDefined();
    });
    fireEvent.click(screen.getByText('Continue'));

    // Step 3: Budget
    await waitFor(() => {
      expect(screen.getByText(/budget|financial/i)).toBeDefined();
    });
    fireEvent.click(screen.getByText('Continue'));

    // Step 4: Objective
    await waitFor(() => {
      expect(screen.getByText(/What matters most to you|objective/i)).toBeDefined();
      expect(screen.getByText('Generate My Energy Twin')).toBeDefined();
    });
  });

  it('3. submits the completed form to POST /api/projects and navigates on success', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { id: 'proj-new-123' },
      error: null,
    } as never);

    render(<ProjectSetupWizard />);

    // Step 1 -> Step 2
    fireEvent.click(screen.getByText('Continue'));
    await waitFor(() => expect(screen.getByText('Your energy baseline')).toBeDefined());

    // Step 2 -> Step 3
    fireEvent.click(screen.getByText('Continue'));
    await waitFor(() => expect(screen.getByText(/budget|financial/i)).toBeDefined());

    // Step 3 -> Step 4
    fireEvent.click(screen.getByText('Continue'));
    await waitFor(() => expect(screen.getByText('Generate My Energy Twin')).toBeDefined());

    // Step 4 -> Submit
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
      expect(mockPush).toHaveBeenCalledWith('/projects/proj-new-123');
    });
  });
});