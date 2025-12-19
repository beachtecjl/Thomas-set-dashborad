import React, { useEffect, useMemo, useRef, useState } from 'react';
import SearchBar from './components/SearchBar';
import SetTable from './components/SetTable';
import SetDetail from './components/SetDetail';
import AddSetModal from './components/AddSetModal';
import seedSets from './data/seedSets';

const STORAGE_KEY = 'lego-set-dashboard-data';

const computeMetrics = (set) => {
  const delta = set.currentPrice - set.purchasePrice;
  const roi = set.purchasePrice > 0 ? (delta / set.purchasePrice) * 100 : null;
  const totalScore = set.rankA + set.rankB + set.rankC + set.rankD;
  return { delta, roi, totalScore };
};

const normalizeSet = (set) => ({
  ...set,
  purchasePrice: Number(set.purchasePrice) || 0,
  currentPrice: Number(set.currentPrice) || 0,
  rankA: Number(set.rankA) || 0,
  rankB: Number(set.rankB) || 0,
  rankC: Number(set.rankC) || 0,
  rankD: Number(set.rankD) || 0,
  year:
    set.year === null || set.year === undefined || set.year === ''
      ? null
      : Number(set.year),
  notes: set.notes || '',
  tags: Array.isArray(set.tags) ? set.tags : [],
});

const loadInitialSets = () => {
  if (typeof window === 'undefined') return seedSets;
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) return parsed.map((item) => normalizeSet(item));
    }
  } catch (error) {
    console.warn('Unable to read saved sets', error);
  }
  return seedSets.map((item) => normalizeSet(item));
};

function App() {
  const initialSets = useRef(loadInitialSets());
  const [sets, setSets] = useState(initialSets.current);
  const [selectedId, setSelectedId] = useState(initialSets.current[0]?.setId || null);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
    } catch (error) {
      console.warn('Unable to persist sets', error);
    }
  }, [sets]);

  const filteredSets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const result = sets.filter((set) => {
      if (!normalizedQuery) return true;
      return (
        set.setId.toLowerCase().includes(normalizedQuery) ||
        set.name.toLowerCase().includes(normalizedQuery) ||
        (set.theme || '').toLowerCase().includes(normalizedQuery)
      );
    });

    const sorted = [...result].sort((a, b) => {
      const metricsA = computeMetrics(a);
      const metricsB = computeMetrics(b);

      if (sortBy === 'currentPrice') {
        return b.currentPrice - a.currentPrice;
      }

      if (sortBy === 'roi') {
        const roiA = metricsA.roi ?? -Infinity;
        const roiB = metricsB.roi ?? -Infinity;
        return roiB - roiA;
      }

      // Default: total score
      if (metricsB.totalScore === metricsA.totalScore) {
        return b.currentPrice - a.currentPrice;
      }
      return metricsB.totalScore - metricsA.totalScore;
    });

    return sorted;
  }, [sets, query, sortBy]);

  useEffect(() => {
    if (!selectedId && filteredSets.length) {
      setSelectedId(filteredSets[0].setId);
    }
  }, [filteredSets, selectedId]);

  const selectedSet = sets.find((s) => s.setId === selectedId) || filteredSets[0];

  const handleUpdateSet = (updatedSet) => {
    const normalized = normalizeSet(updatedSet);
    setSets((prev) =>
      prev.map((item) => (item.setId === normalized.setId ? normalized : item))
    );
  };

  const handleAddSet = (newSet) => {
    const fullSet = normalizeSet({
      ...newSet,
      purchasePrice: 0,
      currentPrice: 0,
      rankA: 0,
      rankB: 0,
      rankC: 0,
      rankD: 0,
      notes: '',
      tags: [],
    });
    setSets((prev) => [fullSet, ...prev]);
    setSelectedId(newSet.setId);
    setIsAddModalOpen(false);
  };

  const handleRemoveMissingSelection = () => {
    if (selectedId && !sets.find((s) => s.setId === selectedId)) {
      setSelectedId(sets[0]?.setId || null);
    }
  };

  useEffect(() => {
    handleRemoveMissingSelection();
  }, [sets]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
              LEGO Investing
            </p>
            <h1 className="text-3xl font-bold text-slate-50">
              LEGO Set Ranking Dashboard
            </h1>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-md bg-accent text-slate-900 font-semibold hover:bg-cyan-300 transition shadow-card"
          >
            + Add Set
          </button>
        </header>

        <div className="bg-panel border border-border rounded-xl shadow-card p-4">
          <SearchBar query={query} onChange={setQuery} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_1.2fr] gap-5">
          <SetTable
            sets={filteredSets.map((set) => ({
              ...set,
              totalScore: computeMetrics(set).totalScore,
            }))}
            selectedId={selectedId}
            onSelect={setSelectedId}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          {selectedSet ? (
            <SetDetail set={selectedSet} onChange={handleUpdateSet} />
          ) : (
            <div className="bg-panel border border-border rounded-xl shadow-card p-5 flex items-center justify-center text-slate-400">
              Select or add a set to view details.
            </div>
          )}
        </div>
      </div>

      <AddSetModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddSet}
        existingIds={sets.map((set) => set.setId)}
      />
    </div>
  );
}

export default App;
