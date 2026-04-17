# Privacy Policy — Storage Toggler

_Last updated: 2026-04-17_

Storage Toggler is a Chrome extension that lets users toggle `localStorage`
values on any website via a popup or a configured keyboard shortcut.

## What data is collected

**None.** Storage Toggler does not collect, transmit, sell, or share any
personal or browsing data. There is no analytics, no telemetry, no external
server communication, and no third-party SDKs.

## What data is stored, and where

The only data Storage Toggler stores is **your own configuration**:

- the list of localStorage key/value pairs you define,
- their display order,
- each pair's optional keyboard shortcut,
- the "reload after toggle" flag.

This configuration is stored in [`chrome.storage.sync`](https://developer.chrome.com/docs/extensions/reference/api/storage),
which is Chrome's built-in sync storage. If you are signed into Chrome with
sync enabled, Chrome will sync this configuration across your own browsers.
Your configuration is never transmitted to the extension author or to any
third-party server.

## What the extension accesses on web pages

When you explicitly trigger a toggle — either by clicking a toggle button in
the popup or by pressing a configured keyboard shortcut — Storage Toggler
reads and writes the relevant key in `localStorage` on the **active tab**.

- It only reads the key you configured.
- It does not read cookies, form data, page content, or any other storage.
- It does not send any page data anywhere.
- Without your click or shortcut, no page access occurs.

The content script needed to capture keyboard shortcuts runs on all URLs but
only listens for your configured shortcuts. It does not observe, log, or
transmit any other activity.

## Permissions

- **`storage`** — to persist your configuration in `chrome.storage.sync`.
- **`scripting`** — to read/write the configured `localStorage` key on the
  active tab when you trigger a toggle from the popup.
- **`activeTab`** — to limit that access to the tab you are currently viewing
  when you click the extension icon.
- **`<all_urls>`** host permission — so the keyboard-shortcut listener can
  work on arbitrary websites.

## Children

Storage Toggler is a developer tool and is not directed at children under 13.

## Changes

If this policy ever changes, the update will be committed to the extension's
public repository and reflected in the "Last updated" date above.

## Contact

Questions or concerns? Open an issue at
<https://github.com/toniweser/chrome-storage-toggler/issues>.
