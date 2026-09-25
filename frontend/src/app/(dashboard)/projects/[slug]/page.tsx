"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ProjectTeamGrid } from "@/components/features/projects/ProjectTeamGrid";
import { ProjectDocumentList } from "@/components/features/projects/ProjectDocumentList";

export default function ProjectDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "team" | "documents" | "activity">("overview");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("student");

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "student";
    setUserRole(role);
    fetchProject();
    fetchCurrentUser();
  }, [slug]);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/auth/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      if (res.ok) {
        const user = await res.json();
        setCurrentUserId(user.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProject = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/projects/${slug}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setProject(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMemberRemoved = async (studentId: string) => {
    if (!project) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/projects/${project.id}/members/${studentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      if (res.ok) {
        fetchProject();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-[#5C5C5C]">Loading project details...</div>;
  }

  if (!project) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-[#1E1E1E]">Project not found</h2>
        <Link href="/projects" className="mt-4 inline-block text-sm font-semibold text-[#1E1E1E] underline">
          Back to Projects
        </Link>
      </div>
    );
  }

  const isCreator = project.created_by === currentUserId;
  const isMentor = project.mentor_id === currentUserId;
  const canManage = isCreator || isMentor || ["admin", "hod"].includes(userRole);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 bg-[#F2F2F1] min-h-screen">
      <Link href="/projects" className="text-xs font-semibold text-[#5C5C5C] hover:text-[#1E1E1E]">
        ← Back to Projects
      </Link>

      {/* Hero section */}
      <div className="bg-white border border-[#D6D6D6] rounded-2xl p-6 md:p-8 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider bg-[#94B0B8]/20 text-[#2C4A52]">
              {project.domain || "AI/ML"}
            </span>
            <span className="text-xs font-medium px-3 py-1 rounded-full capitalize bg-[#EEF3EE] text-[#7A9A7E]">
              {project.status || "ongoing"}
            </span>
          </div>
          {project.mentor_name && (
            <div className="text-xs text-[#5C5C5C]">
              Faculty Mentor: <span className="font-semibold text-[#1E1E1E]">{project.mentor_name}</span>
            </div>
          )}
        </div>

        <h1 className="text-3xl font-extrabold text-[#1E1E1E]">{project.title}</h1>
        {project.summary && <p className="text-sm text-[#5C5C5C] max-w-3xl leading-relaxed">{project.summary}</p>}

        {project.tech_stack && project.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {project.tech_stack.map((t: string, idx: number) => (
              <span
                key={idx}
                className="text-xs font-mono bg-[#F2F2F1] text-[#1E1E1E] px-2.5 py-1 rounded border border-[#D6D6D6]"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#D6D6D6] gap-8">
        {(["overview", "team", "documents", "activity"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-semibold capitalize transition ${
              activeTab === tab
                ? "text-[#1E1E1E] border-b-2 border-[#1E1E1E]"
                : "text-[#5C5C5C] hover:text-[#1E1E1E]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="bg-white border border-[#D6D6D6] rounded-2xl p-6 md:p-8 shadow-sm">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-[#1E1E1E] uppercase tracking-wider mb-2">Project Description</h3>
              <p className="text-sm text-[#5C5C5C] leading-relaxed whitespace-pre-wrap">
                {project.description || "No full description provided."}
              </p>
            </div>

            {project.outcomes && (
              <div>
                <h3 className="text-sm font-bold text-[#1E1E1E] uppercase tracking-wider mb-2">Key Outcomes & Impact</h3>
                <p className="text-sm text-[#5C5C5C] leading-relaxed whitespace-pre-wrap">{project.outcomes}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#D6D6D6]">
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-[#F2F2F1] rounded-xl text-center text-xs font-semibold text-[#1E1E1E] hover:bg-gray-200 transition"
                >
                  GitHub Repository ↗
                </a>
              )}
              {project.demo_url && (
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-[#F2F2F1] rounded-xl text-center text-xs font-semibold text-[#1E1E1E] hover:bg-gray-200 transition"
                >
                  Live Demo ↗
                </a>
              )}
              {project.paper_url && (
                <a
                  href={project.paper_url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-[#F2F2F1] rounded-xl text-center text-xs font-semibold text-[#1E1E1E] hover:bg-gray-200 transition"
                >
                  Research Paper ↗
                </a>
              )}
            </div>
          </div>
        )}

        {activeTab === "team" && (
          <ProjectTeamGrid
            members={project.members || []}
            projectId={project.id}
            canManage={canManage}
            onMemberAdded={fetchProject}
            onMemberRemoved={handleMemberRemoved}
          />
        )}

        {activeTab === "documents" && (
          <ProjectDocumentList
            documents={project.documents || []}
            projectId={project.id}
            canManage={canManage}
            onDocumentUploaded={fetchProject}
          />
        )}

        {activeTab === "activity" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#1E1E1E] mb-2">Recent Project Activity</h3>
            <div className="p-4 bg-[#F2F2F1] border border-[#D6D6D6] rounded-xl text-xs text-[#5C5C5C]">
              Created on {new Date(project.created_at).toLocaleDateString()} by user {project.created_by}.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
