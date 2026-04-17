import { move } from "@dnd-kit/helpers";
import { DragDropProvider } from "@dnd-kit/react";
import { useState } from "react";
import type { StoredPair } from "@/shared/types";
import { PairCard } from "./PairCard";
import { PairForm } from "./PairForm";

interface PairListProps {
  pairs: StoredPair[];
  currentValues: Record<string, string | null>;
  editingPairId: string | null;
  allPairs: StoredPair[];
  onToggle: (pair: StoredPair) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onSave: (pair: StoredPair) => void;
  onCancelEdit: () => void;
  onReorder: (pairs: StoredPair[]) => void;
}

export function PairList({
  pairs,
  currentValues,
  editingPairId,
  allPairs,
  onToggle,
  onEdit,
  onDelete,
  onSave,
  onCancelEdit,
  onReorder,
}: PairListProps) {
  const [items, setItems] = useState(pairs);

  // Keep items in sync with pairs prop
  if (pairs !== items && JSON.stringify(pairs) !== JSON.stringify(items)) {
    setItems(pairs);
  }

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        setItems((currentItems) => {
          const reordered = move(currentItems, event);
          onReorder(reordered);
          return reordered;
        });
      }}
    >
      <div className="space-y-2">
        {items.map((pair, index) =>
          editingPairId === pair.id ? (
            <PairForm
              key={pair.id}
              pair={pair}
              allPairs={allPairs}
              onSave={onSave}
              onCancel={onCancelEdit}
            />
          ) : (
            <PairCard
              key={pair.id}
              pair={pair}
              index={index}
              currentValue={currentValues[pair.key] ?? null}
              onToggle={() => onToggle(pair)}
              onEdit={() => onEdit(pair.id)}
              onDelete={() => onDelete(pair.id)}
            />
          ),
        )}
      </div>
    </DragDropProvider>
  );
}
