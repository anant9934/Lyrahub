/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import {
  useStudentProfile,
  usePrefetchCriticalData,
} from "@/lib/hooks"
import { StatCard } from "@/components/ui/stat-card"
import { WorkspaceHero } from "@/components/layout/WorkspaceHero"
import { Button } from "@/components/ui/button"
import {
  User,
  Upload,
  FileCheck2,
  Trophy,
  Calendar,
  Briefcase,
  GitBranch,
  Award,
  Clock,
  Users,
  Sparkles,
  BarChart3,
  GraduationCap,
  ShieldCheck,
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

  // Active view state (allows admins / HODs to view other role perspectives)
  const defaultRole = isSuperAdmin
    ? "admin"
    : isHODRole
    ? "hod"
    : isFacultyRole
    ? "faculty"
    : "student"

  const [activeRoleView, setActiveRoleView] = useState<string>(defaultRole)

  // Prefetch likely next routes while user reads dashboard
  usePrefetchCriticalData()

  // Fetch real profile — uses shared query keys for deduplication
  const { data: studentProfile } = useStudentProfile(!!user)

  // Role preview switcher for privileged users
  const canSwitchViews = isSuperAdmin || isHODRole

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Role Switcher Pill if Privileged User */}
      {canSwitchViews && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#D4E0F0] bg-white px-4 py-3 shadow-sm dark:bg-[#101e35] dark:border-[#1E3456]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1478ef]/10 text-[#1478ef]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[12px] font-bold text-[#091936] dark:text-white">View Perspective</span>
              <span className="ml-2 text-[11px] text-[#9ab5d0]">Switch dashboard mode</span>
            </div>
          </div>
          <div className="inline-flex h-8 items-center rounded-xl border border-[#D4E0F0] bg-[#F0F4FA] p-0.5 text-[11px] font-semibold dark:bg-[#0f1829] dark:border-[#1E3456]">
            {(["student", "faculty", "hod", "admin"] as const).map((role) => (
              <button
                key={role}
                onClick={() => setActiveRoleView(role)}
                className={`px-3 py-1 rounded-[9px] capitalize transition-all ${
                  activeRoleView === role
                    ? "bg-[#071b3d] text-white shadow-sm"
                    : "text-[#526783] hover:text-[#091936] dark:text-[#7aace0] dark:hover:text-white"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeRoleView !== "student" && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] px-4 py-2.5 text-[12px] font-semibold text-[#92400E]">
          <span className="text-base">👁</span>
          <span>Preview mode — sample data shown for the <strong className="capitalize">{activeRoleView}</strong> dashboard view.</span>
        </div>
      )}

      {/* Render appropriate dashboard view */}
      {activeRoleView === "student" && (
        <StudentDashboardView
          user={user}
          profile={studentProfile}
        />
      )}

      {activeRoleView === "hod" && (
        <HODDashboardView />
      )}

      {activeRoleView === "faculty" && (
        <FacultyDashboardView />
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
}: {
  user: any
  profile: any
}) {
  const studentName = profile?.user?.name || user?.email?.split("@")[0] || "there"
  const displayName =
    studentName.charAt(0).toUpperCase() + studentName.slice(1)

  return (
    <div className="space-y-8">
      <WorkspaceHero eyebrow="Your AIMETRA space" title={<>Welcome back, <span className="text-[#ffcf36]">{displayName}.</span></>} description="Your work, connections, and next opportunities are all here." tone="navy" icon={Sparkles} visual="aida" />

      {/* 4 Stat Cards in a row (Matching Panel 13) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="CGPA"
          value={profile?.cgpa != null ? profile.cgpa.toFixed(1) : "8.4"}
          subValue="Target: 8.5+"
          progress={profile?.cgpa != null ? (profile.cgpa / 10) * 100 : 84}
          accentColor="#16A34A"
          icon={<GraduationCap className="w-4 h-4 text-[#16A34A]" />}
        />
        <StatCard
          label="Attendance"
          value="92%"
          subValue="Semester 6 · Regular"
          progress={92}
          accentColor="#1478ef"
          icon={<Clock className="w-4 h-4 text-[#1478ef]" />}
        />
        <StatCard
          label="Readiness"
          value={profile?.readiness_score != null ? `${profile.readiness_score}%` : "78%"}
          subValue="Placement eligible"
          progress={profile?.readiness_score || 78}
          accentColor="#7C3AED"
          icon={<Sparkles className="w-4 h-4 text-[#7C3AED]" />}
        />
        <StatCard
          label="My Rank"
          value={profile?.rank ? `#${profile.rank}` : "#12/120"}
          subValue="Top 10% in Batch"
          accentColor="#CA8A04"
          icon={<Trophy className="w-4 h-4 text-[#CA8A04]" />}
        />
      </div>

      {/* Quick Actions (Matching Panel 3) */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#667A93]">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            href="/dashboard/profile"
            className="flex flex-col items-center justify-center p-4 rounded-lg border border-[#DCE5F1] bg-white hover:border-[#0F172A] hover:bg-[#F6F8FC] transition-all text-center group"
          >
            <User className="w-4 h-4 text-[#526783] group-hover:text-[#0F172A] mb-2" />
            <span className="text-xs font-medium text-[#0F172A]">
              Update Profile
            </span>
          </Link>

          <Link
            href="/qr/my-code"
            className="flex flex-col items-center justify-center p-4 rounded-lg border border-[#DCE5F1] bg-white hover:border-[#0F172A] hover:bg-[#F6F8FC] transition-all text-center group"
          >
            <Upload className="w-4 h-4 text-[#526783] group-hover:text-[#0F172A] mb-2" />
            <span className="text-xs font-medium text-[#0F172A]">
              Upload Documents
            </span>
          </Link>

          <Link
            href="/tests"
            className="flex flex-col items-center justify-center p-4 rounded-lg border border-[#DCE5F1] bg-white hover:border-[#0F172A] hover:bg-[#F6F8FC] transition-all text-center group"
          >
            <FileCheck2 className="w-4 h-4 text-[#526783] group-hover:text-[#0F172A] mb-2" />
            <span className="text-xs font-medium text-[#0F172A]">
              Take AI/ML Test
            </span>
          </Link>

          <Link
            href="/ranking"
            className="flex flex-col items-center justify-center p-4 rounded-lg border border-[#DCE5F1] bg-white hover:border-[#0F172A] hover:bg-[#F6F8FC] transition-all text-center group"
          >
            <Trophy className="w-4 h-4 text-[#526783] group-hover:text-[#0F172A] mb-2" />
            <span className="text-xs font-medium text-[#0F172A]">
              View My Rank
            </span>
          </Link>

          <Link
            href="/events"
            className="flex flex-col items-center justify-center p-4 rounded-lg border border-[#DCE5F1] bg-white hover:border-[#0F172A] hover:bg-[#F6F8FC] transition-all text-center group"
          >
            <Calendar className="w-4 h-4 text-[#526783] group-hover:text-[#0F172A] mb-2" />
            <span className="text-xs font-medium text-[#0F172A]">
              Register for Event
            </span>
          </Link>

          <Link
            href="/opportunities"
            className="flex flex-col items-center justify-center p-4 rounded-lg border border-[#DCE5F1] bg-white hover:border-[#0F172A] hover:bg-[#F6F8FC] transition-all text-center group"
          >
            <Briefcase className="w-4 h-4 text-[#526783] group-hover:text-[#0F172A] mb-2" />
            <span className="text-xs font-medium text-[#0F172A]">
              Find Opportunities
            </span>
          </Link>
        </div>
      </div>

      {/* Two Columns: Recent Activities & My Progress (Matching Panel 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Activities */}
        <div className="lg:col-span-7 rounded-lg border border-[#DCE5F1] bg-white p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#DCE5F1] pb-3">
            <h3 className="text-sm font-semibold text-[#0F172A]">
              Recent Activities
            </h3>
            <span className="text-xs text-[#667A93]">Last 7 days</span>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[#F6F8FC] transition-colors">
              <div className="w-8 h-8 rounded-full bg-[#EDF4FC] flex items-center justify-center text-[#0F172A] shrink-0 mt-0.5">
                <GitBranch className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-[#0F172A]">
                  GitHub profile updated
                </div>
                <div className="text-[11px] text-[#667A93]">
                  2 repositories synced with capstone showcase
                </div>
              </div>
              <span className="text-[10px] text-[#71849B] shrink-0">
                2 hours ago
              </span>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[#F6F8FC] transition-colors">
              <div className="w-8 h-8 rounded-full bg-[#EDF4FC] flex items-center justify-center text-[#2563EB] shrink-0 mt-0.5">
                <Award className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-[#0F172A]">
                  Certificate uploaded (AWS ML Specialty)
                </div>
                <div className="text-[11px] text-[#667A93]">
                  Credential verified by faculty advisor
                </div>
              </div>
              <span className="text-[10px] text-[#71849B] shrink-0">
                1 day ago
              </span>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[#F6F8FC] transition-colors">
              <div className="w-8 h-8 rounded-full bg-[#EDF4FC] flex items-center justify-center text-[#16A34A] shrink-0 mt-0.5">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-[#0F172A]">
                  Registered for GenAI Hackathon 2026
                </div>
                <div className="text-[11px] text-[#667A93]">
                  Team confirmed: Neural Knights (3 members)
                </div>
              </div>
              <span className="text-[10px] text-[#71849B] shrink-0">
                3 days ago
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: My Progress (Matching Panel 3) */}
        <div className="lg:col-span-5 rounded-lg border border-[#DCE5F1] bg-white p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#DCE5F1] pb-3">
            <h3 className="text-sm font-semibold text-[#0F172A]">
              My Progress
            </h3>
            <span className="text-xs font-medium text-[#16A34A]">
              On Track
            </span>
          </div>

          {/* Circular Indicator & Breakdown */}
          <div className="flex items-center gap-6">
            <div className="relative w-20 h-20 rounded-full border-4 border-[#DCE5F1] border-t-[#111111] border-r-[#111111] flex items-center justify-center shrink-0">
              <span className="text-xl font-bold text-[#0F172A]">78%</span>
            </div>
            <div className="text-xs text-[#526783] space-y-1">
              <div className="font-medium text-[#0F172A]">
                Profile Readiness
              </div>
              <p className="text-[11px] leading-relaxed text-[#667A93]">
                Your profile is 78% complete for upcoming campus recruitment drives.
              </p>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#526783]">Profile Completeness</span>
                <span className="font-medium text-[#0F172A]">90%</span>
              </div>
              <div className="h-1.5 w-full bg-[#EDF4FC] rounded-full overflow-hidden">
                <div className="h-full bg-[#0F172A] rounded-full w-[90%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#526783]">Skills & Certifications</span>
                <span className="font-medium text-[#0F172A]">80%</span>
              </div>
              <div className="h-1.5 w-full bg-[#EDF4FC] rounded-full overflow-hidden">
                <div className="h-full bg-[#0F172A] rounded-full w-[80%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#526783]">Projects & Publications</span>
                <span className="font-medium text-[#0F172A]">75%</span>
              </div>
              <div className="h-1.5 w-full bg-[#EDF4FC] rounded-full overflow-hidden">
                <div className="h-full bg-[#0F172A] rounded-full w-[75%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#526783]">AI/ML Test Score</span>
                <span className="font-medium text-[#0F172A]">82%</span>
              </div>
              <div className="h-1.5 w-full bg-[#EDF4FC] rounded-full overflow-hidden">
                <div className="h-full bg-[#2563EB] rounded-full w-[82%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#526783]">Verified Documents</span>
                <span className="font-medium text-[#0F172A]">65%</span>
              </div>
              <div className="h-1.5 w-full bg-[#EDF4FC] rounded-full overflow-hidden">
                <div className="h-full bg-[#0F172A] rounded-full w-[65%]" />
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
function HODDashboardView() {
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
      <WorkspaceHero eyebrow="Department intelligence · Preview" title={<>See the whole <span className="text-[#1478ef]">picture.</span></>} description="An overview of learning, research, and outcomes across the department." tone="blue" icon={BarChart3} visual="campus" />

      {/* 4 Stat Cards in a row (Matching Panel 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <div className="lg:col-span-7 rounded-lg border border-[#DCE5F1] bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#0F172A]">
              Placement & Rankings
            </h3>
            <div className="flex items-center gap-4 text-[11px] text-[#667A93]">
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
        <div className="lg:col-span-5 rounded-lg border border-[#DCE5F1] bg-white p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#DCE5F1] pb-3">
            <h3 className="text-sm font-semibold text-[#0F172A]">
              Top Skills in Department
            </h3>
            <span className="text-xs text-[#667A93]">Cohort 2026</span>
          </div>

          <div className="space-y-4 pt-2">
            {topSkills.map((skill) => (
              <div key={skill.name} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-[#0F172A]">
                    {skill.name}
                  </span>
                  <span className="text-[#526783] font-semibold">
                    {skill.percentage}%
                  </span>
                </div>
                <div className="h-2 w-full bg-[#EDF4FC] rounded-full overflow-hidden">
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
      <div className="rounded-lg border border-[#DCE5F1] bg-white overflow-hidden">
        <div className="p-5 border-b border-[#DCE5F1] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#0F172A]">
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
            <thead className="bg-[#F6F8FC] border-b border-[#DCE5F1] text-[#526783] font-medium">
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
              <tr className="hover:bg-[#F6F8FC]">
                <td className="p-3.5 font-medium text-[#0F172A]">
                  Profile Update
                </td>
                <td className="p-3.5 text-[#526783]">Dr. S. Mehta</td>
                <td className="p-3.5 text-[#667A93]">
                  Student skill update - Ananya
                </td>
                <td className="p-3.5 text-[#667A93]">12 Sep 2026</td>
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

              <tr className="hover:bg-[#F6F8FC]">
                <td className="p-3.5 font-medium text-[#0F172A]">
                  New Project
                </td>
                <td className="p-3.5 text-[#526783]">Prof. R. Singh</td>
                <td className="p-3.5 text-[#667A93]">
                  LLM Research Project
                </td>
                <td className="p-3.5 text-[#667A93]">11 Sep 2026</td>
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

              <tr className="hover:bg-[#F6F8FC]">
                <td className="p-3.5 font-medium text-[#0F172A]">Event</td>
                <td className="p-3.5 text-[#526783]">Prof. K. Verma</td>
                <td className="p-3.5 text-[#667A93]">GenAI Workshop</td>
                <td className="p-3.5 text-[#667A93]">10 Sep 2026</td>
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
function FacultyDashboardView() {
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
      <WorkspaceHero eyebrow="Faculty workspace · Preview" title={<>Good to see you <span className="text-[#1478ef]">here.</span></>} description="A clear view of mentoring, projects, requests, and academic activity." tone="blue" icon={GraduationCap} />

      {/* 4 Stat Cards in a row (Matching Panel 5) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="My Students" value="28" icon={<Users className="w-4 h-4 text-[#0F172A]" />} />
        <StatCard label="Active Projects" value="6" icon={<GitBranch className="w-4 h-4 text-[#2563EB]" />} />
        <StatCard label="Pending Requests" value="3" highlight icon={<Clock className="w-4 h-4 text-[#DC2626]" />} />
        <StatCard label="Events Conducted" value="4" icon={<Calendar className="w-4 h-4 text-[#16A34A]" />} />
      </div>

      {/* Tabs: [My Students] [Projects] [Requests] [Upcoming Events] (Matching Panel 5) */}
      <div className="space-y-4">
        <div className="overflow-x-auto max-w-full pb-1">
          <div className="inline-flex h-9 items-center rounded-lg bg-[#EDF4FC] p-1 text-xs font-medium text-[#526783] whitespace-nowrap">
          <button
            onClick={() => setTab("students")}
            className={`px-3 py-1 rounded-md transition-all ${
              tab === "students"
                ? "bg-white text-[#0F172A] shadow-subtle"
                : "text-[#526783] hover:text-[#0F172A]"
            }`}
          >
            My Students
          </button>
          <button
            onClick={() => setTab("projects")}
            className={`px-3 py-1 rounded-md transition-all ${
              tab === "projects"
                ? "bg-white text-[#0F172A] shadow-subtle"
                : "text-[#526783] hover:text-[#0F172A]"
            }`}
          >
            Projects
          </button>
          <button
            onClick={() => setTab("requests")}
            className={`px-3 py-1 rounded-md transition-all ${
              tab === "requests"
                ? "bg-white text-[#0F172A] shadow-subtle"
                : "text-[#526783] hover:text-[#0F172A]"
            }`}
          >
            Requests
          </button>
          <button
            onClick={() => setTab("events")}
            className={`px-3 py-1 rounded-md transition-all ${
              tab === "events"
                ? "bg-white text-[#0F172A] shadow-subtle"
                : "text-[#526783] hover:text-[#0F172A]"
            }`}
          >
            Upcoming Events
          </button>
        </div>
      </div>

        {/* Student Table (Matching Panel 5) */}
        {tab === "students" && (
          <div className="rounded-lg border border-[#DCE5F1] bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F6F8FC] border-b border-[#DCE5F1] text-[#526783] font-medium">
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
                    <tr key={st.regNo} className="hover:bg-[#F6F8FC]">
                      <td className="p-3.5 font-medium text-[#0F172A]">
                        {st.regNo}
                      </td>
                      <td className="p-3.5 font-medium text-[#0F172A]">
                        {st.name}
                      </td>
                      <td className="p-3.5 text-[#526783]">{st.section}</td>
                      <td className="p-3.5 text-[#526783]">{st.cgpa}</td>
                      <td className="p-3.5 text-[#0F172A] font-medium">
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
          <div className="p-8 text-center border border-[#DCE5F1] rounded-lg bg-white text-xs text-[#667A93]">
            Active student capstone & research projects will appear here.
          </div>
        )}

        {tab === "requests" && (
          <div className="p-8 text-center border border-[#DCE5F1] rounded-lg bg-white text-xs text-[#667A93]">
            3 change requests awaiting submission or HOD review.
          </div>
        )}

        {tab === "events" && (
          <div className="p-8 text-center border border-[#DCE5F1] rounded-lg bg-white text-xs text-[#667A93]">
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
      <WorkspaceHero eyebrow="Platform overview · Preview" title={<>Keep AIMETRA <span className="text-[#ffcf36]">running.</span></>} description="Review platform activity, administration, and system information in one place." tone="navy" icon={ShieldCheck} />

      {/* 4 Stat Cards in a row (Matching Panel 6) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <div className="lg:col-span-7 rounded-lg border border-[#DCE5F1] bg-white p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#DCE5F1] pb-3">
            <h3 className="text-sm font-semibold text-[#0F172A]">
              User Distribution
            </h3>
            <span className="text-xs text-[#667A93]">1,435 Total</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
            <div className="w-48 h-48 relative">
              <UserDistributionChart data={userDistribution} />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-lg font-bold text-[#0F172A]">1,435</span>
                <span className="text-[10px] text-[#667A93]">Users</span>
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
                    <span className="text-[#526783]">{item.name}</span>
                  </div>
                  <span className="font-semibold text-[#0F172A]">
                    {item.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Recent Logins */}
        <div className="lg:col-span-5 rounded-lg border border-[#DCE5F1] bg-white p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#DCE5F1] pb-3">
            <h3 className="text-sm font-semibold text-[#0F172A]">
              Recent Logins
            </h3>
            <span className="text-xs text-[#667A93]">Live telemetry</span>
          </div>

          <div className="space-y-3 pt-1">
            {recentLogins.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F6F8FC] transition-colors text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#0F172A] text-white flex items-center justify-center text-xs font-medium">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-[#0F172A]">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-[#667A93]">
                      {item.role}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-[#71849B]">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom: System Activity (Last 7 Days) Area Chart (Matching Panel 6) */}
      <div className="rounded-lg border border-[#DCE5F1] bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#0F172A]">
            System Activity (Last 7 Days)
          </h3>
          <span className="text-xs text-[#667A93]">1.2k - 1.5k requests/day</span>
        </div>

        <div className="h-60 w-full pt-2">
          <SystemActivityChart data={activityData} />
        </div>
      </div>
    </div>
  )
}
