"use client";

import React, { useState } from "react";

interface Experience {
  id: string;
  company: string;
  role: string;
  start_date: string;
  end_date?: string;
  description?: string;
}

interface ExperienceTimelineProps {
  experiences: Experience[];
  isOwner?: boolean;
  onAddExperience?: (data: any) => Promise<void>;
  onDeleteExperience?: (id: string) => Promise<void>;
}

export function ExperienceTimeline({
  experiences,
  isOwner = false,
  onAddExperience,
  onDeleteExperience,
}: ExperienceTimelineProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddExperience) return;
    setIsSubmitting(true);
    try {
      await onAddExperience({
        company,
        role,
        start_date: startDate,
        end_date: endDate || undefined,
        description: description || undefined,
      });
      setCompany("");
      setRole("");
      setStartDate("");
      setEndDate("");
      setDescription("");
      setShowAdd(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-bold text-[#0F172A]">Career & Experience Timeline</h3>
        {isOwner && !showAdd && (
          <button
            onClick={() => setShowAdd(true)}
            className="px-3 py-1.5 text-xs font-semibold bg-[#0F172A] text-white rounded-lg hover:bg-gray-800"
          >
            + Add Position
          </button>
        )}
      </div>

      {showAdd && isOwner && (
        <form onSubmit={handleSubmit} className="p-5 bg-[#F6F8FC] border border-[#DCE5F1] rounded-xl space-y-4">
          <h4 className="text-xs font-bold uppercase text-[#0F172A]">New Career Entry</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Company name"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="px-3 py-2 text-sm bg-white border border-[#DCE5F1] rounded-lg focus:outline-none"
              required
            />
            <input
              type="text"
              placeholder="Role / Title"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="px-3 py-2 text-sm bg-white border border-[#DCE5F1] rounded-lg focus:outline-none"
              required
            />
            <div>
              <label className="block text-[11px] text-[#526783] mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#DCE5F1] rounded-lg focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#526783] mb-1">End Date (leave blank if current)</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#DCE5F1] rounded-lg focus:outline-none"
              />
            </div>
          </div>
          <textarea
            placeholder="Impact, technologies used, achievements..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 text-sm bg-white border border-[#DCE5F1] rounded-lg focus:outline-none"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-3 py-1.5 text-xs text-[#526783] hover:bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs font-semibold bg-[#0F172A] text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Entry"}
            </button>
          </div>
        </form>
      )}

      {experiences.length === 0 ? (
        <div className="p-6 text-center text-xs text-[#526783] bg-[#F6F8FC] rounded-xl border border-[#DCE5F1]">
          No professional experiences recorded yet.
        </div>
      ) : (
        <div className="relative pl-6 border-l-2 border-[#DCE5F1] space-y-6">
          {experiences.map((exp) => (
            <div key={exp.id} className="relative group">
              <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-[#0F172A] border-2 border-white"></div>
              <div className="bg-white border border-[#DCE5F1] rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-[#0F172A]">{exp.role}</h4>
                    <p className="text-xs font-semibold text-[#526783]">{exp.company}</p>
                    <span className="text-[11px] text-[#71849B]">
                      {exp.start_date} — {exp.end_date || "Present"}
                    </span>
                  </div>
                  {isOwner && onDeleteExperience && (
                    <button
                      onClick={() => onDeleteExperience(exp.id)}
                      className="text-xs text-[#B85C5C] opacity-0 group-hover:opacity-100 transition hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </div>
                {exp.description && (
                  <p className="text-xs text-[#526783] mt-2 whitespace-pre-wrap">{exp.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
