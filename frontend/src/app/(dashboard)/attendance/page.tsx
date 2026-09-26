"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  QrCode, 
  Clock, 
  BookOpen, 
  Users, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  Layers,
  ArrowLeft
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface CourseItem {
  id: string;
  name: string;
  code: string;
}

export default function AttendanceStartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [section, setSection] = useState<string>("A");
  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [loading, setLoading] = useState(false);
  const [fetchingCourses, setFetchingCourses] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCourses() {
      try {
        setFetchingCourses(true);
        const res = await api.get("/courses");
        if (res.data?.items) {
          setCourses(res.data.items);
          if (res.data.items.length > 0) {
            setSelectedCourse(res.data.items[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load courses:", err);
      } finally {
        setFetchingCourses(false);
      }
    }
    loadCourses();
  }, []);

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        course_id: selectedCourse || null,
        section: section.trim() || "A",
        duration_minutes: durationMinutes,
      };

      const res = await api.post("/qr/attendance/session", payload);
      const session = res.data;
      router.push(`/attendance/${session.id}`);
    } catch (err: any) {
      console.error("Failed to create attendance session:", err);
      setError(
        err.response?.data?.detail || "Failed to start attendance session. Ensure you have faculty privileges."
      );
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Dashboard
        </Link>
      </div>

      <div className="border-b border-slate-100 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
          <QrCode className="w-7 h-7 text-[#0F766E]" />
          Instant QR Attendance Session
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Launch a time-bounded attendance window. Project the dynamic QR code in lecture halls for frictionless student check-ins.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleStartSession} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-1.5 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#0F766E]" /> Select Course (Optional)
            </label>
            {fetchingCourses ? (
              <div className="h-10 bg-slate-100 animate-pulse rounded-xl" />
            ) : courses.length > 0 ? (
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
              >
                <option value="">-- General / Department Workshop --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code ? `[${c.code}] ` : ""}{c.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder="No courses configured (Session will be general)"
                disabled
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-400"
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1.5 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#0F766E]" /> Section / Batch
              </label>
              <input
                type="text"
                required
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="e.g. A, B, AIML-2024"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1.5 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0F766E]" /> Expiry Duration
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
              >
                <option value={5}>5 Minutes (Quick Check)</option>
                <option value={10}>10 Minutes</option>
                <option value={15}>15 Minutes (Standard Lecture)</option>
                <option value={30}>30 Minutes</option>
                <option value={60}>60 Minutes (Lab Session)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50/70 border border-slate-200/70 rounded-2xl flex items-start gap-3 text-xs text-slate-600">
          <ShieldCheck className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
          <span>
            Anti-tamper protection enabled: IP addresses and timestamps are recorded. Duplicate student entries within the same session are strictly blocked.
          </span>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-xl text-sm font-semibold transition shadow-sm disabled:opacity-50"
          >
            {loading ? "Generating Session..." : "Launch Live QR Code"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
