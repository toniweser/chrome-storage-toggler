import { Plus } from "lucide-react";
import { useState } from "react";
import type { StoredPair } from "@/shared/types";
import { ShortcutRecorder } from "./ShortcutRecorder";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { ValueList } from "./ValueList";

interface PairFormProps {
  pair?: StoredPair;
  allPairs: StoredPair[];
  onSave: (pair: StoredPair) => void;
  onCancel: () => void;
}

export function PairForm({ pair, allPairs, onSave, onCancel }: PairFormProps) {
  const [key, setKey] = useState(pair?.key ?? "");
  const [values, setValues] = useState<string[]>(pair?.values ?? ["", ""]);
  const [reloadAfterToggle, setReloadAfterToggle] = useState(pair?.reloadAfterToggle ?? true);
  const [shortcut, setShortcut] = useState<string | null>(pair?.shortcut ?? null);
  const [newValue, setNewValue] = useState("");

  const canSave = key.trim() !== "" && values.filter((v) => v.trim() !== "").length >= 2;

  const handleAddValue = () => {
    if (newValue.trim()) {
      setValues([...values, newValue.trim()]);
      setNewValue("");
    }
  };

  const handleSave = () => {
    const cleanedValues = values.filter((v) => v.trim() !== "");
    if (cleanedValues.length < 2 || !key.trim()) return;

    onSave({
      id: pair?.id ?? crypto.randomUUID(),
      key: key.trim(),
      values: cleanedValues,
      reloadAfterToggle,
      shortcut,
      order: pair?.order ?? 0,
    });
  };

  return (
    <Card className="p-4 rounded-md space-y-1 animate-scale-in">
      <div className="flex flex-col gap-2.5">
        <label className="text-sm font-medium">Key</label>
        <Input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="localStorage key name"
        />
      </div>

      <div className="flex flex-col gap-2.5">
        <label className="text-sm font-medium">
          Values <span className="text-muted-foreground font-normal">(drag to reorder)</span>
        </label>
        <ValueList values={values} onChange={setValues} />
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 shrink-0" />
          <Input
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="Add a value..."
            className="h-8 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddValue();
              }
            }}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleAddValue}
            disabled={!newValue.trim()}
            className="h-7 w-7 shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Reload after toggle</label>
        <Switch checked={reloadAfterToggle} onCheckedChange={setReloadAfterToggle} />
      </div>

      <div className="flex flex-col gap-2.5">
        <label className="text-sm font-medium">Keyboard Shortcut</label>
        <ShortcutRecorder
          value={shortcut}
          onChange={setShortcut}
          allPairs={allPairs}
          currentPairId={pair?.id ?? null}
        />
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSave} disabled={!canSave}>
          Save
        </Button>
      </div>
    </Card>
  );
}
