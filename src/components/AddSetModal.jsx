import React, { useEffect, useMemo, useState } from 'react';

const initialForm = {
  setId: '',
  name: '',
  theme: '',
  year: '',
};

const AddSetModal = ({ open, onClose, onAdd, existingIds }) => {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [imageStatus, setImageStatus] = useState('idle');

  const reset = () => {
    setForm(initialForm);
    setError('');
    setImageStatus('idle');
  };

  const trimmedSetId = form.setId.trim();
  const validSetId = /^\d{4,7}-\d+$/.test(trimmedSetId);
  const isDuplicate = existingIds.includes(trimmedSetId);
  const canSubmit = validSetId && !isDuplicate;
  const previewUrl = useMemo(
    () => (trimmedSetId ? `https://img.bricklink.com/ItemImage/SN/0/${trimmedSetId}.png` : ''),
    [trimmedSetId]
  );

  useEffect(() => {
    if (!trimmedSetId) {
      setImageStatus('idle');
      return;
    }
    setImageStatus('loading');
  }, [trimmedSetId]);

  useEffect(() => {
    setError('');
  }, [trimmedSetId, form.name, form.theme, form.year]);

  const handleAdd = (e) => {
    e.preventDefault();
    const setId = trimmedSetId;
    if (!validSetId) {
      setError('Set ID must match ####-# (4-7 digits, dash, digits).');
      return;
    }
    if (isDuplicate) {
      setError('This Set ID already exists.');
      return;
    }

    const cleanYear = form.year === '' ? null : Number(form.year);
    onAdd({
      setId,
      name: form.name.trim(),
      theme: form.theme.trim(),
      year: Number.isNaN(cleanYear) ? null : cleanYear,
    });
    reset();
  };

  const onCloseModal = () => {
    reset();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="bg-panel border border-border rounded-xl shadow-card p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-slate-50">Add New Set</h3>
          <button
            onClick={onCloseModal}
            className="text-slate-400 hover:text-slate-200"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex flex-col gap-2">
              <span className="text-sm text-slate-300">Set ID (required)</span>
              <input
                type="text"
                value={form.setId}
                onChange={(e) => setForm((f) => ({ ...f, setId: e.target.value }))}
                placeholder="75263-1"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm text-slate-300">Name (optional)</span>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Set name"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm text-slate-300">Theme (optional)</span>
              <input
                type="text"
                value={form.theme}
                onChange={(e) => setForm((f) => ({ ...f, theme: e.target.value }))}
                placeholder="Star Wars"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm text-slate-300">Year (optional)</span>
              <input
                type="number"
                min="1950"
                max="2100"
                value={form.year}
                onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                placeholder="2023"
              />
            </label>
          </div>
          <p className="text-sm text-slate-400">
            Only Set ID is required. Other fields are optional and can be edited later.
          </p>
          <div className="bg-slate-900/60 border border-border rounded-lg p-3 flex items-center gap-3">
            <div className="h-24 w-24 border border-border rounded-md bg-slate-900 flex items-center justify-center overflow-hidden">
              {trimmedSetId && previewUrl ? (
                <img
                  key={previewUrl}
                  src={previewUrl}
                  alt="Preview"
                  className="h-full w-full object-contain"
                  onLoad={() => setImageStatus('success')}
                  onError={() => setImageStatus('error')}
                />
              ) : (
                <div className="h-full w-full animate-pulse bg-slate-800" />
              )}
            </div>
            <div className="flex-1 text-sm text-slate-300">
              <p className="font-semibold text-slate-100 mb-1">Live BrickLink preview</p>
              {imageStatus === 'loading' && <p>Loading preview...</p>}
              {imageStatus === 'success' && <p>Image found for this Set ID.</p>}
              {imageStatus === 'error' && (
                <p className="text-rose-300">No image found (check Set ID).</p>
              )}
              {imageStatus === 'idle' && <p>Enter a Set ID to see its image.</p>}
            </div>
          </div>
          {error && <p className="text-rose-300 text-sm">{error}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCloseModal}
              className="px-4 py-2 rounded-md border border-border text-slate-200 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`px-4 py-2 rounded-md font-semibold ${
                canSubmit
                  ? 'bg-accent text-slate-900 hover:bg-cyan-300'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              Add Set
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSetModal;
