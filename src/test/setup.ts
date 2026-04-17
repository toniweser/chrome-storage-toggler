import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
});

// jsdom lacks these APIs; Radix UI (tooltip/dialog) relies on them.
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}
if (!HTMLElement.prototype.hasPointerCapture) {
  HTMLElement.prototype.hasPointerCapture = () => false;
}
if (!HTMLElement.prototype.scrollIntoView) {
  HTMLElement.prototype.scrollIntoView = vi.fn();
}

// Mock the chrome.* APIs used by components/background/content
// Individual tests can override specific methods via vi.spyOn or vi.mocked.
const chromeMock = {
  runtime: {
    sendMessage: vi.fn(),
    onMessage: { addListener: vi.fn() },
  },
  storage: {
    sync: {
      get: vi.fn().mockResolvedValue({ pairs: [] }),
      set: vi.fn().mockResolvedValue(undefined),
    },
    onChanged: {
      addListener: vi.fn(),
    },
  },
  tabs: {
    query: vi.fn().mockResolvedValue([{ id: 1, url: "https://example.com" }]),
    reload: vi.fn().mockResolvedValue(undefined),
  },
  scripting: {
    executeScript: vi.fn().mockResolvedValue([{ result: {} }]),
  },
};

Object.assign(globalThis, { chrome: chromeMock });
