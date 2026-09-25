"use client";

import React from "react";
import Link from "next/link";
import { MentorshipBadge } from "./MentorshipBadge";

interface AlumniCardProps {
  alumni: {
    id: string;
    full_name: string;
    graduation_year: number;
    program?: string;
    current_company?: string;
    current_role?: string;
    location?: string;
    open_to_mentorship?: boolean;
    linkedin_url?: string;
  };
}

export function AlumniCard({ alumni }: AlumniCardProps) {
  return (
    <div className="bg-white border border-[#D6D6D6] rounded-xl p-5 hover:shadow-md transition duration-200 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-[#1E1E1E] text-white flex items-center justify-center font-bold text-sm tracking-wider">
            {alumni.full_name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase() || "AL"}
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F2F2F1] text-[#1E1E1E] border border-[#D6D6D6]">
            Class of '{String(alumni.graduation_year).slice(-2)}
          </span>
        </div>

        <h3 className="text-base font-bold text-[#1E1E1E] line-clamp-1">{alumni.full_name}</h3>
        <p className="text-xs font-medium text-[#1E1E1E] line-clamp-1 mt-0.5">
          {alumni.current_role ? `${alumni.current_role}` : "Alumnus"}
          {alumni.current_company ? ` at ${alumni.current_company}` : ""}
        </p>

        <p className="text-xs text-[#5C5C5C] line-clamp-1 mt-1">
          {alumni.program || "AI & ML"} {alumni.location ? `• ${alumni.location}` : ""}
        </p>

        {alumni.open_to_mentorship && (
          <div className="mt-3">
            <MentorshipBadge isOpen={true} />
          </div>
        )}
      </div>

      <div className="mt-5 pt-3 border-t border-[#D6D6D6]/60 flex items-center justify-between">
        {alumni.linkedin_url ? (
          <a
            href={alumni.linkedin_url}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-medium text-[#6B8FA3] hover:underline"
          >
            LinkedIn ↗
          </a>
        ) : (
          <span className="text-xs text-[#9A9A9A]">AI/ML Alumni</span>
        )}
        <Link
          href={`/alumni/${alumni.id}`}
          className="text-xs font-semibold px-3 py-1.5 bg-[#1E1E1E] text-white rounded-lg hover:bg-gray-800 transition"
        >
          Profile →
        </Link>
      </div>
    </div>
  );
}
