import { useCallback, useEffect, useRef, useState } from "react";
import type { StoredPair } from "@/shared/types";
import { Button } from "./ui/button";
import { Keyboard, X } from "lucide-react";

interface ShortcutRecorderProps {
  value: string | null;
  onChange: (shortcut: string | null) => void;
  allPairs: StoredPair[];
  currentPairId: string | null;
}

function formatShortcut(e: KeyboardEvent): string | null {
  if (e.key === "Escape") return null;

  const modifiers: string[] = [];
  if (e.ctrlKey) modifiers.push("Ctrl");
  if (e.altKey) modifiers.push("Alt");
  if (e.shiftKey) modifiers.push("Shift");
  if (e.metaKey) modifiers.push("Meta");

  // Require at least one modifier
  if (modifiers.length === 0) return null;

  // Ignore if only modifier keys are pressed
  const modifierKeys = [
    "Control",
    "Alt",
    "Shift",
    "Meta",
    "CapsLock",
    "NumLock",
  ];
  if (modifierKeys.includes(e.key)) return null;

  const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
  return [...modifiers, key].join("+");
}

export function ShortcutRecorder({
  value,
  onChange,
  allPairs,
  currentPairId,
}: ShortcutRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [conflict, setConflict] = useState<string | null>(null);
  const [pendingShortcut, setPendingShortcut] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const checkConflict = useCallback(
    (shortcut: string): StoredPair | undefined => {
      return allPairs.find(
        (p) => p.id !== currentPairId && p.shortcut === shortcut
      );
    },
    [allPairs, currentPairId]
  );

  useEffect(() => {
    if (!recording) return;

    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.key === "Escape") {
        setRecording(false);
        setPendingShortcut(null);
        setConflict(null);
        return;
      }

      const shortcut = formatShortcut(e);
      if (!shortcut) return;

      const conflictingPair = checkConflict(shortcut);
      if (conflictingPair) {
        setConflict(conflictingPair.key);
        setPendingShortcut(shortcut);
      } else {
        onChange(shortcut);
        setRecording(false);
        setConflict(null);
        setPendingShortcut(null);
      }
    };

    document.addEventListener("keydown", handler, true);
    return () => document.removeEventListener("keydown", handler, true);
  }, [recording, onChange, checkConflict]);

  const handleOverwrite = () => {
    if (pendingShortcut) {
      onChange(pendingShortcut);
    }
    setRecording(false);
    setConflict(null);
    setPendingShortcut(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div
          ref={containerRef}
          className={`flex-1 flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer transition-colors ${
            recording
              ? "border-primary bg-primary/5 ring-1 ring-primary"
              : "border-input hover:border-primary/50"
          }`}
          onClick={() => {
            setRecording(true);
            setConflict(null);
            setPendingShortcut(null);
          }}
        >
          <Keyboard className="h-4 w-4 text-muted-foreground shrink-0" />
          <span
            className={
              recording
                ? "text-primary"
                : value
                  ? "text-foreground"
                  : "text-muted-foreground"
            }
          >
            {recording
              ? "Press a key combination..."
              : value ?? "Click to record..."}
          </span>
        </div>

        {value && !recording && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-destructive hover:text-destructive shrink-0"
            onClick={() => onChange(null)}
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {conflict && (
        <div className="text-xs space-y-1">
          <p className="text-destructive">
            This shortcut is already used by &ldquo;{conflict}&rdquo;.
            Overwrite?
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() => {
                setConflict(null);
                setPendingShortcut(null);
                setRecording(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="h-6 text-xs"
              onClick={handleOverwrite}
            >
              Overwrite
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
