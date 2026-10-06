"use client";

import React, { useState, useEffect } from "react";

interface Mentor {
  id: string;
  name: string;
  email: string;
}

interface MentorAutocompleteProps {
  value?: string;
  onChange: (mentorId: string) => void;
  required?: boolean;
}

export function MentorAutocomplete({ value, onChange, required = false }: MentorAutocompleteProps) {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Default list with known faculty/admin mentors
    setMentors([
      { id: "462c1cf2-570a-4dae-862d-0b73b5da395a", name: "Faculty Coordinator", email: "admin@aiml.hub" },
      { id: "e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1", name: "Prof. Ananya Sen (NLP)", email: "hod@aiml.hub" },
    ]);
  }, []);

  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-[#0F172A]">
        Faculty Mentor {required && <span className="text-[#B85C5C]">*</span>}
      </label>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-2 text-sm text-[#0F172A] bg-[#F6F8FC] border border-[#DCE5F1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0F172A]"
        required={required}
      >
        <option value="">Select a Faculty Mentor...</option>
        {mentors.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name} ({m.email})
          </option>
        ))}
      </select>
    </div>
  );
}
