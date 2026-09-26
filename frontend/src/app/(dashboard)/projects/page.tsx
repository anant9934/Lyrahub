"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { ProjectCard } from "@/components/features/projects/ProjectCard";
import { ProjectFilters } from "@/components/features/projects/ProjectFilters";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("");
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("student");

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole") || "student";
    setRole(storedRole);
    fetchProjects();
  }, [domain, status]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (domain) params.domain = domain;
      if (status) params.status = status;
      if (search) params.search = search;

      const res = await api.get("/projects", { params });
      setProjects(res.data?.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
  };

  const handleSearchSubmit = () => {
    fetchProjects();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111]">
            Projects Repository
          </h1>
          <p className="text-xs text-[#555555] mt-1">
            Department AI/ML projects, faculty-mentored research, and student innovation showcase.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/projects/me"
            className="px-3.5 py-2 text-xs font-medium text-[#111111] bg-white border border-[#E5E5E5] rounded-lg hover:bg-[#FAFAFA] transition"
          >
            My Projects
          </Link>
          <Link
            href="/projects/create"
            className="px-3.5 py-2 text-xs font-medium text-white bg-[#111111] rounded-lg hover:bg-neutral-800 transition"
          >
            + New Project
          </Link>
        </div>
      </div>

      <ProjectFilters
        search={search}
        onSearchChange={handleSearchChange}
        domain={domain}
        onDomainChange={setDomain}
        status={status}
        onStatusChange={setStatus}
      />

      {loading ? (
        <div className="text-center py-16 text-[#5C5C5C]">Loading projects repository...</div>
      ) : projects.length === 0 ? (
        <div className="p-12 text-center bg-white border border-[#D6D6D6] rounded-2xl shadow-sm">
          <h3 className="text-lg font-bold text-[#1E1E1E] mb-2">No projects found</h3>
          <p className="text-sm text-[#5C5C5C] mb-6">
            Be the first to publish an AI/ML research or industry capstone project!
          </p>
          <Link
            href="/projects/create"
            className="px-5 py-2.5 bg-[#1E1E1E] text-white text-sm font-semibold rounded-xl hover:bg-gray-800"
          >
            Create Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((project: any) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
