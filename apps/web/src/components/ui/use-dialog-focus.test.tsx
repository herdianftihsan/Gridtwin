import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { useDialogFocus } from './use-dialog-focus';

function DialogHarness() {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useDialogFocus<HTMLDivElement>(isOpen, () => setIsOpen(false));

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>Open dialog</button>
      {isOpen && (
        <div ref={dialogRef} role="dialog" aria-modal="true" tabIndex={-1}>
          <button type="button">First action</button>
          <button type="button">Last action</button>
        </div>
      )}
    </>
  );
}

describe('useDialogFocus', () => {
  it('focuses into the dialog, traps Tab, closes on Escape, and restores focus', () => {
    render(<DialogHarness />);
    const opener = screen.getByRole('button', { name: 'Open dialog' });
    opener.focus();
    fireEvent.click(opener);

    const first = screen.getByRole('button', { name: 'First action' });
    const last = screen.getByRole('button', { name: 'Last action' });
    expect(document.activeElement).toBe(first);

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(first);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(opener);
  });
});
