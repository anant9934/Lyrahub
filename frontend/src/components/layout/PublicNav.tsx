"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PublicNav() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "People", href: "/people" },
    { label: "Programs", href: "/programs" },
    { label: "Research", href: "/research" },
    { label: "Events", href: "/events" },
    { label: "Contact", href: "/contact" },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E5E5E5] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-base font-bold tracking-[0.08em] text-[#111111] uppercase">
            AIMETRA
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-7">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${
                  isActive
                    ? "font-medium text-[#111111]"
                    : "text-[#555555] hover:text-[#111111]"
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Right CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <Button size="sm" className="rounded-full px-5 bg-[#111111] text-white hover:bg-neutral-800">
              Sign In
            </Button>
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-[#555555] hover:text-[#111111]"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-b border-[#E5E5E5] bg-white px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block text-sm py-2 text-[#555555] hover:text-[#111111]"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-[#E5E5E5]">
            <Link href="/login" onClick={() => setMobileOpen(false)}>
              <Button className="w-full bg-[#111111] text-white">Sign In</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
