import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface NavItemDef {
  label: string
  href: string
  icon: LucideIcon
  exact?: boolean
  badge?: string | number
}

interface ResponsiveSidebarProps {
  items: NavItemDef[]
  isOpen?: boolean
  onClose?: () => void
  isMobileDrawer?: boolean
  collapsed?: boolean
  onToggleCollapse?: () => void
}

/**
 * Adaptive navigation sidebar.
 * Adapts between persistent full sidebar (desktop), collapsed rail (tablet/laptop), and drawer (mobile).
 */
export function ResponsiveSidebar({
  items,
  isOpen = true,
  onClose,
  isMobileDrawer = false,
  collapsed = false,
  onToggleCollapse,
}: ResponsiveSidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  // In mobile drawer mode, respect isOpen state
  if (isMobileDrawer && !isOpen) {
    return null
  }

  // Display name & role badge logic
  const getDisplayName = () => {
    if (!user?.email) return "Guest User"
    return user.email.split("@")[0].toUpperCase()
  }

  const sidebarWidth = isMobileDrawer
    ? "w-72"
    : collapsed
    ? "w-[68px]"
    : "w-64"

  return (
    <aside
      className={cn(
        "border-r border-[#DCE5F1] bg-white flex flex-col h-screen select-none transition-all duration-200",
        isMobileDrawer ? "relative z-50 h-full" : "sticky top-0 z-30",
        sidebarWidth
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#DCE5F1]">
        <Link
          href="/dashboard"
          onClick={onClose}
          className="flex items-center gap-2.5 overflow-hidden"
        >
          <div className="w-8 h-8 rounded-lg bg-[#0F172A] flex items-center justify-center text-white text-[10px] font-bold shrink-0 tracking-tight">
            AM
          </div>
          {(!collapsed || isMobileDrawer) && (
            <span className="font-bold text-sm tracking-[0.1em] text-[#0F172A] uppercase truncate">
              AIMETRA
            </span>
          )}
        </Link>

        {/* Collapse toggle button (desktop/tablet only) */}
        {!isMobileDrawer && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-md text-[#667A93] hover:text-[#0F172A] hover:bg-[#EDF4FC] transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-1 scrollbar-none">
        {items.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href))

          const Icon = item.icon

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose}
              title={collapsed && !isMobileDrawer ? item.label : undefined}
              className={cn(
                "flex items-center rounded-lg text-xs font-medium transition-colors group relative",
                collapsed && !isMobileDrawer
                  ? "justify-center p-2.5"
                  : "justify-between px-3 py-2",
                isActive
                  ? "bg-[#0F172A] text-white"
                  : "text-[#526783] hover:bg-[#EDF4FC] hover:text-[#0F172A]"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0",
                    isActive
                      ? "text-white"
                      : "text-[#667A93] group-hover:text-[#0F172A]"
                  )}
                />
                {(!collapsed || isMobileDrawer) && (
                  <span className="truncate">{item.label}</span>
                )}
              </div>

              {item.badge && (!collapsed || isMobileDrawer) && (
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full font-semibold shrink-0 ml-1.5",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-[#DCE5F1] text-[#34465E]"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* User Profile Footer */}
      <div className="p-2 border-t border-[#DCE5F1]">
        <div
          className={cn(
            "flex items-center rounded-lg hover:bg-[#F6F8FC] transition-colors",
            collapsed && !isMobileDrawer
              ? "justify-center p-2"
              : "justify-between p-2"
          )}
        >
          <Link
            href="/dashboard/profile"
            onClick={onClose}
            title={collapsed && !isMobileDrawer ? getDisplayName() : undefined}
            className="flex items-center gap-2.5 min-w-0 flex-1"
          >
            <div className="w-8 h-8 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-medium text-xs shrink-0">
              {getDisplayName().charAt(0)}
            </div>
            {(!collapsed || isMobileDrawer) && (
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-[#0F172A] truncate">
                  {getDisplayName()}
                </div>
                <div className="text-[10px] text-[#667A93] truncate">
                  AIMETRA Portal
                </div>
              </div>
            )}
          </Link>

          {(!collapsed || isMobileDrawer) && (
            <button
              onClick={logout}
              className="p-1.5 text-[#71849B] hover:text-[#DC2626] rounded-md transition-colors"
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
