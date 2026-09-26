"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useQuery } from "@tanstack/react-query"
import api, { apiGet } from "@/lib/api"
import { StatCard } from "@/components/ui/stat-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Upload,
  FileCheck2,
  Trophy,
  Calendar,
  Briefcase,
  GitBranch,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Users,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Activity,
  Layers,
} from "lucide-react"
import dynamic from "next/dynamic"

const PlacementChart = dynamic(
  () => import("@/components/dashboard/DashboardCharts").then((m) => m.PlacementChart),
  { ssr: false, loading: () => <div className="h-64 w-full animate-pulse bg-neutral-100 rounded-lg" /> }
)

const UserDistributionChart = dynamic(
  () => import("@/components/dashboard/DashboardCharts").then((m) => m.UserDistributionChart),
  { ssr: false, loading: () => <div className="w-48 h-48 animate-pulse bg-neutral-100 rounded-full" /> }
)

const SystemActivityChart = dynamic(
  () => import("@/components/dashboard/DashboardCharts").then((m) => m.SystemActivityChart),
  { ssr: false, loading: () => <div className="h-60 w-full animate-pulse bg-neutral-100 rounded-lg" /> }
)

export default function DashboardPage() {
  const { user } = useAuth()

  // Determine user role
  const rolesList: string[] = user?.roles
    ? user.roles.map((r: any) => r.name?.toLowerCase())
    : []

  const isSuperAdmin =
    rolesList.includes("admin") || user?.email === "admin@aiml.hub"
  const isHODRole =
    rolesList.includes("hod") || user?.email === "hod@aiml.hub"
  const isFacultyRole = rolesList.includes("faculty")
  const isStudentDefault = !isSuperAdmin && !isHODRole && !isFacultyRole

  // Active view state (allows admins / HODs to view other role perspectives)
  const defaultRole = isSuperAdmin
    ? "admin"
    : isHODRole
    ? "hod"
    : isFacultyRole
    ? "faculty"
    : "student"

  const [activeRoleView, setActiveRoleView] = useState<string>(defaultRole)

  // Fetch real profile and stats if available
  const { data: studentProfile } = useQuery({
    queryKey: ["student-me"],
    queryFn: () => apiGet("/students/me").catch(() => null),
    enabled: !!user,
  })

  const { data: rankingsData } = useQuery({
    queryKey: ["rankings-preview"],
    queryFn: () => apiGet("/ranking?page_size=5").catch(() => null),
    enabled: !!user,
  })

  const { data: eventsData } = useQuery({
    queryKey: ["events-preview"],
    queryFn: () => apiGet("/events?page_size=5").catch(() => null),
    enabled: !!user,
  })

  const { data: approvalsData } = useQuery({
    queryKey: ["approvals-preview"],
    queryFn: () => apiGet("/approvals?page_size=5").catch(() => null),
    enabled: isHODRole || isSuperAdmin,
  })

  // Role preview switcher for privileged users
  const canSwitchViews = isSuperAdmin || isHODRole

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Role Switcher Pill if Privileged User */}
      {canSwitchViews && (
        <div className="flex items-center justify-between bg-[#FAFAFA] border border-[#E5E5E5] p-2.5 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#111111]">
              View Perspective:
            </span>
            <span className="text-[11px] text-[#777777]">
              Switch dashboard mode
            </span>
          </div>
          <div className="inline-flex h-8 items-center rounded-md bg-white border border-[#E5E5E5] p-0.5 text-xs">
            <button
              onClick={() => setActiveRoleView("student")}
              className={`px-3 py-1 rounded transition-colors ${
                activeRoleView === "student"
                  ? "bg-[#111111] text-white font-medium"
                  : "text-[#555555] hover:text-[#111111]"
              }`}
            >
              Student
            </button>
            <button
              onClick={() => setActiveRoleView("faculty")}
              className={`px-3 py-1 rounded transition-colors ${
                activeRoleView === "faculty"
                  ? "bg-[#111111] text-white font-medium"
                  : "text-[#555555] hover:text-[#111111]"
              }`}
            >
              Faculty
            </button>
            <button
              onClick={() => setActiveRoleView("hod")}
              className={`px-3 py-1 rounded transition-colors ${
                activeRoleView === "hod"
                  ? "bg-[#111111] text-white font-medium"
                  : "text-[#555555] hover:text-[#111111]"
              }`}
            >
              HOD
            </button>
            <button
              onClick={() => setActiveRoleView("admin")}
              className={`px-3 py-1 rounded transition-colors ${
                activeRoleView === "admin"
                  ? "bg-[#111111] text-white font-medium"
                  : "text-[#555555] hover:text-[#111111]"
              }`}
            >
              Admin
            </button>
          </div>
        </div>
      )}

      {/* Render appropriate dashboard view */}
      {activeRoleView === "student" && (
        <StudentDashboardView
          user={user}
          profile={studentProfile}
          rankings={rankingsData}
        />
      )}

      {activeRoleView === "hod" && (
        <HODDashboardView approvals={approvalsData} />
      )}

      {activeRoleView === "faculty" && (
        <FacultyDashboardView user={user} rankings={rankingsData} />
      )}

      {activeRoleView === "admin" && <AdminDashboardView />}
    </div>
  )
}

