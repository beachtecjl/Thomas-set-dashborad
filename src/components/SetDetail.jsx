import React, { useMemo } from 'react';

const Field = ({ label, children }) => (
  <label className="flex flex-col gap-2">
    <span className="text-sm text-slate-300">{label}</span>
    {children}
  </label>
);

const rankLabels = {
  rankA: 'Rank A',
  rankB: 'Rank B',
  rankC: 'Rank C',
  rankD: 'Rank D',
};

const rankKeys = ['rankA', 'rankB', 'rankC', 'rankD'];

const SetDetail = ({ set, onChange, onDelete }) => {
  const metrics = useMemo(() => {
    const delta = set.currentPrice - set.purchasePrice;
    const roi =
      set.purchasePrice > 0 ? (delta / set.purchasePrice) * 100 : null;
    const totalScore = set.rankA + set.rankB + set.rankC + set.rankD;
    return { delta, roi, totalScore };
  }, [set]);

  const updateField = (field, value) => {
    onChange({ ...set, [field]: value });
  };

  const updateNumber = (field, value) => {
    const parsed = value === '' ? 0 : Number(value);
    updateField(field, parsed);
  };

  return (
    <div className="bg-panel border border-border rounded-xl shadow-card p-5 h-full flex flex-col gap-5">
      <div className="flex items-start gap-4 flex-wrap">
        <img
          src={`https://img.bricklink.com/ItemImage/SN/0/${set.setId}.png`}
          alt={set.name}
          className="w-40 h-40 object-contain rounded-lg border border-border bg-slate-900"
        />
        <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-50">{set.name || 'Untitled set'}</h2>
              <p className="text-slate-300">{set.setId}</p>
            </div>
            <button
              onClick={onDelete}
              className="px-3 py-1.5 rounded-md border border-rose-500 text-rose-200 hover:bg-rose-500/10 text-sm inline-flex items-center gap-2"
            >
              <span aria-hidden="true">🗑️</span>
              <span>Delete</span>
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            <a
              href={`https://www.bricklink.com/v2/catalog/catalogitem.page?S=${set.setId}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-accent text-slate-900 font-semibold hover:bg-cyan-300 transition"
            >
              Open on BrickLink
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Name">
          <input
            type="text"
            value={set.name}
            onChange={(e) => updateField('name', e.target.value)}
          />
        </Field>
        <Field label="Theme">
          <input
            type="text"
            value={set.theme || ''}
            onChange={(e) => updateField('theme', e.target.value)}
          />
        </Field>
        <Field label="Year">
          <input
            type="number"
            min="1950"
            max="2100"
            value={set.year ?? ''}
            onChange={(e) =>
              updateField('year', e.target.value === '' ? null : Number(e.target.value))
            }
          />
        </Field>
        <Field label="Purchase Price">
          <input
            type="number"
            min="0"
            step="0.01"
            value={set.purchasePrice}
            onChange={(e) => updateNumber('purchasePrice', e.target.value)}
          />
        </Field>
        <Field label="Current Price">
          <input
            type="number"
            min="0"
            step="0.01"
            value={set.currentPrice}
            onChange={(e) => updateNumber('currentPrice', e.target.value)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rankKeys.map((rankKey) => (
          <div
            key={rankKey}
            className="bg-slate-900/60 border border-border rounded-lg p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-200 font-medium">{rankLabels[rankKey]}</span>
              <span className="text-accent font-semibold">{set[rankKey]}</span>
            </div>
            <input
              type="range"
              min="-20"
              max="20"
              step="1"
              value={set[rankKey]}
              onChange={(e) => updateNumber(rankKey, e.target.value)}
              className="w-full"
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-slate-900/60 border border-border rounded-lg p-3">
          <p className="text-sm text-slate-400">Total Score</p>
          <p className="text-2xl font-bold text-slate-50">{metrics.totalScore}</p>
        </div>
        <div className="bg-slate-900/60 border border-border rounded-lg p-3">
          <p className="text-sm text-slate-400">Delta</p>
          <p
            className={`text-2xl font-bold ${
              metrics.delta >= 0 ? 'text-emerald-300' : 'text-rose-300'
            }`}
          >
            ${metrics.delta.toFixed(2)}
          </p>
        </div>
        <div className="bg-slate-900/60 border border-border rounded-lg p-3">
          <p className="text-sm text-slate-400">ROI %</p>
          <p className="text-2xl font-bold">
            {metrics.roi !== null ? `${metrics.roi.toFixed(1)}%` : '—'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Notes">
          <textarea
            rows="4"
            value={set.notes || ''}
            onChange={(e) => updateField('notes', e.target.value)}
            className="w-full resize-none"
          />
        </Field>
        <Field label="Tags (comma separated)">
          <input
            type="text"
            value={set.tags?.join(', ') || ''}
            onChange={(e) =>
              updateField(
                'tags',
                e.target.value
                  .split(',')
                  .map((tag) => tag.trim())
                  .filter(Boolean)
              )
            }
          />
        </Field>
      </div>
    </div>
  );
};

export default SetDetail;
