import { matchesShortcut } from "@/shared/shortcut";
import { getNextValue } from "@/shared/toggle";
import type { StoredPair } from "@/shared/types";

let pairs: StoredPair[] = [];

function handleKeyDown(e: KeyboardEvent) {
  for (const pair of pairs) {
    if (!pair.shortcut) continue;

    if (matchesShortcut(pair.shortcut, e)) {
      e.preventDefault();
      e.stopPropagation();

      const current = localStorage.getItem(pair.key);
      const nextValue = getNextValue(pair, current);
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
