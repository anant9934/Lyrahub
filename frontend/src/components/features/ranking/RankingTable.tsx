import React from "react";
import { RankBadge } from "./RankBadge";

export function RankingTable({ items, isLoading }: { items: any[], isLoading: boolean }) {
  if (isLoading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading rankings...</div>;
  }
  
  if (!items || items.length === 0) {
    return <div className="p-8 text-center text-gray-500">No rankings yet. Ask HOD to run recalculation.</div>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[#DCE5F1] bg-white">
      <table className="min-w-full divide-y divide-[#D6D6D6]">
        <thead className="bg-[#F6F8FC]">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#0F172A] uppercase tracking-wider">Rank</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#0F172A] uppercase tracking-wider">Reg No</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#0F172A] uppercase tracking-wider">CGPA</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#0F172A] uppercase tracking-wider">Score</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-[#D6D6D6]">
          {items.map((item, idx) => {
            let rowClass = "";
            if (item.rank === 1) rowClass = "border-l-4 border-l-[#EE8E1E]";
            else if (item.rank === 2) rowClass = "border-l-4 border-l-[#94BD88]";
            else if (item.rank === 3) rowClass = "border-l-4 border-l-blue-500";
            else rowClass = "border-l-4 border-l-transparent";

            return (
              <tr key={item.student_id} className={`hover:bg-[#F6F8FC] transition-colors ${rowClass}`}>
                <td className="px-6 py-4 whitespace-nowrap"><RankBadge rank={item.rank} /></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#0F172A] font-medium">{item.breakdown?.reg_no || "N/A"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.breakdown?.cgpa?.toFixed(2) || "0.00"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-bold">{item.score.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
