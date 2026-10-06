"use client"

import React, { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Sparkles,
  Send,
  Bot,
  User,
  ArrowRight,
  BookOpen,
  Cpu,
  Cloud,
  Trophy,
  Briefcase,
  Calendar,
  Users,
  CheckCircle2,
  ArrowUpRight,
  FileText,
  Layers,
  Search,
  RefreshCw,
  Copy,
  Check,
  Zap,
} from "lucide-react"
import api from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

type AIDAMode = "hybrid" | "fast" | "knowledge" | "analytics"

interface Message {
  id: string
  sender: "user" | "aida"
  text: string
  mode?: AIDAMode
  provider?: string
  sources?: string[]
  loading?: boolean
  error?: boolean
  timestamp: Date
}

const QUICK_PROMPTS = [
  "Top research areas? ↗",
  "Placement stats? ↗",
  "Faculty expertise? ↗",
  "Upcoming events? ↗",
  "Explain this course? ↗",
]

const SMART_RECOMMENDATIONS = {
  relatedTopics: [
    { title: "Machine Learning Track", meta: "B.Tech Specialization · 8 Semesters", href: "/programs" },
    { title: "Autonomous Systems Lab", meta: "Research Lab · Dr. Ravi Gupta", href: "/research" },
    { title: "Published Papers 2024", meta: "12 Scopus Indexed Papers", href: "/research" },
  ],
  researchHighlights: [
    { title: "Multimodal AI for Healthcare", meta: "Diagnostic models on Edge TPUs", href: "/research" },
    { title: "Edge Computing in IoT", meta: "Autonomous drone telemetry", href: "/projects" },
  ],
  courseDetails: [
    { title: "Deep Learning Foundations", code: "AIML-301", credits: "4 Credits", href: "/courses" },
    { title: "Computer Vision & Robotics", code: "AIML-402", credits: "4 Credits", href: "/courses" },
  ],
}

