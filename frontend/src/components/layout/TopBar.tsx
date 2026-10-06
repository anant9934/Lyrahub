"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Search, Bell, HelpCircle, Menu, Sparkles, X, ChevronRight } from "lucide-react"

interface TopBarProps {
  onOpenMobileMenu: () => void
  onOpenAIDA?: () => void
}

const PAGE_TITLES: Record<string, { title: string; section?: string }> = {
  "/dashboard":             { title: "Dashboard",                section: "Home" },
  "/dashboard/profile":     { title: "My Profile",               section: "Account" },
  "/documents":             { title: "Documents",                 section: "Files" },
  "/settings":              { title: "Settings",                  section: "Account" },
  "/ranking":               { title: "Student Rankings",          section: "Academic" },
  "/tests":                 { title: "AI/ML Tests",               section: "Academic" },
  "/projects":              { title: "Project Repository",        section: "Innovation" },
  "/events":                { title: "Department Events",         section: "Campus" },
  "/opportunities":         { title: "Opportunities & Internships", section: "Career" },
  "/courses":               { title: "Course Catalog",            section: "Academic" },
  "/programs":              { title: "Degree Programs",           section: "Academic" },
  "/leadership":            { title: "Leadership Directory",      section: "People" },
  "/alumni":                { title: "Alumni Network",            section: "People" },
  "/groups":                { title: "Clubs & SIGs",              section: "Community" },
  "/achievements":          { title: "Achievements",              section: "Academic" },
  "/approvals":             { title: "Approvals Queue",           section: "Admin" },
  "/aida":                  { title: "AIDA Assistant",            section: "AI Tools" },
  "/ai-usage":              { title: "AI Usage Monitor",          section: "Admin" },
}

function getPageInfo(pathname: string) {
  for (const [key, val] of Object.entries(PAGE_TITLES)) {
    if (pathname === key || (key !== "/dashboard" && pathname.startsWith(key))) {
      return val
    }
  }
  return { title: "Department Portal", section: "AIMETRA" }
}

// Dummy recent notifications
const NOTIFICATIONS = [
  { id: 1, icon: "🎯", title: "New test available", body: "ML Fundamentals — 30 questions", time: "2m ago", unread: true },
  { id: 2, icon: "🏆", title: "Ranking updated", body: "Your position improved to #12", time: "1h ago", unread: true },
  { id: 3, icon: "📅", title: "Event reminder", body: "GenAI Workshop tomorrow at 10am", time: "3h ago", unread: false },
]

