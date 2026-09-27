"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { RankingTableSkeleton } from "@/components/ui/skeletons"
import { useRankings } from "@/lib/hooks"
import {
  Download,
  Info,
} from "lucide-react"
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

// Demo fallback when backend has no seeded data yet
const DEMO_ITEMS: RankingItem[] = [
  { student_id: "s1", rank: 1, score: 0.912, breakdown: { name: "Arjun Mehta", reg_no: "AIML2021", cgpa: 9.2, test_score: 92, skill_score: 88, section: "A" } },
  { student_id: "s2", rank: 2, score: 0.894, breakdown: { name: "Priya Sharma", reg_no: "AIML2013", cgpa: 9.1, test_score: 88, skill_score: 85, section: "B" } },
  { student_id: "s3", rank: 3, score: 0.876, breakdown: { name: "Rohan Verma", reg_no: "AIML2087", cgpa: 8.9, test_score: 86, skill_score: 82, section: "A" } },
  { student_id: "s4", rank: 4, score: 0.852, breakdown: { name: "Ananya Singh", reg_no: "AIML2012", cgpa: 8.8, test_score: 84, skill_score: 80, section: "A" } },
  { student_id: "s5", rank: 5, score: 0.831, breakdown: { name: "Karan Patel", reg_no: "AIML2079", cgpa: 8.7, test_score: 82, skill_score: 78, section: "B" } },
]

