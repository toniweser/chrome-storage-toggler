export interface StoredPair {
  id: string;
  key: string;
  values: string[];
  reloadAfterToggle: boolean;
  shortcut: string | null;
  order: number;
}

// Popup → Background
export type Message =
  | { type: "GET_CONFIG" }
  | { type: "GET_CURRENT_VALUES"; keys: string[] }
  | { type: "TOGGLE_VALUE"; key: string; newValue: string; reload: boolean }
  | { type: "SAVE_CONFIG"; pairs: StoredPair[] };

// Background → Popup (responses)
export type GetConfigResponse = { pairs: StoredPair[] };
export type GetCurrentValuesResponse = { values: Record<string, string | null> };
export type ToggleValueResponse = { success: boolean };
