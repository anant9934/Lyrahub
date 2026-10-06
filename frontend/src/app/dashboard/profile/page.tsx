"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiGet, apiPatch } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ResumeDropzone } from "@/components/features/profile/ResumeDropzone"
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Code2,
  ExternalLink,
  Plus,
  Edit2,
  CheckCircle2,
  QrCode,
  Award,
  BookOpen,
  Calendar,
} from "lucide-react"

export default function ProfilePage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<string>("overview")
  const [isEditing, setIsEditing] = useState(false)
  const [newSkillModalOpen, setNewSkillModalOpen] = useState(false)
  const [newSkillName, setNewSkillName] = useState("")

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => apiGet("/students/me").catch(() => null),
  })

  const [formData, setFormData] = useState({
    bio: "",
    github_url: "",
    linkedin_url: "",
    portfolio_url: "",
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        bio: profile.bio || "",
        github_url: profile.github_url || "",
        linkedin_url: profile.linkedin_url || "",
        portfolio_url: profile.portfolio_url || "",
      })
    }
  }, [profile])

  const updateProfile = useMutation({
    mutationFn: (data: typeof formData) => apiPatch("/students/me", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] })
      setIsEditing(false)
    },
  })

  const addSkillMutation = useMutation({
    mutationFn: (skill: string) =>
      apiPatch("/students/me", {
        skills: [...(profile?.skills || []), skill],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] })
      setNewSkillModalOpen(false)
      setNewSkillName("")
    },
  })

  // Sample static skills matching Panel 7 if none verified yet
  const defaultSkills = [
    "Python",
    "Machine Learning",
    "Deep Learning",
    "Generative AI",
    "Data Analysis",
    "FastAPI",
    "React",
    "SQL",
    "LLMs",
    "Computer Vision",
  ]

  const displaySkills =
    profile?.skills && profile.skills.length > 0
      ? profile.skills
      : defaultSkills

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-[#0F172A]">
          My Profile
        </h1>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
          className="gap-1.5 text-xs"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
        </Button>
      </div>

      {/* Main Profile Header Card (Matching Panel 7) */}
      <div className="rounded-lg border border-[#DCE5F1] bg-white p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar Circle */}
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#0F172A] text-white flex items-center justify-center text-3xl font-semibold shrink-0">
                {profile?.user?.name?.charAt(0) ||
                  user?.email?.charAt(0).toUpperCase() ||
                  "R"}
              </div>
              <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#16A34A] border-2 border-white" />
            </div>

            {/* Profile Info */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-semibold text-[#0F172A]">
                  {profile?.user?.name || "Rahul Sharma"}
                </h2>
                <Badge variant="success" className="text-[10px]">
                  Verified Student
                </Badge>
              </div>

              <div className="text-xs font-medium text-[#526783]">
                {profile?.reg_no || "AIML20E3801"} • Section{" "}
                {profile?.section || "A"}
              </div>

              <div className="text-xs text-[#667A93]">
                B.Tech CSE (AI & ML) • 3rd Year
              </div>

              {/* Contact strip matching Panel 7 */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#526783] pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#71849B]" />
                  Phagwara, Punjab
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#71849B]" />
                  +91 98765 43210
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#71849B]" />
                  {profile?.user?.email || user?.email || "rahul.sharma@lpu.in"}
                </span>
              </div>

              {/* Social icons matching Panel 7 */}
              <div className="flex items-center gap-3 pt-2 text-[#667A93]">
                <a
                  href={profile?.linkedin_url || "https://linkedin.com"}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#0F172A] transition-colors"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
                <a
                  href={profile?.github_url || "https://github.com"}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#0F172A] transition-colors"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                <a
                  href={profile?.portfolio_url || "https://example.com"}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#0F172A] transition-colors"
                >
                  <Globe className="w-4 h-4" />
                </a>
                <span className="hover:text-[#0F172A] cursor-pointer">
                  <Code2 className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Badge on the right */}
          <div className="flex sm:flex-col items-center sm:items-end gap-3 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-[#DCE5F1]">
            <div className="text-left sm:text-right">
              <span className="text-[11px] text-[#667A93]">Academic CGPA</span>
              <div className="text-2xl font-bold text-[#0F172A]">
                {profile?.cgpa ? Number(profile.cgpa).toFixed(2) : "9.20"}
              </div>
            </div>
            <Link href="/qr/my-code">
              <Button size="sm" variant="secondary" className="gap-1.5 text-xs">
                <QrCode className="w-3.5 h-3.5" /> ID Badge
              </Button>
            </Link>
          </div>
        </div>

        {/* Inline Edit Form if isEditing */}
        {isEditing && (
          <div className="mt-6 pt-6 border-t border-[#DCE5F1] space-y-4">
            <h3 className="text-sm font-semibold text-[#0F172A]">
              Edit Student Profile
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[#0F172A]">
                  Bio Summary
                </label>
                <Input
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  placeholder="Aspiring Machine Learning Researcher..."
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#0F172A]">
                  LinkedIn URL
                </label>
                <Input
                  value={formData.linkedin_url}
                  onChange={(e) =>
                    setFormData({ ...formData, linkedin_url: e.target.value })
                  }
                  placeholder="https://linkedin.com/in/username"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#0F172A]">
                  GitHub URL
                </label>
                <Input
                  value={formData.github_url}
                  onChange={(e) =>
                    setFormData({ ...formData, github_url: e.target.value })
                  }
                  placeholder="https://github.com/username"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#0F172A]">
                  Portfolio URL
                </label>
                <Input
                  value={formData.portfolio_url}
                  onChange={(e) =>
                    setFormData({ ...formData, portfolio_url: e.target.value })
                  }
                  placeholder="https://mywebsite.dev"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => updateProfile.mutate(formData)}
                disabled={updateProfile.isPending}
                className="bg-[#0F172A] text-white"
              >
                {updateProfile.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Segmented Tabs matching Panel 7: Overview, Skills, Projects, Certifications, Documents, Activity */}
      <div className="border-b border-[#DCE5F1] flex gap-6 overflow-x-auto text-xs font-medium">
        {[
          { id: "overview", label: "Overview" },
          { id: "skills", label: "Skills" },
          { id: "projects", label: "Projects" },
          { id: "certifications", label: "Certifications" },
          { id: "documents", label: "Documents" },
          { id: "activity", label: "Activity" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 pt-1 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "border-[#0F172A] text-[#0F172A]"
                : "border-transparent text-[#667A93] hover:text-[#0F172A]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview & Technical Skills (Matching Panel 7) */}
      {(activeTab === "overview" || activeTab === "skills") && (
        <div className="space-y-6">
          {/* Technical Skills Card */}
          <div className="rounded-lg border border-[#DCE5F1] bg-white p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#0F172A]">
                  Technical Skills
                </h3>
                <p className="text-xs text-[#667A93]">
                  Verified departmental proficiencies & frameworks
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setNewSkillModalOpen(true)}
                className="gap-1 text-xs h-8"
              >
                <Plus className="w-3.5 h-3.5" /> Add Skill
              </Button>
            </div>

            {/* Skill Badges matching Panel 7 */}
            <div className="flex flex-wrap gap-2 pt-2">
              {displaySkills.map((skill: string, idx: number) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 rounded-lg border border-[#DCE5F1] bg-[#F6F8FC] text-xs font-medium text-[#0F172A] flex items-center gap-1.5 hover:border-[#0F172A] transition-colors"
                >
                  <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                  <span>{skill}</span>
                </div>
              ))}
            </div>

            {/* Modal for adding a skill */}
            {newSkillModalOpen && (
              <div className="p-4 border border-[#DCE5F1] rounded-lg bg-[#F6F8FC] space-y-3 mt-4">
                <div className="text-xs font-semibold text-[#0F172A]">
                  Add Technical Skill
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="e.g. PyTorch, Kubernetes, LangChain..."
                    className="h-9 text-xs"
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      if (newSkillName.trim()) {
                        addSkillMutation.mutate(newSkillName.trim())
                      }
                    }}
                    className="bg-[#0F172A] text-white text-xs h-9 px-4 shrink-0"
                  >
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setNewSkillModalOpen(false)}
                    className="h-9 text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Academic & Placement Snapshot */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-[#DCE5F1] bg-white p-5 space-y-1">
              <span className="text-xs text-[#667A93]">Department Rank</span>
              <div className="text-xl font-bold text-[#0F172A]">#42</div>
              <p className="text-[11px] text-[#526783]">Top 3.5% of cohort</p>
            </div>
            <div className="rounded-lg border border-[#DCE5F1] bg-white p-5 space-y-1">
              <span className="text-xs text-[#667A93]">AI Knowledge Score</span>
              <div className="text-xl font-bold text-[#2563EB]">82 / 100</div>
              <p className="text-[11px] text-[#526783]">Supervised & LLMs passed</p>
            </div>
            <div className="rounded-lg border border-[#DCE5F1] bg-white p-5 space-y-1">
              <span className="text-xs text-[#667A93]">Placement Readiness</span>
              <div className="text-xl font-bold text-[#16A34A]">Tier 1 Eligible</div>
              <p className="text-[11px] text-[#526783]">Resume & GitHub verified</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Projects */}
      {activeTab === "projects" && (
        <div className="rounded-lg border border-[#DCE5F1] bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#0F172A]">
              Capstone & Machine Learning Repositories
            </h3>
            <Link href="/projects/create">
              <Button size="sm" variant="secondary" className="text-xs gap-1">
                <Plus className="w-3.5 h-3.5" /> Submit Project
              </Button>
            </Link>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-lg border border-[#DCE5F1] bg-[#F6F8FC] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-[#0F172A]">
                  Multilingual RAG with Domain Chunking
                </h4>
                <p className="text-[11px] text-[#526783] mt-0.5">
                  FastAPI, ChromaDB, HuggingFace embeddings for Hindi & Punjabi text.
                </p>
              </div>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#2563EB] hover:underline flex items-center gap-1"
              >
                GitHub <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-4 rounded-lg border border-[#DCE5F1] bg-[#F6F8FC] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-[#0F172A]">
                  Autonomous Drone Obstacle Avoidance via YOLOv8
                </h4>
                <p className="text-[11px] text-[#526783] mt-0.5">
                  Edge deployment on Jetson Nano with TensorRT optimization.
                </p>
              </div>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#2563EB] hover:underline flex items-center gap-1"
              >
                GitHub <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Certifications */}
      {activeTab === "certifications" && (
        <div className="rounded-lg border border-[#DCE5F1] bg-white p-6 space-y-4">
          <h3 className="text-sm font-semibold text-[#0F172A]">
            Verified Certifications
          </h3>
          <div className="space-y-3">
            <div className="p-4 rounded-lg border border-[#DCE5F1] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-[#2563EB]" />
                <div>
                  <div className="text-xs font-semibold text-[#0F172A]">
                    AWS Certified Machine Learning – Specialty
                  </div>
                  <div className="text-[10px] text-[#667A93]">
                    Issued Jun 2025 • Expires Jun 2028
                  </div>
                </div>
              </div>
              <Badge variant="success">Verified</Badge>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Documents / Resume Upload */}
      {activeTab === "documents" && (
        <div className="rounded-lg border border-[#DCE5F1] bg-white p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-[#0F172A]">
              Resume & Verified Credentials
            </h3>
            <p className="text-xs text-[#667A93]">
              Upload PDF resumes to extract skills and enable one-click placement applications.
            </p>
          </div>
          <ResumeDropzone
            onSuccess={() =>
              queryClient.invalidateQueries({ queryKey: ["profile"] })
            }
          />
        </div>
      )}

      {/* Tab 6: Activity */}
      {activeTab === "activity" && (
        <div className="rounded-lg border border-[#DCE5F1] bg-white p-6 space-y-4">
          <h3 className="text-sm font-semibold text-[#0F172A]">
            Department Activity Timeline
          </h3>
          <div className="space-y-3 text-xs">
            <div className="border-l-2 border-[#0F172A] pl-3 py-1">
              <div className="font-medium text-[#0F172A]">
                Completed Knowledge Assessment
              </div>
              <div className="text-[10px] text-[#667A93]">
                Scored 82/100 on Intermediate ML Fundamentals • Yesterday
              </div>
            </div>
            <div className="border-l-2 border-[#DCE5F1] pl-3 py-1">
              <div className="font-medium text-[#0F172A]">
                Project Submission Approved
              </div>
              <div className="text-[10px] text-[#667A93]">
                Multilingual RAG verified by Prof. R. Singh • 4 days ago
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
