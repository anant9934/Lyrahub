import { CoursesGridSkeleton } from "@/components/ui/skeletons";

export default function CoursesLoading() {
  return (
    <div className="min-h-screen bg-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero skeleton */}
        <div className="h-52 w-full animate-pulse rounded-2xl bg-[#F0F0F0]" />
        {/* Filter bar */}
        <div className="h-12 w-full animate-pulse rounded-lg bg-[#F0F0F0]" />
        <CoursesGridSkeleton count={6} />
      </div>
    </div>
  );
}
