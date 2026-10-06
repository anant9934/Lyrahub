"use client";

import React, { useState, useEffect } from "react";
import { getCookie } from "cookies-next";
import { format } from "date-fns";

export default function MyAchievementsPage() {
  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    setIsLoading(true);
    try {
      // For now we just fetch all achievements since we lack a /me endpoint explicitly
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

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-[#0F172A] mb-8">My Achievements</h1>

      {isLoading ? (
        <div className="text-center py-10">Loading achievements...</div>
      ) : achievements.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No achievements recorded yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {achievements.map((ach: any) => (
            <div key={ach.id} className="bg-white border border-[#DCE5F1] rounded-lg p-5 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase bg-gray-200 text-gray-800`}>
                  {ach.level || "Award"}
                </span>
                <span className="text-xs font-bold text-white bg-[#EE8E1E] px-2 py-1 rounded-full">
                  {ach.is_verified ? "Verified" : "Pending"}
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#0F172A] mb-1">{ach.title}</h3>
              <p className="text-sm text-gray-700">{ach.category}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
