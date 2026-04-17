import type { StoredPair } from "@/shared/types";

let pairs: StoredPair[] = [];

function getNextValue(pair: StoredPair): string {
  const current = localStorage.getItem(pair.key);
  const index = pair.values.indexOf(current ?? "");
  if (index === -1 || index === pair.values.length - 1) {
    return pair.values[0];
  }
  return pair.values[index + 1];
}

function handleKeyDown(e: KeyboardEvent) {
  for (const pair of pairs) {
    if (!pair.shortcut) continue;

    const parts = pair.shortcut.split("+");
    const key = parts[parts.length - 1];
    const modifiers = parts.slice(0, -1);

    const needsCtrl = modifiers.includes("Ctrl");
    const needsShift = modifiers.includes("Shift");
    const needsAlt = modifiers.includes("Alt");
    const needsMeta = modifiers.includes("Meta");

    if (
      e.key.toUpperCase() === key.toUpperCase() &&
      e.ctrlKey === needsCtrl &&
      e.shiftKey === needsShift &&
      e.altKey === needsAlt &&
      e.metaKey === needsMeta
    ) {
      e.preventDefault();
      e.stopPropagation();

      const nextValue = getNextValue(pair);
      localStorage.setItem(pair.key, nextValue);

      if (pair.reloadAfterToggle) {
        location.reload();
      }
      return;
    }
  }
}

async function loadConfig() {
  const result = await chrome.storage.sync.get("pairs");
  pairs = (result.pairs as StoredPair[] | undefined) ?? [];
}

function init() {
  loadConfig();
  document.addEventListener("keydown", handleKeyDown);

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "sync" && changes.pairs) {
      pairs = (changes.pairs.newValue as StoredPair[] | undefined) ?? [];
    }
  });
}

init();
