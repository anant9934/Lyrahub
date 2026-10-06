"use client";

import React, { useState } from "react";
import { FilterBar } from "@/components/features/ranking/FilterBar";
import { getCookie } from "cookies-next";

export default function ExportPage() {
  const [filters, setFilters] = useState({});
  const [format, setFormat] = useState("csv");

  const handleDownload = () => {
    const query = new URLSearchParams({ ...filters, format } as any).toString();
    const url = `http://localhost:8000/api/v1/ranking/export?${query}`;
    
    // Simplest way to download a file with auth is fetching it as a blob
    fetch(url, {
      headers: { "Authorization": `Bearer ${getCookie("token")}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Export failed");
        return res.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `ranking-export.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(e => {
        alert("Failed to export rankings. Make sure rankings are calculated.");
      });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-[#0F172A] mb-6">Export Rankings</h1>
      
      <div className="bg-white p-8 rounded-lg border border-[#DCE5F1] mb-8">
        <h2 className="text-xl font-bold text-[#0F172A] mb-4">Export Filters</h2>
        <FilterBar filters={filters} setFilters={setFilters} />
        
        <h2 className="text-xl font-bold text-[#0F172A] mb-4 mt-8">Format</h2>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input type="radio" value="csv" checked={format === "csv"} onChange={() => setFormat("csv")} className="accent-[#EE8E1E]" />
            CSV
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" value="pdf" checked={format === "pdf"} onChange={() => setFormat("pdf")} className="accent-[#EE8E1E]" />
            PDF
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" value="xlsx" checked={format === "xlsx"} onChange={() => setFormat("xlsx")} className="accent-[#EE8E1E]" />
            Excel
          </label>
        </div>

        <div className="mt-8 pt-4 border-t border-[#DCE5F1]">
          <button
            onClick={handleDownload}
            className="px-6 py-2 bg-[#EE8E1E] text-white rounded hover:bg-[#d67b15]"
          >
            Download {format.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
}
