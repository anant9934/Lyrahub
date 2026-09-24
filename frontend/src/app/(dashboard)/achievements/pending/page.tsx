"use client";

import React, { useState, useEffect } from "react";
import { getCookie } from "cookies-next";

export default function PendingAchievementsPage() {
  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPendingAchievements();
  }, []);

  const fetchPendingAchievements = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/achievements", {
        headers: { "Authorization": `Bearer ${getCookie("token")}` }
      });
      const data = await res.json();
      setAchievements((data.items || []).filter((a: any) => !a.is_verified));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/achievements/${id}/verify`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${getCookie("token")}` }
      });
      if (res.ok) {
        alert("Achievement verified!");
        fetchPendingAchievements();
      } else {
        alert("Failed to verify");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-[#1E1E1E] mb-8">Pending Verification</h1>

      {isLoading ? (
        <div className="text-center py-10">Loading pending achievements...</div>
      ) : achievements.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No pending achievements.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {achievements.map((ach: any) => (
            <div key={ach.id} className="bg-white border border-[#D6D6D6] rounded-lg p-5 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-[#1E1E1E] mb-1">{ach.title}</h3>
                <p className="text-sm font-semibold text-[#EE8E1E] mb-1">{ach.category} | {ach.level}</p>
                <p className="text-sm text-gray-700">{ach.description}</p>
              </div>
              <button 
                onClick={() => handleVerify(ach.id)}
                className="px-6 py-2 bg-[#94BD88] text-white font-bold rounded hover:bg-green-600 transition"
              >
                Approve
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
