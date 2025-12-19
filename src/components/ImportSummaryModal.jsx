import React from 'react';

const ImportSummaryModal = ({ open, summary, onClose }) => {
  if (!open || !summary) return null;

  const { imported = 0, duplicates = 0, invalid = 0, error } = summary;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="bg-panel border border-border rounded-xl shadow-card p-6 w-full max-w-md space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-50">Import summary</h3>
            <p className="text-slate-300 mt-1">
              Imported sets from the uploaded spreadsheet.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200"
          >
            ✕
          </button>
        </div>

        {error ? (
          <p className="text-rose-300 text-sm">{error}</p>
        ) : (
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-900/60 border border-border rounded-lg p-3">
              <p className="text-sm text-slate-400">Imported</p>
              <p className="text-xl font-bold text-emerald-300">{imported}</p>
            </div>
            <div className="bg-slate-900/60 border border-border rounded-lg p-3">
              <p className="text-sm text-slate-400">Duplicates</p>
              <p className="text-xl font-bold text-slate-100">{duplicates}</p>
            </div>
            <div className="bg-slate-900/60 border border-border rounded-lg p-3">
              <p className="text-sm text-slate-400">Invalid</p>
              <p className="text-xl font-bold text-rose-300">{invalid}</p>
            </div>
          </div>
        )}

        {!error && (
          <p className="text-sm text-slate-300">
            Imported {imported} sets. Skipped {duplicates} duplicates. {invalid} invalid rows.
          </p>
        )}

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-accent text-slate-900 font-semibold hover:bg-cyan-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportSummaryModal;
