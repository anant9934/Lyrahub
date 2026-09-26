"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Award, 
  BookOpen, 
  Calendar, 
  Clock, 
  Compass, 
  ExternalLink, 
  GraduationCap, 
  Mail, 
  MapPin, 
  Phone, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  Users, 
  CheckCircle2,
  ArrowLeft
} from "lucide-react";
import api from "@/lib/api";

interface LeadershipData {
  id: string;
  role: string;
  display_title: string;
  photo_url: string | null;
  short_bio: string | null;
  full_bio: string | null;
  message: string | null;
  vision: string | null;
  qualifications: string[];
  experience_years: number;
  research_interests: string[];
  publications_count: number;
  email: string | null;
  phone: string | null;
  office_location: string | null;
  office_hours: string | null;
  linkedin_url: string | null;
  google_scholar_url: string | null;
  display_order: number;
  is_active: boolean;
}

interface StatsData {
  role: string;
  total_students: number;
  total_faculty: number;
  total_placements: number;
  total_publications: number;
  total_projects: number;
  department_name: string;
}

interface LeadershipProfileViewProps {
  role: "hod" | "cos" | "hos";
}

export default function LeadershipProfileView({ role }: LeadershipProfileViewProps) {
  const [profile, setProfile] = useState<LeadershipData | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"message" | "vision" | "profile" | "responsibilities" | "contact">("message");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [profileRes, statsRes] = await Promise.all([
          api.get(`/leadership/${role}`),
          api.get(`/leadership/${role}/stats`),
        ]);
        setProfile(profileRes.data);
        setStats(statsRes.data);
      } catch (err: any) {
        console.error("Failed to load leadership data:", err);
        setError(err.response?.data?.detail || "Could not retrieve leadership profile");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [role]);

  const getRoleBadge = (r: string) => {
    switch (r.toLowerCase()) {
      case "hod":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Head of Department (HOD)
          </span>
        );
      case "cos":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F0FDF4] text-[#0F766E] border border-[#DCFCE7]">
            <span className="w-2 h-2 rounded-full bg-[#0F766E]"></span>
            Chief of Staff / Dean (COS)
          </span>
        );
      case "hos":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300">
            <span className="w-2 h-2 rounded-full bg-slate-700"></span>
            Head of School (HOS)
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 text-[#0F766E] animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-600">Loading leadership profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="p-8 bg-red-50 border border-red-200 rounded-3xl text-center space-y-3">
          <p className="text-red-700 font-semibold">{error || "Profile not found"}</p>
          <Link
            href="/leadership"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Leadership Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/leadership"
          className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> All Department Leadership
        </Link>
        <div className="flex items-center gap-2">
          {getRoleBadge(profile.role)}
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Photo: 3:4 ratio rounded card */}
          <div className="md:col-span-4 flex justify-center">
            <div className="relative w-56 sm:w-64 aspect-[3/4] rounded-3xl overflow-hidden border-4 border-slate-100 shadow-md group">
              <img
                src={
                  profile.photo_url ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800"
                }
                alt={profile.display_title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent"></div>
            </div>
          </div>

          {/* Details & Short Bio */}
          <div className="md:col-span-8 space-y-4">
            <div>
              {getRoleBadge(profile.role)}
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mt-2">
                {profile.display_title}
              </h1>
              <p className="text-base text-[#0F766E] font-medium mt-1">
                Department of Artificial Intelligence & Machine Learning
              </p>
            </div>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {profile.short_bio}
            </p>

            {/* Quick Badges */}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-slate-100 text-slate-700">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {profile.experience_years}+ Years Experience
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-slate-100 text-slate-700">
                <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                {profile.publications_count}+ Peer-Reviewed Publications
              </span>
            </div>

            {/* CTA bar */}
            <div className="pt-3 flex flex-wrap gap-3">
              {profile.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-xl text-xs font-semibold transition shadow-sm"
                >
                  <Mail className="w-3.5 h-3.5" /> Email Office
                </a>
              )}
              {profile.office_hours && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Hours: {profile.office_hours}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Mini Cards Below Hero */}
        {stats && (
          <div className="mt-10 pt-8 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/60 text-center">
              <p className="text-2xl font-black text-slate-900">{stats.total_students}+</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Active Students</p>
            </div>
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/60 text-center">
              <p className="text-2xl font-black text-slate-900">{stats.total_faculty}</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Faculty Members</p>
            </div>
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/60 text-center">
              <p className="text-2xl font-black text-slate-900">{stats.total_placements}</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Placements (FY)</p>
            </div>
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/60 text-center">
              <p className="text-2xl font-black text-slate-900">{stats.total_publications}</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Publications</p>
            </div>
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/60 text-center col-span-2 sm:col-span-1">
              <p className="text-2xl font-black text-slate-900">{stats.total_projects}</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Active Projects</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="space-y-6">
        <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
          {[
            { id: "message", label: "Message" },
            { id: "vision", label: "Vision" },
            { id: "profile", label: "Profile & Research" },
            { id: "responsibilities", label: "Responsibilities" },
            { id: "contact", label: "Contact & Hours" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-[#0F766E] text-[#0F766E]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          {activeTab === "message" && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900">Message to Department & Candidates</h3>
              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-4">
                {profile.message || "Message from leadership is currently being updated."}
              </div>
            </div>
          )}

          {activeTab === "vision" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Strategic Vision</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Guiding principles steering academic and computational excellence.
                </p>
              </div>

              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl">
                <p className="text-base text-slate-800 italic leading-relaxed">
                  &ldquo;{profile.vision || "To spearhead cognitive systems and ethical artificial intelligence breakthroughs globally."}&rdquo;
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 border border-slate-200/80 rounded-2xl bg-white shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-[#F0FDF4] text-[#0F766E] flex items-center justify-center mb-3">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">Research Velocity</h4>
                  <p className="text-xs text-slate-500 mt-1">High-impact publications in NeurIPS, CVPR, and ICML conferences.</p>
                </div>
                <div className="p-5 border border-slate-200/80 rounded-2xl bg-white shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">Industry Leadership</h4>
                  <p className="text-xs text-slate-500 mt-1">Corporate lab chairs and active high-growth placement pipelines.</p>
                </div>
                <div className="p-5 border border-slate-200/80 rounded-2xl bg-white shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">Ethical Governance</h4>
                  <p className="text-xs text-slate-500 mt-1">Algorithmic fairness, model safety, and transparent AI governance.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Academic Background & Biography</h3>
                <div className="mt-4 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {profile.full_bio}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-[#0F766E]" /> Degrees & Qualifications
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-600">
                    {profile.qualifications && profile.qualifications.length > 0 ? (
                      profile.qualifications.map((q, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                          <span>{q}</span>
                        </li>
                      ))
                    ) : (
                      <li>No qualifications listed</li>
                    )}
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#0F766E]" /> Core Research Interests
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.research_interests && profile.research_interests.length > 0 ? (
                      profile.research_interests.map((r, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium"
                        >
                          {r}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">General Artificial Intelligence</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "responsibilities" && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900">Administrative & Academic Responsibilities</h3>
              <div className="space-y-3 pt-2">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
                  <strong className="text-slate-800">1. Departmental Curriculum & Standards:</strong>
                  <p className="text-slate-600">
                    Regularly revising course syllabi, laboratory infrastructure, and faculty performance assessments.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
                  <strong className="text-slate-800">2. Research Clusters & Grants:</strong>
                  <p className="text-slate-600">
                    Overseeing research sponsorships, doctoral dissertations, and high-performance computing clusters.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
                  <strong className="text-slate-800">3. Approvals & Student Petitions:</strong>
                  <p className="text-slate-600">
                    Final authority on change requests, student profile updates, and grade moderation panels.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "contact" && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-900">Office & Direct Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 border border-slate-200 rounded-2xl flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#0F766E] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Office Location</h4>
                    <p className="text-xs text-slate-600 mt-1">{profile.office_location || "Academic Complex"}</p>
                  </div>
                </div>

                <div className="p-5 border border-slate-200 rounded-2xl flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#0F766E] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Office Hours</h4>
                    <p className="text-xs text-slate-600 mt-1">{profile.office_hours || "By Appointment"}</p>
                  </div>
                </div>

                <div className="p-5 border border-slate-200 rounded-2xl flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#0F766E] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Official Email</h4>
                    <a href={`mailto:${profile.email}`} className="text-xs text-[#0F766E] font-medium hover:underline mt-1 block">
                      {profile.email}
                    </a>
                  </div>
                </div>

                <div className="p-5 border border-slate-200 rounded-2xl flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#0F766E] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Direct Phone</h4>
                    <p className="text-xs text-slate-600 mt-1">{profile.phone || "Internal Extension Only"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
