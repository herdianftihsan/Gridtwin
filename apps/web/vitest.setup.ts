// apps/web/vitest.setup.ts

// 1. Robust MatchMedia Polyfill (Kebal terhadap vi.restoreAllMocks)
const matchMediaPolyfill = (query: string): MediaQueryList => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: matchMediaPolyfill,
});

Object.defineProperty(globalThis, 'matchMedia', {
  writable: true,
  configurable: true,
  value: matchMediaPolyfill,
});

// 2. Robust ResizeObserver Polyfill
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: MockResizeObserver,
});

Object.defineProperty(globalThis, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: MockResizeObserver,
});