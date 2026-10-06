"use client";

import React from "react";

interface ProjectFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  domain: string;
  onDomainChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
}

export function ProjectFilters({
  search,
  onSearchChange,
  domain,
  onDomainChange,
  status,
  onStatusChange,
}: ProjectFiltersProps) {
  return (
    <div className="bg-white border border-[#DCE5F1] rounded-xl p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-3 items-center">
      <div className="relative flex-1 w-full">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search projects by title, keywords or summary..."
          className="w-full px-3.5 py-2 text-sm text-[#0F172A] bg-[#F6F8FC] border border-[#DCE5F1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0F172A]"
        />
      </div>
      <div className="flex gap-2 w-full md:w-auto">
        <select
          value={domain}
          onChange={(e) => onDomainChange(e.target.value)}
          className="px-3 py-2 text-sm text-[#0F172A] bg-white border border-[#DCE5F1] rounded-lg focus:outline-none"
        >
          <option value="">All Domains</option>
          <option value="cv">Computer Vision (CV)</option>
          <option value="nlp">Natural Language Processing (NLP)</option>
          <option value="llm">Large Language Models (LLM)</option>
          <option value="mlops">MLOps</option>
          <option value="robotics">Robotics</option>
        </select>
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-3 py-2 text-sm text-[#0F172A] bg-white border border-[#DCE5F1] rounded-lg focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="abandoned">Abandoned</option>
          <option value="archived">Archived</option>
        </select>
      </div>
    </div>
  );
}
