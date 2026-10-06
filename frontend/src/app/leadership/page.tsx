"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Clock,
  ExternalLink,
  GraduationCap,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
  ArrowRight,
} from "lucide-react"
import api from "@/lib/api"
import { PublicNav } from "@/components/layout/PublicNav"
import { PublicFooter } from "@/components/layout/PublicFooter"
import { PublicShowcaseHero } from "@/components/layout/PublicShowcaseHero"
import { Button } from "@/components/ui/button"

interface LeadershipItem {
  id: string
  role: string
  display_title: string
  photo_url: string | null
  short_bio: string | null
  experience_years: number
  publications_count: number
  email: string | null
  office_location: string | null
  display_order: number
}

export default function LeadershipDirectoryPage() {
  const [profiles, setProfiles] = useState<LeadershipItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    async function loadLeadership() {
      try {
        setLoading(true)
        const res = await api.get("/leadership")
        setProfiles(res.data || [])
        setLoadError(false)
      } catch (err) {
        console.error("Failed to load leadership list:", err)
        setLoadError(true)
      } finally {
        setLoading(false)
      }
    }
    loadLeadership()
  }, [])

  return (
    <div className="aimetra-public theme-leadership min-h-screen bg-white text-[#0F172A] flex flex-col">
      <PublicNav />

      <main className="flex-1 w-full">
        <PublicShowcaseHero
          eyebrow="Governance & leadership"
          title={<>People who <span className="text-[#1478ef]">lead change.</span></>}
          description="Meet the leaders guiding AIMETRA's teaching, research, and student experience."
          tone="sky"
          visual="campus"
          visualLabel="Meet the leadership team"
        >
          <a href="#leadership-team" className="inline-flex h-11 items-center rounded-full bg-[#081a39] px-6 text-xs font-bold text-white transition hover:bg-[#1478ef]">Explore profiles <ArrowRight className="ml-2 h-4 w-4" /></a>
        </PublicShowcaseHero>

        {/* Leadership Cards Grid */}
        <section id="leadership-team" className="mx-auto max-w-7xl px-6 pb-20 pt-10 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-80 animate-pulse rounded-[26px] border border-[#DCE5F1] bg-[#F6F8FC]"
              />
            ))}
          </div>
        ) : loadError ? (
          <div className="rounded-[26px] border border-[#dce5f1] bg-[#f1f7ff] p-8 text-center text-sm text-[#526783]">Leadership profiles are unavailable right now. Please try again later.</div>
        ) : profiles.length === 0 ? (
          <div className="rounded-[26px] border border-[#dce5f1] bg-[#f1f7ff] p-8 text-center text-sm text-[#526783]">No leadership profiles have been published yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {profiles.map((p) => {
              const routeRole = p.role.toLowerCase()
              return (
                <div
                  key={p.id}
                  className="group flex flex-col justify-between rounded-[26px] border border-[#DCE5F1] bg-white p-6 shadow-[0_12px_30px_rgba(8,26,57,0.06)] transition-all hover:-translate-y-1 hover:border-[#1478ef] hover:shadow-[0_18px_38px_rgba(8,26,57,0.12)]"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-[#dceeff] text-[#1478ef] flex items-center justify-center font-black text-lg overflow-hidden shrink-0">
                        {p.photo_url ? (
                          <img
                            src={p.photo_url}
                            alt={p.display_title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{p.display_title.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#2563EB]">
                          {p.role.toUpperCase()}
                        </div>
                        <h3 className="text-base font-semibold text-[#0F172A]">
                          {p.display_title}
                        </h3>
                      </div>
                    </div>

                    {p.short_bio && <p className="text-xs text-[#526783] leading-relaxed line-clamp-3">{p.short_bio}</p>}

                    <div className="pt-2 border-t border-[#DCE5F1] space-y-1.5 text-xs text-[#667A93]">
                      {p.office_location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#71849B]" />
                          <span>{p.office_location}</span>
                        </div>
                      )}
                      {p.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-[#71849B]" />
                          <span>{p.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#DCE5F1] flex items-center justify-between">
                    <span className="text-xs text-[#667A93]">
                      {p.publications_count} Publications
                    </span>
                    <Link
                      href={`/leadership/${routeRole}`}
                      className="text-xs font-semibold text-[#0F172A] hover:underline flex items-center gap-1 group-hover:text-[#2563EB]"
                    >
                      <span>Full Dossier</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
