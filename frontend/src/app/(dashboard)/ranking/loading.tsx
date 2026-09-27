import { RankingTableSkeleton } from "@/components/ui/skeletons";

export default function RankingLoading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-40 animate-pulse rounded bg-[#F0F0F0]" />
          <div className="h-3 w-56 animate-pulse rounded bg-[#F0F0F0]" />
        </div>
        <div className="h-9 w-28 animate-pulse rounded-lg bg-[#F0F0F0]" />
      </div>
      {/* Filter bar */}
      <div className="h-12 w-full animate-pulse rounded-lg bg-[#F0F0F0]" />
      {/* Table */}
      <RankingTableSkeleton rows={10} />
    </div>
  );
}
