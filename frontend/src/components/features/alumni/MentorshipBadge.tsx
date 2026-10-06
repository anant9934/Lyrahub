"use client";

import React from "react";

export function MentorshipBadge({ isOpen }: { isOpen: boolean }) {
  if (!isOpen) return null;
  return (
    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-[#FACC15]/20 text-[#855B00] border border-[#FACC15]/40 inline-flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-[#FACC15]"></span>
      Open to Mentorship
    </span>
  );
}
