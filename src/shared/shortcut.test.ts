import { describe, expect, it } from "vitest";
import { formatShortcut, matchesShortcut } from "./shortcut";

function keyEvent(overrides: Partial<KeyboardEventInit> & { key: string }): KeyboardEvent {
  return new KeyboardEvent("keydown", {
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    ...overrides,
  });
}

describe("formatShortcut", () => {
  it("returns Ctrl+Shift+<key> for a single letter with modifiers", () => {
    expect(formatShortcut(keyEvent({ key: "d", ctrlKey: true, shiftKey: true }))).toBe(
      "Ctrl+Shift+D",
    );
  });

  it("uppercases single-char keys, keeps multi-char names as-is", () => {
    expect(formatShortcut(keyEvent({ key: "ArrowUp", ctrlKey: true }))).toBe("Ctrl+ArrowUp");
  });

  it("orders modifiers consistently: Ctrl, Alt, Shift, Meta", () => {
    expect(
      formatShortcut(
        keyEvent({ key: "x", ctrlKey: true, altKey: true, shiftKey: true, metaKey: true }),
      ),
    ).toBe("Ctrl+Alt+Shift+Meta+X");
  });

  it("returns null for Escape (cancels recording)", () => {
    expect(formatShortcut(keyEvent({ key: "Escape", ctrlKey: true }))).toBeNull();
  });

  it("returns null when no modifier is pressed", () => {
    expect(formatShortcut(keyEvent({ key: "d" }))).toBeNull();
  });

  it("returns null while only a modifier key is held", () => {
    expect(formatShortcut(keyEvent({ key: "Shift", shiftKey: true }))).toBeNull();
    expect(formatShortcut(keyEvent({ key: "Control", ctrlKey: true }))).toBeNull();
    expect(formatShortcut(keyEvent({ key: "Meta", metaKey: true }))).toBeNull();
  });
});

describe("matchesShortcut", () => {
  it("matches when all modifiers and key agree", () => {
    expect(
      matchesShortcut("Ctrl+Shift+D", keyEvent({ key: "D", ctrlKey: true, shiftKey: true })),
    ).toBe(true);
  });

  it("is case-insensitive on the key", () => {
    expect(
      matchesShortcut("Ctrl+Shift+D", keyEvent({ key: "d", ctrlKey: true, shiftKey: true })),
    ).toBe(true);
  });

  it("does not match when an extra modifier is held", () => {
    expect(matchesShortcut("Ctrl+D", keyEvent({ key: "d", ctrlKey: true, shiftKey: true }))).toBe(
      false,
    );
  });

  it("does not match when a required modifier is missing", () => {
    expect(matchesShortcut("Ctrl+Shift+D", keyEvent({ key: "d", ctrlKey: true }))).toBe(false);
  });

  it("does not match when the key differs", () => {
    expect(matchesShortcut("Ctrl+D", keyEvent({ key: "e", ctrlKey: true }))).toBe(false);
  });
});
