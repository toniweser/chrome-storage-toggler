import type { Message, StoredPair } from "@/shared/types";

chrome.runtime.onMessage.addListener(
  (
    message: Message,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response?: unknown) => void,
  ) => {
    if (!message?.type) return false;

    handleMessage(message)
      .then(sendResponse)
      .catch((err) => {
        console.error("[Storage Toggler]", err);
        sendResponse({ error: String(err) });
      });

    return true;
  },
);

async function handleMessage(message: Message): Promise<unknown> {
  switch (message.type) {
    case "GET_CONFIG":
      return getConfig();
    case "GET_CURRENT_VALUES":
      return getCurrentValues(message.keys);
    case "TOGGLE_VALUE":
      return toggleValue(message.key, message.newValue, message.reload);
    case "SAVE_CONFIG":
      return saveConfig(message.pairs);
    default:
      return {};
  }
}

async function getConfig(): Promise<{ pairs: StoredPair[] }> {
  const result = await chrome.storage.sync.get("pairs");
  return { pairs: (result.pairs as StoredPair[] | undefined) ?? [] };
}

export function isScriptableUrl(url: string | undefined): boolean {
  if (!url) return false;
  return (
    !url.startsWith("chrome://") &&
    !url.startsWith("chrome-extension://") &&
    !url.startsWith("edge://") &&
    !url.startsWith("about:") &&
    !url.startsWith("devtools://") &&
    !url.startsWith("view-source:") &&
    !url.startsWith("https://chrome.google.com/webstore") &&
    !url.startsWith("https://chromewebstore.google.com")
  );
}

function emptyValues(keys: string[]): Record<string, string | null> {
  const values: Record<string, string | null> = {};
  for (const key of keys) values[key] = null;
  return values;
}

async function getCurrentValues(
  keys: string[],
): Promise<{ values: Record<string, string | null> }> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !isScriptableUrl(tab.url)) return { values: emptyValues(keys) };

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (keys: string[]) => {
        const values: Record<string, string | null> = {};
        for (const key of keys) {
          values[key] = localStorage.getItem(key);
        }
        return values;
      },
      args: [keys],
    });
    return { values: results[0]?.result ?? emptyValues(keys) };
  } catch (err) {
    console.warn("[Storage Toggler] getCurrentValues failed:", err);
    return { values: emptyValues(keys) };
  }
}

async function toggleValue(
  key: string,
  newValue: string,
  reload: boolean,
): Promise<{ success: boolean; error?: string }> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !isScriptableUrl(tab.url)) {
    return { success: false, error: "This page cannot be scripted (restricted URL)." };
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (key: string, value: string) => {
        localStorage.setItem(key, value);
      },
      args: [key, newValue],
    });

    if (reload) {
      try {
        await chrome.tabs.reload(tab.id);
      } catch (err) {
        console.warn("[Storage Toggler] reload failed:", err);
      }
    }

    return { success: true };
  } catch (err) {
    console.warn("[Storage Toggler] toggleValue failed:", err);
    return { success: false, error: String(err) };
  }
}

async function saveConfig(pairs: StoredPair[]): Promise<{ success: boolean }> {
  await chrome.storage.sync.set({ pairs });
  return { success: true };
}
