"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AlumniCard } from "@/components/features/alumni/AlumniCard";
import { AlumniFilters } from "@/components/features/alumni/AlumniFilters";

export default function AlumniDirectoryPage() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [year, setYear] = useState("");
  const [company, setCompany] = useState("");
  const [mentorshipOnly, setMentorshipOnly] = useState(false);
  const [userRole, setUserRole] = useState("student");

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "student";
    setUserRole(role);
    fetchAlumni();
  }, [year, company, mentorshipOnly]);

  const fetchAlumni = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (year) params.append("graduation_year", year);
      if (company) params.append("company", company);
      if (mentorshipOnly) params.append("open_to_mentorship", "true");
      if (search) params.append("search", search);

      const res = await fetch(`http://localhost:8000/api/v1/alumni?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setAlumni(data.items || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-[#F2F2F1] min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1E1E1E]">Alumni Directory</h1>
          <p className="text-sm text-[#5C5C5C] mt-1">
            Connect with department graduates in global AI research, big tech, and cutting-edge startups.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/alumni/mentors"
            className="px-4 py-2 text-sm font-semibold text-[#1E1E1E] bg-white border border-[#D6D6D6] rounded-xl hover:bg-gray-100 transition shadow-sm"
          >
            Mentors
          </Link>
          {["admin", "hod"].includes(userRole) && (
            <Link
              href="/alumni/verify"
              className="px-4 py-2 text-sm font-semibold text-[#1E1E1E] bg-[#EEBE1E]/20 border border-[#EEBE1E]/50 rounded-xl hover:bg-[#EEBE1E]/30 transition shadow-sm"
            >
              Verify Queue
            </Link>
          )}
          <Link
            href="/alumni/register"
            className="px-4 py-2 text-sm font-semibold text-white bg-[#1E1E1E] rounded-xl hover:bg-gray-800 transition shadow-sm"
          >
            Register as Alumni
          </Link>
        </div>
      </div>

      <AlumniFilters
        search={search}
        onSearchChange={setSearch}
        year={year}
        onYearChange={setYear}
        company={company}
        onCompanyChange={setCompany}
        mentorshipOnly={mentorshipOnly}
        onMentorshipChange={setMentorshipOnly}
      />

      {loading ? (
        <div className="text-center py-16 text-[#5C5C5C]">Loading alumni directory...</div>
      ) : alumni.length === 0 ? (
        <div className="p-12 text-center bg-white border border-[#D6D6D6] rounded-2xl shadow-sm">
          <h3 className="text-lg font-bold text-[#1E1E1E] mb-2">No alumni found</h3>
          <p className="text-sm text-[#5C5C5C] mb-6">
            Try adjusting your search criteria or register your alumni profile today.
          </p>
          <Link
            href="/alumni/register"
            className="px-5 py-2.5 bg-[#1E1E1E] text-white text-sm font-semibold rounded-xl hover:bg-gray-800"
          >
            Register Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {alumni.map((a: any) => (
            <AlumniCard key={a.id} alumni={a} />
          ))}
        </div>
      )}
    </div>
  );
}
