"use client";

import React, { useState, useEffect } from "react";
import { RadarBreakdown } from "@/components/features/ranking/RadarBreakdown";
import { getCookie } from "cookies-next";

export default function MyRankingPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/v1/ranking/me`, {
          headers: { "Authorization": `Bearer ${getCookie("token")}` }
        });
        if (res.ok) {
          const d = await res.json();
          setData(d);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMe();
  }, []);

  if (isLoading) return <div className="p-8 text-center">Loading your ranking...</div>;
  if (!data) return <div className="p-8 text-center text-gray-500">No ranking data found for you yet.</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col gap-8">
      <div className="bg-white p-8 rounded-lg border border-[#DCE5F1] text-center">
        <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Your Rank</h1>
        <div className="text-5xl font-black text-[#94BD88]">#{data.rank}</div>
        <p className="mt-4 text-gray-500 text-lg">Overall Score: <span className="font-bold text-[#0F172A]">{data.score.toFixed(2)}</span></p>
      </div>

      <div className="bg-white p-8 rounded-lg border border-[#DCE5F1]">
        <h2 className="text-xl font-bold text-[#0F172A] mb-6">Performance Breakdown</h2>
        <RadarBreakdown breakdown={data.breakdown} />
      </div>
    </div>
  );
}
