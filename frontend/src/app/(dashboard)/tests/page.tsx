"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  BrainCircuit, 
  Clock, 
  Award, 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight,
  Filter,
  Layers,
  Settings
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface TestItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  domain: string;
  difficulty: string;
  duration_minutes: number;
  total_questions: number;
  total_marks: number;
  passing_marks: number;
  is_published: boolean;
}

export default function TestsListPage() {
  const { user } = useAuth();
  const [tests, setTests] = useState<TestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [domainFilter, setDomainFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  const rolesList: string[] = user?.roles ? user.roles.map((r: any) => r.name?.toLowerCase()) : [];
  const isFacultyOrAdmin = rolesList.includes("admin") || rolesList.includes("hod") || rolesList.includes("faculty") || user?.email === "admin@aiml.hub";

  useEffect(() => {
    async function loadTests() {
      try {
        setLoading(true);
        const params: any = {};
        if (domainFilter !== "all") params.domain = domainFilter;
        if (difficultyFilter !== "all") params.difficulty = difficultyFilter;
        const res = await api.get("/tests", { params });
        setTests(res.data.items || []);
      } catch (err) {
        console.error("Failed to load tests", err);
      } finally {
        setLoading(false);
      }
    }
    loadTests();
  }, [domainFilter, difficultyFilter]);

  const getDomainLabel = (d: string) => {
    switch (d) {
      case "ai_ml_general": return "AI & ML Fundamentals";
      case "llm": return "Large Language Models";
      case "cv": return "Computer Vision";
      case "nlp": return "Natural Language Processing";
      case "mlops": return "MLOps & Engineering";
      default: return d;
    }
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case "beginner":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600">Beginner</span>;
      case "intermediate":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600">Intermediate</span>;
      case "advanced":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600">Advanced</span>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-2xl border border-border bg-gradient-to-r from-surface to-primary/5 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-card">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>AI/ML Knowledge Assessment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            Department Knowledge Tests
          </h1>
          <p className="text-sm text-ink-500 max-w-2xl">
            Take timed, auto-graded benchmark tests across Core AI/ML, Transformers, Computer Vision, and MLOps. Your scores directly contribute to your overall Department Leaderboard Ranking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/tests/me"
            className="px-4 py-2 text-sm font-medium rounded-lg border border-border bg-surface text-ink hover:bg-canvas transition-colors flex items-center gap-2"
          >
            <Clock className="w-4 h-4 text-primary" />
            <span>My Attempt History</span>
          </Link>
          {isFacultyOrAdmin && (
            <Link
              href="/tests/manage"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              <span>Manage Tests</span>
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-border shadow-card">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink-500 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="text-xs font-medium bg-canvas border border-border rounded-lg px-3 py-1.5 text-ink focus:outline-none focus:border-primary"
          >
            <option value="all">All Domains</option>
            <option value="ai_ml_general">AI & ML Fundamentals</option>
            <option value="llm">Large Language Models</option>
            <option value="cv">Computer Vision</option>
            <option value="nlp">NLP</option>
            <option value="mlops">MLOps</option>
          </select>

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="text-xs font-medium bg-canvas border border-border rounded-lg px-3 py-1.5 text-ink focus:outline-none focus:border-primary"
          >
            <option value="all">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <span className="text-xs text-ink-400">
          Showing {tests.length} available {tests.length === 1 ? "test" : "tests"}
        </span>
      </div>

      {/* Test Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-xl border border-border bg-surface p-6 animate-pulse space-y-4">
              <div className="h-4 bg-border rounded w-1/3"></div>
              <div className="h-6 bg-border rounded w-3/4"></div>
              <div className="h-16 bg-border rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : tests.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-xl border border-border p-8 space-y-3">
          <BrainCircuit className="w-12 h-12 text-ink-300 mx-auto" />
          <h3 className="text-lg font-bold text-ink">No Tests Found</h3>
          <p className="text-xs text-ink-500 max-w-sm mx-auto">
            There are currently no active benchmark tests matching your selected filters.
          </p>
          {isFacultyOrAdmin && (
            <Link
              href="/tests/manage"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold"
            >
              Create New Test
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((t) => (
            <div
              key={t.id}
              className="rounded-xl border border-border bg-surface p-6 flex flex-col justify-between hover:shadow-card hover:border-primary/40 transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-primary px-2.5 py-0.5 rounded-full bg-primary/10">
                    {getDomainLabel(t.domain)}
                  </span>
                  {getDifficultyBadge(t.difficulty)}
                </div>

                <h3 className="text-lg font-bold text-ink group-hover:text-primary transition-colors">
                  {t.title}
                </h3>

                <p className="text-xs text-ink-500 line-clamp-2 leading-relaxed">
                  {t.description || "Comprehensive department evaluation covering key algorithmic concepts and applications."}
                </p>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border text-center">
                  <div className="bg-canvas p-2 rounded-lg">
                    <div className="flex items-center justify-center text-ink-400 mb-1">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-ink">{t.duration_minutes}m</span>
                    <span className="block text-[10px] text-ink-400">Duration</span>
                  </div>
                  <div className="bg-canvas p-2 rounded-lg">
                    <div className="flex items-center justify-center text-ink-400 mb-1">
                      <HelpCircle className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-ink">{t.total_questions}</span>
                    <span className="block text-[10px] text-ink-400">Questions</span>
                  </div>
                  <div className="bg-canvas p-2 rounded-lg">
                    <div className="flex items-center justify-center text-ink-400 mb-1">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    <span className="text-xs font-bold text-ink">{t.total_marks}</span>
                    <span className="block text-[10px] text-ink-400">Marks</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-ink-400">
                  Passing: <strong className="text-ink">{t.passing_marks || Math.ceil(t.total_marks / 2)} marks</strong>
                </span>

                <Link
                  href={`/tests/${t.slug}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
