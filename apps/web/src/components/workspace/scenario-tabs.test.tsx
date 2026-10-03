import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ScenarioTabs } from './scenario-tabs';

describe('ScenarioTabs', () => {
  it('disables strategy changes while an async workspace operation is active', () => {
    const onTabSelect = vi.fn();
    render(
      <ScenarioTabs
        activeTab="balanced"
        onTabSelect={onTabSelect}
        recommendedScenario={null}
        disabled
      />,
    );

    const paybackTab = screen.getByRole('button', { name: 'Balik Modal Tercepat' });
    expect((paybackTab as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(paybackTab);
    expect(onTabSelect).not.toHaveBeenCalled();
  });
});
