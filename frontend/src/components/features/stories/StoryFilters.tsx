'use client';

import React from 'react';
import { Search, Filter, X } from 'lucide-react';

interface FiltersState {
  story_type: string;
  batch_year: string;
  tag: string;
  search: string;
}

interface StoryFiltersProps {
  filters: FiltersState;
  onChange: (filters: FiltersState) => void;
  onReset: () => void;
}

export const StoryFilters: React.FC<StoryFiltersProps> = ({
  filters,
  onChange,
  onReset
}) => {
  const currentYear = new Date().getFullYear();
  const batchYears = Array.from({ length: 8 }, (_, i) => currentYear - i);

  const hasActiveFilters = Boolean(
    filters.story_type || filters.batch_year || filters.tag || filters.search
  );

  return (
    <div className="bg-white p-4 rounded-xl border border-[#D6D6D6] space-y-3">
      <div className="flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#7A7A7A] absolute left-3 top-3" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Search stories by title, student name, company, or keyword..."
            className="w-full pl-9 pr-4 py-2 border border-[#D6D6D6] rounded-lg text-sm bg-white focus:outline-none focus:border-[#94B0B8]"
          />
        </div>

        {/* Story Type */}
        <div className="flex items-center gap-1 bg-[#F2F2F1] p-1 rounded-lg border border-[#D6D6D6] w-full md:w-auto">
          <button
            type="button"
            onClick={() => onChange({ ...filters, story_type: '' })}
            className={`flex-1 md:flex-none px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filters.story_type === '' ? 'bg-white text-[#1E1E1E] shadow-sm font-semibold' : 'text-[#5C5C5C] hover:text-[#1E1E1E]'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...filters, story_type: 'student' })}
            className={`flex-1 md:flex-none px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filters.story_type === 'student' ? 'bg-white text-[#1E1E1E] shadow-sm font-semibold' : 'text-[#5C5C5C] hover:text-[#1E1E1E]'
            }`}
          >
            Students
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...filters, story_type: 'alumni' })}
            className={`flex-1 md:flex-none px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filters.story_type === 'alumni' ? 'bg-white text-[#1E1E1E] shadow-sm font-semibold' : 'text-[#5C5C5C] hover:text-[#1E1E1E]'
            }`}
          >
            Alumni
          </button>
        </div>

        {/* Batch Year Select */}
        <select
          value={filters.batch_year}
          onChange={(e) => onChange({ ...filters, batch_year: e.target.value })}
          className="w-full md:w-36 py-2 px-3 border border-[#D6D6D6] rounded-lg text-sm bg-white text-[#1E1E1E] focus:outline-none focus:border-[#94B0B8]"
        >
          <option value="">All Batches</option>
          {batchYears.map((yr) => (
            <option key={yr} value={yr}>
              Batch {yr}
            </option>
          ))}
        </select>

        {/* Reset button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-[#B85C5C] hover:text-[#1E1E1E] px-2 py-1.5 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>
    </div>
  );
};
