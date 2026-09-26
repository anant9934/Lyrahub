"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { PublicNav } from "@/components/layout/PublicNav"
import { PublicFooter } from "@/components/layout/PublicFooter"
import { Button } from "@/components/ui/button"
import {
  Mail,
  MapPin,
  BookOpen,
  Search,
  ExternalLink,
  GraduationCap,
  Award,
  ArrowRight,
  Filter,
} from "lucide-react"
import api from "@/lib/api"

interface Person {
  id: string
  name: string
  roleTitle: string
  category: "leadership" | "faculty" | "researchers" | "advisory"
  departmentRole: string
  areas: string[]
  bio: string
  email: string
  office: string
  publications: number
  dossierUrl?: string
  initials: string
}

const PEOPLE_DATA: Person[] = [
  {
    id: "p1",
    name: "Dr. K. S. Ramanathan",
    roleTitle: "Professor & Head of Department",
    category: "leadership",
    departmentRole: "HOD Secretariat",
    areas: ["Statistical Machine Learning", "Probabilistic Graphical Models", "AI Governance"],
    bio: "Ph.D. from IISc Bangalore. Over 24 years leading academic research, doctoral guidance, and enterprise AI transformation initiatives.",
    email: "hod.aiml@institution.edu",
    office: "Academic Block 4, Suite 401",
    publications: 68,
    dossierUrl: "/leadership/hod",
    initials: "KR",
  },
  {
    id: "p2",
    name: "Dr. Ananya Mukherjee",
    roleTitle: "Associate Professor & Chief of Staff",
    category: "leadership",
    departmentRole: "Chief of Staff",
    areas: ["Natural Language Processing", "Multilingual LLMs", "Computational Linguistics"],
    bio: "Ph.D. from IIT Bombay. Principal investigator for Indic-LLM benchmarking and cross-lingual representation learning.",
    email: "ananya.m@institution.edu",
    office: "Academic Block 4, Suite 403",
    publications: 42,
    dossierUrl: "/leadership/cos",
    initials: "AM",
  },
  {
    id: "p3",
    name: "Dr. Vikramaditya Sen",
    roleTitle: "Professor & Head of Studies",
    category: "leadership",
    departmentRole: "Head of Studies",
    areas: ["Computer Vision", "Self-Supervised Learning", "Medical Image Analytics"],
    bio: "Ph.D. from CMU. Directs the department's vision diagnostics initiatives and undergraduate honors thesis committee.",
    email: "vikram.sen@institution.edu",
    office: "Academic Block 4, Suite 405",
    publications: 54,
    dossierUrl: "/leadership/hos",
    initials: "VS",
  },
  {
    id: "p4",
    name: "Dr. Priya Sundaram",
    roleTitle: "Associate Professor",
    category: "faculty",
    departmentRole: "Deep Learning Chair",
    areas: ["Deep Reinforcement Learning", "Autonomous Navigation", "Multi-Agent Systems"],
    bio: "Specializes in sample-efficient reinforcement learning with applications in robotic manipulation and quadrotor control.",
    email: "priya.sundaram@institution.edu",
    office: "Academic Block 4, Lab 202",
    publications: 31,
    initials: "PS",
  },
  {
    id: "p5",
    name: "Dr. Rajeshwar Rao",
    roleTitle: "Assistant Professor",
    category: "faculty",
    departmentRole: "Edge AI Lab Director",
    areas: ["Edge AI", "TinyML", "Hardware Accelerator Architectures"],
    bio: "Leading sponsored hardware-software co-design research for low-power edge accelerators on FPGA and neuromorphic silicon.",
    email: "r.rao@institution.edu",
    office: "Innovation Annex, Room 108",
    publications: 27,
    initials: "RR",
  },
  {
    id: "p6",
    name: "Dr. Meera Nambiar",
    roleTitle: "Associate Professor",
    category: "faculty",
    departmentRole: "Ethics & Safety Lead",
    areas: ["AI Alignment", "Interpretability & Explainable AI", "Data Provenance"],
    bio: "Researches mechanistic interpretability in transformer architectures and differential privacy for collaborative learning.",
    email: "meera.nambiar@institution.edu",
    office: "Academic Block 4, Lab 310",
    publications: 36,
    initials: "MN",
  },
  {
    id: "p7",
    name: "Siddharth Verma",
    roleTitle: "Senior Doctoral Fellow",
    category: "researchers",
    departmentRole: "DST Inspire Fellow",
    areas: ["Diffusion Models", "3D Gaussian Splatting", "Neural Radiance Fields"],
    bio: "Doctoral candidate researching view-synthesis and inverse rendering under Dr. Vikramaditya Sen. First author at CVPR 2025.",
    email: "siddharth.v@institution.edu",
    office: "Vision Lab, Suite 214",
    publications: 7,
    initials: "SV",
  },
  {
    id: "p8",
    name: "Tanvi Deshmukh",
    roleTitle: "Postdoctoral Researcher",
    category: "researchers",
    departmentRole: "GenAI Core Researcher",
    areas: ["Chain-of-Thought Reasoning", "Code Generation Models", "Agentic Workflows"],
    bio: "Working on neuro-symbolic reasoning and automated program verification using large language models.",
    email: "tanvi.d@institution.edu",
    office: "NLP Center, Room 302",
    publications: 12,
    initials: "TD",
  },
  {
    id: "p9",
    name: "Dr. Arun Chandrasekhar",
    roleTitle: "Distinguished Industry Fellow",
    category: "advisory",
    departmentRole: "Industry Advisory Board",
    areas: ["Enterprise AI Architecture", "Cloud Scale Inference", "Data Systems"],
    bio: "VP of Engineering at CloudScale AI. Advises the department on industry curriculum alignment and capstone sponsorships.",
    email: "arun.c.advisor@institution.edu",
    office: "Industry Board Secretariat",
    publications: 24,
    initials: "AC",
  },
]

