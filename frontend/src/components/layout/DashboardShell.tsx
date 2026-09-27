"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { DashboardSidebar } from "./DashboardSidebar"
import { TopBar } from "./TopBar"
import { ResponsiveBottomNav } from "@/components/responsive/ResponsiveBottomNav"
import { Sparkles } from "lucide-react"

const AIDAAssistant = dynamic(
  () => import("../features/ai/AIDAAssistant").then((mod) => mod.AIDAAssistant),
  { ssr: false }
)

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [aidaOpen, setAidaOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col md:flex-row">
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
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-10 animate-in slide-in-from-left duration-200">
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 bg-white overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Floating AIDA Assistant Trigger (Desktop only - mobile has it in BottomNav) */}
      <div className="hidden md:block fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setAidaOpen(!aidaOpen)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#111111] text-white shadow-modal hover:bg-neutral-800 transition-all text-xs font-medium"
        >
          <Sparkles className="w-4 h-4 text-[#2563EB]" />
          <span>Ask AIDA</span>
        </button>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <ResponsiveBottomNav onOpenAIDA={() => setAidaOpen(true)} />

      {/* AIDA Slide-over Panel */}
      <AIDAAssistant isOpen={aidaOpen} onClose={() => setAidaOpen(false)} />
    </div>
  )
}
