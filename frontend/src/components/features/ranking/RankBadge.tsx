import React from "react";

export function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#EE8E1E] text-white font-bold">1</span>;
  if (rank === 2) return <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#94BD88] text-white font-bold">2</span>;
  if (rank === 3) return <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white font-bold">3</span>;
  return <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-700 font-bold">{rank}</span>;
}