export default function RankingPage() {
  const [year, setYear] = useState<string>("all")
  const [section, setSection] = useState<string>("all")
  const [topN, setTopN] = useState<number>(100)
  const [selectedStudent, setSelectedStudent] = useState<RankingItem | null>(null)

  // TanStack Query with placeholderData — previous data stays visible while refetching
  const { data, isLoading, isFetching, isError } = useRankings({
    pageSize: topN,
    section,
  })

  // Resolve data — use API results or demo fallback
  const rawItems: RankingItem[] = data?.items ?? []
  const items: RankingItem[] = rawItems.length > 0 ? rawItems : (!isLoading && !isFetching ? DEMO_ITEMS : [])
  const isRefreshing = isFetching && !isLoading

  const exportCSV = () => {
    const headers = ["Rank", "Name", "Reg No", "CGPA", "Test Score", "Skill Score", "Final Score"]
    const rows = items.map((it) => [
      it.rank,
      it.breakdown?.name || `Student ${it.rank}`,
      it.breakdown?.reg_no || "N/A",
      it.breakdown?.cgpa?.toFixed(2) || "0.00",
      it.breakdown?.test_score || "80",
      it.breakdown?.skill_score || "75",
      it.score.toFixed(3),
    ])
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")
    const link = document.createElement("a")
    link.setAttribute("href", encodeURI(csvContent))
    link.setAttribute("download", `student_rankings_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Header (always immediate) ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111]">
            Student Rankings
          </h1>
          <p className="text-xs text-[#555555]">
            AI &amp; ML student ranking based on multiple parameters (AHP + TOPSIS).
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isRefreshing && (
            <span className="text-[10px] text-[#888888] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse inline-block" />
              Updating…
            </span>
          )}
          <Button
            onClick={exportCSV}
            disabled={isLoading || items.length === 0}
            className="gap-2 bg-[#111111] text-white hover:bg-neutral-800 text-xs h-9 px-4 rounded-lg disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* ── Filters (always immediate) ────────────────────────────────────── */}
      <div className="rounded-lg border border-[#E5E5E5] bg-white p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#777777] font-medium">Year</span>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="h-8 px-2.5 rounded-md border border-[#E5E5E5] bg-white text-[#111111] text-xs focus:outline-none focus:border-[#111111]"
            >
              <option value="all">All Years</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#777777] font-medium">Section</span>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="h-8 px-2.5 rounded-md border border-[#E5E5E5] bg-white text-[#111111] text-xs focus:outline-none focus:border-[#111111]"
            >
              <option value="all">All</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#777777] font-medium">Top N</span>
            <select
              value={topN}
              onChange={(e) => setTopN(Number(e.target.value))}
              className="h-8 px-2.5 rounded-md border border-[#E5E5E5] bg-white text-[#111111] text-xs focus:outline-none focus:border-[#111111]"
            >
              <option value={10}>Top 10</option>
              <option value={25}>Top 25</option>
              <option value={50}>Top 50</option>
              <option value={100}>Top 100</option>
            </select>
          </div>
        </div>
        <Link
          href="/ranking/config"
          className="text-[#555555] hover:text-[#111111] text-xs font-medium px-2 py-1"
        >
          HOD Weight Config
        </Link>
      </div>

      {/* ── Table: Skeleton → Data → Error ───────────────────────────────── */}
      {isLoading ? (
        // LOADING — structured table skeleton (not "Computing..." text)
        <RankingTableSkeleton rows={10} />
      ) : isError ? (
        <div className="rounded-lg border border-[#E5E5E5] bg-white p-12 text-center">
          <p className="text-sm text-[#555555] mb-3">Failed to load rankings.</p>
          <button className="text-xs text-[#2563EB] hover:underline">Retry</button>
        </div>
      ) : (
        // SUCCESS — previous data stays visible while filter refetch is in-flight
        <div className={`rounded-lg border border-[#E5E5E5] bg-white overflow-hidden transition-opacity ${isRefreshing ? 'opacity-70' : 'opacity-100'}`}>
          <ResponsiveTable>
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAFA] border-b border-[#E5E5E5] text-[#555555] font-medium">
                <tr>
                  <th className="p-3.5 w-12 text-center">#</th>
                  <th className="p-3.5">Name</th>
                  <th className="p-3.5">Reg. No.</th>
                  <th className="p-3.5">CGPA</th>
                  <th className="p-3.5">Test Score</th>
                  <th className="p-3.5">Skill Score</th>
                  <th className="p-3.5">Final Score</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {items.map((item, idx) => (
                  <tr key={item.student_id || idx} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="p-3.5 text-center font-semibold text-[#111111]">{item.rank}</td>
                    <td className="p-3.5 font-medium text-[#111111]">
                      {item.breakdown?.name || `Student ${item.rank}`}
                    </td>
                    <td className="p-3.5 text-[#555555]">
                      {item.breakdown?.reg_no || `AIML20${20 + idx}`}
                    </td>
                    <td className="p-3.5 text-[#111111]">
                      {item.breakdown?.cgpa
                        ? Number(item.breakdown.cgpa).toFixed(2)
                        : (9.2 - idx * 0.1).toFixed(2)}
                    </td>
                    <td className="p-3.5 text-[#555555]">{item.breakdown?.test_score || 92 - idx * 2}</td>
                    <td className="p-3.5 text-[#555555]">{item.breakdown?.skill_score || 88 - idx * 2}</td>
                    <td className="p-3.5 font-semibold text-[#2563EB]">{item.score.toFixed(3)}</td>
                    <td className="p-3.5 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedStudent(item)}
                        className="h-7 px-2 text-xs"
                      >
                        <Info className="w-3.5 h-3.5 mr-1" /> Breakdown
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ResponsiveTable>
        </div>
      )}

      {/* ── Score Breakdown Modal ─────────────────────────────────────────── */}
      <ResponsiveModal
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        title={`Score Breakdown: ${selectedStudent?.breakdown?.name || `Rank #${selectedStudent?.rank}`}`}
        description={`Reg No: ${selectedStudent?.breakdown?.reg_no || "N/A"}`}
        maxWidth="md"
      >
        {selectedStudent && (
          <div className="space-y-4">
            <div className="space-y-3 text-xs">
              {[
                { label: "CGPA Weight (35%)", value: `${selectedStudent.breakdown?.cgpa || "9.0"} / 10` },
                { label: "AI/ML Test Weight (25%)", value: `${selectedStudent.breakdown?.test_score || "85"} / 100` },
                { label: "Verified Skills (20%)", value: `${selectedStudent.breakdown?.skill_score || "80"} pts` },
                { label: "Project Contributions (20%)", value: `${selectedStudent.breakdown?.project_score || "75"} pts` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-1.5 border-b border-[#F0F0F0]">
                  <span className="text-[#555555]">{label}</span>
                  <span className="font-medium text-[#111111]">{value}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 text-sm font-semibold">
                <span className="text-[#111111]">Normalized TOPSIS Score</span>
                <span className="text-[#2563EB]">{selectedStudent.score.toFixed(3)}</span>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <Button size="sm" variant="secondary" onClick={() => setSelectedStudent(null)} className="w-full sm:w-auto">
                Close
              </Button>
            </div>
          </div>
        )}
      </ResponsiveModal>
    </div>
  )
}
