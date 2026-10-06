"use client";

import React from "react";

interface AlumniFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  year: string;
  onYearChange: (val: string) => void;
  company: string;
  onCompanyChange: (val: string) => void;
  mentorshipOnly: boolean;
  onMentorshipChange: (val: boolean) => void;
}

export function AlumniFilters({
  search,
  onSearchChange,
  year,
  onYearChange,
  company,
  onCompanyChange,
  mentorshipOnly,
  onMentorshipChange,
}: AlumniFiltersProps) {
  return (
    <div className="bg-white border border-[#DCE5F1] rounded-xl p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-3 items-center">
      <div className="relative flex-1 w-full">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name, company, role, or keywords..."
          className="w-full px-3.5 py-2 text-sm text-[#0F172A] bg-[#F6F8FC] border border-[#DCE5F1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0F172A]"
        />
      </div>
      <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
        <select
          value={year}
          onChange={(e) => onYearChange(e.target.value)}
          className="px-3 py-2 text-sm text-[#0F172A] bg-white border border-[#DCE5F1] rounded-lg focus:outline-none"
        >
          <option value="">All Batches</option>
          <option value="2026">2026</option>
          <option value="2025">2025</option>
          <option value="2024">2024</option>
          <option value="2023">2023</option>
          <option value="2022">2022</option>
        </select>
        <input
          type="text"
          value={company}
          onChange={(e) => onCompanyChange(e.target.value)}
          placeholder="Company..."
          className="px-3 py-2 text-sm text-[#0F172A] bg-white border border-[#DCE5F1] rounded-lg focus:outline-none w-32"
        />
        <label className="flex items-center gap-2 text-xs font-semibold text-[#0F172A] cursor-pointer ml-1 select-none">
          <input
            type="checkbox"
            checked={mentorshipOnly}
            onChange={(e) => onMentorshipChange(e.target.checked)}
            className="rounded border-[#DCE5F1] text-[#0F172A] focus:ring-0"
          />
          Mentors Only
        </label>
      </div>
    </div>
  );
}
