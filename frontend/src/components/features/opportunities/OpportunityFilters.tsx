'use client';

import React from 'react';
import { Search, Filter, X } from 'lucide-react';

interface OpportunityFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  opportunityType: string;
  onOpportunityTypeChange: (val: string) => void;
  mode: string;
  onModeChange: (val: string) => void;
  verifiedOnly: boolean;
  onVerifiedOnlyChange: (val: boolean) => void;
  onReset: () => void;
}

export const OpportunityFilters: React.FC<OpportunityFiltersProps> = ({
  search,
  onSearchChange,
  opportunityType,
  onOpportunityTypeChange,
  mode,
  onModeChange,
  verifiedOnly,
  onVerifiedOnlyChange,
  onReset
}) => {
  const hasActiveFilters = search || opportunityType !== 'all' || mode !== 'all' || verifiedOnly;

  return (
    <div className="bg-white rounded-2xl border border-[#DCE5F1] p-4 md:p-5 mb-8 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#667A93] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search company, title, keywords..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs md:text-sm rounded-xl border border-[#DCE5F1] focus:outline-none focus:border-[#0F172A] bg-[#F6F8FC]/40"
          />
        </div>

        {/* Opportunity Type */}
        <div>
          <select
            value={opportunityType}
            onChange={(e) => onOpportunityTypeChange(e.target.value)}
            className="w-full px-3 py-2 text-xs md:text-sm rounded-xl border border-[#DCE5F1] focus:outline-none focus:border-[#0F172A] bg-white text-[#0F172A]"
          >
            <option value="all">All Opportunities</option>
            <option value="internship">Internship</option>
            <option value="training">Training</option>
            <option value="workshop">Workshop</option>
            <option value="course">External Course</option>
            <option value="fellowship">Fellowship</option>
            <option value="scholarship">Scholarship</option>
          </select>
        </div>

        {/* Mode */}
        <div>
          <select
            value={mode}
            onChange={(e) => onModeChange(e.target.value)}
            className="w-full px-3 py-2 text-xs md:text-sm rounded-xl border border-[#DCE5F1] focus:outline-none focus:border-[#0F172A] bg-white text-[#0F172A]"
          >
            <option value="all">All Working Modes</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">On-site</option>
          </select>
        </div>

        {/* Verified checkbox & Reset */}
        <div className="flex items-center justify-between gap-2 px-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#0F172A]">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => onVerifiedOnlyChange(e.target.checked)}
              className="rounded border-[#DCE5F1] text-[#0F172A]"
            />
            <span>Verified only</span>
          </label>

          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="p-1.5 text-xs text-[#667A93] hover:text-[#0F172A] hover:bg-[#F6F8FC] rounded-lg transition-colors flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
