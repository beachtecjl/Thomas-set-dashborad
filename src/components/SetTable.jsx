import React from 'react';

const sortLabels = {
  score: 'Total Score (desc)',
  currentPrice: 'Current Price (desc)',
  roi: 'ROI % (desc)',
};

const formatCurrency = (value) =>
  typeof value === 'number' ? `$${value.toFixed(2)}` : '—';

const formatRoi = (value) =>
  typeof value === 'number' && Number.isFinite(value)
    ? `${value.toFixed(1)}%`
    : '—';

const SetTable = ({ sets, selectedId, onSelect, sortBy, onSortChange, onDelete }) => {
  return (
    <div className="bg-panel border border-border rounded-xl shadow-card p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-slate-50">Set List</h2>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-300">Sort by</span>
          <select value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
            {Object.entries(sortLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="overflow-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-900/80 text-slate-300">
            <tr>
              <th className="px-3 py-2 font-semibold">Image</th>
              <th className="px-3 py-2 font-semibold">Set ID</th>
              <th className="px-3 py-2 font-semibold">Name</th>
              <th className="px-3 py-2 font-semibold text-center">Total Score</th>
              <th className="px-3 py-2 font-semibold text-center">Current Price</th>
              <th className="px-3 py-2 font-semibold text-center">Purchase Price</th>
              <th className="px-3 py-2 font-semibold text-center">Delta</th>
              <th className="px-3 py-2 font-semibold text-center">ROI %</th>
              <th className="px-3 py-2 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sets.map((set) => {
              const imageUrl = `https://img.bricklink.com/ItemImage/SN/0/${set.setId}.png`;
              const delta = set.currentPrice - set.purchasePrice;
              const roi =
                set.purchasePrice > 0
                  ? ((delta / set.purchasePrice) * 100)
                  : null;
              const totalScore = set.rankA + set.rankB + set.rankC + set.rankD;

              return (
                <tr
                  key={set.setId}
                  onClick={() => onSelect(set.setId)}
                  className={`cursor-pointer border-b border-border/60 hover:bg-slate-800/70 ${
                    selectedId === set.setId ? 'bg-slate-800/60' : ''
                  }`}
                >
                  <td className="px-3 py-2">
                    <a
                      href={`https://www.bricklink.com/v2/catalog/catalogitem.page?S=${set.setId}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        src={imageUrl}
                        alt={set.name}
                        className="h-14 w-14 object-contain rounded-md border border-border bg-slate-900"
                        loading="lazy"
                      />
                    </a>
                  </td>
                  <td className="px-3 py-2 font-semibold text-slate-100">{set.setId}</td>
                  <td className="px-3 py-2">{set.name}</td>
                  <td className="px-3 py-2 text-center text-slate-50 font-semibold">
                    {totalScore}
                  </td>
                  <td className="px-3 py-2 text-center">{formatCurrency(set.currentPrice)}</td>
                  <td className="px-3 py-2 text-center">{formatCurrency(set.purchasePrice)}</td>
                  <td className={`px-3 py-2 text-center ${delta >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {formatCurrency(delta)}
                  </td>
                  <td className="px-3 py-2 text-center">{formatRoi(roi)}</td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(set);
                      }}
                      className="text-rose-300 hover:text-rose-200 text-sm underline-offset-2 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SetTable;
