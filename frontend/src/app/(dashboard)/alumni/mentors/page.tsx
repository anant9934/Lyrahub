"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AlumniCard } from "@/components/features/alumni/AlumniCard";

export default function AlumniMentorsPage() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/alumni/mentors", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setMentors(data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-[#F6F8FC] min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/alumni" className="text-xs font-semibold text-[#526783] hover:text-[#0F172A]">
              ← All Alumni
            </Link>
          </div>
          <h1 className="text-3xl font-extrabold text-[#0F172A]">Alumni Mentorship Network</h1>
          <p className="text-sm text-[#526783] mt-1">
            Verified department graduates actively offering 1:1 guidance, resume reviews, and career counseling.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-[#526783]">Loading mentors network...</div>
      ) : mentors.length === 0 ? (
        <div className="p-12 text-center bg-white border border-[#DCE5F1] rounded-2xl shadow-sm">
          <p className="text-sm text-[#526783]">No verified mentors available right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mentors.map((m: any) => (
            <AlumniCard key={m.id} alumni={m} />
          ))}
        </div>
      )}
    </div>
  );
}
