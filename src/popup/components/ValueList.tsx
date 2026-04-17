import { move } from "@dnd-kit/helpers";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { GripVertical, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface ValueListProps {
  values: string[];
  onChange: (values: string[]) => void;
}

interface ValueItemData {
  id: string;
  value: string;
}

function ValueItem({
  id,
  value,
  index,
  onChange,
  onRemove,
  canRemove,
}: {
  id: string;
  value: string;
  index: number;
  onChange: (value: string) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const { ref, handleRef } = useSortable({ id, index });

  return (
    <div ref={ref} className="flex items-center gap-1.5">
      <button
        type="button"
        ref={handleRef}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors touch-none shrink-0"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-8 text-sm" />
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
        onClick={onRemove}
        disabled={!canRemove}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

export function ValueList({ values, onChange }: ValueListProps) {
  const [items, setItems] = useState<ValueItemData[]>(() =>
    values.map((v) => ({ id: crypto.randomUUID(), value: v })),
  );

  // Sync external values → internal items, preserving IDs by position
  const internalValues = items.map((i) => i.value);
  const inSync =
    internalValues.length === values.length && internalValues.every((v, i) => v === values[i]);
  if (!inSync) {
    setItems(
      values.map((v, i) => ({
        id: items[i]?.id ?? crypto.randomUUID(),
        value: v,
      })),
    );
  }

  const handleValueChange = (id: string, newValue: string) => {
    const updated = items.map((it) => (it.id === id ? { ...it, value: newValue } : it));
    setItems(updated);
    onChange(updated.map((it) => it.value));
  };

  const handleRemove = (id: string) => {
    const updated = items.filter((it) => it.id !== id);
    setItems(updated);
    onChange(updated.map((it) => it.value));
  };

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        setItems((current) => {
          const reordered = move(current, event);
          onChange(reordered.map((it) => it.value));
          return reordered;
        });
      }}
    >
      <div className="space-y-1.5">
        {items.map((item, index) => (
          <ValueItem
            key={item.id}
            id={item.id}
            value={item.value}
            index={index}
            onChange={(v) => handleValueChange(item.id, v)}
            onRemove={() => handleRemove(item.id)}
            canRemove={items.length > 2}
          />
        ))}
      </div>
    </DragDropProvider>
  );
}
