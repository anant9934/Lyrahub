"use client";

import React, { useState } from "react";

interface MemberAutocompleteProps {
  onAddMember: (studentId: string, role: string) => void;
}

export function MemberAutocomplete({ onAddMember }: MemberAutocompleteProps) {
  const [studentId, setStudentId] = useState("");
  const [role, setRole] = useState("contributor");

  const handleAdd = () => {
    if (!studentId.trim()) return;
    onAddMember(studentId.trim(), role);
    setStudentId("");
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Student ID or Reg No..."
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
        className="flex-1 px-3 py-2 text-sm bg-[#F2F2F1] border border-[#D6D6D6] rounded-lg focus:outline-none"
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="px-3 py-2 text-sm bg-[#F2F2F1] border border-[#D6D6D6] rounded-lg focus:outline-none"
      >
        <option value="contributor">Contributor</option>
        <option value="lead">Lead</option>
        <option value="advisor">Advisor</option>
      </select>
      <button
        type="button"
        onClick={handleAdd}
        className="px-3 py-2 text-xs font-semibold bg-[#1E1E1E] text-white rounded-lg hover:bg-gray-800"
      >
        Add
      </button>
    </div>
  );
}
