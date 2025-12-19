import React, { useState } from 'react';

const initialForm = {
  setId: '',
  name: '',
  theme: '',
  year: '',
};

const AddSetModal = ({ open, onClose, onAdd, existingIds }) => {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');

  const reset = () => {
    setForm(initialForm);
    setError('');
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const setId = form.setId.trim();
    const name = form.name.trim();
    if (!setId || !name) {
      setError('Set ID and Name are required.');
      return;
    }
    if (!setId.includes('-')) {
      setError('Set ID must contain a dash (e.g., 75263-1).');
      return;
    }
    if (existingIds.includes(setId)) {
      setError('This Set ID already exists.');
      return;
    }

    const cleanYear = form.year === '' ? null : Number(form.year);
    onAdd({
      setId,
      name,
      theme: form.theme.trim() || '',
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
              <span className="text-sm text-slate-300">Set ID</span>
              <input
                type="text"
                value={form.setId}
                onChange={(e) => setForm((f) => ({ ...f, setId: e.target.value }))}
                placeholder="75263-1"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm text-slate-300">Name</span>
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
              className="px-4 py-2 rounded-md bg-accent text-slate-900 font-semibold hover:bg-cyan-300"
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