/* =========================================================================
   PANEL 3: STUDENT DASHBOARD
   ========================================================================= */
function StudentDashboardView({
  user,
  profile,
  rankings,
}: {
  user: any
  profile: any
  rankings: any
}) {
  const studentName = profile?.user?.name || user?.email?.split("@")[0] || "Rahul"
  const displayName =
    studentName.charAt(0).toUpperCase() + studentName.slice(1)

  return (
    <div className="space-y-8">
      {/* Header (Matching Panel 3) */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111]">
          Welcome back, {displayName} 👋
        </h1>
        <p className="text-xs text-[#555555]">
          Here&apos;s your AI & ML journey at a glance.
        </p>
      </div>

      {/* 4 Stat Cards in a row (Matching Panel 3) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="My Rank"
          value={profile?.rank ? `#${profile.rank}` : "#42"}
          subValue="(out of 1240)"
          icon={<Trophy className="w-4 h-4 text-[#CA8A04]" />}
        />
        <StatCard
          label="Test Score"
          value="82 / 100"
          subValue="Verified"
          icon={<FileCheck2 className="w-4 h-4 text-[#2563EB]" />}
        />
        <StatCard
          label="Skills"
          value={profile?.skills?.length || "18"}
          subValue="verified"
          icon={<Sparkles className="w-4 h-4 text-[#16A34A]" />}
        />
        <StatCard
          label="Projects"
          value="5"
          subValue="with 2 publications"
          icon={<GitBranch className="w-4 h-4 text-[#111111]" />}
        />
      </div>

      {/* Quick Actions (Matching Panel 3) */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#777777]">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            href="/dashboard/profile"
            className="flex flex-col items-center justify-center p-4 rounded-lg border border-[#E5E5E5] bg-white hover:border-[#111111] hover:bg-[#FAFAFA] transition-all text-center group"
          >
            <User className="w-4 h-4 text-[#555555] group-hover:text-[#111111] mb-2" />
            <span className="text-xs font-medium text-[#111111]">
              Update Profile
            </span>
          </Link>

          <Link
            href="/qr/my-code"
            className="flex flex-col items-center justify-center p-4 rounded-lg border border-[#E5E5E5] bg-white hover:border-[#111111] hover:bg-[#FAFAFA] transition-all text-center group"
          >
            <Upload className="w-4 h-4 text-[#555555] group-hover:text-[#111111] mb-2" />
            <span className="text-xs font-medium text-[#111111]">
              Upload Documents
            </span>
          </Link>

          <Link
            href="/tests"
            className="flex flex-col items-center justify-center p-4 rounded-lg border border-[#E5E5E5] bg-white hover:border-[#111111] hover:bg-[#FAFAFA] transition-all text-center group"
          >
            <FileCheck2 className="w-4 h-4 text-[#555555] group-hover:text-[#111111] mb-2" />
            <span className="text-xs font-medium text-[#111111]">
              Take AI/ML Test
            </span>
          </Link>

          <Link
            href="/ranking"
            className="flex flex-col items-center justify-center p-4 rounded-lg border border-[#E5E5E5] bg-white hover:border-[#111111] hover:bg-[#FAFAFA] transition-all text-center group"
          >
            <Trophy className="w-4 h-4 text-[#555555] group-hover:text-[#111111] mb-2" />
            <span className="text-xs font-medium text-[#111111]">
              View My Rank
            </span>
          </Link>

          <Link
            href="/events"
            className="flex flex-col items-center justify-center p-4 rounded-lg border border-[#E5E5E5] bg-white hover:border-[#111111] hover:bg-[#FAFAFA] transition-all text-center group"
          >
            <Calendar className="w-4 h-4 text-[#555555] group-hover:text-[#111111] mb-2" />
            <span className="text-xs font-medium text-[#111111]">
              Register for Event
            </span>
          </Link>

          <Link
            href="/opportunities"
            className="flex flex-col items-center justify-center p-4 rounded-lg border border-[#E5E5E5] bg-white hover:border-[#111111] hover:bg-[#FAFAFA] transition-all text-center group"
          >
            <Briefcase className="w-4 h-4 text-[#555555] group-hover:text-[#111111] mb-2" />
            <span className="text-xs font-medium text-[#111111]">
              Find Opportunities
            </span>
          </Link>
        </div>
      </div>

      {/* Two Columns: Recent Activities & My Progress (Matching Panel 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Activities */}
        <div className="lg:col-span-7 rounded-lg border border-[#E5E5E5] bg-white p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
            <h3 className="text-sm font-semibold text-[#111111]">
              Recent Activities
            </h3>
            <span className="text-xs text-[#777777]">Last 7 days</span>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[#FAFAFA] transition-colors">
              <div className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#111111] shrink-0 mt-0.5">
                <GitBranch className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-[#111111]">
                  GitHub profile updated
                </div>
                <div className="text-[11px] text-[#777777]">
                  2 repositories synced with capstone showcase
                </div>
              </div>
              <span className="text-[10px] text-[#888888] shrink-0">
                2 hours ago
              </span>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[#FAFAFA] transition-colors">
              <div className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#2563EB] shrink-0 mt-0.5">
                <Award className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-[#111111]">
                  Certificate uploaded (AWS ML Specialty)
                </div>
                <div className="text-[11px] text-[#777777]">
                  Credential verified by faculty advisor
                </div>
              </div>
              <span className="text-[10px] text-[#888888] shrink-0">
                1 day ago
              </span>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[#FAFAFA] transition-colors">
              <div className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#16A34A] shrink-0 mt-0.5">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-[#111111]">
                  Registered for GenAI Hackathon 2026
                </div>
                <div className="text-[11px] text-[#777777]">
                  Team confirmed: Neural Knights (3 members)
                </div>
              </div>
              <span className="text-[10px] text-[#888888] shrink-0">
                3 days ago
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: My Progress (Matching Panel 3) */}
        <div className="lg:col-span-5 rounded-lg border border-[#E5E5E5] bg-white p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
            <h3 className="text-sm font-semibold text-[#111111]">
              My Progress
            </h3>
            <span className="text-xs font-medium text-[#16A34A]">
              On Track
            </span>
          </div>

          {/* Circular Indicator & Breakdown */}
          <div className="flex items-center gap-6">
            <div className="relative w-20 h-20 rounded-full border-4 border-[#E5E5E5] border-t-[#111111] border-r-[#111111] flex items-center justify-center shrink-0">
              <span className="text-xl font-bold text-[#111111]">78%</span>
            </div>
            <div className="text-xs text-[#555555] space-y-1">
              <div className="font-medium text-[#111111]">
                Profile Readiness
              </div>
              <p className="text-[11px] leading-relaxed text-[#777777]">
                Your profile is 78% complete for upcoming campus recruitment drives.
              </p>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#555555]">Profile Completeness</span>
                <span className="font-medium text-[#111111]">90%</span>
              </div>
              <div className="h-1.5 w-full bg-[#F5F5F5] rounded-full overflow-hidden">
                <div className="h-full bg-[#111111] rounded-full w-[90%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#555555]">Skills & Certifications</span>
                <span className="font-medium text-[#111111]">80%</span>
              </div>
              <div className="h-1.5 w-full bg-[#F5F5F5] rounded-full overflow-hidden">
                <div className="h-full bg-[#111111] rounded-full w-[80%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#555555]">Projects & Publications</span>
                <span className="font-medium text-[#111111]">75%</span>
              </div>
              <div className="h-1.5 w-full bg-[#F5F5F5] rounded-full overflow-hidden">
                <div className="h-full bg-[#111111] rounded-full w-[75%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#555555]">AI/ML Test Score</span>
                <span className="font-medium text-[#111111]">82%</span>
              </div>
              <div className="h-1.5 w-full bg-[#F5F5F5] rounded-full overflow-hidden">
                <div className="h-full bg-[#2563EB] rounded-full w-[82%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#555555]">Verified Documents</span>
                <span className="font-medium text-[#111111]">65%</span>
              </div>
              <div className="h-1.5 w-full bg-[#F5F5F5] rounded-full overflow-hidden">
                <div className="h-full bg-[#111111] rounded-full w-[65%]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   PANEL 4: HOD DASHBOARD
   ========================================================================= */
function HODDashboardView({ approvals }: { approvals: any }) {
  const placementData = [
    { year: "2022", placed: 180, notPlaced: 40 },
    { year: "2023", placed: 220, notPlaced: 35 },
    { year: "2024", placed: 290, notPlaced: 30 },
    { year: "2025", placed: 310, notPlaced: 20 },
  ]

  const topSkills = [
    { name: "Python", percentage: 92 },
    { name: "Machine Learning", percentage: 78 },
    { name: "Deep Learning", percentage: 65 },
    { name: "Generative AI", percentage: 58 },
    { name: "Data Analysis", percentage: 52 },
  ]

  return (
    <div className="space-y-8">
      {/* Header (Matching Panel 4) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111]">
            HOD Dashboard
          </h1>
          <p className="text-xs text-[#555555]">
            Department overview and key insights.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select className="h-9 px-3 rounded-lg border border-[#E5E5E5] bg-white text-xs text-[#111111] focus:outline-none focus:border-[#111111]">
            <option>Academic Year 2025-26</option>
            <option>Academic Year 2024-25</option>
          </select>
        </div>
      </div>

      {/* 4 Stat Cards in a row (Matching Panel 4) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Students"
          value="1,240"
          trend="+12% from last year"
          trendType="positive"
        />
        <StatCard
          label="Faculty Members"
          value="52"
          trend="+2 new this year"
          trendType="positive"
        />
        <StatCard
          label="Research Projects"
          value="320"
          trend="+18% from last year"
          trendType="positive"
        />
        <StatCard
          label="Placements"
          value="78%"
          trend="+6% from last year"
          trendType="positive"
        />
      </div>

      {/* Charts Row: Placement & Rankings + Top Skills (Matching Panel 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Placement & Rankings Bar Chart */}
        <div className="lg:col-span-7 rounded-lg border border-[#E5E5E5] bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#111111]">
              Placement & Rankings
            </h3>
            <div className="flex items-center gap-4 text-[11px] text-[#777777]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#2563EB]" /> Placed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#93C5FD]" /> Not Placed
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <PlacementChart data={placementData} />
          </div>
        </div>

        {/* Right: Top Skills in Department */}
        <div className="lg:col-span-5 rounded-lg border border-[#E5E5E5] bg-white p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
            <h3 className="text-sm font-semibold text-[#111111]">
              Top Skills in Department
            </h3>
            <span className="text-xs text-[#777777]">Cohort 2026</span>
          </div>

          <div className="space-y-4 pt-2">
            {topSkills.map((skill) => (
              <div key={skill.name} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-[#111111]">
                    {skill.name}
                  </span>
                  <span className="text-[#555555] font-semibold">
                    {skill.percentage}%
                  </span>
                </div>
                <div className="h-2 w-full bg-[#F5F5F5] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2563EB] rounded-full"
                    style={{ width: `${skill.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom: Recent Approvals Table (Matching Panel 4) */}
      <div className="rounded-lg border border-[#E5E5E5] bg-white overflow-hidden">
        <div className="p-5 border-b border-[#E5E5E5] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#111111]">
            Recent Approvals
          </h3>
          <Link
            href="/approvals"
            className="text-xs text-[#2563EB] hover:underline font-medium"
          >
            View Queue →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFAFA] border-b border-[#E5E5E5] text-[#555555] font-medium">
              <tr>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Requested By</th>
                <th className="p-3.5">Details</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              <tr className="hover:bg-[#FAFAFA]">
                <td className="p-3.5 font-medium text-[#111111]">
                  Profile Update
                </td>
                <td className="p-3.5 text-[#555555]">Dr. S. Mehta</td>
                <td className="p-3.5 text-[#777777]">
                  Student skill update - Ananya
                </td>
                <td className="p-3.5 text-[#777777]">12 Sep 2026</td>
                <td className="p-3.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#FEF9C3] text-[#A16207]">
                    Pending
                  </span>
                </td>
                <td className="p-3.5 text-right">
                  <Link href="/approvals">
                    <Button size="sm" variant="secondary" className="h-7 text-xs">
                      Review
                    </Button>
                  </Link>
                </td>
              </tr>

              <tr className="hover:bg-[#FAFAFA]">
                <td className="p-3.5 font-medium text-[#111111]">
                  New Project
                </td>
                <td className="p-3.5 text-[#555555]">Prof. R. Singh</td>
                <td className="p-3.5 text-[#777777]">
                  LLM Research Project
                </td>
                <td className="p-3.5 text-[#777777]">11 Sep 2026</td>
                <td className="p-3.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#DCFCE7] text-[#15803D]">
                    Approved
                  </span>
                </td>
                <td className="p-3.5 text-right">
                  <Button size="sm" variant="ghost" className="h-7 text-xs" disabled>
                    View
                  </Button>
                </td>
              </tr>

              <tr className="hover:bg-[#FAFAFA]">
                <td className="p-3.5 font-medium text-[#111111]">Event</td>
                <td className="p-3.5 text-[#555555]">Prof. K. Verma</td>
                <td className="p-3.5 text-[#777777]">GenAI Workshop</td>
                <td className="p-3.5 text-[#777777]">10 Sep 2026</td>
                <td className="p-3.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#FEF9C3] text-[#A16207]">
                    Pending
                  </span>
                </td>
                <td className="p-3.5 text-right">
                  <Link href="/approvals">
                    <Button size="sm" variant="secondary" className="h-7 text-xs">
                      Review
                    </Button>
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   PANEL 5: FACULTY DASHBOARD
   ========================================================================= */
function FacultyDashboardView({
  user,
  rankings,
}: {
  user: any
  rankings: any
}) {
  const [tab, setTab] = useState("students")

  const studentsList = [
    {
      regNo: "AIML0012",
      name: "Ananya Singh",
      section: "A",
      cgpa: "8.9",
      rank: 15,
      status: "Active",
    },
    {
      regNo: "AIML0024",
      name: "Rohan Mehta",
      section: "A",
      cgpa: "8.6",
      rank: 32,
      status: "Active",
    },
    {
      regNo: "AIML0056",
      name: "Priya Sharma",
      section: "B",
      cgpa: "8.4",
      rank: 48,
      status: "Active",
    },
    {
      regNo: "AIML0078",
      name: "Karan Patel",
      section: "B",
      cgpa: "8.1",
      rank: 76,
      status: "Active",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header (Matching Panel 5) */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111]">
          Welcome, Prof. R. Singh
        </h1>
        <p className="text-xs text-[#555555]">
          Manage your students, projects and academic activities.
        </p>
      </div>

      {/* 4 Stat Cards in a row (Matching Panel 5) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="My Students" value="28" icon={<Users className="w-4 h-4 text-[#111111]" />} />
        <StatCard label="Active Projects" value="6" icon={<GitBranch className="w-4 h-4 text-[#2563EB]" />} />
        <StatCard label="Pending Requests" value="3" highlight icon={<Clock className="w-4 h-4 text-[#DC2626]" />} />
        <StatCard label="Events Conducted" value="4" icon={<Calendar className="w-4 h-4 text-[#16A34A]" />} />
      </div>

      {/* Tabs: [My Students] [Projects] [Requests] [Upcoming Events] (Matching Panel 5) */}
      <div className="space-y-4">
        <div className="inline-flex h-9 items-center rounded-lg bg-[#F5F5F5] p-1 text-xs font-medium text-[#555555]">
          <button
            onClick={() => setTab("students")}
            className={`px-3 py-1 rounded-md transition-all ${
              tab === "students"
                ? "bg-white text-[#111111] shadow-subtle"
                : "text-[#555555] hover:text-[#111111]"
            }`}
          >
            My Students
          </button>
          <button
            onClick={() => setTab("projects")}
            className={`px-3 py-1 rounded-md transition-all ${
              tab === "projects"
                ? "bg-white text-[#111111] shadow-subtle"
                : "text-[#555555] hover:text-[#111111]"
            }`}
          >
            Projects
          </button>
          <button
            onClick={() => setTab("requests")}
            className={`px-3 py-1 rounded-md transition-all ${
              tab === "requests"
                ? "bg-white text-[#111111] shadow-subtle"
                : "text-[#555555] hover:text-[#111111]"
            }`}
          >
            Requests
          </button>
          <button
            onClick={() => setTab("events")}
            className={`px-3 py-1 rounded-md transition-all ${
              tab === "events"
                ? "bg-white text-[#111111] shadow-subtle"
                : "text-[#555555] hover:text-[#111111]"
            }`}
          >
            Upcoming Events
          </button>
        </div>

        {/* Student Table (Matching Panel 5) */}
        {tab === "students" && (
          <div className="rounded-lg border border-[#E5E5E5] bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFAFA] border-b border-[#E5E5E5] text-[#555555] font-medium">
                  <tr>
                    <th className="p-3.5">Reg. No.</th>
                    <th className="p-3.5">Name</th>
                    <th className="p-3.5">Section</th>
                    <th className="p-3.5">CGPA</th>
                    <th className="p-3.5">Rank</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {studentsList.map((st) => (
                    <tr key={st.regNo} className="hover:bg-[#FAFAFA]">
                      <td className="p-3.5 font-medium text-[#111111]">
                        {st.regNo}
                      </td>
                      <td className="p-3.5 font-medium text-[#111111]">
                        {st.name}
                      </td>
                      <td className="p-3.5 text-[#555555]">{st.section}</td>
                      <td className="p-3.5 text-[#555555]">{st.cgpa}</td>
                      <td className="p-3.5 text-[#111111] font-medium">
                        {st.rank}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#DCFCE7] text-[#15803D]">
                          {st.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <Link href="/dashboard/profile">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-7 text-xs"
                          >
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "projects" && (
          <div className="p-8 text-center border border-[#E5E5E5] rounded-lg bg-white text-xs text-[#777777]">
            Active student capstone & research projects will appear here.
          </div>
        )}

        {tab === "requests" && (
          <div className="p-8 text-center border border-[#E5E5E5] rounded-lg bg-white text-xs text-[#777777]">
            3 change requests awaiting submission or HOD review.
          </div>
        )}

        {tab === "events" && (
          <div className="p-8 text-center border border-[#E5E5E5] rounded-lg bg-white text-xs text-[#777777]">
            4 departmental workshops scheduled for this semester.
          </div>
        )}
      </div>
    </div>
  )
}

/* =========================================================================
   PANEL 6: ADMIN DASHBOARD
   ========================================================================= */
function AdminDashboardView() {
  const userDistribution = [
    { name: "Students", value: 1248, color: "#111111" },
    { name: "Faculty", value: 52, color: "#2563EB" },
    { name: "Alumni", value: 120, color: "#16A34A" },
    { name: "Others", value: 23, color: "#CA8A04" },
  ]

  const activityData = [
    { date: "6 Sep", count: 1200 },
    { date: "7 Sep", count: 1100 },
    { date: "8 Sep", count: 1350 },
    { date: "9 Sep", count: 1450 },
    { date: "10 Sep", count: 1300 },
    { date: "11 Sep", count: 1250 },
    { date: "12 Sep", count: 1420 },
  ]

  const recentLogins = [
    { name: "Rahul Sharma", role: "Student", time: "2 min ago" },
    { name: "Prof. R. Singh", role: "Faculty", time: "12 min ago" },
    { name: "Ananya Gupta", role: "Student", time: "25 min ago" },
    { name: "Dr. A. Kumar", role: "HOD", time: "1 hour ago" },
  ]

  return (
    <div className="space-y-8">
      {/* Header (Matching Panel 6) */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111]">
          Admin Dashboard
        </h1>
        <p className="text-xs text-[#555555]">
          System overview and health status.
        </p>
      </div>

      {/* 4 Stat Cards in a row (Matching Panel 6) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value="1,435" />
        <StatCard label="Active Users" value="1,210" />
        <StatCard label="Storage Used" value="68 GB" />
        <StatCard
          label="System Health"
          value="All Good"
          trend="Neon + Redis Healthy"
          trendType="positive"
        />
      </div>

      {/* Mid Row: User Distribution Donut + Recent Logins (Matching Panel 6) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: User Distribution Donut */}
        <div className="lg:col-span-7 rounded-lg border border-[#E5E5E5] bg-white p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
            <h3 className="text-sm font-semibold text-[#111111]">
              User Distribution
            </h3>
            <span className="text-xs text-[#777777]">1,435 Total</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
            <div className="w-48 h-48 relative">
              <UserDistributionChart data={userDistribution} />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-lg font-bold text-[#111111]">1,435</span>
                <span className="text-[10px] text-[#777777]">Users</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              {userDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-6 justify-between min-w-[160px]">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[#555555]">{item.name}</span>
                  </div>
                  <span className="font-semibold text-[#111111]">
                    {item.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Recent Logins */}
        <div className="lg:col-span-5 rounded-lg border border-[#E5E5E5] bg-white p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
            <h3 className="text-sm font-semibold text-[#111111]">
              Recent Logins
            </h3>
            <span className="text-xs text-[#777777]">Live telemetry</span>
          </div>

          <div className="space-y-3 pt-1">
            {recentLogins.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[#FAFAFA] transition-colors text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#111111] text-white flex items-center justify-center text-xs font-medium">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-[#111111]">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-[#777777]">
                      {item.role}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-[#888888]">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom: System Activity (Last 7 Days) Area Chart (Matching Panel 6) */}
      <div className="rounded-lg border border-[#E5E5E5] bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#111111]">
            System Activity (Last 7 Days)
          </h3>
          <span className="text-xs text-[#777777]">1.2k - 1.5k requests/day</span>
        </div>

        <div className="h-60 w-full pt-2">
          <SystemActivityChart data={activityData} />
        </div>
      </div>
    </div>
  )
}
