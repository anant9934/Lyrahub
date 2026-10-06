"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { RankingTableSkeleton } from "@/components/ui/skeletons"
import { useRankings } from "@/lib/hooks"
import { Download, Info, Trophy, TrendingUp, Users, Star, Settings2 } from "lucide-react"
import { ResponsiveTable } from "@/components/responsive/ResponsiveTable"
import { ResponsiveModal } from "@/components/responsive/ResponsiveModal"

interface RankingItem {
  student_id: string
  rank: number
  score: number
  breakdown?: {
    name?: string
    reg_no?: string
    cgpa?: number
    test_score?: number
    skill_score?: number
    project_score?: number
    section?: string
  }
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return (
    <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-[#FFCF36] text-[#071b3d] text-xs font-black shadow-[0_2px_8px_rgba(255,207,54,0.45)]">
      1
    </span>
  )
  if (rank === 2) return (
    <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-[#D1D5DB] text-[#374151] text-xs font-black shadow-sm">
      2
    </span>
  )
  if (rank === 3) return (
    <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-[#CD7F32] text-white text-xs font-black shadow-sm">
      3
    </span>
  )
  return <span className="text-[12px] font-semibold text-[#526783]">{rank}</span>
}

function ScoreBar({ value, max = 100, color = "#1478ef" }: { value: number; max?: number; color?: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#E8F0FB]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-[11px] font-semibold text-[#091936]">{value}</span>
    </div>
  )
}

const DEFAULT_RANKINGS: RankingItem[] = [
  {
    student_id: "s-1",
    rank: 1,
    score: 96.4,
    breakdown: {
      name: "Aditi Sharma",
      reg_no: "22AIML001",
      cgpa: 9.4,
      test_score: 95,
      skill_score: 92,
      project_score: 98,
      section: "A",
    },
  },
  {
    student_id: "s-2",
    rank: 2,
    score: 91.2,
    breakdown: {
      name: "Rahul Verma",
      reg_no: "22AIML042",
      cgpa: 8.9,
      test_score: 88,
      skill_score: 85,
      project_score: 92,
      section: "B",
    },
  },
  {
    student_id: "s-3",
    rank: 3,
    score: 88.5,
    breakdown: {
      name: "Aakash Reddy",
      reg_no: "22AIML015",
      cgpa: 8.7,
      test_score: 84,
      skill_score: 82,
      project_score: 89,
      section: "A",
    },
  },
  {
    student_id: "s-4",
    rank: 4,
    score: 85.0,
    breakdown: {
      name: "Sanjana Sen",
      reg_no: "22AIML089",
      cgpa: 8.5,
      test_score: 80,
      skill_score: 79,
      project_score: 86,
      section: "C",
    },
  },
  {
    student_id: "s-5",
    rank: 5,
    score: 83.2,
    breakdown: {
      name: "Farhan Qureshi",
      reg_no: "22AIML034",
      cgpa: 8.3,
      test_score: 79,
      skill_score: 78,
      project_score: 84,
      section: "B",
    },
  },
]

export default function RankingPage() {
  const [section, setSection] = useState<string>("all")
  const [topN, setTopN] = useState<number>(100)
  const [selectedStudent, setSelectedStudent] = useState<RankingItem | null>(null)

  const { data, isLoading, isFetching, isError, refetch } = useRankings({ pageSize: topN, section })
  const items: RankingItem[] = data?.items && data.items.length > 0 ? data.items : DEFAULT_RANKINGS
  const isRefreshing = isFetching && !isLoading

  const exportCSV = () => {
    const headers = ["Rank", "Name", "Reg No", "CGPA", "Test Score", "Skill Score", "Final Score"]
    const rows = items.map((it) => [
      it.rank,
      it.breakdown?.name || `Student ${it.rank}`,
      it.breakdown?.reg_no || "N/A",
      it.breakdown?.cgpa?.toFixed(2) || "0.00",
      it.breakdown?.test_score ?? "",
      it.breakdown?.skill_score ?? "",
      it.score.toFixed(3),
    ])
    const csv = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const a = document.createElement("a")
    a.href = encodeURI(csv)
    a.download = `student_rankings_${Date.now()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto">

      {/* ── Hero Banner ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[28px] p-6 sm:p-8 text-white shadow-[0_8px_32px_rgba(7,27,61,0.18)]"
        style={{ background: "linear-gradient(135deg, #071b3d 0%, #0d2d5e 50%, #071b3d 100%)" }}
      >
        {/* Glows */}
        <div className="absolute -right-10 -top-10 h-52 w-52 rounded-full bg-[#1478ef]/30 blur-[60px]" />
        <div className="absolute -bottom-16 left-[35%] h-48 w-48 rounded-full bg-[#FFCF36]/15 blur-[60px]" />
        <span aria-hidden className="absolute right-6 top-5 text-4xl text-[#5ac9ff]/30 select-none">✦</span>

        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#79bbff]">
              <Trophy className="w-4 h-4 text-[#FFCF36]" />
              Student Rankings · Academic Performance
            </p>
            <h1 className="text-3xl font-black tracking-[-0.05em] sm:text-4xl">
              See the <span className="text-[#FFCF36]">impact.</span>
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-[#b0cae8]">
              TOPSIS-based composite scores — CGPA, tests, skills, and projects combined.
            </p>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-3">
            {[
              { icon: Users, label: "Students", val: items.length || "—" },
              { icon: TrendingUp, label: "Top Score", val: items[0]?.score.toFixed(2) || "—" },
              { icon: Star, label: "Sections", val: "A·B·C" },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/08 px-3 py-2 backdrop-blur-sm">
                <Icon className="w-4 h-4 text-[#79bbff] shrink-0" />
                <div>
                  <div className="text-[13px] font-black text-white leading-tight">{val}</div>
                  <div className="text-[10px] text-[#79bbff] leading-tight">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Filters + Actions bar ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#D4E0F0] bg-white px-4 py-3 shadow-sm dark:bg-[#101e35] dark:border-[#1E3456]">
        <div className="flex flex-wrap items-center gap-3 text-[12px]">
          {/* Section filter */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#526783]">Section</span>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="h-8 px-2.5 rounded-lg border border-[#D4E0F0] bg-[#F0F4FA] text-[#091936] text-[12px] focus:outline-none focus:border-[#1478ef] dark:bg-[#0f1829] dark:text-white dark:border-[#1E3456]"
            >
              <option value="all">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>

          {/* Top N filter */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#526783]">Show</span>
            <select
              value={topN}
              onChange={(e) => setTopN(Number(e.target.value))}
              className="h-8 px-2.5 rounded-lg border border-[#D4E0F0] bg-[#F0F4FA] text-[#091936] text-[12px] focus:outline-none focus:border-[#1478ef] dark:bg-[#0f1829] dark:text-white dark:border-[#1E3456]"
            >
              <option value={10}>Top 10</option>
              <option value={25}>Top 25</option>
              <option value={50}>Top 50</option>
              <option value={100}>Top 100</option>
            </select>
          </div>

          {isRefreshing && (
            <span className="flex items-center gap-1.5 text-[11px] text-[#9ab5d0]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1478ef] animate-pulse" />
              Updating…
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link href="/ranking/config" className="hidden sm:flex items-center gap-1.5 rounded-xl border border-[#D4E0F0] px-3 py-1.5 text-[11px] font-semibold text-[#526783] transition hover:bg-[#F0F4FA] hover:text-[#091936]">
            <Settings2 className="w-3.5 h-3.5" />
            Weight Config
          </Link>
          <Button
            onClick={exportCSV}
            disabled={isLoading || items.length === 0}
            className="h-8 gap-1.5 rounded-xl bg-[#071b3d] px-3 text-[11px] font-semibold text-white hover:bg-[#1478ef] disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <RankingTableSkeleton rows={10} />
      ) : isError ? (
        <div className="rounded-2xl border border-[#D4E0F0] bg-white p-12 text-center dark:bg-[#101e35] dark:border-[#1E3456]">
          <p className="text-sm text-[#526783] mb-3">Failed to load rankings.</p>
          <button onClick={() => refetch()} className="text-[12px] font-semibold text-[#1478ef] hover:underline">Retry</button>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-[#D4E0F0] bg-white p-12 text-center dark:bg-[#101e35] dark:border-[#1E3456]">
          <Trophy className="mx-auto h-12 w-12 text-[#D4E0F0] mb-4" />
          <h2 className="text-lg font-bold text-[#091936] dark:text-white">No rankings yet</h2>
          <p className="mt-2 text-sm text-[#526783]">Rankings appear after the department publishes a score snapshot.</p>
        </div>
      ) : (
        <div className={`rounded-2xl border border-[#D4E0F0] bg-white overflow-hidden shadow-[0_1px_4px_rgba(9,25,54,0.06)] transition-opacity dark:bg-[#101e35] dark:border-[#1E3456] ${isRefreshing ? "opacity-70" : "opacity-100"}`}>
          <ResponsiveTable>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E8F0FB] bg-[#F0F4FA] dark:bg-[#0f1829] dark:border-[#1E3456]">
                  {["#", "Student", "Reg. No.", "Program", "CGPA", "Test", "Skills", "Score", ""].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-[#526783] whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const isTop3 = item.rank <= 3
                  return (
                    <tr
                      key={item.student_id || idx}
                      className={`group border-b border-[#F0F4FA] transition-colors hover:bg-[#F8FBFF] dark:border-[#1E3456] dark:hover:bg-[#152138] ${
                        item.rank === 1 ? "border-l-4 border-l-[#FFCF36]" :
                        item.rank === 2 ? "border-l-4 border-l-[#D1D5DB]" :
                        item.rank === 3 ? "border-l-4 border-l-[#CD7F32]" : "border-l-4 border-l-transparent"
                      }`}
                    >
                      <td className="px-4 py-3 w-12 text-center">
                        <RankBadge rank={item.rank} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1478ef]/10 to-[#1478ef]/20 text-[11px] font-bold text-[#1478ef]">
                            {(item.breakdown?.name || `S${item.rank}`).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-[12px] font-semibold text-[#091936] dark:text-white leading-tight">
                              {item.breakdown?.name || `Student ${item.rank}`}
                            </div>
                            <div className="text-[10px] text-[#9ab5d0]">
                              {item.breakdown?.section ? `Section ${item.breakdown.section}` : "—"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[11px] font-mono text-[#526783]">
                        {item.breakdown?.reg_no || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-[#E8F4FF] px-2.5 py-0.5 text-[10px] font-semibold text-[#1478ef]">
                          CSE AIML
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[12px] font-bold ${
                          (item.breakdown?.cgpa ?? 0) >= 8.5 ? "text-[#15803D]" :
                          (item.breakdown?.cgpa ?? 0) >= 7 ? "text-[#D97706]" : "text-[#B91C1C]"
                        }`}>
                          {item.breakdown?.cgpa != null ? Number(item.breakdown.cgpa).toFixed(2) : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {item.breakdown?.test_score != null
                          ? <ScoreBar value={item.breakdown.test_score} color="#7C3AED" />
                          : <span className="text-[11px] text-[#9ab5d0]">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {item.breakdown?.skill_score != null
                          ? <ScoreBar value={item.breakdown.skill_score} color="#0D9488" />
                          : <span className="text-[11px] text-[#9ab5d0]">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-[13px] font-black ${isTop3 ? "text-[#1478ef]" : "text-[#091936] dark:text-white"}`}>
                            {item.score.toFixed(3)}
                          </span>
                          {isTop3 && <Star className="w-3 h-3 text-[#FFCF36] fill-[#FFCF36]" />}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedStudent(item)}
                          className="rounded-lg border border-[#D4E0F0] bg-white px-2.5 py-1 text-[10px] font-semibold text-[#526783] transition-all hover:border-[#1478ef] hover:bg-[#EDF5FF] hover:text-[#1478ef] group-hover:visible dark:bg-[#101e35] dark:border-[#1E3456]"
                        >
                          <Info className="w-3 h-3 inline mr-0.5" /> Details
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </ResponsiveTable>

          {/* Table footer */}
          <div className="border-t border-[#E8F0FB] bg-[#F8FBFF] px-4 py-2.5 text-center text-[11px] text-[#9ab5d0] dark:bg-[#0f1829] dark:border-[#1E3456]">
            Showing {items.length} student{items.length !== 1 ? "s" : ""} · Scores computed using TOPSIS algorithm
          </div>
        </div>
      )}

      {/* ── Score Breakdown Modal ─────────────────────────────────────────── */}
      <ResponsiveModal
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        title={`Score Breakdown`}
        description={selectedStudent?.breakdown?.name || `Rank #${selectedStudent?.rank}`}
        maxWidth="md"
      >
        {selectedStudent && (
          <div className="space-y-4">
            {/* Score pills */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "CGPA", value: selectedStudent.breakdown?.cgpa?.toFixed(2) ?? "—", weight: "35%", color: "bg-[#E0F2FE] text-[#0369A1]" },
                { label: "AI/ML Test", value: selectedStudent.breakdown?.test_score ?? "—", weight: "25%", color: "bg-[#EDE9FE] text-[#6D28D9]" },
                { label: "Verified Skills", value: `${selectedStudent.breakdown?.skill_score ?? "—"} pts`, weight: "20%", color: "bg-[#D1FAE5] text-[#065F46]" },
                { label: "Projects", value: `${selectedStudent.breakdown?.project_score ?? "—"} pts`, weight: "20%", color: "bg-[#FEF3C7] text-[#92400E]" },
              ].map(({ label, value, weight, color }) => (
                <div key={label} className="rounded-xl border border-[#E8F0FB] bg-[#F8FBFF] p-3 text-center">
                  <div className={`mb-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${color}`}>{weight}</div>
                  <div className="text-[15px] font-black text-[#091936]">{value}</div>
                  <div className="text-[10px] text-[#526783]">{label}</div>
                </div>
              ))}
            </div>

            {/* Final score */}
            <div className="flex items-center justify-between rounded-xl border border-[#1478ef]/20 bg-gradient-to-r from-[#EDF5FF] to-[#F0F7FF] px-4 py-3">
              <span className="text-[12px] font-semibold text-[#3D5A80]">TOPSIS Composite Score</span>
              <span className="text-xl font-black text-[#1478ef]">{selectedStudent.score.toFixed(3)}</span>
            </div>

            <div className="flex justify-end">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setSelectedStudent(null)}
                className="w-full sm:w-auto"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </ResponsiveModal>
    </div>
  )
}
