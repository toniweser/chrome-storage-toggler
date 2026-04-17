import { useSortable } from "@dnd-kit/react/sortable";
import { GripVertical, Keyboard, Pencil, Play, Trash2 } from "lucide-react";
import { useState } from "react";
import type { StoredPair } from "@/shared/types";
import { DeleteDialog } from "./DeleteDialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface PairCardProps {
  pair: StoredPair;
  index: number;
  currentValue: string | null;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function PairCard({ pair, index, currentValue, onToggle, onEdit, onDelete }: PairCardProps) {
  const [showDelete, setShowDelete] = useState(false);
  const { ref, handleRef } = useSortable({ id: pair.id, index });

  return (
    <>
      <Card ref={ref} className="p-3 rounded-md animate-fade-in">
        <div className="flex items-center gap-2">
          <button
            type="button"
            ref={handleRef}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors touch-none"
            aria-label="Drag to reorder"
          >
            <GripVertical className="h-4 w-4" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm truncate">{pair.key}</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={onToggle}
                  >
                    <Play className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle to next value</TooltipContent>
              </Tooltip>
              {pair.shortcut && (
                <Badge variant="secondary" className="shrink-0 text-xs gap-1">
                  <Keyboard className="h-3 w-3" />
                  {pair.shortcut}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground min-w-0 truncate">
              {pair.values.map((v, i) => (
                <span key={`${pair.id}-${v}`} className="flex items-center gap-1">
                  {i > 0 && <span className="text-border">&middot;</span>}
                  <span className={v === currentValue ? "text-primary font-medium" : ""}>{v}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-0.5 shrink-0 self-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onEdit}
              aria-label="Edit pair"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={() => setShowDelete(true)}
              aria-label="Delete pair"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      <DeleteDialog
        open={showDelete}
        pairKey={pair.key}
        onConfirm={() => {
          setShowDelete(false);
          onDelete();
        }}
        onCancel={() => setShowDelete(false)}
      />
    </>
  );
}
