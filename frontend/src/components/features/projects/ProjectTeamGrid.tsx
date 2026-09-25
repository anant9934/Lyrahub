"use client";

import React, { useState } from "react";

interface Member {
  id: string;
  student_id: string;
  role: string;
  joined_at?: string;
  student_reg_no?: string;
}

interface ProjectTeamGridProps {
  members: Member[];
  projectId: string;
  canManage: boolean;
  onMemberAdded?: () => void;
  onMemberRemoved?: (studentId: string) => void;
}

export function ProjectTeamGrid({
  members,
  projectId,
  canManage,
  onMemberAdded,
  onMemberRemoved,
}: ProjectTeamGridProps) {
  const [studentId, setStudentId] = useState("");
  const [role, setRole] = useState("contributor");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim()) return;
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch(`http://localhost:8000/api/v1/projects/${projectId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({ student_id: studentId.trim(), role }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to add member");
      }

      setStudentId("");
      if (onMemberAdded) onMemberAdded();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleColors: Record<string, string> = {
    lead: "bg-[#EEBE1E]/20 text-[#855B00]",
    advisor: "bg-[#94B0B8]/20 text-[#2C4A52]",
    contributor: "bg-gray-100 text-[#1E1E1E]",
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {members.map((m) => (
          <div
            key={m.id}
            className="p-4 bg-white border border-[#D6D6D6] rounded-xl flex items-center justify-between shadow-sm"
          >
            <div>
              <div className="text-sm font-bold text-[#1E1E1E]">
                {m.student_reg_no ? `Reg No: ${m.student_reg_no}` : "Student"}
              </div>
              <span
                className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full inline-block mt-1 ${
                  roleColors[m.role?.toLowerCase() || ""] || "bg-gray-100 text-gray-700"
                }`}
              >
                {m.role || "Contributor"}
              </span>
            </div>
            {canManage && m.role !== "lead" && onMemberRemoved && (
              <button
                onClick={() => onMemberRemoved(m.student_id)}
                className="text-xs text-[#B85C5C] hover:underline"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      {canManage && (
        <form onSubmit={handleAdd} className="p-5 bg-[#F2F2F1] border border-[#D6D6D6] rounded-xl space-y-3">
          <h4 className="text-sm font-bold text-[#1E1E1E]">Add Team Member</h4>
          {error && <div className="text-xs text-[#B85C5C]">{error}</div>}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Student UUID..."
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="flex-1 px-3 py-2 text-sm bg-white border border-[#D6D6D6] rounded-lg focus:outline-none"
              required
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="px-3 py-2 text-sm bg-white border border-[#D6D6D6] rounded-lg focus:outline-none"
            >
              <option value="contributor">Contributor</option>
              <option value="lead">Lead</option>
              <option value="advisor">Advisor</option>
            </select>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#1E1E1E] text-white text-sm font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {isSubmitting ? "Adding..." : "Add Member"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
