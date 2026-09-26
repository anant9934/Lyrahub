"use client"

import React, { useState } from "react"
import Link from "next/link"
import { PublicNav } from "@/components/layout/PublicNav"
import { PublicFooter } from "@/components/layout/PublicFooter"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Search,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Tag,
} from "lucide-react"

interface DepartmentEvent {
  id: string
  title: string
  category: "hackathons" | "workshops" | "seminars" | "symposiums"
  categoryLabel: string
  date: string
  time: string
  venue: string
  speakerOrLead: string
  description: string
  seats: string
  status: "open" | "closing-soon" | "upcoming"
}

const EVENTS_LIST: DepartmentEvent[] = [
  {
    id: "ev-1",
    title: "AIMETRA Annual GenAI Hackathon 2026",
    category: "hackathons",
    categoryLabel: "48-Hour Hackathon",
    date: "October 16 - 18, 2026",
    time: "48 Hours (Continuous)",
    venue: "Main Innovation Auditorium & Computing Cluster",
    speakerOrLead: "Organized by AI Student SIG & Industry Partners",
    description:
      "Build real-world multi-agent systems, multimodal assistants, and autonomous reasoning pipelines. ₹5,00,000 prize pool, cloud compute credits, and direct interview opportunities.",
    seats: "400 Participants • 80 Teams",
    status: "open",
  },
  {
    id: "ev-2",
    title: "Hands-on LLM Alignment & Distributed Fine-Tuning Lab",
    category: "workshops",
    categoryLabel: "Technical Workshop",
    date: "October 24, 2026",
    time: "10:00 AM - 4:30 PM",
    venue: "Academic Block 4, Lab Complex Suite 202",
    speakerOrLead: "Dr. Ananya Mukherjee & NVIDIA Academic Team",
    description:
      "Deep dive into LoRA, QLoRA, and Direct Preference Optimization (DPO) executed on dedicated H100 GPU nodes. Participants receive pre-configured Jupyter notebooks.",
    seats: "80 Seats Remaining",
    status: "closing-soon",
  },
  {
    id: "ev-3",
    title: "Industry Keynote: Foundation Models in Clinical Oncology",
    category: "seminars",
    categoryLabel: "Distinguished Lecture",
    date: "November 4, 2026",
    time: "2:00 PM - 3:30 PM",
    venue: "Virtual & Block 4 Seminar Hall",
    speakerOrLead: "Dr. Sandeep Rao, VP of Medical Intelligence, HealthTech Labs",
    description:
      "Addressing multimodal electronic health records, histopathology vision transformers, and algorithmic validation in clinical settings.",
    seats: "Open to All Students & Faculty",
    status: "upcoming",
  },
  {
    id: "ev-4",
    title: "Autonomous Robotics & Drone Navigation Challenge",
    category: "hackathons",
    categoryLabel: "Competition",
    date: "November 12 - 13, 2026",
    time: "9:00 AM - 6:00 PM",
    venue: "Innovation Annex, Robotics Arena",
    speakerOrLead: "Robotics Club & Dr. Priya Sundaram",
    description:
      "Hardware-software navigation challenge where student quadrupeds and rovers traverse an obstacle course using visual SLAM without external GPS.",
    seats: "24 Teams",
    status: "open",
  },
  {
    id: "ev-5",
    title: "Department Research Symposium & Doctoral Poster Session",
    category: "symposiums",
    categoryLabel: "Academic Symposium",
    date: "November 28, 2026",
    time: "9:30 AM - 5:00 PM",
    venue: "Department Atrium & Exhibition Hall",
    speakerOrLead: "HOD Secretariat & Research Committee",
    description:
      "Annual showcase of peer-reviewed papers accepted at top conferences. Undergraduate honors candidates and Ph.D. scholars present thesis findings to industry delegates.",
    seats: "Public & Academic Attendees",
    status: "upcoming",
  },
  {
    id: "ev-6",
    title: "TinyML & Low-Power Edge Inference on RISC-V",
    category: "workshops",
    categoryLabel: "Hardware Lab",
    date: "December 5, 2026",
    time: "1:30 PM - 5:30 PM",
    venue: "Edge AI Lab, Room 108",
    speakerOrLead: "Dr. Rajeshwar Rao",
    description:
      "Practical deployment of 4-bit quantized computer vision networks on battery-powered microcontrollers and custom RISC-V development kits.",
    seats: "45 Seats",
    status: "open",
  },
]

