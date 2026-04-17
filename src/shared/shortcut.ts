const MODIFIER_KEYS = ["Control", "Alt", "Shift", "Meta", "CapsLock", "NumLock"];

interface ShortcutEventLike {
  key: string;
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
}

export function formatShortcut(e: ShortcutEventLike): string | null {
  if (e.key === "Escape") return null;

  const modifiers: string[] = [];
  if (e.ctrlKey) modifiers.push("Ctrl");
  if (e.altKey) modifiers.push("Alt");
  if (e.shiftKey) modifiers.push("Shift");
  if (e.metaKey) modifiers.push("Meta");

  if (modifiers.length === 0) return null;
  if (MODIFIER_KEYS.includes(e.key)) return null;

  const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
  return [...modifiers, key].join("+");
}

export function matchesShortcut(shortcut: string, e: ShortcutEventLike): boolean {
  const parts = shortcut.split("+");
  const key = parts[parts.length - 1];
  const modifiers = parts.slice(0, -1);

  return (
    e.key.toUpperCase() === key.toUpperCase() &&
    e.ctrlKey === modifiers.includes("Ctrl") &&
    e.shiftKey === modifiers.includes("Shift") &&
    e.altKey === modifiers.includes("Alt") &&
    e.metaKey === modifiers.includes("Meta")
  );
}
