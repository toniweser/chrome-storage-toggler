import { describe, expect, it } from "vitest";
import { getNextValue } from "./toggle";
import type { StoredPair } from "./types";

const makePair = (values: string[]): StoredPair => ({
  id: "1",
  key: "test",
  values,
  reloadAfterToggle: false,
  shortcut: null,
  order: 0,
});

describe("getNextValue", () => {
  it("cycles forward through values", () => {
    const p = makePair(["a", "b", "c"]);
    expect(getNextValue(p, "a")).toBe("b");
    expect(getNextValue(p, "b")).toBe("c");
  });

  it("loops back to the first after the last", () => {
    const p = makePair(["a", "b", "c"]);
    expect(getNextValue(p, "c")).toBe("a");
  });

  it("returns the first value when current is null", () => {
    expect(getNextValue(makePair(["dark", "light"]), null)).toBe("dark");
  });

  it("returns the first value when current is not in the list", () => {
    expect(getNextValue(makePair(["dark", "light"]), "sepia")).toBe("dark");
  });

  it("works with two-value toggles", () => {
    const p = makePair(["on", "off"]);
    expect(getNextValue(p, "on")).toBe("off");
    expect(getNextValue(p, "off")).toBe("on");
  });

  it("treats empty-string current as unset and returns first", () => {
    expect(getNextValue(makePair(["a", "b"]), "")).toBe("a");
  });
});