export default function EventsPublicPage() {
  const [activeTab, setActiveTab] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")

  const filteredEvents = EVENTS_LIST.filter((ev) => {
    const matchesCategory = activeTab === "all" || ev.category === activeTab
    const matchesSearch =
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.speakerOrLead.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-white text-[#111111] flex flex-col">
      <PublicNav />

      <main className="flex-1">
        {/* Header */}
        <section className="border-b border-[#E5E5E5] bg-[#FAFAFA] py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#888888] mb-3">
                Department Calendar &amp; Programs
              </p>
              <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#111111] mb-4">
                Events, Seminars &amp; Hackathons
              </h1>
              <p className="text-sm sm:text-base text-[#555555] leading-relaxed">
                Connect with researchers, industry practitioners, and peers through competitive
                hackathons, technical workshops, research symposia, and distinguished lectures.
              </p>
            </div>
          </div>
        </section>

        {/* Filter bar */}
        <section className="border-b border-[#E5E5E5] bg-white sticky top-16 z-30 shadow-sm">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              {[
                { id: "all", label: "All Events" },
                { id: "hackathons", label: "Hackathons" },
                { id: "workshops", label: "Workshops" },
                { id: "seminars", label: "Guest Lectures" },
                { id: "symposiums", label: "Symposia" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-[#111111] text-white"
                      : "bg-[#F5F5F5] text-[#555555] hover:bg-[#EAEAEA] hover:text-[#111111]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events, topics, venues..."
                className="w-full h-9 pl-9 pr-4 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] text-xs text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-[#111111]"
              />
            </div>
          </div>
        </section>

        {/* Events Grid */}
        <section className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8 text-xs text-[#777777]">
            <span>Showing {filteredEvents.length} scheduled events</span>
            <span>Department of Artificial Intelligence &amp; Machine Learning</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEvents.map((ev) => (
              <div
                key={ev.id}
                className="rounded-xl border border-[#E5E5E5] bg-white p-6 flex flex-col justify-between hover:border-[#111111] hover:shadow-subtle transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded bg-[#F5F5F5] text-[10px] font-semibold tracking-wide text-[#333333] border border-[#E5E5E5]">
                      {ev.categoryLabel}
                    </span>
                    {ev.status === "closing-soon" && (
                      <span className="text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                        Closing Soon
                      </span>
                    )}
                    {ev.status === "open" && (
                      <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        Registrations Open
                      </span>
                    )}
                    {ev.status === "upcoming" && (
                      <span className="text-[10px] font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                        Scheduled
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-[#111111] mb-2 group-hover:text-black">
                    {ev.title}
                  </h3>

                  <p className="text-xs text-[#555555] leading-relaxed mb-6">
                    {ev.description}
                  </p>

                  <div className="space-y-2 border-t border-b border-[#F0F0F0] py-3.5 mb-6 text-xs text-[#666666]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#888888] shrink-0" />
                      <span className="font-medium text-[#111111]">{ev.date}</span>
                      <span className="text-[#CCCCCC]">•</span>
                      <span>{ev.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#888888] shrink-0" />
                      <span>{ev.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-[#888888] shrink-0" />
                      <span>{ev.speakerOrLead}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] font-mono text-[#888888]">{ev.seats}</span>
                  <Link href="/login">
                    <Button className="h-8 px-4 rounded-md bg-[#111111] text-white hover:bg-neutral-800 text-xs font-medium">
                      Register / Details <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-20 border border-dashed border-[#E0E0E0] rounded-xl my-8">
              <Calendar className="w-10 h-10 text-[#AAAAAA] mx-auto mb-3" />
              <p className="text-sm font-semibold text-[#111111]">No matching events found</p>
              <p className="text-xs text-[#777777] mt-1">Please try modifying your search filter.</p>
            </div>
          )}
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
