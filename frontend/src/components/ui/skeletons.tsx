/**
 * Skeleton primitives — used across the app to show structural loading states.
 * Skeletons must match the ACTUAL content dimensions they replace.
 *
 * Rules:
 *  • Never show a skeleton for an operation that completes < 150 ms.
 *  • Never show generic spinners for whole-page loads.
 *  • Never show "Loading..." text while a skeleton is already there.
 */

import React from 'react';

// ── Base pulse element ────────────────────────────────────────────────────────
function Pulse({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded bg-[#F0F0F0] ${className}`}
      aria-hidden="true"
      style={style}
    />
  );
}

// ── Page-level skeletons ──────────────────────────────────────────────────────

/** Full dashboard page shell skeleton */
export function DashboardPageSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto" aria-busy="true" aria-label="Loading dashboard">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Pulse className="h-7 w-48" />
          <Pulse className="h-3 w-64" />
        </div>
        <Pulse className="h-8 w-32" />
      </div>
      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      {/* Charts + secondary content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartSkeleton height={220} />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <ListItemSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Card skeletons ────────────────────────────────────────────────────────────

/** Matches ProjectCard dimensions */
export function ProjectCardSkeleton() {
  return (
    <div
      className="bg-white rounded-xl border border-[#DCE5F1] overflow-hidden"
      aria-hidden="true"
    >
      {/* Thumbnail area */}
      <Pulse className="h-32 w-full rounded-none" />
      <div className="p-4 space-y-3">
        {/* Title */}
        <Pulse className="h-4 w-3/4" />
        {/* Subtitle */}
        <Pulse className="h-3 w-full" />
        <Pulse className="h-3 w-5/6" />
        {/* Badges */}
        <div className="flex gap-2 pt-1">
          <Pulse className="h-5 w-16 rounded-full" />
          <Pulse className="h-5 w-12 rounded-full" />
        </div>
        {/* Button */}
        <Pulse className="h-8 w-full rounded-lg mt-2" />
      </div>
    </div>
  );
}

/** Grid of ProjectCardSkeletons */
export function ProjectsGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      aria-busy="true"
      aria-label="Loading projects"
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Matches CourseCard dimensions */
export function CourseCardSkeleton() {
  return (
    <div
      className="bg-white rounded-xl border border-[#DCE5F1] p-5 space-y-3"
      aria-hidden="true"
    >
      {/* Course code + type badge */}
      <div className="flex items-center gap-2">
        <Pulse className="h-5 w-16 rounded-full" />
        <Pulse className="h-5 w-12 rounded-full" />
      </div>
      {/* Title */}
      <Pulse className="h-4 w-3/4" />
      {/* Description */}
      <Pulse className="h-3 w-full" />
      <Pulse className="h-3 w-5/6" />
      {/* Credits / semester */}
      <div className="flex gap-3 pt-1">
        <Pulse className="h-4 w-20" />
        <Pulse className="h-4 w-16" />
      </div>
      {/* Button */}
      <Pulse className="h-8 w-28 rounded-lg mt-2" />
    </div>
  );
}

/** Grid of CourseCardSkeletons */
export function CoursesGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      aria-busy="true"
      aria-label="Loading courses"
    >
      {Array.from({ length: count }).map((_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Ranking table skeleton — replaces "Computing..." text */
export function RankingTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div
      className="rounded-lg border border-[#DCE5F1] bg-white overflow-hidden"
      aria-busy="true"
      aria-label="Loading rankings"
    >
      {/* Table header */}
      <div className="bg-[#F6F8FC] border-b border-[#DCE5F1] px-4 py-3 grid grid-cols-8 gap-4">
        {['w-6', 'w-24', 'w-20', 'w-16', 'w-16', 'w-16', 'w-16', 'w-16'].map((w, i) => (
          <Pulse key={i} className={`h-3 ${w}`} />
        ))}
      </div>
      {/* Table rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="px-4 py-3 grid grid-cols-8 gap-4 border-b border-[#EDF4FC] last:border-0"
        >
          <Pulse className="h-3 w-4" />
          <Pulse className="h-3 w-24" />
          <Pulse className="h-3 w-20" />
          <Pulse className="h-3 w-12" />
          <Pulse className="h-3 w-10" />
          <Pulse className="h-3 w-10" />
          <Pulse className="h-3 w-12" />
          <Pulse className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

// ── Stat card skeleton ────────────────────────────────────────────────────────
export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-[#DCE5F1] p-5 space-y-3" aria-hidden="true">
      <div className="flex items-center justify-between">
        <Pulse className="h-3 w-24" />
        <Pulse className="h-8 w-8 rounded-lg" />
      </div>
      <Pulse className="h-7 w-16" />
      <Pulse className="h-3 w-20" />
    </div>
  );
}

// ── Chart skeleton ────────────────────────────────────────────────────────────
export function ChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div
      className="bg-white rounded-xl border border-[#DCE5F1] p-5"
      aria-hidden="true"
      style={{ height: height + 40 }}
    >
      <Pulse className="h-4 w-32 mb-4" />
      <Pulse className="w-full rounded-lg" style={{ height }} />
    </div>
  );
}

// ── Table skeleton (generic) ──────────────────────────────────────────────────
export function TableSkeleton({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div
      className="rounded-lg border border-[#DCE5F1] bg-white overflow-hidden"
      aria-busy="true"
    >
      <div className="bg-[#F6F8FC] border-b border-[#DCE5F1] px-4 py-3 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Pulse key={i} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-4 py-3 flex gap-4 border-b border-[#EDF4FC] last:border-0">
          {Array.from({ length: cols }).map((_, j) => (
            <Pulse key={j} className="h-3 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// ── List item skeleton ────────────────────────────────────────────────────────
export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-[#F0F0F0]" aria-hidden="true">
      <Pulse className="h-8 w-8 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Pulse className="h-3 w-3/4" />
        <Pulse className="h-2 w-1/2" />
      </div>
      <Pulse className="h-6 w-12 rounded-full" />
    </div>
  );
}

// ── Auth / full-page shell skeleton ──────────────────────────────────────────

/**
 * Shown during the initial auth check (replaces blank white screen + centre spinner).
 * Renders a credible AIMETRA shell so the user sees the layout immediately.
 */
export function AuthShellSkeleton() {
  return (
    <div className="min-h-screen bg-white flex" aria-busy="true" aria-label="Loading AIMETRA">
      {/* Sidebar skeleton */}
      <div className="hidden md:flex flex-col w-60 border-r border-[#DCE5F1] bg-white p-5 space-y-2 shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <Pulse className="h-7 w-7 rounded-md" />
          <Pulse className="h-4 w-20" />
        </div>
        {/* Nav items */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2">
            <Pulse className="h-4 w-4 rounded" />
            <Pulse className="h-3 flex-1" />
          </div>
        ))}
      </div>
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <div className="h-16 border-b border-[#DCE5F1] px-6 flex items-center justify-between">
          <Pulse className="h-5 w-32" />
          <div className="flex items-center gap-3">
            <Pulse className="h-9 w-48 rounded-lg hidden sm:block" />
            <Pulse className="h-8 w-8 rounded-full" />
          </div>
        </div>
        {/* Content area */}
        <div className="flex-1 p-6 lg:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <Pulse className="h-7 w-40" />
            <Pulse className="h-8 w-28 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
          <Pulse className="h-56 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