export default function PeopleDirectoryPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")

  const filteredPeople = PEOPLE_DATA.filter((person) => {
    const matchesCategory = activeCategory === "all" || person.category === activeCategory
    const matchesSearch =
      person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.areas.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-white text-[#111111] flex flex-col">
      <PublicNav />

      <main className="flex-1">
        {/* Header */}
        <section className="border-b border-[#E5E5E5] bg-[#FAFAFA] py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#888888] mb-3">
                Department Directory
              </p>
              <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#111111] mb-4">
                People &amp; Faculty
              </h1>
              <p className="text-sm sm:text-base text-[#555555] leading-relaxed">
                Meet the professors, researchers, academic leaders, and fellows driving instruction,
                scientific inquiry, and doctoral innovation across AIMETRA.
              </p>
            </div>
          </div>
        </section>

        {/* Filters and Search Bar */}
        <section className="border-b border-[#E5E5E5] bg-white sticky top-16 z-30 shadow-sm">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              {[
                { id: "all", label: "All Members" },
                { id: "leadership", label: "Leadership" },
                { id: "faculty", label: "Faculty" },
                { id: "researchers", label: "Researchers" },
                { id: "advisory", label: "Advisory Board" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    activeCategory === tab.id
                      ? "bg-[#111111] text-white"
                      : "bg-[#F5F5F5] text-[#555555] hover:bg-[#EAEAEA] hover:text-[#111111]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, role or topic..."
                className="w-full h-9 pl-9 pr-4 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] text-xs text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-[#111111]"
              />
            </div>
          </div>
        </section>

        {/* Directory Grid */}
        <section className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8 text-xs text-[#777777]">
            <span>Showing {filteredPeople.length} members</span>
            <span>Department of AI &amp; Machine Learning</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPeople.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-[#E5E5E5] bg-white p-6 flex flex-col justify-between hover:border-[#111111] hover:shadow-subtle transition-all group"
              >
                <div>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#111111] text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {p.initials}
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-[#888888]">
                        {p.departmentRole}
                      </div>
                      <h3 className="text-base font-semibold text-[#111111] group-hover:text-black">
                        {p.name}
                      </h3>
                      <p className="text-xs text-[#555555] font-medium">{p.roleTitle}</p>
                    </div>
                  </div>

                  <p className="text-xs text-[#666666] leading-relaxed mb-4">
                    {p.bio}
                  </p>

                  {/* Focus areas */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {p.areas.map((area, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-[#F5F5F5] text-[10px] font-medium text-[#444444] border border-[#EBEBEB]"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#F0F0F0] space-y-2 text-xs text-[#777777]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#999999]" />
                      <span className="truncate max-w-[180px]">{p.email}</span>
                    </div>
                    <span className="text-[11px] font-medium text-[#111111]">
                      {p.publications} Pubs
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#888888]">
                      <MapPin className="w-3 h-3 text-[#AAAAAA]" />
                      <span>{p.office}</span>
                    </div>

                    {p.dossierUrl && (
                      <Link
                        href={p.dossierUrl}
                        className="text-xs font-semibold text-[#111111] hover:underline inline-flex items-center gap-1"
                      >
                        Dossier <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredPeople.length === 0 && (
            <div className="text-center py-20 border border-dashed border-[#E0E0E0] rounded-xl my-8">
              <GraduationCap className="w-10 h-10 text-[#AAAAAA] mx-auto mb-3" />
              <p className="text-sm font-semibold text-[#111111]">No directory members match</p>
              <p className="text-xs text-[#777777] mt-1">Try modifying your category or search query.</p>
            </div>
          )}
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
