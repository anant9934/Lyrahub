"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useProjects } from "@/lib/hooks"
import { ProjectCard } from "@/components/features/projects/ProjectCard"
import { ProjectFilters } from "@/components/features/projects/ProjectFilters"
import { ProjectsGridSkeleton } from "@/components/ui/skeletons"
import { useDebounce } from "@/lib/use-debounce"
import { FolderGit2, Plus, BookOpen, Cpu, Layers, ArrowRight, Sparkles } from "lucide-react"

interface ProjectItem {
  id: string
  title: string
  slug: string
  summary?: string
  tech_stack?: string[]
  domain?: string
  status: string
  mentor_name?: string
  cover_image_url?: string
}

const DOMAIN_TILES = [
  { key: "", label: "All Projects", icon: Layers, color: "#1478ef", bg: "#EDF5FF" },
  { key: "ai_ml", label: "AI & ML", icon: Cpu, color: "#7C3AED", bg: "#F3EEFF" },
  { key: "web", label: "Web & Apps", icon: FolderGit2, color: "#0D9488", bg: "#E6FAFA" },
  { key: "research", label: "Research", icon: BookOpen, color: "#D97706", bg: "#FFF8E8" },
  { key: "genai", label: "GenAI", icon: Sparkles, color: "#E11D48", bg: "#FFF0F3" },
]

const DEFAULT_PROJECTS: ProjectItem[] = [
  {
    id: "proj-1",
    title: "Smart Attendance System",
    slug: "smart-attendance-system",
    summary: "Real-time edge facial recognition attendance tracking using OpenCV and deep embeddings.",
    domain: "cv",
    tech_stack: ["Python", "OpenCV", "TensorFlow", "FastAPI"],
    status: "ongoing",
    mentor_name: "Dr. Ravi Gupta",
  },
  {
    id: "proj-2",
    title: "AI Resume Analyzer & Matcher",
    slug: "ai-resume-analyzer",
    summary: "Automated candidate-job description semantic similarity ranking using Sentence-Transformers.",
    domain: "nlp",
    tech_stack: ["PyTorch", "HuggingFace", "Next.js", "pgvector"],
    status: "ongoing",
    mentor_name: "Dr. Kamalpreet Kaur",
  },
  {
    id: "proj-3",
    title: "Campus Navigation & Mapping Robot",
    slug: "campus-navigation-robot",
    summary: "Autonomous indoor SLAM mapping rover with lidar telemetry and obstacle avoidance.",
    domain: "robotics",
    tech_stack: ["ROS2", "Python", "C++", "Jetson Nano"],
    status: "ongoing",
    mentor_name: "Prof. Prajithaa Parani",
  },
]

