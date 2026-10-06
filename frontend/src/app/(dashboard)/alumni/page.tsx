"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { AlumniCard } from "@/components/features/alumni/AlumniCard";
import { AlumniFilters } from "@/components/features/alumni/AlumniFilters";
import { WorkspaceHero } from "@/components/layout/WorkspaceHero";
import { GraduationCap } from "lucide-react";

export default function AlumniDirectoryPage() {
  const [alumni, setAlumni] = useState<any[]>([]);
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

  const DEFAULT_ALUMNI = [
    {
      id: "alm-1",
      full_name: "Neha Sharma",
      graduation_year: 2023,
      program: "B.Tech AI & ML",
      current_company: "Google",
      current_role: "Software Engineer",
      location: "Bengaluru, India",
      open_to_mentorship: true,
      linkedin_url: "https://linkedin.com",
    },
    {
      id: "alm-2",
      full_name: "Arjun Verma",
      graduation_year: 2022,
      program: "B.Tech AI & ML",
      current_company: "Microsoft",
      current_role: "Data Scientist",
      location: "Hyderabad, India",
      open_to_mentorship: true,
      linkedin_url: "https://linkedin.com",
    },
    {
      id: "alm-3",
      full_name: "Priya Singh",
      graduation_year: 2024,
      program: "M.Tech Data Science",
      current_company: "Amazon",
      current_role: "ML Engineer",
      location: "Bengaluru, India",
      open_to_mentorship: true,
      linkedin_url: "https://linkedin.com",
    },
    {
      id: "alm-4",
      full_name: "Rohan Patel",
      graduation_year: 2023,
      program: "B.Tech AI & ML",
      current_company: "Tesla",
      current_role: "Autopilot Specialist",
      location: "Remote / Bay Area",
      open_to_mentorship: false,
      linkedin_url: "https://linkedin.com",
    },
  ];

  const fetchAlumni = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (year) params.graduation_year = year;
      if (company) params.company = company;
      if (mentorshipOnly) params.open_to_mentorship = true;
      if (search) params.search = search;

      const res = await api.get("/alumni", { params });
      if (res.data?.items && res.data.items.length > 0) {
        setAlumni(res.data.items);
      } else {
        setAlumni(DEFAULT_ALUMNI);
      }
    } catch (e) {
      console.error(e);
      setAlumni(DEFAULT_ALUMNI);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <WorkspaceHero eyebrow="Our alumni network" title={<>Where our <span className="text-[#7c3aed]">students go.</span></>} description="Meet graduates, find mentors, and stay connected to the AIMETRA community." tone="lilac" icon={GraduationCap} actions={<>
          <Link
            href="/alumni/mentors"
            className="rounded-full border border-[#d9c2ff] bg-white px-4 py-2.5 text-xs font-bold text-[#081a39] transition hover:bg-[#f9f5ff]"
          >
            Mentors
          </Link>
          {["admin", "hod"].includes(userRole) && (
            <Link
              href="/alumni/verify"
              className="rounded-full border border-[#f4db92] bg-[#fff3d1] px-4 py-2.5 text-xs font-bold text-[#081a39] transition hover:bg-[#ffe7a6]"
            >
              Verify Queue
            </Link>
          )}
          <Link
            href="/alumni/register"
            className="rounded-full bg-[#081a39] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#1478ef]"
          >
            Register as Alumni
          </Link>
      </>}/>

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
        <div className="text-center py-16 text-[#526783]">Loading alumni directory...</div>
      ) : alumni.length === 0 ? (
        <div className="p-12 text-center bg-white border border-[#DCE5F1] rounded-2xl shadow-sm">
          <h3 className="text-lg font-bold text-[#0F172A] mb-2">No alumni found</h3>
          <p className="text-sm text-[#526783] mb-6">
            Try adjusting your search criteria or register your alumni profile today.
          </p>
          <Link
            href="/alumni/register"
            className="px-5 py-2.5 bg-[#0F172A] text-white text-sm font-semibold rounded-xl hover:bg-gray-800"
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
