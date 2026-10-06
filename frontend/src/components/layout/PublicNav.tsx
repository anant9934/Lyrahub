"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Menu, Search, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PublicNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState("")

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault()
    if (!search.trim()) return
    setSearchOpen(false)
    router.push(`/people?search=${encodeURIComponent(search.trim())}`)
  }

  const navLinks = [
    { label: "About", href: "/about" },
    { label: "People", href: "/people" },
    { label: "Programs", href: "/programs" },
    { label: "Research", href: "/research" },
    { label: "Events", href: "/events" },
    { label: "Contact", href: "/contact" },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#e4eaf3] bg-white/95 backdrop-blur dark:border-[#29354b] dark:bg-[#151f30]/95">
      <div className="mx-auto flex h-[68px] max-w-[1600px] items-center justify-between gap-4 px-5 lg:px-7">
        {/* Brand */}
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1478ef] text-[#ffdb45] shadow-[0_4px_10px_rgba(20,120,239,0.25)]"><Sparkles className="h-5 w-5" /></span>
          <span className="text-base font-black tracking-[-0.04em] text-[#091936] uppercase dark:text-white">
            AIMETRA
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-4 md:flex lg:gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs font-semibold transition-colors lg:text-sm ${
                  isActive
                    ? "text-[#0868df] dark:text-[#80bbff]"
                    : "text-[#3a4c67] hover:text-[#0868df] dark:text-[#c2d1e8] dark:hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Right CTA */}
        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <button type="button" onClick={() => setSearchOpen(!searchOpen)} aria-label="Search people" aria-expanded={searchOpen} className="flex h-9 w-9 items-center justify-center rounded-full border border-[#dbe9ff] bg-white text-[#3a4c67] transition hover:border-[#1478ef] hover:text-[#1478ef]"><Search className="h-4 w-4" /></button>
          <Link href="/aida" className="rounded-full border border-[#dbe9ff] bg-[#f1f7ff] px-3.5 py-2 text-xs font-bold text-[#0868df] transition hover:bg-[#e6f1ff] dark:border-[#355680] dark:bg-[#223a5a] dark:text-[#b4d8ff]">AIDA ✦</Link>
          <Link href="/login">
            <Button size="sm" className="rounded-full bg-[#081a39] px-5 text-white hover:bg-[#12366d] dark:bg-[#ffcf36] dark:text-[#091936] dark:hover:bg-[#ffe476]">
              Sign In
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Link href="/aida" className="rounded-full bg-[#f1f7ff] px-3 py-2 text-xs font-black text-[#0868df]">AIDA ✦</Link>
          <button type="button" onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-[#3a4c67] hover:text-[#0868df] dark:text-white" aria-label="Toggle menu">{mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}</button>
        </div>
      </div>

      {searchOpen && <form onSubmit={submitSearch} className="absolute right-5 top-[72px] z-50 w-[min(420px,calc(100vw-40px))] rounded-[22px] border border-[#dbe9ff] bg-white p-4 shadow-[0_22px_55px_rgba(8,26,57,0.18)]">
        <label htmlFor="public-people-search" className="text-[11px] font-black uppercase tracking-[0.16em] text-[#1478ef]">Search the people directory</label>
        <div className="mt-2 flex gap-2"><input id="public-people-search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Name, role, or research area" className="min-w-0 flex-1 rounded-xl border border-[#dce5f1] px-3 py-2 text-sm text-[#081a39] outline-none focus:border-[#1478ef]" /><button type="submit" className="rounded-xl bg-[#081a39] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#1478ef]">Search</button></div>
      </form>}

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="space-y-3 border-b border-[#e4eaf3] bg-white px-6 py-4 md:hidden dark:border-[#29354b] dark:bg-[#151f30]">
          <button type="button" onClick={() => { setMobileOpen(false); setSearchOpen(true) }} className="flex w-full items-center gap-2 rounded-xl bg-[#f1f7ff] px-3 py-2 text-sm font-bold text-[#0868df]"><Search className="h-4 w-4" /> Search people</button>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm text-[#3a4c67] hover:text-[#0868df] dark:text-[#c2d1e8]"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/login" onClick={() => setMobileOpen(false)} className="block rounded-xl bg-[#f1f7ff] px-3 py-2 text-sm font-bold text-[#0868df] dark:bg-[#223a5a] dark:text-[#b4d8ff]">Meet AIDA ✦</Link>
          <div className="border-t border-[#e4eaf3] pt-3 dark:border-[#29354b]">
            <Link href="/login" onClick={() => setMobileOpen(false)}>
              <Button className="w-full bg-[#0F172A] text-white">Sign In</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
