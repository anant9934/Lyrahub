"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { DashboardSidebar } from "./DashboardSidebar"
import { TopBar } from "./TopBar"
import { ResponsiveBottomNav } from "@/components/responsive/ResponsiveBottomNav"

const AIDAAssistant = dynamic(
  () => import("../features/ai/AIDAAssistant").then((mod) => mod.AIDAAssistant),
  { ssr: false }
)

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [aidaOpen, setAidaOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const section = usePathname().split("/").filter(Boolean)[0] || "dashboard"

  useEffect(() => {
    document.documentElement.classList.toggle("motion-reduced", localStorage.getItem("aimetra-reduced-motion") === "true")
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink md:flex-row dark:bg-[#101827]">
      {/* Desktop / Tablet Sidebar */}
      <div className="hidden md:block shrink-0">
        <DashboardSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 flex w-full max-w-xs flex-1 flex-col bg-surface animate-in slide-in-from-left duration-200">
            <DashboardSidebar onClose={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenAIDA={() => setAidaOpen(true)}
        />
        <main data-section={section} className="aimetra-workspace flex-1 overflow-y-auto p-4 pb-20 sm:p-6 lg:p-8 md:pb-8 dark:bg-[#101827]">
          {children}
        </main>
      </div>

      {/* Floating AIDA Assistant Trigger (Desktop only - mobile has it in BottomNav) */}
      <div className="hidden md:flex fixed bottom-6 right-6 z-40 flex-col items-center gap-0">
        {/* Robot image sitting above the button */}
        <button
          onClick={() => setAidaOpen(!aidaOpen)}
          aria-label="Open AIDA assistant"
          className="group relative flex flex-col items-center"
        >
          {/* AIDA mascot — large, floating above pill */}
          <div className="relative h-20 w-20 transition-transform duration-200 group-hover:-translate-y-1 drop-shadow-[0_8px_20px_rgba(9,103,209,0.4)]">
            <Image
              src="/images/aida-mascot.png"
              alt="AIDA robot assistant"
              fill
              sizes="80px"
              className="object-contain"
            />
          </div>
          {/* Pill label */}
          <div className="flex items-center gap-1.5 rounded-full border border-[#1d3760] bg-[#071b3d] px-3.5 py-1.5 text-xs font-bold text-white shadow-[0_8px_24px_rgba(7,27,61,0.35)] transition-all group-hover:bg-[#1478ef] -mt-1">
            <span className="text-[#ffda48]">✦</span>
            <span>Ask AIDA</span>
          </div>
        </button>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <ResponsiveBottomNav onOpenAIDA={() => setAidaOpen(true)} />

      {/* AIDA Slide-over Panel */}
      <AIDAAssistant isOpen={aidaOpen} onClose={() => setAidaOpen(false)} />
    </div>
  )
}
