"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ProjectCard } from "@/components/features/projects/ProjectCard";

export default function MyProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"my" | "mentoring">("my");
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    fetchMyProjects();
  }, []);

  const fetchMyProjects = async () => {
    setLoading(true);
    try {
      const meRes = await fetch("http://localhost:8000/api/v1/auth/me", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      });
      if (meRes.ok) {
        const user = await meRes.json();
        setCurrentUserId(user.id);
      }

      const res = await fetch("http://localhost:8000/api/v1/projects/me", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((p: any) => {
    if (tab === "mentoring") {
      return p.mentor_id === currentUserId;
    }
    return p.created_by === currentUserId || (p.members || []).some((m: any) => m.student_id === currentUserId);
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-[#F2F2F1] min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1E1E1E]">My Project Workspaces</h1>
          <p className="text-sm text-[#5C5C5C] mt-1">
            Projects you created, contribute to, or guide as faculty mentor.
          </p>
        </div>
        <Link
          href="/projects/create"
          className="px-4 py-2 text-sm font-semibold text-white bg-[#1E1E1E] rounded-xl hover:bg-gray-800 transition"
        >
          + New Project
        </Link>
      </div>

      <div className="flex border-b border-[#D6D6D6] gap-8">
        <button
          onClick={() => setTab("my")}
          className={`pb-3 text-sm font-semibold transition ${
            tab === "my"
              ? "text-[#1E1E1E] border-b-2 border-[#1E1E1E]"
              : "text-[#5C5C5C] hover:text-[#1E1E1E]"
          }`}
        >
          My Projects ({projects.filter((p: any) => p.mentor_id !== currentUserId).length})
        </button>
        <button
          onClick={() => setTab("mentoring")}
          className={`pb-3 text-sm font-semibold transition ${
            tab === "mentoring"
              ? "text-[#1E1E1E] border-b-2 border-[#1E1E1E]"
              : "text-[#5C5C5C] hover:text-[#1E1E1E]"
          }`}
        >
          Mentoring ({projects.filter((p: any) => p.mentor_id === currentUserId).length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-[#5C5C5C]">Loading your projects...</div>
      ) : filteredProjects.length === 0 ? (
        <div className="p-12 text-center bg-white border border-[#D6D6D6] rounded-2xl">
          <p className="text-sm text-[#5C5C5C] mb-4">No projects found in this tab.</p>
          <Link
            href="/projects"
            className="text-xs font-semibold text-[#1E1E1E] underline"
          >
            Browse all projects in repository
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProjects.map((p: any) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}
