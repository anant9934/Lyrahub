"use client";

import React from "react";
import Link from "next/link";

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    slug: string;
    summary?: string;
    tech_stack?: string[];
    domain?: string;
    status: string;
    mentor_name?: string;
    cover_image_url?: string;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const domainColors: Record<string, string> = {
    cv: "bg-[#94B0B8]/20 text-[#2C4A52]",
    nlp: "bg-[#EAF0F3] text-[#6B8FA3]",
    llm: "bg-[#EEBE1E]/20 text-[#855B00]",
    mlops: "bg-[#1E1E1E] text-white",
    robotics: "bg-[#FAF3E2] text-[#B37F1D]",
  };

  const statusColors: Record<string, string> = {
    ongoing: "bg-[#94B0B8]/20 text-[#2C4A52]",
    completed: "bg-[#EEF3EE] text-[#7A9A7E]",
    abandoned: "bg-[#F5EAEA] text-[#B85C5C]",
    archived: "bg-gray-100 text-[#5C5C5C]",
  };

  const domainBadge = domainColors[project.domain?.toLowerCase() || ""] || "bg-gray-100 text-gray-700";
  const statusBadge = statusColors[project.status?.toLowerCase() || "ongoing"] || "bg-gray-100 text-gray-700";

  return (
    <div className="responsive-card bg-white border border-[#D6D6D6] rounded-xl overflow-hidden hover:shadow-md transition duration-200 flex flex-col justify-between">
      <div
        className="h-36 bg-gray-100 bg-cover bg-center border-b border-[#D6D6D6]"
        style={{
          backgroundImage: `url(${project.cover_image_url || "/placeholder-project.jpg"})`,
        }}
      />
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${domainBadge}`}>
              {project.domain || "AI/ML"}
            </span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusBadge}`}>
              {project.status || "ongoing"}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-[#1E1E1E] mb-1.5 leading-snug line-clamp-2">{project.title}</h3>
          <p className="text-xs text-[#5C5C5C] mb-3 line-clamp-2">
            {project.summary || "No project summary provided."}
          </p>

          {project.tech_stack && project.tech_stack.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {project.tech_stack.slice(0, 4).map((tech, idx) => (
                <span
                  key={idx}
                  className="text-[11px] font-mono bg-[#F2F2F1] text-[#1E1E1E] px-2 py-0.5 rounded border border-[#D6D6D6]"
                >
                  {tech}
                </span>
              ))}
              {project.tech_stack.length > 4 && (
                <span className="text-[11px] text-[#5C5C5C] px-1 self-center">
                  +{project.tech_stack.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-[#D6D6D6]/60 flex items-center justify-between mt-auto gap-2">
          <div className="text-xs text-[#5C5C5C] truncate flex-1 min-w-0">
            {project.mentor_name ? `Mentor: ${project.mentor_name}` : "Self-guided"}
          </div>
          <Link
            href={`/projects/${project.slug}`}
            className="text-xs font-semibold px-3 py-1.5 bg-[#1E1E1E] text-white rounded-lg hover:bg-gray-800 transition shrink-0"
          >
            Details →
          </Link>
        </div>
      </div>
    </div>
  );
}
