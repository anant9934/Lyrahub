'use client';

import React from 'react';
import { Search, Filter, X } from 'lucide-react';

interface CourseFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  semester: string;
  onSemesterChange: (val: string) => void;
  courseType: string;
  onCourseTypeChange: (val: string) => void;
  category: string;
  onCategoryChange: (val: string) => void;
  onReset: () => void;
}

export const CourseFilters: React.FC<CourseFiltersProps> = ({
  search,
  onSearchChange,
  semester,
  onSemesterChange,
  courseType,
  onCourseTypeChange,
  category,
  onCategoryChange,
  onReset,
}) => {
  const hasActiveFilters = search || semester !== 'all' || courseType !== 'all' || category !== 'all';

  return (
    <div className="bg-white rounded-2xl border border-[#DCE5F1] p-4 md:p-5 mb-8 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#667A93] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by code, title, topic..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs md:text-sm rounded-xl border border-[#DCE5F1] focus:outline-none focus:border-[#0F172A] bg-[#F6F8FC]/40"
          />
        </div>

        {/* Semester */}
        <div>
          <select
            value={semester}
            onChange={(e) => onSemesterChange(e.target.value)}
            className="w-full px-3 py-2 text-xs md:text-sm rounded-xl border border-[#DCE5F1] focus:outline-none focus:border-[#0F172A] bg-white text-[#0F172A]"
          >
            <option value="all">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
              <option key={s} value={String(s)}>Semester {s}</option>
            ))}
          </select>
        </div>

        {/* Course Type */}
        <div>
          <select
            value={courseType}
            onChange={(e) => onCourseTypeChange(e.target.value)}
            className="w-full px-3 py-2 text-xs md:text-sm rounded-xl border border-[#DCE5F1] focus:outline-none focus:border-[#0F172A] bg-white text-[#0F172A]"
          >
            <option value="all">All Course Types</option>
            <option value="core">Core</option>
            <option value="elective">Elective</option>
            <option value="lab">Lab / Practical</option>
            <option value="project">Project</option>
            <option value="seminar">Seminar</option>
          </select>
        </div>

        {/* Category */}
        <div className="flex items-center gap-2">
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2 text-xs md:text-sm rounded-xl border border-[#DCE5F1] focus:outline-none focus:border-[#0F172A] bg-white text-[#0F172A]"
          >
            <option value="all">All Categories</option>
            <option value="theory">Theory</option>
            <option value="practical">Practical</option>
            <option value="humanities">Humanities</option>
            <option value="minor">Engineering Minor</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={onReset}
              title="Reset Filters"
              className="p-2 rounded-xl text-[#667A93] hover:bg-[#F6F8FC] hover:text-[#0F172A] transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
