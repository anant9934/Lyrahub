"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  FileText,
  Upload,
  Search,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  ShieldCheck,
  FolderGit2,
  QrCode,
  ArrowUpRight,
  Filter,
} from "lucide-react"
import { WorkspaceHero } from "@/components/layout/WorkspaceHero"

interface DocumentItem {
  id: string
  name: string
  category: "Academic" | "Certificates" | "Resume" | "Research" | "Internal"
  format: "PDF" | "DOCX" | "ZIP"
  size: string
  uploadedDate: string
  status: "Verified" | "Pending" | "Draft"
  url?: string
}

const INITIAL_DOCS: DocumentItem[] = [
  {
    id: "doc-1",
    name: "Degree Certificate (2024)",
    category: "Academic",
    format: "PDF",
    size: "2.4 MB",
    uploadedDate: "May 12, 2025",
    status: "Verified",
  },
  {
    id: "doc-2",
    name: "Transcript (Semester 6)",
    category: "Academic",
    format: "PDF",
    size: "1.1 MB",
    uploadedDate: "Dec 18, 2025",
    status: "Verified",
  },
  {
    id: "doc-3",
    name: "Internship Certificate — DeepTech Labs",
    category: "Certificates",
    format: "PDF",
    size: "850 KB",
    uploadedDate: "Jan 10, 2026",
    status: "Pending",
  },
  {
    id: "doc-4",
    name: "Research Paper Draft (IEEE Template)",
    category: "Research",
    format: "PDF",
    size: "3.8 MB",
    uploadedDate: "Feb 04, 2026",
    status: "Verified",
  },
  {
    id: "doc-5",
    name: "Verified Resume — AI/ML Specialist",
    category: "Resume",
    format: "PDF",
    size: "420 KB",
    uploadedDate: "Feb 28, 2026",
    status: "Verified",
  },
  {
    id: "doc-6",
    name: "Department Ethics Clearance",
    category: "Internal",
    format: "PDF",
    size: "310 KB",
    uploadedDate: "Mar 01, 2026",
    status: "Draft",
  },
]

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState<string>("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [docs, setDocs] = useState<DocumentItem[]>(INITIAL_DOCS)

  const tabs = ["All", "Academic", "Certificates", "Resume", "Research", "Internal"]

  const filteredDocs = docs.filter((doc) => {
    const matchesTab = activeTab === "All" || doc.category === activeTab
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <WorkspaceHero
        eyebrow="AIMETRA Vault · Panel 23"
        title={<>Your <span className="text-[#1478ef]">Documents.</span></>}
        description="Verified transcripts, degree credentials, certifications, and research publication drafts."
        tone="blue"
        icon={FileText}
      />

      {/* ── Action Bar: Tabs & Search ────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Category Tabs (Matching Panel 23) */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-[#D4E0F0] bg-white p-1.5 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeTab === tab
                  ? "bg-[#071b3d] text-white shadow-sm"
                  : "text-[#526783] hover:text-[#091936] hover:bg-[#F0F4FA]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search & Upload Button */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#9ab5d0]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="h-9 w-full rounded-full border border-[#D4E0F0] bg-white pl-9 pr-3 text-xs text-[#091936] placeholder-[#9ab5d0] shadow-sm outline-none focus:border-[#1478ef]"
            />
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex h-9 items-center gap-2 rounded-full bg-[#1478ef] px-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#0f64cc]"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Upload</span>
          </button>
        </div>
      </div>

      {/* ── Document Table (Matching Panel 23) ────────────────────────────── */}
      <div className="overflow-hidden rounded-[24px] border border-[#D4E0F0] bg-white shadow-[0_4px_20px_rgba(9,25,54,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E8F0FB] bg-[#F8FBFE] text-[11px] font-black uppercase tracking-wider text-[#526783]">
                <th className="py-3.5 pl-6 pr-4">Document Name</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Size</th>
                <th className="px-4 py-3.5">Uploaded</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="py-3.5 pl-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4FA]">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#9ab5d0]">
                    No documents found matching the filter.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => {
                  const statusColors = {
                    Verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
                    Pending:  "bg-amber-50 text-amber-700 border-amber-200",
                    Draft:    "bg-slate-100 text-slate-700 border-slate-200",
                  }[doc.status]

                  const StatusIcon = {
                    Verified: CheckCircle2,
                    Pending: Clock,
                    Draft: AlertCircle,
                  }[doc.status]

                  return (
                    <tr
                      key={doc.id}
                      className="group transition hover:bg-[#F8FBFE]"
                    >
                      <td className="py-3.5 pl-6 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EDF5FF] text-[#1478ef]">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-bold text-[#091936] group-hover:text-[#1478ef] transition-colors">
                              {doc.name}
                            </span>
                            <span className="ml-2 rounded bg-[#F0F4FA] px-1.5 py-0.5 text-[10px] font-mono text-[#526783]">
                              {doc.format}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-[#526783]">
                        {doc.category}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[11px] text-[#526783]">
                        {doc.size}
                      </td>
                      <td className="px-4 py-3.5 text-[#9ab5d0]">
                        {doc.uploadedDate}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${statusColors}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {doc.status}
                        </span>
                      </td>
                      <td className="py-3.5 pl-4 pr-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            title="View Document"
                            onClick={() => alert(`Previewing ${doc.name}`)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#D4E0F0] text-[#526783] transition hover:border-[#1478ef] hover:text-[#1478ef] hover:bg-[#EDF5FF]"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            title="Download Document"
                            onClick={() => alert(`Downloading ${doc.name}`)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#D4E0F0] text-[#526783] transition hover:border-[#1478ef] hover:text-[#1478ef] hover:bg-[#EDF5FF]"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Quick Links ───────────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href="/dashboard/profile"
          className="group flex items-center justify-between rounded-2xl border border-[#D4E0F0] bg-white p-4 shadow-sm transition hover:border-[#1478ef] hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDF5FF] text-[#1478ef]">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#091936]">Resume & Profile</div>
              <div className="text-[11px] text-[#526783]">Manage verified credentials</div>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-[#9ab5d0] group-hover:text-[#1478ef]" />
        </Link>

        <Link
          href="/qr/my-code"
          className="group flex items-center justify-between rounded-2xl border border-[#D4E0F0] bg-white p-4 shadow-sm transition hover:border-[#1478ef] hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF8E8] text-[#D97706]">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#091936]">Student QR ID</div>
              <div className="text-[11px] text-[#526783]">Instant scan verification</div>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-[#9ab5d0] group-hover:text-[#D97706]" />
        </Link>

        <Link
          href="/projects/me"
          className="group flex items-center justify-between rounded-2xl border border-[#D4E0F0] bg-white p-4 shadow-sm transition hover:border-[#1478ef] hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3EEFF] text-[#7C3AED]">
              <FolderGit2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#091936]">Project Files</div>
              <div className="text-[11px] text-[#526783]">Attached repos and reports</div>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-[#9ab5d0] group-hover:text-[#7C3AED]" />
        </Link>
      </div>

      {/* ── Upload Modal Mock ────────────────────────────────────────────── */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F0F4FA] pb-3">
              <h3 className="text-sm font-black text-[#091936]">Upload New Document</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-xs font-bold text-[#9ab5d0] hover:text-[#091936]"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#526783]">
                  Document Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Semester 7 Grade Sheet"
                  className="mt-1 h-10 w-full rounded-xl border border-[#D4E0F0] px-3 text-xs outline-none focus:border-[#1478ef]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#526783]">
                  Category
                </label>
                <select className="mt-1 h-10 w-full rounded-xl border border-[#D4E0F0] px-3 text-xs outline-none focus:border-[#1478ef]">
                  <option>Academic</option>
                  <option>Certificates</option>
                  <option>Resume</option>
                  <option>Research</option>
                  <option>Internal</option>
                </select>
              </div>
              <div className="rounded-2xl border-2 border-dashed border-[#D4E0F0] p-6 text-center hover:border-[#1478ef]">
                <Upload className="mx-auto h-8 w-8 text-[#1478ef]" />
                <p className="mt-2 text-xs font-bold text-[#091936]">
                  Click or drag files here to upload
                </p>
                <p className="text-[10px] text-[#9ab5d0]">PDF, DOCX up to 10MB</p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="rounded-full px-4 py-2 text-xs font-semibold text-[#526783] hover:bg-[#F0F4FA]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert("Document queued for verification!")
                    setShowUploadModal(false)
                  }}
                  className="rounded-full bg-[#1478ef] px-5 py-2 text-xs font-bold text-white hover:bg-[#0f64cc]"
                >
                  Upload & Verify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
