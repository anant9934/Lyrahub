import React from "react";

export function FilterBar({ filters, setFilters }: { filters: any, setFilters: any }) {
  return (
    <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white border border-[#D6D6D6] rounded-lg">
      <div className="flex flex-col">
        <label className="text-xs font-semibold text-gray-500 mb-1">Min CGPA</label>
        <input 
          type="number" 
          step="0.1"
          min="0"
          max="10"
          className="border border-[#D6D6D6] rounded px-3 py-1.5 text-sm"
          value={filters.cgpa_min || ""}
          onChange={(e) => setFilters({ ...filters, cgpa_min: e.target.value })}
          placeholder="e.g. 7.5"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-xs font-semibold text-gray-500 mb-1">Section</label>
        <input 
          type="text" 
          className="border border-[#D6D6D6] rounded px-3 py-1.5 text-sm"
          value={filters.section || ""}
          onChange={(e) => setFilters({ ...filters, section: e.target.value })}
          placeholder="e.g. A"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-xs font-semibold text-gray-500 mb-1">Placed</label>
        <select 
          className="border border-[#D6D6D6] rounded px-3 py-1.5 text-sm"
          value={filters.placed || ""}
          onChange={(e) => setFilters({ ...filters, placed: e.target.value })}
        >
          <option value="">All</option>
          <option value="placed">Yes</option>
          <option value="unplaced">No</option>
        </select>
      </div>
      <div className="flex items-end">
        <button 
          onClick={() => setFilters({})}
          className="px-4 py-1.5 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
