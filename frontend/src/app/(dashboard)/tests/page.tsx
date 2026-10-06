"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import {
  BrainCircuit,
  Clock,
  Award,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  Filter,
  Settings,
  Zap,
  BookOpen,
  TrendingUp,
} from "lucide-react"
import api from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

interface TestItem {
  id: string
  title: string
  slug: string
  description: string
  domain: string
  difficulty: string
  duration_minutes: number
  total_questions: number
  total_marks: number
  passing_marks: number
  is_published: boolean
}

const DOMAIN_META: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  ai_ml_general: { label: "AI & ML", color: "#1478ef", bg: "#EDF5FF", icon: "🤖" },
  llm:           { label: "LLMs",    color: "#7C3AED", bg: "#F3EEFF", icon: "💬" },
  cv:            { label: "Vision",  color: "#0D9488", bg: "#E6FAFA", icon: "👁" },
  nlp:           { label: "NLP",     color: "#D97706", bg: "#FFF8E8", icon: "📝" },
  mlops:         { label: "MLOps",   color: "#E11D48", bg: "#FFF0F3", icon: "⚙️" },
}

const DIFF_META: Record<string, { label: string; color: string; bg: string }> = {
  beginner:     { label: "Beginner",     color: "#15803D", bg: "#DCFCE7" },
  intermediate: { label: "Intermediate", color: "#D97706", bg: "#FEF3C7" },
  advanced:     { label: "Advanced",     color: "#B91C1C", bg: "#FEE2E2" },
}

const DEFAULT_TESTS: TestItem[] = [
  {
    id: "t-1",
    title: "Data Structures Quiz",
    slug: "data-structures-quiz",
    description: "Core algorithms, tree traversals, dynamic programming and complexity analysis.",
    domain: "ai_ml_general",
    difficulty: "intermediate",
    duration_minutes: 20,
    total_questions: 10,
    total_marks: 50,
    passing_marks: 30,
    is_published: true,
  },
  {
    id: "t-2",
    title: "Machine Learning Basics",
    slug: "machine-learning-basics",
    description: "Supervised and unsupervised models, loss functions, gradient descent and regularizations.",
    domain: "ai_ml_general",
    difficulty: "beginner",
    duration_minutes: 30,
    total_questions: 15,
    total_marks: 60,
    passing_marks: 36,
    is_published: true,
  },
  {
    id: "t-3",
    title: "Aptitude & Logical Reasoning",
    slug: "aptitude-reasoning",
    description: "Quantitative aptitude, data interpretation, probability and analytical patterns.",
    domain: "ai_ml_general",
    difficulty: "intermediate",
    duration_minutes: 30,
    total_questions: 20,
    total_marks: 100,
    passing_marks: 60,
    is_published: true,
  },
  {
    id: "t-4",
    title: "GenAI & LLM Fundamentals",
    slug: "genai-fundamentals",
    description: "Transformers, attention mechanisms, prompt engineering, and fine-tuning strategies.",
    domain: "llm",
    difficulty: "advanced",
    duration_minutes: 25,
    total_questions: 12,
    total_marks: 50,
    passing_marks: 30,
    is_published: true,
  },
]