export default function ProjectsPage() {
  const [search, setSearch] = useState("")
  const [domain, setDomain] = useState("")
  const [status, setStatus] = useState("")

  const debouncedSearch = useDebounce(search, 350)
  const { data, isLoading, isFetching, isError } = useProjects<ProjectItem>({
    search: debouncedSearch,
    domain,
    status,
  })

  const fetchedProjects: ProjectItem[] = Array.isArray(data) ? data : (data?.items ?? [])
  const projects: ProjectItem[] = fetchedProjects.length > 0 ? fetchedProjects : (!debouncedSearch && !domain && !status ? DEFAULT_PROJECTS : [])
  const isInitialLoad = isLoading
  const isRefreshing = isFetching && !isLoading

  return (
    <div className="space-y-5 max-w-7xl mx-auto">

      {/* ── Hero Banner ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[28px] p-6 sm:p-8 shadow-[0_8px_32px_rgba(20,120,239,0.10)]"
        style={{ background: "linear-gradient(135deg, #e6f1ff 0%, #f0f7ff 60%, #e6f1ff 100%)" }}
      >
        <div className="absolute -right-10 -top-10 h-52 w-52 rounded-full bg-[#1478ef]/15 blur-[60px]" />
        <div className="absolute -bottom-16 left-[30%] h-48 w-48 rounded-full bg-[#FFCF36]/20 blur-[60px]" />
        <span aria-hidden className="absolute right-6 top-5 text-4xl text-[#1478ef]/15 select-none">✦</span>

        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#1478ef]">
              <FolderGit2 className="w-4 h-4" />
              Student & Faculty Innovation
            </p>
            <h1 className="text-3xl font-black tracking-[-0.05em] text-[#071b3d] sm:text-4xl">
              Ideas become <span className="text-[#1478ef]">impact.</span>
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-[#526783]">
              Explore projects from students and faculty across AI, ML, and industry applications.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/projects/me"
              className="flex items-center gap-2 rounded-xl border border-[#C4DFFF] bg-white px-4 py-2.5 text-[12px] font-bold text-[#071b3d] shadow-sm transition hover:border-[#1478ef] hover:text-[#1478ef]"
            >
              My Projects
            </Link>
            <Link
              href="/projects/create"
              className="flex items-center gap-2 rounded-xl bg-[#071b3d] px-4 py-2.5 text-[12px] font-bold text-white shadow-sm transition hover:bg-[#1478ef]"
            >
              <Plus className="w-4 h-4" />
              New Project
            </Link>
          </div>
        </div>
      </div>

      {/* ── Domain Quick Tiles ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {DOMAIN_TILES.map((tile) => {
          const Icon = tile.icon
          const isActive = domain === tile.key
          return (
            <button
              key={tile.key}
              onClick={() => setDomain(tile.key)}
              className={`flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 text-[11px] font-bold transition-all ${
                isActive
                  ? "border-transparent text-white shadow-md"
                  : "border-[#D4E0F0] bg-white text-[#526783] hover:border-current hover:-translate-y-0.5"
              }`}
              style={isActive ? { background: tile.color, borderColor: tile.color } : undefined}
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors"
                style={{
                  background: isActive ? "rgba(255,255,255,0.2)" : tile.bg,
                  color: isActive ? "#fff" : tile.color,
                }}
              >
                <Icon className="w-4 h-4" />
              </span>
              {tile.label}
            </button>
          )
        })}
      </div>

      {/* ── Filters bar ──────────────────────────────────────────────────── */}
      <ProjectFilters
        search={search}
        onSearchChange={setSearch}
        domain={domain}
        onDomainChange={setDomain}
        status={status}
        onStatusChange={setStatus}
      />

      {/* ── Refresh indicator ────────────────────────────────────────────── */}
      {isRefreshing && (
        <div className="flex items-center gap-2 text-[11px] text-[#9ab5d0]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#1478ef] animate-pulse" />
          Refreshing projects…
        </div>
      )}

      {/* ── Content ──────────────────────────────────────────────────────── */}
      {isInitialLoad ? (
        <ProjectsGridSkeleton count={8} />
      ) : isError ? (
        <div className="rounded-2xl border border-[#D4E0F0] bg-white p-12 text-center shadow-sm">
          <FolderGit2 className="mx-auto h-12 w-12 text-[#D4E0F0] mb-4" />
          <h3 className="text-[16px] font-black text-[#091936] mb-2">Couldn&apos;t load projects</h3>
          <p className="text-sm text-[#526783] mb-5">There was a problem fetching the project repository.</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl bg-[#071b3d] px-5 py-2 text-[12px] font-bold text-white hover:bg-[#1478ef] transition"
          >
            Retry
          </button>
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-[#D4E0F0] bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EDF5FF]">
            <FolderGit2 className="h-8 w-8 text-[#1478ef]" />
          </div>
          <h3 className="text-[16px] font-black text-[#091936] mb-2">No projects found</h3>
          <p className="text-sm text-[#526783] mb-6">
            {debouncedSearch || domain || status
              ? "No projects match your filters. Try adjusting the search."
              : "Be the first to publish an AI/ML research or industry capstone project!"}
          </p>
          {!debouncedSearch && !domain && !status && (
            <Link
              href="/projects/create"
              className="inline-flex items-center gap-2 rounded-xl bg-[#071b3d] px-5 py-2.5 text-[12px] font-bold text-white transition hover:bg-[#1478ef]"
            >
              <Plus className="w-4 h-4" />
              Create Project
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
