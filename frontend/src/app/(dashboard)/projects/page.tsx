"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useProjects } from "@/lib/hooks";
import { ProjectCard } from "@/components/features/projects/ProjectCard";
import { ProjectFilters } from "@/components/features/projects/ProjectFilters";
import { ProjectsGridSkeleton } from "@/components/ui/skeletons";
import { useDebounce } from "@/lib/use-debounce";

interface ProjectItem {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  tech_stack?: string[];
  domain?: string;
  status: string;
  mentor_name?: string;
  cover_image_url?: string;
}

export default function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("");
  const [status, setStatus] = useState("");

  // Debounce search so we don't fire a new request on every keystroke
  const debouncedSearch = useDebounce(search, 350);

  const { data, isLoading, isFetching, isError } = useProjects<ProjectItem>({
    search: debouncedSearch,
    domain,
    status,
  });

  const projects: ProjectItem[] = Array.isArray(data) ? data : (data?.items ?? []);

  // Three explicit states: LOADING | SUCCESS_WITH_DATA | SUCCESS_EMPTY
  // isFetching === true while refetching with previous data visible
  const isInitialLoad = isLoading;
  const isRefreshing = isFetching && !isLoading;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Page header (always immediate) ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111]">
            Projects Repository
          </h1>
          <p className="text-xs text-[#555555] mt-1">
            Department AI/ML projects, faculty-mentored research, and student innovation showcase.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/projects/me"
            className="px-3.5 py-2 text-xs font-medium text-[#111111] bg-white border border-[#E5E5E5] rounded-lg hover:bg-[#FAFAFA] transition"
          >
            My Projects
          </Link>
          <Link
            href="/projects/create"
            className="px-3.5 py-2 text-xs font-medium text-white bg-[#111111] rounded-lg hover:bg-neutral-800 transition"
          >
            + New Project
          </Link>
        </div>
      </div>

      {/* ── Filters (always immediate) ───────────────────────────────────── */}
      <ProjectFilters
        search={search}
        onSearchChange={setSearch}
        domain={domain}
        onDomainChange={setDomain}
        status={status}
        onStatusChange={setStatus}
      />

      {/* ── Subtle refresh indicator ─────────────────────────────────────── */}
      {isRefreshing && (
        <div className="flex items-center gap-2 text-[10px] text-[#888888]">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse" />
          Refreshing…
        </div>
      )}

      {/* ── Content: Skeleton → Data → Empty → Error ────────────────────── */}
      {isInitialLoad ? (
        // LOADING: show card skeletons matching actual project card dimensions
        <ProjectsGridSkeleton count={8} />
      ) : isError ? (
        // ERROR state
        <div className="p-12 text-center bg-white border border-[#D6D6D6] rounded-2xl shadow-sm">
          <h3 className="text-lg font-bold text-[#1E1E1E] mb-2">Couldn&apos;t load projects</h3>
          <p className="text-sm text-[#5C5C5C] mb-6">
            There was a problem fetching the projects repository. Please check your connection.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-[#1E1E1E] text-white text-sm font-semibold rounded-xl hover:bg-gray-800"
          >
            Retry
          </button>
        </div>
      ) : projects.length > 0 ? (
        // SUCCESS WITH DATA
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((project: ProjectItem) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        // SUCCESS EMPTY — only shown after confirmed empty response
        <div className="p-12 text-center bg-white border border-[#D6D6D6] rounded-2xl shadow-sm">
          <h3 className="text-lg font-bold text-[#1E1E1E] mb-2">No projects found</h3>
          <p className="text-sm text-[#5C5C5C] mb-6">
            {debouncedSearch || domain || status
              ? "No projects match your filters. Try adjusting the search or filters."
              : "Be the first to publish an AI/ML research or industry capstone project!"}
          </p>
          {!debouncedSearch && !domain && !status && (
            <Link
              href="/projects/create"
              className="px-5 py-2.5 bg-[#1E1E1E] text-white text-sm font-semibold rounded-xl hover:bg-gray-800"
            >
              Create Project
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
