import { describe, expect, it } from "vitest";
import { isScriptableUrl } from "./index";

describe("isScriptableUrl", () => {
  it("allows http and https URLs", () => {
    expect(isScriptableUrl("https://example.com")).toBe(true);
    expect(isScriptableUrl("http://localhost:3000")).toBe(true);
  });

  it("blocks chrome:// internal pages", () => {
    expect(isScriptableUrl("chrome://extensions")).toBe(false);
    expect(isScriptableUrl("chrome://settings/")).toBe(false);
  });

  it("blocks chrome-extension:// URLs", () => {
    expect(isScriptableUrl("chrome-extension://abcdef/popup.html")).toBe(false);
  });

  it("blocks devtools, view-source, about, edge", () => {
    expect(isScriptableUrl("devtools://devtools/bundled/devtools_app.html")).toBe(false);
    expect(isScriptableUrl("view-source:https://example.com")).toBe(false);
    expect(isScriptableUrl("about:blank")).toBe(false);
    expect(isScriptableUrl("edge://settings")).toBe(false);
  });

  it("blocks both Chrome Web Store hosts", () => {
    expect(isScriptableUrl("https://chrome.google.com/webstore/category")).toBe(false);
    expect(isScriptableUrl("https://chromewebstore.google.com/detail/xyz")).toBe(false);
  });

  it("returns false for undefined or empty url", () => {
    expect(isScriptableUrl(undefined)).toBe(false);
    expect(isScriptableUrl("")).toBe(false);
  });
});
