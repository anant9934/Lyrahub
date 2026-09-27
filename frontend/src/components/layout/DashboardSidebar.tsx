"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import {
  LayoutDashboard,
  User,
  Trophy,
  FileText,
  FolderGit2,
  Calendar,
  Briefcase,
  GraduationCap,
  FileCheck2,
  Users,
  Compass,
  MessageSquare,
  ShieldCheck,
  Settings,
  BookOpen,
  LogOut,
  Sparkles,
  BarChart3,
  QrCode,
  Layers,
  Award,
  Bell,
  CheckSquare,
  Cpu,
  ChevronLeft,
  ChevronRight,
  LucideIcon
} from "lucide-react"

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  exact?: boolean
  badge?: string | number
}

interface DashboardSidebarProps {
  onClose?: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export function DashboardSidebar({
  onClose,
  collapsed = false,
  onToggleCollapse,
}: DashboardSidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const rolesList: string[] = user?.roles ? user.roles.map((r: { name?: string }) => r.name?.toLowerCase() || "") : []
  const isAdmin = rolesList.includes("admin") || user?.email === "admin@aiml.hub"
  const isHOD = rolesList.includes("hod") || user?.email === "hod@aiml.hub"
  const isFaculty = rolesList.includes("faculty")

  // Role-based Nav definition per Section 36
  let navItems: NavItem[] = []

  if (isAdmin) {
    navItems = [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
      { label: "User Management", href: "/admin", icon: Users },
      { label: "Roles & Permissions", href: "/admin", icon: ShieldCheck },
      { label: "System Settings", href: "/admin", icon: Settings },
      { label: "Audit Logs", href: "/admin", icon: FileText },
      { label: "Data Management", href: "/courses/manage", icon: Layers },
      { label: "AI Usage Monitor", href: "/ai-usage", icon: Cpu },
      { label: "Analytics", href: "/ranking", icon: BarChart3 },
      { label: "Announcement", href: "/events", icon: Bell },
      { label: "Backup & Security", href: "/admin", icon: ShieldCheck },
    ]
  } else if (isHOD) {
    navItems = [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
      { label: "Students", href: "/ranking", icon: Users },
      { label: "Faculty", href: "/leadership", icon: GraduationCap },
      { label: "Ranking & Analytics", href: "/ranking", icon: Trophy },
      { label: "AI Usage Monitor", href: "/ai-usage", icon: Cpu },
      { label: "Approvals", href: "/approvals", icon: CheckSquare },
      { label: "Projects", href: "/projects", icon: FolderGit2 },
      { label: "Events", href: "/events", icon: Calendar },
      { label: "Achievements", href: "/achievements", icon: Award },
      { label: "Alumni", href: "/alumni", icon: Compass },
      { label: "Reports & Export", href: "/ranking/export", icon: BarChart3 },
      { label: "Courses", href: "/courses", icon: BookOpen },
      { label: "Programs", href: "/programs", icon: Layers },
      { label: "Opportunities", href: "/opportunities", icon: Briefcase },
      { label: "Settings", href: "/admin", icon: Settings },
    ]
  } else if (isFaculty) {
    navItems = [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
      { label: "My Students", href: "/dashboard?tab=students", icon: Users },
      { label: "Faculty Profile", href: "/dashboard/profile", icon: User },
      { label: "Projects", href: "/projects", icon: FolderGit2 },
      { label: "Events & Activities", href: "/events", icon: Calendar },
      { label: "Change Requests", href: "/approvals", icon: CheckSquare },
      { label: "Academic Tools", href: "/tests/manage", icon: FileCheck2 },
      { label: "Research", href: "/projects", icon: Sparkles },
      { label: "Achievements", href: "/achievements", icon: Trophy },
      { label: "Mentorship", href: "/alumni/mentors", icon: Compass },
      { label: "Feedback", href: "/testimonials", icon: MessageSquare },
    ]
  } else {
    // Student default
    navItems = [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
      { label: "My Profile", href: "/dashboard/profile", icon: User },
      { label: "Skills & Ranking", href: "/ranking", icon: Trophy },
      { label: "Tests", href: "/tests", icon: FileCheck2 },
      { label: "Projects", href: "/projects", icon: FolderGit2 },
      { label: "Events", href: "/events", icon: Calendar },
      { label: "Opportunities", href: "/opportunities", icon: Briefcase },
      { label: "Academic Courses", href: "/courses", icon: GraduationCap },
      { label: "Documents", href: "/qr/my-code", icon: QrCode },
      { label: "Mentorship", href: "/alumni/mentors", icon: Compass },
      { label: "Clubs & SIGs", href: "/groups", icon: Users },
      { label: "Feedback", href: "/testimonials/create", icon: MessageSquare },
    ]
  }

  // Display name & role badge logic
  const getDisplayName = () => {
    if (!user?.email) return "Guest User"
    if (isAdmin) return "Admin User"
    if (isHOD) return "Dr. A. Kumar"
    if (isFaculty) return "Prof. R. Singh"
    return "Rahul Sharma"
  }

  const getRoleLabel = () => {
    if (isAdmin) return "Super Admin"
    if (isHOD) return "HOD • AI & ML"
    if (isFaculty) return "Faculty • AI & ML"
    return "Student • CSE AIML"
  }

  return (
    <aside
      className={`border-r border-[#E5E5E5] bg-white flex flex-col h-screen sticky top-0 z-30 select-none transition-all duration-200 ${
        collapsed ? "w-[68px]" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div
        className={`h-16 flex items-center border-b border-[#E5E5E5] ${
          collapsed ? "justify-center px-2" : "justify-between px-4 sm:px-6"
        }`}
      >
        <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-7 h-7 rounded-md bg-[#111111] flex items-center justify-center text-white text-[9px] font-bold tracking-tight shrink-0">
            AM
          </div>
          {!collapsed && (
            <span className="font-bold text-sm tracking-[0.1em] text-[#111111] uppercase truncate">
              AIMETRA
            </span>
          )}
        </Link>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-md text-[#777777] hover:text-[#111111] hover:bg-[#F5F5F5] transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Nav List */}
      <div className={`flex-1 overflow-y-auto py-4 space-y-1 ${collapsed ? "px-2" : "px-3"}`}>
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))

          const IconComponent = item.icon

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose}
              title={collapsed ? item.label : undefined}
              className={`flex items-center rounded-lg text-xs font-medium transition-colors ${
                collapsed ? "justify-center p-2.5" : "justify-between px-3 py-2"
              } ${
                isActive
                  ? "bg-[#111111] text-white"
                  : "text-[#555555] hover:bg-[#F5F5F5] hover:text-[#111111]"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-[#777777]"}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </div>
              {item.badge && !collapsed && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold shrink-0 ml-1.5 ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-[#E5E5E5] text-[#333333]"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* User Footer Card */}
      <div className={`border-t border-[#E5E5E5] ${collapsed ? "p-2" : "p-3"}`}>
        <div
          className={`flex items-center rounded-lg hover:bg-[#FAFAFA] transition-colors ${
            collapsed ? "justify-center p-1.5" : "justify-between p-2"
          }`}
        >
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-2.5 min-w-0 flex-1"
            title={collapsed ? getDisplayName() : undefined}
          >
            <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center font-medium text-xs shrink-0">
              {getDisplayName().charAt(0)}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-[#111111] truncate">
                  {getDisplayName()}
                </div>
                <div className="text-[10px] text-[#777777] truncate">
                  {getRoleLabel()}
                </div>
              </div>
            )}
          </Link>
          {!collapsed && (
            <button
              onClick={logout}
              className="p-1.5 text-[#888888] hover:text-[#DC2626] rounded-md transition-colors"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
