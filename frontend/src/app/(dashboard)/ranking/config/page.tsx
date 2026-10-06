"use client";

import React, { useState, useEffect } from "react";
import { WeightSlider } from "@/components/features/ranking/WeightSlider";
import { getCookie } from "cookies-next";

export default function RankingConfigPage() {
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [version, setVersion] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/ranking/config", {
      headers: { "Authorization": `Bearer ${getCookie("token")}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then(data => {
        setWeights(data.weights);
        setVersion(data.version);
      })
      .catch(e => {
        console.error(e);
        // Toast or redirect non-HOD
      });
  }, []);

  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const is100 = Math.abs(total - 1.0) < 0.001;

  const handleSave = async () => {
    if (!is100) return;
    setIsSaving(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/ranking/config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getCookie("token")}`
        },
        body: JSON.stringify({ weights })
      });
      if (res.ok) {
        const data = await res.json();
        setVersion(data.version);
        alert("Configuration saved. Rankings will be recalculated automatically.");
      } else {
        alert("Failed to save. You must be an HOD.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const labels: Record<string, string> = {
    test_score: "Test Score",
    cgpa: "CGPA",
    certifications: "Certifications",
    projects: "Projects",
    coding_stats: "Coding Stats",
    resume_quality: "Resume Quality",
    internships: "Internships",
    revenue: "Revenue"
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Ranking Engine Configuration</h1>
      <p className="text-gray-500 mb-8">Current Version: v{version}</p>

      <div className="bg-white p-8 rounded-lg border border-[#DCE5F1] mb-8">
        <h2 className="text-xl font-bold text-[#0F172A] mb-6">Algorithm Weights</h2>
        {Object.keys(weights).map(key => (
          <WeightSlider
            key={key}
            label={labels[key] || key}
            value={weights[key]}
            onChange={(val) => setWeights({ ...weights, [key]: val })}
          />
        ))}

        <div className="mt-8 pt-4 border-t border-[#DCE5F1] flex justify-between items-center">
          <div className={`text-lg font-bold ${is100 ? 'text-[#94BD88]' : 'text-red-500'}`}>
            Total: {(total * 100).toFixed(1)}%
          </div>
          <button
            onClick={handleSave}
            disabled={!is100 || isSaving}
            className="px-6 py-2 bg-[#0F172A] text-white rounded hover:bg-gray-800 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </div>
    </div>
  );
}
