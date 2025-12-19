import React from 'react';

const SearchBar = ({ query, onChange }) => {
  return (
    <div className="mb-4 flex flex-col gap-2">
      <label className="text-sm text-slate-300">Search by ID, Name, or Theme</label>
      <input
        type="text"
        value={query}
        placeholder="e.g., 75263-1 or Star Wars"
        onChange={(e) => onChange(e.target.value)}
        className="w-full"
      />
    </div>
  );
};

export default SearchBar;
