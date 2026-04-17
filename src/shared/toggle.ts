import type { StoredPair } from "./types";

export function getNextValue(pair: StoredPair, current: string | null): string {
  const index = pair.values.indexOf(current ?? "");
  if (index === -1 || index === pair.values.length - 1) {
    return pair.values[0];
  }
  return pair.values[index + 1];
}
