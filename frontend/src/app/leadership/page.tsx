"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Award, 
  BookOpen, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  GraduationCap, 
  Mail, 
  MapPin, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  Users,
  ArrowRight
} from "lucide-react";
import api from "@/lib/api";

interface LeadershipItem {
  id: string;
  role: string;
  display_title: string;
  photo_url: string | null;
  short_bio: string | null;
  experience_years: number;
  publications_count: number;
  email: string | null;
  office_location: string | null;
  display_order: number;
}

export default function LeadershipDirectoryPage() {
  const [profiles, setProfiles] = useState<LeadershipItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeadership() {
      try {
        setLoading(true);
        const res = await api.get("/api/v1/leadership");
        setProfiles(res.data);
      } catch (err) {
        console.error("Failed to load leadership list:", err);
      } finally {
        setLoading(false);
      }
    }
    loadLeadership();
  }, []);

  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case "hod":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Head of Department
          </span>
        );
      case "cos":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F0FDF4] text-[#0F766E] border border-[#DCFCE7]">
            <span className="w-2 h-2 rounded-full bg-[#0F766E]"></span>
            Chief of Staff / Dean
          </span>
        );
      case "hos":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300">
            <span className="w-2 h-2 rounded-full bg-slate-700"></span>
            Head of School
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0FDF4] border border-[#DCFCE7] text-xs font-semibold text-[#0F766E]">
          <ShieldCheck className="w-3.5 h-3.5" /> Department Leadership & Governance
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
          Executive Leadership Team
        </h1>
        <p className="text-base text-slate-600">
          Stewarding academic excellence, research velocity, and ethical innovation across the Department of Artificial Intelligence & Machine Learning.
        </p>
      </div>

      {/* Leadership Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-[#0F766E] animate-spin mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading leadership directory...</p>
        </div>
      ) : profiles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {profiles.map((leader) => (
            <div
              key={leader.id}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow group"
            >
              <div className="space-y-5">
                {/* Photo 3:4 */}
                <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img
                    src={
                      leader.photo_url ||
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800"
                    }
                    alt={leader.display_title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    {getRoleBadge(leader.role)}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0F766E] transition-colors">
                    {leader.display_title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                    {leader.short_bio}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> {leader.experience_years}+ yrs exp
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" /> {leader.publications_count}+ papers
                  </span>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href={`/leadership/${leader.role}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-[#0F766E] text-white rounded-xl text-xs font-semibold transition"
                >
                  View Full Profile & Message <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-slate-500">
          No leadership profiles found.
        </div>
      )}

      {/* Department Quick Links */}
      <div className="p-8 bg-slate-50 border border-slate-200 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/leadership/hod"
          className="p-5 bg-white border border-slate-200/80 rounded-2xl hover:border-[#0F766E] transition"
        >
          <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Office of the HOD</div>
          <h4 className="text-sm font-bold text-slate-900">Head of Department</h4>
          <p className="text-xs text-slate-500 mt-1">Curricular governance, student petitions, and research laboratories.</p>
        </Link>

        <Link
          href="/leadership/cos"
          className="p-5 bg-white border border-slate-200/80 rounded-2xl hover:border-[#0F766E] transition"
        >
          <div className="text-xs font-bold text-[#0F766E] uppercase tracking-wider mb-1">Academic Administration</div>
          <h4 className="text-sm font-bold text-slate-900">Chief of Staff / Dean</h4>
          <p className="text-xs text-slate-500 mt-1">Inter-disciplinary research alliances, degree accreditations, and industry chairs.</p>
        </Link>

        <Link
          href="/leadership/hos"
          className="p-5 bg-white border border-slate-200/80 rounded-2xl hover:border-[#0F766E] transition"
        >
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">School Executive</div>
          <h4 className="text-sm font-bold text-slate-900">Head of School</h4>
          <p className="text-xs text-slate-500 mt-1">Supercomputing GPU infrastructure and overarching institutional trajectory.</p>
        </Link>
      </div>
    </div>
  );
}