export default function TestsListPage() {
  const { user } = useAuth()
  const [tests, setTests] = useState<TestItem[]>(DEFAULT_TESTS)
  const [activeTab, setActiveTab] = useState<"available" | "upcoming" | "completed">("available")
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [domainFilter, setDomainFilter] = useState("all")
  const [difficultyFilter, setDifficultyFilter] = useState("all")

  const rolesList: string[] = user?.roles
    ? user.roles.map((r: { name?: string }) => r.name?.toLowerCase() || "")
    : []
  const isFacultyOrAdmin =
    rolesList.includes("admin") ||
    rolesList.includes("hod") ||
    rolesList.includes("faculty") ||
    user?.email === "admin@aiml.hub"

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const params: Record<string, string> = {}
        if (domainFilter !== "all") params.domain = domainFilter
        if (difficultyFilter !== "all") params.difficulty = difficultyFilter
        const res = await api.get("/tests", { params })
        if (res.data?.items && res.data.items.length > 0) {
          setTests(res.data.items)
        } else {
          setTests(DEFAULT_TESTS)
        }
        setLoadError(false)
      } catch {
        // Fallback to default tests
        setTests(DEFAULT_TESTS)
        setLoadError(false)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [domainFilter, difficultyFilter])

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* ── Hero Banner ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[28px] p-6 sm:p-8 shadow-[0_8px_32px_rgba(234,110,34,0.14)]"
        style={{ background: "linear-gradient(135deg, #fff4e8 0%, #fff9f4 60%, #fff4e8 100%)" }}
      >
        <div className="absolute -right-10 -top-10 h-52 w-52 rounded-full bg-[#EA6E22]/15 blur-[60px]" />
        <div className="absolute -bottom-16 left-[30%] h-48 w-48 rounded-full bg-[#FFCF36]/20 blur-[60px]" />
        <span aria-hidden className="absolute right-6 top-5 text-4xl text-[#EA6E22]/20 select-none">✦</span>

        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#EA6E22]">
              <BrainCircuit className="w-4 h-4" />
              AI & ML Knowledge — Test Your Readiness
            </p>
            <h1 className="text-3xl font-black tracking-[-0.05em] text-[#071b3d] sm:text-4xl">
              Test your <span className="text-[#EA6E22]">readiness.</span>
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-[#526783]">
              Timed assessments across AI, ML, computer vision, NLP, and MLOps.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {[
              { icon: Zap, label: "Live Tests", val: tests.length },
              { icon: TrendingUp, label: "Domains", val: "5" },
              { icon: CheckCircle2, label: "Completion", val: "—" },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} className="flex items-center gap-2 rounded-xl border border-[#EA6E22]/15 bg-white px-3 py-2 shadow-sm">
                <Icon className="w-4 h-4 text-[#EA6E22] shrink-0" />
                <div>
                  <div className="text-[13px] font-black text-[#071b3d] leading-tight">{val}</div>
                  <div className="text-[10px] text-[#9ab5d0] leading-tight">{label}</div>
                </div>
              </div>
            ))}

            {isFacultyOrAdmin && (
              <Link
                href="/tests/manage"
                className="flex items-center gap-2 rounded-xl bg-[#071b3d] px-4 py-2 text-[12px] font-bold text-white transition hover:bg-[#1478ef] shadow-sm"
              >
                <Settings className="w-4 h-4" />
                Manage Tests
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Domain quick filter chips ────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setDomainFilter("all")}
          className={`rounded-full px-4 py-1.5 text-[12px] font-semibold transition-all ${
            domainFilter === "all"
              ? "bg-[#071b3d] text-white shadow-sm"
              : "border border-[#D4E0F0] bg-white text-[#526783] hover:border-[#1478ef] hover:text-[#1478ef]"
          }`}
        >
          All Domains
        </button>
        {Object.entries(DOMAIN_META).map(([key, meta]) => (
          <button
            key={key}
            onClick={() => setDomainFilter(key)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12px] font-semibold transition-all ${
              domainFilter === key
                ? "text-white shadow-sm"
                : "border border-[#D4E0F0] bg-white text-[#526783] hover:border-current"
            }`}
            style={domainFilter === key ? { background: meta.color } : undefined}
          >
            <span>{meta.icon}</span>
            {meta.label}
          </button>
        ))}
      </div>

      {/* ── Status Tabs (Upcoming / Available / Completed - Panel 19) ────── */}
      <div className="flex items-center gap-1.5 rounded-2xl border border-[#D4E0F0] bg-white p-1.5 shadow-sm w-fit">
        {(["upcoming", "available", "completed"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-xl px-4 py-1.5 text-xs font-bold capitalize transition-all ${
              activeTab === tab
                ? "bg-[#071b3d] text-white shadow-sm"
                : "text-[#526783] hover:text-[#091936] hover:bg-[#F0F4FA]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Filter bar ───────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#D4E0F0] bg-white px-4 py-3 shadow-sm dark:bg-[#101e35] dark:border-[#1E3456]">
        <div className="flex flex-wrap items-center gap-3 text-[12px]">
          <div className="flex items-center gap-1.5 font-semibold text-[#526783]">
            <Filter className="w-3.5 h-3.5" />
            Filters:
          </div>
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-[#D4E0F0] bg-[#F0F4FA] text-[#091936] text-[12px] focus:outline-none focus:border-[#1478ef]"
          >
            <option value="all">All Domains</option>
            {Object.entries(DOMAIN_META).map(([key, m]) => (
              <option key={key} value={key}>{m.label}</option>
            ))}
          </select>
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-[#D4E0F0] bg-[#F0F4FA] text-[#091936] text-[12px] focus:outline-none focus:border-[#1478ef]"
          >
            <option value="all">All Levels</option>
            {Object.keys(DIFF_META).map((d) => (
              <option key={d} value={d}>{DIFF_META[d].label}</option>
            ))}
          </select>
        </div>
        <span className="text-[11px] text-[#9ab5d0]">
          {tests.length} {tests.length === 1 ? "test" : "tests"} available
        </span>
      </div>

      {/* ── Test Cards Grid ───────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-2xl border border-[#D4E0F0] bg-white p-5 shimmer" />
          ))}
        </div>
      ) : loadError ? (
        <div className="rounded-2xl border border-[#FEE2E2] bg-[#FFF5F5] p-8 text-center">
          <BrainCircuit className="mx-auto h-12 w-12 text-[#EA6E22] mb-3" />
          <h3 className="text-lg font-black text-[#071b3d]">Tests unavailable</h3>
          <p className="mt-2 text-sm text-[#526783]">Check again when the department service is available.</p>
        </div>
      ) : tests.length === 0 ? (
        <div className="rounded-2xl border border-[#D4E0F0] bg-white p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-[#D4E0F0] mb-4" />
          <h3 className="text-lg font-bold text-[#091936]">No Tests Found</h3>
          <p className="mt-2 text-sm text-[#526783]">No active tests match your selected filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tests.map((t) => {
            const domain = DOMAIN_META[t.domain] || { label: t.domain, color: "#526783", bg: "#F0F4FA", icon: "📋" }
            const diff = DIFF_META[t.difficulty]

            return (
              <div
                key={t.id}
                className="group flex flex-col justify-between rounded-2xl border border-[#D4E0F0] bg-white p-5 shadow-[0_1px_4px_rgba(9,25,54,0.06)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(9,25,54,0.10)] hover:border-[#A8C8FF]"
              >
                <div className="space-y-3">
                  {/* Domain + Difficulty badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold"
                      style={{ background: domain.bg, color: domain.color }}
                    >
                      <span>{domain.icon}</span>
                      {domain.label}
                    </span>
                    {diff && (
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                        style={{ background: diff.bg, color: diff.color }}
                      >
                        {diff.label}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-[14px] font-black leading-tight text-[#091936] group-hover:text-[#1478ef] transition-colors">
                    {t.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[11px] leading-relaxed text-[#526783] line-clamp-2">
                    {t.description || "Comprehensive department evaluation covering key concepts and applications."}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#F0F4FA]">
                    {[
                      { Icon: Clock,      val: `${t.duration_minutes}m`, label: "Duration" },
                      { Icon: HelpCircle, val: t.total_questions,        label: "Questions" },
                      { Icon: Award,      val: t.total_marks,            label: "Marks" },
                    ].map(({ Icon, val, label }) => (
                      <div key={label} className="flex flex-col items-center rounded-xl bg-[#F8FBFF] py-2 gap-0.5">
                        <Icon className="w-3.5 h-3.5 text-[#9ab5d0] mb-0.5" />
                        <span className="text-[12px] font-black text-[#091936]">{val}</span>
                        <span className="text-[10px] text-[#9ab5d0]">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between border-t border-[#F0F4FA] pt-3">
                  <span className="text-[11px] text-[#526783]">
                    Pass: <strong className="text-[#091936]">{t.passing_marks || Math.ceil(t.total_marks / 2)} marks</strong>
                  </span>
                  <Link
                    href={`/tests/${t.slug}`}
                    className="flex items-center gap-1.5 rounded-xl bg-[#071b3d] px-3 py-1.5 text-[11px] font-bold text-white transition-all hover:bg-[#1478ef] group-hover:bg-[#1478ef]"
                  >
                    Start Test
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
