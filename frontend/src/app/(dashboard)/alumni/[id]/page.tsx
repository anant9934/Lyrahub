"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ExperienceTimeline } from "@/components/features/alumni/ExperienceTimeline";
import { MentorshipBadge } from "@/components/features/alumni/MentorshipBadge";

export default function AlumniProfilePage() {
  const params = useParams();
  const id = params?.id as string;

  const [alumni, setAlumni] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlumniDetail();
  }, [id]);

  const fetchAlumniDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/alumni/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setAlumni(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-[#5C5C5C]">Loading alumni profile...</div>;
  }

  if (!alumni) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-[#1E1E1E]">Profile not found</h2>
        <Link href="/alumni" className="mt-4 inline-block text-sm font-semibold text-[#1E1E1E] underline">
          Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 bg-[#F2F2F1] min-h-screen">
      <Link href="/alumni" className="text-xs font-semibold text-[#5C5C5C] hover:text-[#1E1E1E]">
        ← Back to Alumni Directory
      </Link>

      <div className="bg-white border border-[#D6D6D6] rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#1E1E1E] text-white flex items-center justify-center font-bold text-xl tracking-wider shadow-sm">
              {alumni.full_name
                ?.split(" ")
                .map((n: string) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() || "AL"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-[#1E1E1E]">{alumni.full_name}</h1>
                {alumni.is_verified && (
                  <span className="text-xs text-[#7A9A7E] bg-[#EEF3EE] px-2 py-0.5 rounded-full font-bold">
                    ✓ Verified
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-[#1E1E1E] mt-0.5">
                {alumni.current_role ? `${alumni.current_role}` : "Alumnus"}
                {alumni.current_company ? ` at ${alumni.current_company}` : ""}
              </p>
              <p className="text-xs text-[#5C5C5C] mt-0.5">
                {alumni.program} • Class of {alumni.graduation_year}
                {alumni.location ? ` • ${alumni.location}` : ""}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2">
            <MentorshipBadge isOpen={alumni.open_to_mentorship} />
            {alumni.open_to_hiring && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EEF3EE] text-[#7A9A7E] border border-[#7A9A7E]/30">
                Hiring
              </span>
            )}
          </div>
        </div>

        {alumni.bio && (
          <div className="pt-4 border-t border-[#D6D6D6]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E1E1E] mb-2">About</h3>
            <p className="text-sm text-[#5C5C5C] leading-relaxed whitespace-pre-wrap">{alumni.bio}</p>
          </div>
        )}

        {/* Contact links if public */}
        {alumni.privacy_level === "public" && (
          <div className="pt-4 border-t border-[#D6D6D6] flex flex-wrap gap-4">
            {alumni.linkedin_url && (
              <a
                href={alumni.linkedin_url}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 bg-[#F2F2F1] rounded-lg text-xs font-semibold text-[#1E1E1E] hover:bg-gray-200 transition"
              >
                LinkedIn ↗
              </a>
            )}
            {alumni.github_url && (
              <a
                href={alumni.github_url}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 bg-[#F2F2F1] rounded-lg text-xs font-semibold text-[#1E1E1E] hover:bg-gray-200 transition"
              >
                GitHub ↗
              </a>
            )}
            {alumni.portfolio_url && (
              <a
                href={alumni.portfolio_url}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 bg-[#F2F2F1] rounded-lg text-xs font-semibold text-[#1E1E1E] hover:bg-gray-200 transition"
              >
                Portfolio ↗
              </a>
            )}
            {alumni.email && (
              <a
                href={`mailto:${alumni.email}`}
                className="px-3.5 py-1.5 bg-[#1E1E1E] text-white rounded-lg text-xs font-semibold hover:bg-gray-800 transition"
              >
                Contact via Email
              </a>
            )}
          </div>
        )}
      </div>

      {/* Experience Section */}
      <div className="bg-white border border-[#D6D6D6] rounded-2xl p-6 md:p-8 shadow-sm">
        <ExperienceTimeline experiences={alumni.experiences || []} isOwner={false} />
      </div>
    </div>
  );
}
