import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import SearchBar from './components/SearchBar';
import SetTable from './components/SetTable';
import SetDetail from './components/SetDetail';
import AddSetModal from './components/AddSetModal';
import ConfirmModal from './components/ConfirmModal';
import ImportSummaryModal from './components/ImportSummaryModal';
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
  name: set.name || '',
  theme: set.theme || '',
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
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [importSummary, setImportSummary] = useState(null);
  const fileInputRef = useRef(null);

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

  const handleDeleteSet = (setId) => {
    if (!setId) return;

    if (selectedId === setId) {
      const visibleIds = filteredSets.map((s) => s.setId);
      const idx = visibleIds.indexOf(setId);
      const nextId = visibleIds[idx + 1] ?? visibleIds[idx - 1] ?? null;
      setSelectedId(nextId || null);
    }

    setSets((prev) => prev.filter((item) => item.setId !== setId));
    setDeleteTarget(null);
  };

  const handleRemoveMissingSelection = () => {
    if (selectedId && !sets.find((s) => s.setId === selectedId)) {
      setSelectedId(sets[0]?.setId || null);
    }
  };

  useEffect(() => {
    handleRemoveMissingSelection();
  }, [sets]);

  const handleImportClick = () => fileInputRef.current?.click();

  const extractSetId = (row) => {
    if (!row || typeof row !== 'object') return null;
    const candidates = ['setid', 'set_id', 'set', 'set #', 'set#', 'set number', 'set_number'];
    for (const [key, value] of Object.entries(row)) {
      const normalizedKey = key?.toString().trim().toLowerCase();
      if (candidates.includes(normalizedKey)) {
        if (value === null || value === undefined) return null;
        let raw = value;
        if (typeof raw === 'number') raw = raw.toString();
        raw = String(raw).trim();
        if (!raw) return null;
        if (/^\d+$/.test(raw)) {
          return `${raw}-1`;
        }
        return raw;
      }
    }
    return null;
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheet = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheet];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      const existingIds = new Set(sets.map((s) => s.setId));
      const added = [];
      let duplicates = 0;
      let invalid = 0;

      rows.forEach((row) => {
        const setId = extractSetId(row);
        if (!setId) {
          invalid += 1;
          return;
        }
        const normalizedId = setId.trim();
        const isValidPattern = /^\d{4,7}-\d+$/.test(normalizedId);
        if (!isValidPattern) {
          invalid += 1;
          return;
        }
        if (existingIds.has(normalizedId)) {
          duplicates += 1;
          return;
        }

        existingIds.add(normalizedId);
        const newSet = normalizeSet({
          setId: normalizedId,
          name: '',
          theme: '',
          year: null,
          purchasePrice: 0,
          currentPrice: 0,
          rankA: 0,
          rankB: 0,
          rankC: 0,
          rankD: 0,
          notes: '',
          tags: [],
        });
        added.push(newSet);
      });

      if (added.length) {
        setSets((prev) => [...added, ...prev]);
        if (!selectedId) {
          setSelectedId(added[0].setId);
        }
      }

      setImportSummary({
        imported: added.length,
        duplicates,
        invalid,
      });
    } catch (error) {
      setImportSummary({
        imported: 0,
        duplicates: 0,
        invalid: 0,
        error: 'Failed to import file. Please check the format.',
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const detailContent = selectedSet ? (
    <SetDetail
      set={selectedSet}
      onChange={handleUpdateSet}
      onDelete={() => setDeleteTarget(selectedSet)}
    />
  ) : (
    <div className="bg-panel border border-border rounded-xl shadow-card p-5 flex items-center justify-center text-slate-400">
      Select or add a set to view details.
    </div>
  );

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
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleImportClick}
              className="px-4 py-2 rounded-md border border-border text-slate-100 hover:bg-slate-800 transition shadow-card"
            >
              Import XLSX
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-md bg-accent text-slate-900 font-semibold hover:bg-cyan-300 transition shadow-card"
            >
              + Add Set
            </button>
          </div>
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
            onDelete={(set) => setDeleteTarget(set)}
          />

          {detailContent}
        </div>
      </div>

      <AddSetModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddSet}
        existingIds={sets.map((set) => set.setId)}
      />

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete this set?"
        message="This cannot be undone."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => handleDeleteSet(deleteTarget?.setId)}
      />

      <ImportSummaryModal
        open={!!importSummary}
        summary={importSummary}
        onClose={() => setImportSummary(null)}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

export default App;
