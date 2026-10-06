"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
    return <div className="p-8 text-center text-[#526783]">Loading project details...</div>;
  }

  if (!project) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-[#0F172A]">Project not found</h2>
        <Link href="/projects" className="mt-4 inline-block text-sm font-semibold text-[#0F172A] underline">
          Back to Projects
        </Link>
      </div>
    );
  }

  const isCreator = project.created_by === currentUserId;
  const isMentor = project.mentor_id === currentUserId;
  const canManage = isCreator || isMentor || ["admin", "hod"].includes(userRole);

  return (
    <div className="mx-auto min-h-screen max-w-6xl space-y-8 bg-[#F6F8FC] p-4 sm:p-8">
      <Link href="/projects" className="text-xs font-bold text-[#1478ef] hover:underline">
        ← Back to Projects
      </Link>

      {/* Hero section */}
      <div className="relative isolate space-y-4 overflow-hidden rounded-[28px] bg-[#071b3d] p-6 text-white shadow-[0_18px_45px_rgba(7,27,61,0.15)] md:p-8 lg:pr-[35%]">
        <div className="absolute inset-y-0 right-0 -z-10 hidden w-[38%] [clip-path:polygon(20%_0,100%_0,100%_100%,0_100%)] lg:block"><Image src="/images/hero-campus.webp" alt="" fill sizes="38vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-r from-[#071b3d]/70 to-transparent" /></div>
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#80beff]">Project showcase</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
              {project.domain || "AI/ML"}
            </span>
            <span className="rounded-full bg-[#ffcf36] px-3 py-1 text-xs font-bold capitalize text-[#071b3d]">
              {project.status || "ongoing"}
            </span>
          </div>
          {project.mentor_name && (
            <div className="text-xs text-[#bfd3ec]">
              Faculty Mentor: <span className="font-semibold text-white">{project.mentor_name}</span>
            </div>
          )}
        </div>

        <h1 className="text-3xl font-black leading-[1.04] tracking-[-0.055em] text-white sm:text-5xl">{project.title}</h1>
        {project.summary && <p className="max-w-3xl text-sm leading-relaxed text-[#bfd3ec]">{project.summary}</p>}

        {project.tech_stack && project.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {project.tech_stack.map((t: string, idx: number) => (
              <span
                key={idx}
                className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#DCE5F1] gap-8">
        {(["overview", "team", "documents", "activity"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-semibold capitalize transition ${
              activeTab === tab
                ? "text-[#0F172A] border-b-2 border-[#0F172A]"
                : "text-[#526783] hover:text-[#0F172A]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="bg-white border border-[#DCE5F1] rounded-2xl p-6 md:p-8 shadow-sm">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-2">Project Description</h3>
              <p className="text-sm text-[#526783] leading-relaxed whitespace-pre-wrap">
                {project.description || "No full description provided."}
              </p>
            </div>

            {project.outcomes && (
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-2">Key Outcomes & Impact</h3>
                <p className="text-sm text-[#526783] leading-relaxed whitespace-pre-wrap">{project.outcomes}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#DCE5F1]">
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-[#F6F8FC] rounded-xl text-center text-xs font-semibold text-[#0F172A] hover:bg-gray-200 transition"
                >
                  GitHub Repository ↗
                </a>
              )}
              {project.demo_url && (
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-[#F6F8FC] rounded-xl text-center text-xs font-semibold text-[#0F172A] hover:bg-gray-200 transition"
                >
                  Live Demo ↗
                </a>
              )}
              {project.paper_url && (
                <a
                  href={project.paper_url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-[#F6F8FC] rounded-xl text-center text-xs font-semibold text-[#0F172A] hover:bg-gray-200 transition"
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
            <h3 className="text-sm font-bold text-[#0F172A] mb-2">Recent Project Activity</h3>
            <div className="p-4 bg-[#F6F8FC] border border-[#DCE5F1] rounded-xl text-xs text-[#526783]">
              Created on {new Date(project.created_at).toLocaleDateString()} by user {project.created_by}.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
