"use client"

import React from "react"
import Link from "next/link"
import { ArrowUpRight, GitBranch, User } from "lucide-react"

interface ProjectCardProps {
  project: {
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
}

const DOMAIN_META: Record<string, { label: string; color: string; bg: string }> = {
  cv:        { label: "Computer Vision", color: "#0D9488", bg: "#E6FAFA" },
  nlp:       { label: "NLP",             color: "#D97706", bg: "#FFF8E8" },
  llm:       { label: "LLM",             color: "#7C3AED", bg: "#F3EEFF" },
  mlops:     { label: "MLOps",           color: "#E11D48", bg: "#FFF0F3" },
  robotics:  { label: "Robotics",        color: "#1478ef", bg: "#EDF5FF" },
  ai_ml:     { label: "AI & ML",         color: "#1478ef", bg: "#EDF5FF" },
  research:  { label: "Research",        color: "#D97706", bg: "#FFF8E8" },
  web:       { label: "Web & Apps",      color: "#0D9488", bg: "#E6FAFA" },
  genai:     { label: "GenAI",           color: "#E11D48", bg: "#FFF0F3" },
}

const STATUS_META: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  ongoing:   { label: "Active",    color: "#15803D", bg: "#DCFCE7", dot: "#22C55E" },
  completed: { label: "Done",      color: "#1D4ED8", bg: "#DBEAFE", dot: "#3B82F6" },
  abandoned: { label: "Paused",    color: "#B91C1C", bg: "#FEE2E2", dot: "#EF4444" },
  archived:  { label: "Archived",  color: "#526783", bg: "#F0F4FA", dot: "#9ab5d0" },
}

export function ProjectCard({ project }: ProjectCardProps) {
  const domainKey = project.domain?.toLowerCase() || ""
  const statusKey = project.status?.toLowerCase() || "ongoing"
  const domain = DOMAIN_META[domainKey] || { label: project.domain || "AI/ML", color: "#526783", bg: "#F0F4FA" }
  const status = STATUS_META[statusKey] || STATUS_META.ongoing

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-[#D4E0F0] bg-white shadow-[0_1px_3px_rgba(9,25,54,0.06)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(9,25,54,0.10)] hover:border-[#A8C8FF]">
      {/* Cover image / placeholder */}
      <div
        className="relative h-36 shrink-0 overflow-hidden bg-gradient-to-br from-[#E8F0FB] to-[#F0F4FA]"
        style={project.cover_image_url ? { backgroundImage: `url(${project.cover_image_url})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
      >
        {!project.cover_image_url && (
          <div className="flex h-full items-center justify-center">
            <GitBranch className="h-12 w-12 text-[#D4E0F0]" />
          </div>
        )}
        {/* Status badge overlay */}
        <div
          className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold shadow-sm"
          style={{ background: status.bg, color: status.color }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: status.dot }} />
          {status.label}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        {/* Domain badge */}
        <span
          className="mb-2 self-start rounded-full px-2.5 py-0.5 text-[10px] font-bold"
          style={{ background: domain.bg, color: domain.color }}
        >
          {domain.label}
        </span>

        {/* Title */}
        <h3 className="line-clamp-2 text-[14px] font-black leading-tight text-[#091936] group-hover:text-[#1478ef] transition-colors">
          {project.title}
        </h3>

        {/* Summary */}
        {project.summary && (
          <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-[#526783]">
            {project.summary}
          </p>
        )}

        {/* Tech stack */}
        {project.tech_stack && project.tech_stack.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {project.tech_stack.slice(0, 4).map((tech, i) => (
              <span
                key={i}
                className="rounded-lg border border-[#E8F0FB] bg-[#F8FBFF] px-2 py-0.5 font-mono text-[10px] text-[#3D5A80]"
              >
                {tech}
              </span>
            ))}
            {project.tech_stack.length > 4 && (
              <span className="self-center text-[10px] text-[#9ab5d0]">
                +{project.tech_stack.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between border-t border-[#F0F4FA] pt-3 gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <User className="h-3.5 w-3.5 shrink-0 text-[#9ab5d0]" />
            <span className="truncate text-[11px] text-[#526783]">
              {project.mentor_name || "Self-guided"}
            </span>
          </div>
          <Link
            href={`/projects/${project.slug}`}
            className="flex shrink-0 items-center gap-1 rounded-xl bg-[#071b3d] px-3 py-1.5 text-[11px] font-bold text-white transition-all hover:bg-[#1478ef] group-hover:bg-[#1478ef]"
          >
            View
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
