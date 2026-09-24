"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getCookie } from "cookies-next";
import { format } from "date-fns";

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
    university: "bg-[#1E1E1E] text-white", // ink
    college: "bg-gray-200 text-gray-800",
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#1E1E1E]">Hall of Fame</h1>
        <div className="flex gap-4">
          <Link href="/achievements/me" className="px-4 py-2 text-[#1E1E1E] bg-[#D6D6D6] rounded hover:bg-gray-300 transition">
            My Achievements
          </Link>
          <Link href="/achievements/create" className="px-4 py-2 text-white bg-[#EE8E1E] rounded hover:bg-[#d67b15] transition">
            Add Achievement
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading achievements...</div>
      ) : achievements.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No achievements recorded yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {achievements.map((ach: any) => (
            <div key={ach.id} className="bg-white border border-[#D6D6D6] rounded-lg p-5 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${levelColors[ach.level] || levelColors.college}`}>
                  {ach.level || "Award"}
                </span>
                <span className="text-xs text-gray-400">
                  {ach.achieved_on ? format(new Date(ach.achieved_on), "MMM yyyy") : ""}
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#1E1E1E] mb-1">{ach.title}</h3>
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
