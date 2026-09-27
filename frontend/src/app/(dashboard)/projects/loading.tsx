import { ProjectsGridSkeleton } from "@/components/ui/skeletons";

export default function ProjectsLoading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded bg-[#F0F0F0]" />
          <div className="h-3 w-64 animate-pulse rounded bg-[#F0F0F0]" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 animate-pulse rounded-lg bg-[#F0F0F0]" />
          <div className="h-9 w-28 animate-pulse rounded-lg bg-[#F0F0F0]" />
        </div>
      </div>
      {/* Filter bar skeleton */}
      <div className="h-12 w-full animate-pulse rounded-lg bg-[#F0F0F0]" />
      <ProjectsGridSkeleton count={8} />
    </div>
  );
}
