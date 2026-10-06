"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getCookie } from "cookies-next";
import { format } from "date-fns";
import { Trophy } from "lucide-react";
import { WorkspaceHero } from "@/components/layout/WorkspaceHero";

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/achievements", {
        headers: { "Authorization": `Bearer ${getCookie("token")}` }
      });
      const data = await res.json();
      setAchievements(data.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const levelColors: Record<string, string> = {
    international: "bg-[#EE8E1E] text-white", // amber
    national: "bg-[#94BD88] text-white", // sage
    state: "bg-[#7195BB] text-white", // info
    university: "bg-[#0F172A] text-white", // ink
    college: "bg-gray-200 text-gray-800",
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-8">
      <WorkspaceHero eyebrow="Rewards & recognition" title={<>Your effort <span className="text-[#b97800]">deserves more.</span></>} description="Celebrate the achievements, contributions, and moments that move our community forward." tone="yellow" icon={Trophy} actions={<>
          <Link href="/achievements/me" className="rounded-full border border-[#efd695] bg-white px-4 py-2.5 text-xs font-bold text-[#081a39] transition hover:bg-[#fffbeb]">
            My Achievements
          </Link>
          <Link href="/achievements/create" className="rounded-full bg-[#081a39] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#1478ef]">
            Add Achievement
          </Link>
      </>}/>

      {isLoading ? (
        <div className="text-center py-10">Loading achievements...</div>
      ) : achievements.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No achievements recorded yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {achievements.map((ach: any) => (
            <div key={ach.id} className="rounded-[24px] border border-[#DCE5F1] bg-white p-5 shadow-[0_9px_25px_rgba(8,26,57,0.05)] transition hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(8,26,57,0.1)]">
              <div className="flex justify-between items-start mb-3">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${levelColors[ach.level] || levelColors.college}`}>
                  {ach.level || "Award"}
                </span>
                <span className="text-xs text-gray-400">
                  {ach.achieved_on ? format(new Date(ach.achieved_on), "MMM yyyy") : ""}
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#0F172A] mb-1">{ach.title}</h3>
              <p className="text-sm font-semibold text-[#EE8E1E] mb-3">{ach.category}</p>
              <p className="text-xs text-gray-500 mb-4">{ach.issuer}</p>
              <p className="text-sm text-gray-700 line-clamp-3">{ach.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
