import type { Message, StoredPair } from "@/shared/types";

// --- Mock Chrome APIs ---

const syncStore: Record<string, unknown> = {
  pairs: [
    {
      id: "1",
      key: "ui-theme",
      values: ["Dark", "Light"],
      reloadAfterToggle: true,
      shortcut: "Ctrl+Shift+D",
      order: 0,
    },
    {
      id: "2",
      key: "feature-flags",
      values: ["on", "off", "debug"],
      reloadAfterToggle: false,
      shortcut: null,
      order: 1,
    },
    {
      id: "3",
      key: "debug-mode",
      values: ["true", "false"],
      reloadAfterToggle: true,
      shortcut: null,
      order: 2,
    },
  ] satisfies StoredPair[],
};

const fakeLocalStorage: Record<string, string> = {
  "ui-theme": "Dark",
  "feature-flags": "on",
  "debug-mode": "true",
};

interface StorageChange {
  oldValue?: unknown;
  newValue?: unknown;
}

const changeListeners: Array<(changes: Record<string, StorageChange>, areaName: string) => void> =
  [];

const chromeMock = {
  runtime: {
    sendMessage: async (message: Message) => {
      switch (message.type) {
        case "GET_CONFIG":
          return { pairs: syncStore.pairs ?? [] };

        case "GET_CURRENT_VALUES": {
          const values: Record<string, string | null> = {};
          for (const key of message.keys) {
            values[key] = fakeLocalStorage[key] ?? null;
          }
          return { values };
        }

        case "TOGGLE_VALUE": {
          fakeLocalStorage[message.key] = message.newValue;
          if (message.reload) {
            console.log("[dev] Would reload page");
          }
          return { success: true };
        }

        case "SAVE_CONFIG": {
          const oldPairs = syncStore.pairs;
          syncStore.pairs = message.pairs;
          for (const listener of changeListeners) {
            listener(
              {
                pairs: {
                  oldValue: oldPairs,
                  newValue: message.pairs,
                },
              },
              "sync",
            );
          }
          return { success: true };
        }
      }
    },
  },
  storage: {
    sync: {
      get: async (key: string) => ({ [key]: syncStore[key] }),
      set: async (items: Record<string, unknown>) => {
        Object.assign(syncStore, items);
      },
    },
    onChanged: {
      addListener: (fn: (changes: Record<string, StorageChange>, areaName: string) => void) => {
        changeListeners.push(fn);
      },
    },
  },
  tabs: {
    query: async () => [{ id: 1 }],
    reload: async () => console.log("[dev] Would reload tab"),
  },
  scripting: {
    executeScript: async () => [{ result: {} }],
  },
};

// Install mock before any other imports use chrome
Object.assign(globalThis, { chrome: chromeMock });

// --- Now boot the app ---
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { TooltipProvider } from "@/popup/components/ui/tooltip";
import { App } from "./App";
import "./globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TooltipProvider>
      <App />
    </TooltipProvider>
  </StrictMode>,
);