export function TopBar({ onOpenMobileMenu, onOpenAIDA }: TopBarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const pageInfo = getPageInfo(pathname)

  // Track scroll for shadow
  useEffect(() => {
    const el = document.querySelector(".aimetra-workspace")
    if (!el) return
    const onScroll = () => setScrolled(el.scrollTop > 4)
    el.addEventListener("scroll", onScroll)
    return () => el.removeEventListener("scroll", onScroll)
  }, [])

  const submitSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const q = searchQuery.trim()
    if (!q) return
    router.push(`/people?search=${encodeURIComponent(q)}`)
    setMobileSearchOpen(false)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setNotificationsOpen(false)
        setMobileSearchOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length

  const displayName = user?.email
    ? user.email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    : "U"

  return (
    <header
      className={`sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-[#D4E0F0]/60 bg-white/90 px-4 backdrop-blur-md transition-shadow sm:px-6 dark:border-[#1E3456]/60 dark:bg-[#0f1829]/90 ${
        scrolled ? "shadow-[0_2px_16px_rgba(9,25,54,0.08)]" : ""
      }`}
    >
      {/* ── Left: Mobile menu + Breadcrumb ────────────────────────────────── */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-[#526783] hover:text-[#091936] hover:bg-[#EDF4FC] rounded-lg transition-colors shrink-0"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb */}
        <div className="min-w-0">
          <div className="hidden items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1478ef] sm:flex">
            <span className="text-[#9ab5d0]">AIMETRA</span>
            <ChevronRight className="w-3 h-3 text-[#C4D8EE]" />
            <span>{pageInfo.section}</span>
          </div>
          <h2 className="truncate text-[15px] font-black tracking-[-0.03em] text-[#091936] dark:text-white leading-tight">
            {pageInfo.title}
          </h2>
        </div>
      </div>

      {/* ── Right: Search + AIDA + Notifications + Avatar ─────────────────── */}
      <div className="flex items-center gap-1.5 sm:gap-2">

        {/* Global search (Desktop) */}
        <form onSubmit={submitSearch} className="relative hidden w-36 sm:block md:w-48 lg:w-60">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9ab5d0]" />
          <input
            type="text"
            aria-label="Search people"
            placeholder="Search people…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-xl border border-[#D4E0F0] bg-[#F0F4FA] pl-9 pr-3 text-[12px] text-[#091936] placeholder:text-[#9ab5d0] transition-all focus:border-[#1478ef] focus:bg-white focus:outline-none focus:shadow-[0_0_0_3px_rgba(20,120,239,0.12)] dark:bg-[#0f1829] dark:text-white dark:border-[#1E3456]"
          />
        </form>

        {/* Mobile search trigger */}
        <button
          onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
          className="sm:hidden p-2 text-[#526783] hover:text-[#091936] hover:bg-[#EDF4FC] rounded-lg transition-colors"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* AIDA AI button */}
        {onOpenAIDA && (
          <button
            onClick={onOpenAIDA}
            className="hidden items-center gap-1.5 rounded-full border border-[#C4DFFF] bg-gradient-to-r from-[#EDF5FF] to-[#E8F2FF] px-3 py-1.5 text-[11px] font-bold text-[#1478ef] transition-all hover:border-[#1478ef] hover:shadow-[0_2px_8px_rgba(20,120,239,0.20)] md:flex dark:border-[#1E3456] dark:bg-[#0f1829] dark:text-[#79bbff]"
            title="Open AIDA Assistant"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask AIDA</span>
          </button>
        )}

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 text-[#526783] hover:text-[#091936] hover:bg-[#EDF4FC] rounded-full transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#1478ef] text-[9px] font-bold text-white shadow">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications dropdown */}
          {notificationsOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
              <div className="absolute right-0 top-full mt-2 z-50 w-[calc(100vw-24px)] sm:w-80 rounded-2xl border border-[#D4E0F0] bg-white shadow-[0_8px_32px_rgba(9,25,54,0.14)] animate-in fade-in slide-in-from-top-2 duration-150 dark:bg-[#101e35] dark:border-[#1E3456]">
                <div className="flex items-center justify-between border-b border-[#D4E0F0] px-4 py-3 dark:border-[#1E3456]">
                  <span className="text-[12px] font-bold text-[#091936] dark:text-white">Notifications</span>
                  <button
                    onClick={() => setNotificationsOpen(false)}
                    className="text-[#9ab5d0] hover:text-[#526783]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="divide-y divide-[#F0F4FA] dark:divide-[#1E3456]">
                  {NOTIFICATIONS.map((n) => (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[#F0F4FA] dark:hover:bg-[#152138] ${
                        n.unread ? "bg-[#F8FBFF]" : ""
                      }`}
                    >
                      <span className="mt-0.5 text-xl shrink-0">{n.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-semibold text-[#091936] dark:text-white">{n.title}</p>
                        <p className="text-[11px] text-[#526783] dark:text-[#7aace0]">{n.body}</p>
                        <p className="mt-0.5 text-[10px] text-[#9ab5d0]">{n.time}</p>
                      </div>
                      {n.unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#1478ef]" />}
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#D4E0F0] px-4 py-2.5 dark:border-[#1E3456]">
                  <button className="w-full text-center text-[11px] font-semibold text-[#1478ef] hover:underline">
                    View all notifications
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Help */}
        <Link
          href="/leadership"
          className="p-2 text-[#526783] hover:text-[#091936] hover:bg-[#EDF4FC] rounded-full transition-colors"
          title="Department Directory"
        >
          <HelpCircle className="w-4 h-4" />
        </Link>

        {/* User Avatar */}
        <Link
          href="/dashboard/profile"
          className="ml-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#1478ef] to-[#0a5ecc] text-[13px] font-bold text-white shadow-[0_2px_8px_rgba(20,120,239,0.35)] transition-all hover:shadow-[0_4px_12px_rgba(20,120,239,0.45)] hover:ring-2 hover:ring-[#A8CFF7]"
          title={displayName}
        >
          {displayName.charAt(0)}
        </Link>
      </div>

      {/* ── Mobile expandable search ───────────────────────────────────────── */}
      {mobileSearchOpen && (
        <div className="sm:hidden absolute top-[68px] inset-x-0 z-30 flex items-center gap-2 border-b border-[#D4E0F0] bg-white/95 p-3 shadow-md backdrop-blur animate-in slide-in-from-top-2 duration-150 dark:bg-[#0f1829]/95 dark:border-[#1E3456]">
          <form onSubmit={submitSearch} className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9ab5d0]" />
            <input
              type="text"
              autoFocus
              aria-label="Search people"
              placeholder="Search people…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-[#D4E0F0] bg-[#F0F4FA] text-[12px] text-[#091936] placeholder:text-[#9ab5d0] focus:bg-white focus:outline-none focus:border-[#1478ef]"
            />
          </form>
          <button onClick={() => setMobileSearchOpen(false)} className="p-1.5 text-[#526783]">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  )
}
