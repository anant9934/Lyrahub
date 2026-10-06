"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Trophy,
  FolderGit2,
  Sparkles,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ResponsiveBottomNavProps {
  onOpenAIDA?: () => void
}

/**
 * Mobile Bottom Navigation.
 * Thumb-accessible navigation bar for mobile authenticated areas.
 * Anchors key workflows within one-handed reach and accounts for iOS/Android home indicators.
 */
export function ResponsiveBottomNav({ onOpenAIDA }: ResponsiveBottomNavProps) {
  const pathname = usePathname()

  const navLinks = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
    { label: "Rankings", href: "/ranking", icon: Trophy },
    { label: "Projects", href: "/projects", icon: FolderGit2 },
    { label: "AIDA", href: "#aida", icon: Sparkles, isAction: true },
    { label: "Profile", href: "/dashboard/profile", icon: User },
  ]

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 px-2 backdrop-blur md:hidden"
      style={{
        paddingBottom: "max(6px, env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div className="flex items-center justify-around h-14">
        {navLinks.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href) && !item.isAction

          const Icon = item.icon

          if (item.isAction) {
            return (
              <button
                key={item.label}
                type="button"
                aria-label="Ask AIDA assistant"
                onClick={onOpenAIDA}
                className="flex flex-col items-center justify-center flex-1 py-1 text-center group text-[#526783] hover:text-[#0F172A]"
              >
                <div className="-mt-3 flex h-9 w-9 items-center justify-center rounded-full bg-brand-navy text-white shadow-md">
                  <Icon className="h-4 w-4 text-brand-yellow" />
                </div>
                <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
              </button>
            )
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              aria-label={item.label}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-1 text-center transition-colors min-h-[44px]",
                isActive
                  ? "font-bold text-brand-blue"
                  : "text-ink-400 hover:text-brand-blue"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5",
                  isActive ? "text-brand-blue" : "text-ink-400"
                )}
              />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
