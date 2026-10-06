"use client"

import Link from "next/link"
import Image from "next/image"
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
  Settings,
  BookOpen,
  LogOut,
  Sparkles,
  BarChart3,
  QrCode,
  Layers,
  Award,
  CheckSquare,
  Cpu,
  ChevronLeft,
  ChevronRight,
  LucideIcon,
} from "lucide-react"

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  exact?: boolean
  badge?: string | number
  group?: string
}

interface DashboardSidebarProps {
  onClose?: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}

// Nav group separator labels
const GROUP_LABELS: Record<string, string> = {
  main: "Main",
  academic: "Academic",
  tools: "Tools",
  admin: "Admin",
}

export function DashboardSidebar({
  onClose,
  collapsed = false,
  onToggleCollapse,
}: DashboardSidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const rolesList: string[] = user?.roles
    ? user.roles.map((r: { name?: string }) => r.name?.toLowerCase() || "")
    : []
  const isAdmin = rolesList.includes("admin") || user?.email === "admin@aiml.hub"
  const isHOD = rolesList.includes("hod") || user?.email === "hod@aiml.hub"
  const isFaculty = rolesList.includes("faculty")

  let navItems: NavItem[] = []

  if (isAdmin) {
    navItems = [
      { label: "Dashboard",        href: "/dashboard",        icon: LayoutDashboard, exact: true, group: "main" },
      { label: "My Profile",       href: "/dashboard/profile", icon: User,            group: "main" },
      { label: "Approvals",        href: "/approvals",        icon: CheckSquare,      group: "admin" },
      { label: "Data Management",  href: "/courses/manage",   icon: Layers,           group: "admin" },
      { label: "AI Usage Monitor", href: "/ai-usage",         icon: Cpu,              group: "admin" },
      { label: "Ask AIDA",         href: "/aida",             icon: Sparkles,         group: "tools" },
      { label: "Analytics",        href: "/ranking",          icon: BarChart3,        group: "tools" },
      { label: "Events",           href: "/events",           icon: Calendar,         group: "academic" },
      { label: "Projects",         href: "/projects",         icon: FolderGit2,       group: "academic" },
      { label: "Settings",         href: "/settings",         icon: Settings,         group: "tools" },
    ]
  } else if (isHOD) {
    navItems = [
      { label: "Dashboard",          href: "/dashboard",       icon: LayoutDashboard, exact: true, group: "main" },
      { label: "Students",           href: "/ranking",         icon: Users,           group: "main" },
      { label: "Faculty",            href: "/leadership",      icon: GraduationCap,   group: "main" },
      { label: "Ranking & Analytics",href: "/ranking",         icon: Trophy,          group: "academic" },
      { label: "AI Usage Monitor",   href: "/ai-usage",        icon: Cpu,             group: "admin" },
      { label: "Ask AIDA",           href: "/aida",            icon: Sparkles,        group: "tools" },
      { label: "Approvals",          href: "/approvals",       icon: CheckSquare,     group: "admin" },
      { label: "Projects",           href: "/projects",        icon: FolderGit2,      group: "academic" },
      { label: "Events",             href: "/events",          icon: Calendar,        group: "academic" },
      { label: "Achievements",       href: "/achievements",    icon: Award,           group: "academic" },
      { label: "Alumni",             href: "/alumni",          icon: Compass,         group: "main" },
      { label: "Reports & Export",   href: "/ranking/export",  icon: BarChart3,       group: "tools" },
      { label: "Courses",            href: "/courses",         icon: BookOpen,        group: "academic" },
      { label: "Programs",           href: "/programs",        icon: Layers,          group: "academic" },
      { label: "Opportunities",      href: "/opportunities",   icon: Briefcase,       group: "academic" },
      { label: "Settings",           href: "/settings",        icon: Settings,        group: "tools" },
    ]
  } else if (isFaculty) {
    navItems = [
      { label: "Dashboard",          href: "/dashboard",            icon: LayoutDashboard, exact: true, group: "main" },
      { label: "Student Rankings",   href: "/ranking",              icon: Users,           group: "main" },
      { label: "Faculty Profile",    href: "/dashboard/profile",    icon: User,            group: "main" },
      { label: "Projects",           href: "/projects",             icon: FolderGit2,      group: "academic" },
      { label: "Events & Activities",href: "/events",               icon: Calendar,        group: "academic" },
      { label: "Change Requests",    href: "/approvals",            icon: CheckSquare,     group: "tools" },
      { label: "Academic Tools",     href: "/tests/manage",         icon: FileCheck2,      group: "academic" },
      { label: "Ask AIDA",           href: "/aida",                 icon: Sparkles,        group: "tools" },
      { label: "Research",           href: "/projects",             icon: Sparkles,        group: "academic" },
      { label: "Achievements",       href: "/achievements",         icon: Trophy,          group: "academic" },
      { label: "Mentorship",         href: "/alumni/mentors",       icon: Compass,         group: "main" },
      { label: "Feedback",           href: "/testimonials",         icon: MessageSquare,   group: "tools" },
      { label: "Settings",           href: "/settings",             icon: Settings,        group: "tools" },
    ]
  } else {
    // Student
    navItems = [
      { label: "Dashboard",        href: "/dashboard",           icon: LayoutDashboard, exact: true, group: "main" },
      { label: "My Profile",       href: "/dashboard/profile",   icon: User,            group: "main" },
      { label: "Skills & Ranking", href: "/ranking",             icon: Trophy,          group: "academic" },
      { label: "Tests",            href: "/tests",               icon: FileCheck2,      group: "academic" },
      { label: "Ask AIDA",         href: "/aida",                icon: Sparkles,        group: "tools" },
      { label: "Projects",         href: "/projects",            icon: FolderGit2,      group: "academic" },
      { label: "Events",           href: "/events",              icon: Calendar,        group: "academic" },
      { label: "Opportunities",    href: "/opportunities",       icon: Briefcase,       group: "academic" },
      { label: "Academic Courses", href: "/courses",             icon: GraduationCap,   group: "academic" },
      { label: "Documents",        href: "/documents",           icon: FileText,        group: "tools" },
      { label: "Mentorship",       href: "/alumni/mentors",      icon: Compass,         group: "main" },
      { label: "Clubs & SIGs",     href: "/groups",              icon: Users,           group: "academic" },
      { label: "Feedback",         href: "/testimonials/create", icon: MessageSquare,   group: "tools" },
      { label: "Settings",         href: "/settings",            icon: Settings,        group: "tools" },
    ]
  }

  const getDisplayName = () => {
    if (!user?.email) return "Guest User"
    return user.email
      .split("@")[0]
      .replace(/[._-]+/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const getRoleLabel = () => {
    if (isAdmin)  return "Super Admin"
    if (isHOD)    return "HOD · AI & ML"
    if (isFaculty) return "Faculty · AI & ML"
    return "Student · CSE AIML"
  }

  const getRoleDot = () => {
    if (isAdmin)  return "bg-[#FFCF36]"
    if (isHOD)    return "bg-[#fb7185]"
    if (isFaculty) return "bg-[#34d399]"
    return "bg-[#60a5fa]"
  }

  // Group items for rendering with separators
  const renderedGroups = collapsed
    ? [navItems] // no separators when collapsed
    : (() => {
        const groups: { key: string; items: NavItem[] }[] = []
        let current: NavItem[] = []
        let currentGroup = ""
        for (const item of navItems) {
          const g = item.group || "main"
          if (g !== currentGroup) {
            if (current.length) groups.push({ key: currentGroup, items: current })
            current = [item]
            currentGroup = g
          } else {
            current.push(item)
          }
        }
        if (current.length) groups.push({ key: currentGroup, items: current })
        return groups
      })()

  return (
    <aside
      className={`sticky top-0 z-30 flex h-screen flex-col select-none transition-all duration-200 ${
        collapsed ? "w-[68px]" : "w-[240px]"
      }`}
      style={{
        background: "linear-gradient(180deg, #071b3d 0%, #0a2348 60%, #071b3d 100%)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "4px 0 24px rgba(0,0,0,0.20)",
      }}
    >
      {/* ── Brand Header ─────────────────────────────────────────────────── */}
      <div
        className={`flex h-[68px] shrink-0 items-center border-b border-white/[0.07] ${
          collapsed ? "justify-center px-2" : "justify-between px-4"
        }`}
      >
        <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          {/* AIDA mini avatar as logo */}
          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-xl bg-[#DDEFFF]">
            <Image src="/images/aida-mascot.png" alt="AIMETRA" fill sizes="32px" className="object-cover object-top" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span className="block truncate text-[13px] font-black tracking-[-0.04em] text-white uppercase leading-tight">
                AIMETRA
              </span>
              <span className="block text-[9px] font-medium tracking-wider text-[#5a9de0] uppercase">
                AI · ML · Hub
              </span>
            </div>
          )}
        </Link>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="rounded-lg p-1 text-[#5a8dbf] transition-colors hover:bg-white/10 hover:text-white"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* ── Nav Items ───────────────────────────────────────────────────── */}
      <div className={`flex-1 overflow-y-auto py-3 ${collapsed ? "px-2" : "px-2"}`}>
        {Array.isArray(renderedGroups[0])
          ? /* collapsed — flat list */
            (renderedGroups[0] as unknown as NavItem[]).map((item) => (
              <NavLink key={item.label} item={item} pathname={pathname} collapsed={collapsed} onClose={onClose} />
            ))
          : /* expanded — grouped */
            (renderedGroups as { key: string; items: NavItem[] }[]).map((group, gIdx) => (
              <div key={group.key} className={gIdx > 0 ? "mt-3 pt-3 border-t border-white/[0.06]" : ""}>
                {!collapsed && gIdx > 0 && (
                  <p className="mb-1.5 px-3 text-[9px] font-black uppercase tracking-[0.14em] text-[#3d6a99]">
                    {GROUP_LABELS[group.key] || group.key}
                  </p>
                )}
                {group.items.map((item) => (
                  <NavLink key={item.label} item={item} pathname={pathname} collapsed={collapsed} onClose={onClose} />
                ))}
              </div>
            ))
        }
      </div>

      {/* ── User Footer Card ─────────────────────────────────────────────── */}
      <div className={`shrink-0 border-t border-white/[0.07] ${collapsed ? "p-2" : "p-3"}`}>
        <div
          className={`flex items-center rounded-xl transition-colors hover:bg-white/08 ${
            collapsed ? "justify-center p-1.5" : "gap-2.5 p-2"
          }`}
        >
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-2.5 min-w-0 flex-1"
            title={collapsed ? getDisplayName() : undefined}
          >
            {/* Avatar with role dot */}
            <div className="relative shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#1478ef] to-[#0a5ecc] text-xs font-bold text-white shadow-[0_2px_8px_rgba(20,120,239,0.4)]">
                {getDisplayName().charAt(0)}
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#071b3d] ${getRoleDot()}`} />
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-semibold text-white leading-tight">
                  {getDisplayName()}
                </div>
                <div className="truncate text-[10px] text-[#4d85b8] leading-tight mt-0.5">
                  {getRoleLabel()}
                </div>
              </div>
            )}
          </Link>
          {!collapsed && (
            <button
              onClick={logout}
              className="shrink-0 rounded-lg p-1.5 text-[#4d85b8] transition-colors hover:bg-white/10 hover:text-[#fb7185]"
              title="Log Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}

// ── NavLink sub-component ─────────────────────────────────────────────────────

function NavLink({
  item,
  pathname,
  collapsed,
  onClose,
}: {
  item: NavItem
  pathname: string
  collapsed: boolean
  onClose?: () => void
}) {
  const isActive = item.exact
    ? pathname === item.href
    : pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))

  const Icon = item.icon

  return (
    <Link
      href={item.href}
      onClick={onClose}
      title={collapsed ? item.label : undefined}
      className={`flex items-center rounded-xl text-[12px] font-medium transition-all duration-150 mb-0.5 ${
        collapsed ? "justify-center p-2.5" : "justify-between px-3 py-2"
      } ${
        isActive
          ? "bg-[#1478ef] text-white shadow-[0_3px_12px_rgba(20,120,239,0.35)]"
          : "text-[#7aace0] hover:bg-white/[0.08] hover:text-white"
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <Icon
          className={`w-4 h-4 shrink-0 ${
            isActive ? "text-white" : "text-[#4d7fb0]"
          }`}
        />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </div>
      {item.badge && !collapsed && (
        <span
          className={`shrink-0 ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
            isActive ? "bg-white/20 text-white" : "bg-[#1478ef]/20 text-[#79bbff]"
          }`}
        >
          {item.badge}
        </span>
      )}
    </Link>
  )
}
