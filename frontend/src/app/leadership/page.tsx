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

  useEffect(() => {
    async function loadLeadership() {
      try {
        setLoading(true)
        const res = await api.get("/leadership")
        setProfiles(res.data || [])
      } catch (err) {
        console.error("Failed to load leadership list:", err)
      } finally {
        setLoading(false)
      }
    }
    loadLeadership()
  }, [])

  return (
    <div className="min-h-screen bg-white text-[#111111] flex flex-col">
      <PublicNav />

      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 lg:px-8 space-y-12 w-full">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
            Governance & Leadership
          </span>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#111111]">
            Department Leadership Team
          </h1>
          <p className="text-sm text-[#555555]">
            Stewarding academic excellence, research velocity, and ethical innovation across the Department of Artificial Intelligence & Machine Learning.
          </p>
        </div>

        {/* Leadership Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-80 rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {profiles.map((p) => {
              const routeRole = p.role.toLowerCase()
              return (
                <div
                  key={p.id}
                  className="rounded-lg border border-[#E5E5E5] bg-white p-6 flex flex-col justify-between hover:border-[#111111] transition-all group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-lg overflow-hidden shrink-0">
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
                        <h3 className="text-base font-semibold text-[#111111]">
                          {p.display_title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-xs text-[#555555] leading-relaxed line-clamp-3">
                      {p.short_bio ||
                        "Leading strategic research and academic programs in the AI/ML Department."}
                    </p>

                    <div className="pt-2 border-t border-[#E5E5E5] space-y-1.5 text-xs text-[#777777]">
                      {p.office_location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#888888]" />
                          <span>{p.office_location}</span>
                        </div>
                      )}
                      {p.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-[#888888]" />
                          <span>{p.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#E5E5E5] flex items-center justify-between">
                    <span className="text-xs text-[#777777]">
                      {p.publications_count} Publications
                    </span>
                    <Link
                      href={`/leadership/${routeRole}`}
                      className="text-xs font-semibold text-[#111111] hover:underline flex items-center gap-1 group-hover:text-[#2563EB]"
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
      </main>

      <PublicFooter />
    </div>
  )
}
