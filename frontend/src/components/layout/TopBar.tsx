"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Search, Bell, HelpCircle, Menu, Sparkles, X } from "lucide-react"

interface TopBarProps {
  onOpenMobileMenu: () => void
  onOpenAIDA?: () => void
}

export function TopBar({ onOpenMobileMenu, onOpenAIDA }: TopBarProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  // Close notifications on Escape
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

  // Derive human-readable page title
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard"
    if (pathname.startsWith("/dashboard/profile")) return "My Profile"
    if (pathname.startsWith("/ranking")) return "Student Rankings"
    if (pathname.startsWith("/tests")) return "AI/ML Tests"
    if (pathname.startsWith("/projects")) return "Project Repository"
    if (pathname.startsWith("/events")) return "Department Events"
    if (pathname.startsWith("/opportunities")) return "Opportunities & Internships"
    if (pathname.startsWith("/courses")) return "Course Catalog"
    if (pathname.startsWith("/programs")) return "Degree Programs"
    if (pathname.startsWith("/leadership")) return "Leadership Directory"
    if (pathname.startsWith("/alumni")) return "Alumni Network"
    if (pathname.startsWith("/groups")) return "Clubs & SIGs"
    if (pathname.startsWith("/achievements")) return "Achievements"
    if (pathname.startsWith("/approvals")) return "Approvals Queue"
    if (pathname.startsWith("/admin")) return "Administration"
    return "Department Portal"
  }

  return (
    <header className="h-16 border-b border-[#E5E5E5] bg-white px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile menu trigger + Page title */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-[#555555] hover:text-[#111111] hover:bg-[#F5F5F5] rounded-md transition-colors shrink-0"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-semibold text-[#111111] tracking-tight truncate">
            {getPageTitle()}
          </h2>
        </div>
      </div>

      {/* Right: Search, Notifications, AIDA shortcut, User Avatar */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Global Search Bar (Desktop / Tablet) */}
        <div className="relative hidden sm:block w-36 md:w-48 lg:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
          <input
            type="text"
            placeholder="Search students, projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] text-xs text-[#111111] placeholder:text-[#888888] focus:bg-white focus:outline-none focus:border-[#111111] transition-colors"
          />
        </div>

        {/* Mobile Search Trigger (< sm) */}
        <button
          onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
          className="sm:hidden p-2 text-[#555555] hover:text-[#111111] hover:bg-[#F5F5F5] rounded-full transition-colors"
          title="Search"
          aria-label="Toggle search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* AIDA AI Assistant trigger */}
        {onOpenAIDA && (
          <button
            onClick={onOpenAIDA}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E5E5] text-xs font-medium text-[#111111] bg-white hover:bg-[#FAFAFA] transition-colors"
            title="Open AIDA Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>AIDA</span>
          </button>
        )}

        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 text-[#555555] hover:text-[#111111] hover:bg-[#F5F5F5] rounded-full transition-colors relative"
            title="Notifications"
            aria-label="Toggle notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-[#2563EB] absolute top-1.5 right-1.5"></span>
          </button>

          {/* Simple notifications popover — clamped width */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-[calc(100vw-32px)] sm:w-72 max-w-xs rounded-lg border border-[#E5E5E5] bg-white p-3 shadow-dropdown z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2 mb-2">
                <span className="text-xs font-semibold text-[#111111]">Notifications</span>
                <span className="text-[10px] text-[#2563EB] cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded bg-[#FAFAFA] hover:bg-[#F5F5F5] transition-colors">
                  <div className="font-medium text-[#111111]">Rankings Updated</div>
                  <div className="text-[10px] text-[#777777] mt-0.5">Semester rankings recalculated by HOD</div>
                </div>
                <div className="p-2 rounded hover:bg-[#FAFAFA] transition-colors">
                  <div className="font-medium text-[#111111]">GenAI Hackathon 2026</div>
                  <div className="text-[10px] text-[#777777] mt-0.5">Registration confirmed for next weekend</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Help icon */}
        <Link
          href="/leadership"
          className="p-2 text-[#555555] hover:text-[#111111] hover:bg-[#F5F5F5] rounded-full transition-colors"
          title="Department Directory"
        >
          <HelpCircle className="w-4 h-4" />
        </Link>

        {/* User Avatar */}
        <Link
          href="/dashboard/profile"
          className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center font-medium text-xs hover:ring-2 hover:ring-[#E5E5E5] transition-all ml-1"
        >
          {user?.email?.charAt(0).toUpperCase() || "U"}
        </Link>
      </div>

      {/* Mobile Expandable Search Bar */}
      {mobileSearchOpen && (
        <div className="sm:hidden absolute top-16 inset-x-0 bg-white border-b border-[#E5E5E5] p-3 shadow-md z-30 flex items-center gap-2 animate-in slide-in-from-top-2 duration-150">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
            <input
              type="text"
              autoFocus
              placeholder="Search students, projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] text-xs text-[#111111] placeholder:text-[#888888] focus:bg-white focus:outline-none focus:border-[#111111]"
            />
          </div>
          <button
            onClick={() => setMobileSearchOpen(false)}
            className="p-1.5 text-[#777777] hover:text-[#111111]"
            aria-label="Close search"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  )
}
