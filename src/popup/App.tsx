import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { StoredPair } from "@/shared/types";
import { PairForm } from "./components/PairForm";
import { PairList } from "./components/PairList";
import { Button } from "./components/ui/button";

export function App() {
  const [pairs, setPairs] = useState<StoredPair[]>([]);
  const [currentValues, setCurrentValues] = useState<Record<string, string | null>>({});
  const [editingPairId, setEditingPairId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const configResponse = await chrome.runtime.sendMessage({
        type: "GET_CONFIG",
      });
      const loadedPairs: StoredPair[] = configResponse.pairs ?? [];
      setPairs(loadedPairs);

      if (loadedPairs.length > 0) {
        const keys = loadedPairs.map((p) => p.key);
        const valuesResponse = await chrome.runtime.sendMessage({
          type: "GET_CURRENT_VALUES",
          keys,
        });
        setCurrentValues(valuesResponse.values ?? {});
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const savePairs = async (updatedPairs: StoredPair[]) => {
    setPairs(updatedPairs);
    await chrome.runtime.sendMessage({
      type: "SAVE_CONFIG",
      pairs: updatedPairs,
    });
  };

  const handleToggle = async (pair: StoredPair) => {
    const current = currentValues[pair.key];
    const index = pair.values.indexOf(current ?? "");
    const nextIndex = index === -1 || index === pair.values.length - 1 ? 0 : index + 1;
    const newValue = pair.values[nextIndex];

    setCurrentValues((prev) => ({ ...prev, [pair.key]: newValue }));

    await chrome.runtime.sendMessage({
      type: "TOGGLE_VALUE",
      key: pair.key,
      newValue,
      reload: pair.reloadAfterToggle,
    });
  };

  const handleSavePair = async (pair: StoredPair) => {
    let updatedPairs: StoredPair[];
    const existingIndex = pairs.findIndex((p) => p.id === pair.id);

    if (existingIndex >= 0) {
      updatedPairs = pairs.map((p) => (p.id === pair.id ? pair : p));
    } else {
      updatedPairs = [...pairs, { ...pair, order: pairs.length }];
    }

    await savePairs(updatedPairs);
    setEditingPairId(null);
    setIsAdding(false);
  };

  const handleDeletePair = async (id: string) => {
    const updatedPairs = pairs.filter((p) => p.id !== id).map((p, i) => ({ ...p, order: i }));
    await savePairs(updatedPairs);
  };

  const handleReorder = async (reorderedPairs: StoredPair[]) => {
    const updatedPairs = reorderedPairs.map((p, i) => ({ ...p, order: i }));
    await savePairs(updatedPairs);
  };

  if (loading) {
    return (
      <div className="w-[500px] p-6 flex items-center justify-center">
        <span className="text-muted-foreground text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <div className="w-[500px] min-h-0">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <img src="./icons/icon48.png" alt="Storage Toggler" className="h-5 w-5" />
        <h1 className="text-base font-semibold">Storage Toggler</h1>
        {!isAdding && editingPairId === null && (
          <Button variant="outline" size="sm" className="ml-auto" onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add new pair
          </Button>
        )}
      </div>

      <div className="p-3 space-y-2">
        {pairs.length === 0 && !isAdding ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No pairs configured yet
          </div>
        ) : (
          <PairList
            pairs={pairs}
            currentValues={currentValues}
            editingPairId={editingPairId}
            allPairs={pairs}
            onToggle={handleToggle}
            onEdit={setEditingPairId}
            onDelete={handleDeletePair}
            onSave={handleSavePair}
            onCancelEdit={() => setEditingPairId(null)}
            onReorder={handleReorder}
          />
        )}

        {isAdding && (
          <PairForm allPairs={pairs} onSave={handleSavePair} onCancel={() => setIsAdding(false)} />
        )}
      </div>
    </div>
  );
}