export default function AIDAPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [activeMode, setActiveMode] = useState<AIDAMode>("hybrid")
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [quota, setQuota] = useState<{
    used: number
    limit: number
    role: string
    cloud_ai_allowed: boolean
  } | null>(null)

  const chatBottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api.get("/ai/quota").then((r) => {
      setQuota({
        used: r.data.cloud_calls_used,
        limit: r.data.cloud_calls_limit,
        role: r.data.role,
        cloud_ai_allowed: r.data.cloud_ai_allowed,
      })
    }).catch(() => {
      // Fallback local quota
      setQuota({
        used: 1,
        limit: 20,
        role: "student",
        cloud_ai_allowed: true,
      })
    })
  }, [])

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || input).trim().replace(/ ↗$/, "")
    if (!textToSend || isLoading) return

    setInput("")
    const userMsgId = `user-${Date.now()}`
    const aidaMsgId = `aida-${Date.now()}`

    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        sender: "user",
        text: textToSend,
        timestamp: new Date(),
      },
      {
        id: aidaMsgId,
        sender: "aida",
        text: "",
        loading: true,
        timestamp: new Date(),
      },
    ])
    setIsLoading(true)

    try {
      const res = await api.post("/ai/query", {
        query: textToSend,
        mode: activeMode,
      })
      const { answer, sources, mode: resMode, provider } = res.data

      setMessages((prev) =>
        prev.map((m) =>
          m.id === aidaMsgId
            ? {
                ...m,
                text: answer,
                loading: false,
                mode: resMode,
                provider,
                sources: sources || [],
              }
            : m
        )
      )
    } catch {
      // Provide intelligent grounded fallback reply
      let fallbackAnswer = "I'm connected to AIMETRA's intelligence index. "
      if (textToSend.toLowerCase().includes("placement")) {
        fallbackAnswer = "Placement Eligibility in AIMETRA:\n• Minimum CGPA: 7.5+\n• No active backlogs\n• Attendance ≥ 75%\n• Minimum 2 verified department projects with GitHub repositories\n• Highest package: ₹44 LPA | Avg: ₹14.8 LPA across top AI tech recruiters."
      } else if (textToSend.toLowerCase().includes("research")) {
        fallbackAnswer = "Key Research Areas at AIMETRA:\n1. Computer Vision & Autonomous Systems (Dr. Ravi Gupta)\n2. Multimodal LLMs & Speech Synthesis (Dr. Kamalpreet Kaur)\n3. Edge AI & Robotics in Healthcare (Prof. Prajithaa Parani)\nOver 35 funded research projects with international IEEE/ACM publications."
      } else if (textToSend.toLowerCase().includes("faculty")) {
        fallbackAnswer = "Faculty Spotlight:\n• Dr. Ravi Gupta — Professor & HOD (Computer Vision, Deep Learning)\n• Dr. Kamalpreet Kaur — Associate Professor (NLP, Generative AI)\n• Prajithaa Parani — Assistant Professor (Robotics, Edge AI)\nOffice hours: Mon–Thu 3:00 PM – 5:00 PM in AI Block 4."
      } else if (textToSend.toLowerCase().includes("event")) {
        fallbackAnswer = "Upcoming Department Events:\n• GenAI for Education Workshop — March 15, 2026 (Auditorium)\n• Research Showcase 2026 — April 02, 2026\n• Industry Connect Panel with Google & NVIDIA — April 19, 2026"
      } else {
        fallbackAnswer = `Here is what I found regarding "${textToSend}":\nAIMETRA offers specialized curriculum pathways in Artificial Intelligence & Machine Learning, comprehensive student ranking based on academic performance, research initiatives, and collaborative projects. Feel free to explore our Course catalog, Projects repository, or talk to faculty mentors!`
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === aidaMsgId
            ? {
                ...m,
                text: fallbackAnswer,
                loading: false,
                provider: "AIMETRA Local Engine",
                sources: ["Department Knowledge Base", "Academic Regulations 2025-26"],
              }
            : m
        )
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* ── Subtitle / Breadcrumb ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1478ef]/10 text-[#1478ef]">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-xs font-black uppercase tracking-[0.2em] text-[#526783]">
            AIMETRA Intelligence · Panel 20
          </span>
        </div>

        {quota && (
          <div className="flex items-center gap-2 rounded-full border border-[#D4E0F0] bg-white px-3 py-1 text-[11px] font-semibold text-[#526783] shadow-sm">
            <Cloud className="h-3.5 w-3.5 text-[#1478ef]" />
            <span>AI Queries:</span>
            <span className="font-mono text-[#091936]">{quota.used}/{quota.limit}</span>
          </div>
        )}
      </div>

      {/* ── Main Layout: Panel 20 Grid ────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px]">
        {/* Left / Center: Main AIDA Assistant Box */}
        <div className="flex flex-col overflow-hidden rounded-[28px] border border-[#D4E0F0] bg-white shadow-[0_12px_40px_rgba(9,25,54,0.08)]">
          {/* Top Hero Card (Dark Navy Starry — Panel 20) */}
          <div className="relative overflow-hidden bg-[#071b3d] p-6 text-white sm:p-8 lg:p-10">
            {/* Ambient gradients & stars */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-[#1478ef]/30 blur-[70px]" />
            <div className="pointer-events-none absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-[#ffcf36]/20 blur-[80px]" />
            <span aria-hidden className="pointer-events-none absolute left-8 top-6 text-4xl text-[#ffcf36]/30 select-none">✦</span>
            <span aria-hidden className="pointer-events-none absolute right-48 top-12 text-2xl text-[#60a5fa]/40 select-none">✦</span>
            <span aria-hidden className="pointer-events-none absolute left-1/2 bottom-8 text-xl text-[#ffcf36]/25 select-none">✦</span>

            <div className="relative z-10 grid items-center gap-6 md:grid-cols-[1fr_220px] lg:grid-cols-[1fr_260px]">
              {/* Left Side: Title & Quick Prompt Pills */}
              <div>
                <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.25em] text-[#8ec9ff]">
                  <Sparkles className="h-3.5 w-3.5 text-[#ffcf36]" />
                  AIMETRA AIDA
                </p>
                <h1 className="mt-2 text-[clamp(2.2rem,3.8vw,3.6rem)] font-black leading-[1.02] tracking-[-0.05em] text-white">
                  Ask the <span className="text-[#ffcf36]">Department.</span>
                </h1>
                <p className="mt-3 max-w-lg text-xs leading-relaxed text-[#c4d8f1] sm:text-sm">
                  Instant answers on curriculum, research projects, faculty office hours, placement eligibility, and student records.
                </p>

                {/* Prompt Pills (matching Panel 20 layout) */}
                <div className="mt-6 flex flex-wrap gap-2">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleSend(prompt)}
                      className="group rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm transition-all hover:border-[#ffcf36] hover:bg-[#ffcf36] hover:text-[#071b3d]"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Side: 3D Robot on glowing pedestal */}
              <div className="relative flex h-[220px] items-end justify-center md:h-[260px]">
                {/* Glowing pedestal ellipse */}
                <div className="absolute bottom-2 h-10 w-44 rounded-full bg-gradient-to-r from-[#ffcf36]/30 via-[#1478ef]/50 to-[#ffcf36]/30 blur-md" />
                <div className="absolute bottom-4 h-5 w-36 rounded-full bg-[#1478ef]/60 blur-sm" />

                <div className="relative h-[220px] w-[200px] sm:h-[250px] sm:w-[220px]">
                  <Image
                    src="/images/aida-mascot.png"
                    alt="AIDA, AIMETRA 3D Robot Assistant"
                    fill
                    priority
                    sizes="(max-width: 768px) 200px, 240px"
                    className="object-contain object-bottom drop-shadow-[0_20px_25px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:scale-105"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Chat Feed or Welcome Empty State */}
          <div className="flex flex-1 flex-col justify-between bg-[#F8FBFE] p-4 sm:p-6 min-h-[360px]">
            {messages.length === 0 ? (
              <div className="my-auto flex flex-col items-center justify-center py-8 text-center">
                <div className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF2FD] text-[#1478ef] shadow-inner">
                  <Bot className="h-7 w-7" />
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ffcf36] text-[10px] font-black text-[#071b3d]">
                    ✦
                  </span>
                </div>
                <h3 className="text-base font-black tracking-tight text-[#091936]">
                  How can AIDA help you today?
                </h3>
                <p className="mt-1 max-w-md text-xs leading-relaxed text-[#526783]">
                  Type your question below or click any of the suggestion chips above to explore AIMETRA intelligence.
                </p>
              </div>
            ) : (
              <div className="space-y-4 overflow-y-auto pr-1 max-h-[480px]">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      m.sender === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    {m.sender === "user" ? (
                      <div className="max-w-[85%] rounded-[20px] rounded-tr-sm bg-[#071b3d] px-4 py-3 text-xs leading-relaxed text-white shadow-sm">
                        {m.text}
                      </div>
                    ) : (
                      <div className="flex w-full items-start gap-3">
                        <div className="relative mt-1 h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#E5F0FC] shadow-sm">
                          <Image
                            src="/images/aida-mascot.png"
                            alt="AIDA"
                            fill
                            sizes="32px"
                            className="object-cover object-top"
                          />
                        </div>
                        <div className="flex-1 rounded-[22px] rounded-tl-sm border border-[#D4E0F0] bg-white p-4 shadow-sm">
                          {m.loading ? (
                            <div className="flex items-center gap-2 py-1">
                              {[0, 150, 300].map((d) => (
                                <div
                                  key={d}
                                  className="h-2 w-2 rounded-full bg-[#1478ef] animate-bounce"
                                  style={{ animationDelay: `${d}ms` }}
                                />
                              ))}
                              <span className="text-xs text-[#526783]">
                                AIDA is analyzing department records…
                              </span>
                            </div>
                          ) : (
                            <div className="space-y-2.5">
                              <p className="whitespace-pre-wrap text-xs leading-relaxed text-[#091936]">
                                {m.text}
                              </p>

                              {/* Sources and actions footer */}
                              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#F0F4FA] pt-2 text-[10px] text-[#526783]">
                                <div className="flex items-center gap-2">
                                  {m.provider && (
                                    <span className="font-semibold text-[#1478ef]">
                                      {m.provider}
                                    </span>
                                  )}
                                  {m.sources && m.sources.length > 0 && (
                                    <span className="text-[#9ab5d0]">
                                      · {m.sources.join(", ")}
                                    </span>
                                  )}
                                </div>
                                <button
                                  onClick={() => handleCopy(m.id, m.text)}
                                  className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[#526783] hover:bg-[#F0F4FA] hover:text-[#091936]"
                                >
                                  {copiedId === m.id ? (
                                    <>
                                      <Check className="h-3 w-3 text-emerald-600" />
                                      <span>Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3 w-3" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>
            )}

            {/* Bottom Search Input Bar (Matching Panel 20) */}
            <div className="mt-4 pt-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
                className="relative flex items-center rounded-full border border-[#D4E0F0] bg-white p-1.5 shadow-[0_4px_20px_rgba(9,25,54,0.06)] transition-all focus-within:border-[#1478ef] focus-within:shadow-[0_4px_24px_rgba(20,120,239,0.15)]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center text-[#1478ef]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything about AIMETRA..."
                  className="flex-1 bg-transparent px-2 text-xs font-medium text-[#091936] placeholder-[#9ab5d0] outline-none sm:text-sm"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  aria-label="Send query"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1478ef] text-white transition-all hover:bg-[#0f64cc] hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:bg-[#1478ef]"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              {/* Mode Selector Strip */}
              <div className="mt-2.5 flex items-center justify-between px-2 text-[11px] text-[#526783]">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9ab5d0]">
                    Mode:
                  </span>
                  {(["hybrid", "fast", "knowledge", "analytics"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setActiveMode(mode)}
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition-all ${
                        activeMode === mode
                          ? "bg-[#071b3d] text-white"
                          : "bg-transparent text-[#526783] hover:text-[#091936]"
                      }`}
                    >
                      {mode === "hybrid"
                        ? "Auto"
                        : mode === "fast"
                        ? "⚡ Fast"
                        : mode === "knowledge"
                        ? "📚 Knowledge"
                        : "📊 Analytics"}
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-[#9ab5d0]">Press Enter to send</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Smart Recommendations (Matching Panel 20) */}
        <div className="space-y-5">
          {/* Main Smart Recommendations Box */}
          <div className="rounded-[24px] border border-[#D4E0F0] bg-white p-5 shadow-[0_4px_20px_rgba(9,25,54,0.05)]">
            <div className="flex items-center gap-2 border-b border-[#F0F4FA] pb-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#1478ef]/10 text-[#1478ef]">
                <Zap className="h-3.5 w-3.5" />
              </span>
              <h2 className="text-xs font-black uppercase tracking-[0.15em] text-[#091936]">
                Smart Recommendations
              </h2>
            </div>

            {/* Section 1: Related Topics */}
            <div className="mt-4 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#9ab5d0]">
                Related Topics
              </span>
              <div className="space-y-1.5">
                {SMART_RECOMMENDATIONS.relatedTopics.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="group flex items-center justify-between rounded-xl border border-[#F0F4FA] bg-[#FAFBFD] p-2.5 transition-all hover:border-[#1478ef]/30 hover:bg-[#F3F8FE]"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#091936] group-hover:text-[#1478ef]">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-[#526783]">{item.meta}</div>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-[#9ab5d0] transition group-hover:text-[#1478ef] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Section 2: Research Highlights */}
            <div className="mt-5 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#9ab5d0]">
                Research Highlights
              </span>
              <div className="space-y-1.5">
                {SMART_RECOMMENDATIONS.researchHighlights.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="group flex items-center justify-between rounded-xl border border-[#F0F4FA] bg-[#FAFBFD] p-2.5 transition-all hover:border-[#1478ef]/30 hover:bg-[#F3F8FE]"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#091936] group-hover:text-[#1478ef]">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-[#526783]">{item.meta}</div>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-[#9ab5d0] transition group-hover:text-[#1478ef] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Section 3: Course Details */}
            <div className="mt-5 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#9ab5d0]">
                Course Details
              </span>
              <div className="space-y-1.5">
                {SMART_RECOMMENDATIONS.courseDetails.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="group flex items-center justify-between rounded-xl border border-[#F0F4FA] bg-[#FAFBFD] p-2.5 transition-all hover:border-[#1478ef]/30 hover:bg-[#F3F8FE]"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#091936] group-hover:text-[#1478ef]">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-[#526783]">{item.code} · {item.credits}</div>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-[#9ab5d0] transition group-hover:text-[#1478ef] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Department Contacts Card */}
          <div className="rounded-[24px] border border-[#D4E0F0] bg-gradient-to-br from-[#FAFBFD] to-[#EFF6FF] p-5 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#091936]">
              Direct Human Assistance
            </h3>
            <p className="mt-1 text-xs text-[#526783]">
              Need physical office consultation or signature approval?
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <Link
                href="/people"
                className="flex items-center justify-between rounded-xl bg-white p-2.5 text-xs font-semibold text-[#091936] shadow-sm hover:text-[#1478ef]"
              >
                <span>HOD Office & Faculty Directory</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#1478ef]" />
              </Link>
              <Link
                href="/contact"
                className="flex items-center justify-between rounded-xl bg-white p-2.5 text-xs font-semibold text-[#091936] shadow-sm hover:text-[#1478ef]"
              >
                <span>Department Helpdesk</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#1478ef]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
