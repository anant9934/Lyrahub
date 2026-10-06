'use client';

import React from 'react';
import { Search, CheckCircle, X } from 'lucide-react';

interface GroupFiltersState {
  group_type: string;
  category: string;
  is_official: boolean;
  search: string;
}

interface GroupFiltersProps {
  filters: GroupFiltersState;
  onChange: (filters: GroupFiltersState) => void;
  onReset: () => void;
}

export const GroupFilters: React.FC<GroupFiltersProps> = ({
  filters,
  onChange,
  onReset
}) => {
  const hasActive = Boolean(
    filters.group_type || filters.category || filters.is_official || filters.search
  );

  return (
    <div className="bg-white p-4 rounded-xl border border-[#DCE5F1] space-y-3">
      <div className="flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#667A93] absolute left-3 top-3" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Search clubs, interest groups, societies by name or keyword..."
            className="w-full pl-9 pr-4 py-2 border border-[#DCE5F1] rounded-lg text-sm bg-white focus:outline-none focus:border-[#94B0B8]"
          />
        </div>

        {/* Category Select */}
        <select
          value={filters.category}
          onChange={(e) => onChange({ ...filters, category: e.target.value })}
          className="w-full md:w-44 py-2 px-3 border border-[#DCE5F1] rounded-lg text-xs bg-white text-[#0F172A] focus:outline-none focus:border-[#94B0B8]"
        >
          <option value="">All Categories</option>
          <option value="technical">Technical</option>
          <option value="cultural">Cultural</option>
          <option value="sports">Sports</option>
          <option value="social">Social</option>
          <option value="professional">Professional</option>
        </select>

        {/* Group Type Select */}
        <select
          value={filters.group_type}
          onChange={(e) => onChange({ ...filters, group_type: e.target.value })}
          className="w-full md:w-40 py-2 px-3 border border-[#DCE5F1] rounded-lg text-xs bg-white text-[#0F172A] focus:outline-none focus:border-[#94B0B8]"
        >
          <option value="">All Types</option>
          <option value="club">Clubs</option>
          <option value="society">Societies</option>
          <option value="interest_group">Interest Groups</option>
          <option value="chapter">Chapters</option>
        </select>

        {/* Official Only Toggle */}
        <button
          type="button"
          onClick={() => onChange({ ...filters, is_official: !filters.is_official })}
          className={`w-full md:w-auto flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors ${
            filters.is_official
              ? 'bg-[#EEF3EE] text-[#7A9A7E] border-[#7A9A7E]'
              : 'bg-[#F6F8FC] text-[#526783] border-[#DCE5F1] hover:bg-white'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" /> Official Only
        </button>

        {hasActive && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-[#B85C5C] hover:text-[#0F172A] px-2 py-1.5 transition-colors self-end md:self-center"
          >
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>
    </div>
  );
};
