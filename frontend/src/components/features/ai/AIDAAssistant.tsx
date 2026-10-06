"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import {
  X,
  Send,
  Download,
  BarChart2,
  AlertCircle,
  Cpu,
  Cloud,
  Zap,
  BookOpen,
  Search,
  Database,
  Users,
  Trophy,
  Calendar,
  Briefcase,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"

// ─── Types ────────────────────────────────────────────────────────────────────

type AIDAMode = "hybrid" | "fast" | "knowledge" | "analytics" | "advanced"

interface SourceItem {
  title?: string
  category?: string
  section?: string
  page?: number
}

interface Message {
  id: string
  sender: "user" | "aida"
  text: string
  route?: string
  intent?: string
  ai_mode?: string
  signal?: string
  query?: string
  provider?: string
  tokens_out?: number
  latency_ms?: number
  cloud_calls_used?: number
  cloud_calls_limit?: number
  sources?: SourceItem[]
  table?: {
    headers: string[]
    rows: (string | number)[][]
  }
  can_escalate_cloud?: boolean
  error?: boolean
  loading?: boolean
}

// ─── Route Badge ──────────────────────────────────────────────────────────────

function RouteBadge({ route, mode, provider }: { route?: string; mode?: string; provider?: string }) {
  if (!route && !mode) return null

  let bg = "#F5F5F5"
  let color = "#5C5C5C"
  let icon = <Database className="w-2.5 h-2.5" />

  switch (route) {
    case "deterministic":
      bg = "#EEF3EE"; color = "#2E5E35"; icon = <Zap className="w-2.5 h-2.5" />; break
    case "cache":
      bg = "#EAF0F3"; color = "#1E40AF"; icon = <Zap className="w-2.5 h-2.5" />; break
    case "okf":
      bg = "#F3E8FF"; color = "#6B21A8"; icon = <BookOpen className="w-2.5 h-2.5" />; break
    case "rag":
      bg = "#EDE9FE"; color = "#5B21B6"; icon = <Search className="w-2.5 h-2.5" />; break
    case "local_llm":
      bg = "#E0F2FE"; color = "#0369A1"; icon = <Cpu className="w-2.5 h-2.5" />; break
    case "browser_slm":
      bg = "#FEF3C7"; color = "#92400E"; icon = <Cpu className="w-2.5 h-2.5" />; break
    case "cloud_llm":
      bg = "#DBEAFE"; color = "#1E40AF"; icon = <Cloud className="w-2.5 h-2.5" />; break
    case "blocked":
    case "quota_exceeded":
      bg = "#FEE2E2"; color = "#991B1B"; icon = <AlertCircle className="w-2.5 h-2.5" />; break
  }

  const label = mode || (route ? route.replace("_", " ").toUpperCase() : "AIDA")

  return (
    <div className="flex items-center gap-1.5 mt-1">
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
        style={{ background: bg, color }}
      >
        {icon}
        <span>{label}</span>
        {provider && <span className="opacity-75">· {provider}</span>}
      </span>
    </div>
  )
}

// ─── Quick Action Tiles ───────────────────────────────────────────────────────

const quickActions = [
  { label: "Faculty spotlight", icon: Users,    query: "Who are the top faculty members?",       color: "#1478ef", bg: "#EDF5FF" },
  { label: "Placement status", icon: Trophy,    query: "Placement eligibility criteria?",          color: "#D97706", bg: "#FFF8E8" },
  { label: "Upcoming events",  icon: Calendar,  query: "What events are happening soon?",          color: "#7C3AED", bg: "#F3EEFF" },
  { label: "Opportunities",    icon: Briefcase, query: "Show available opportunities",             color: "#0D9488", bg: "#E6FAFA" },
]

// ─── Main AIDA Component ──────────────────────────────────────────────────────

export function AIDAAssistant({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [chatStarted, setChatStarted] = useState(false)
  const [input, setInput] = useState("")
  const [activeMode, setActiveMode] = useState<AIDAMode>("hybrid")
  const [isLoading, setIsLoading] = useState(false)
  const [quota, setQuota] = useState<{
    used: number
    limit: number
    role: string
    cloud_ai_allowed: boolean
  } | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Fetch quota on mount / open
  useEffect(() => {
    if (!isOpen) return
    api.get("/ai/quota").then((r) => {
      setQuota({
        used: r.data.cloud_calls_used,
        limit: r.data.cloud_calls_limit,
        role: r.data.role,
        cloud_ai_allowed: r.data.cloud_ai_allowed,
      })
    }).catch(() => {})
  }, [isOpen])

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Query dispatch function
  const sendQuery = async (queryText: string, modeOverride?: AIDAMode, forceCloud?: boolean) => {
    const textToSend = queryText.trim()
    if (!textToSend || isLoading) return

    if (!chatStarted) setChatStarted(true)

    const mode = modeOverride || activeMode
    const userMsg: Message = { id: Date.now().toString(), sender: "user", text: textToSend }
    const loadingMsg: Message = { id: `loading-${Date.now()}`, sender: "aida", text: "", loading: true }

    setMessages((prev) => [...prev, userMsg, loadingMsg])
    setInput("")
    setIsLoading(true)

    try {
      const res = await api.post("/ai/query", {
        query: textToSend,
        mode,
        force_cloud: forceCloud,
      })
      const data = res.data

      // Real Browser SLM client execution (WebGPU with WASM fallback)
      if (data.signal === "__BROWSER_SLM__") {
        try {
          const { runBrowserSLM } = await import("@/lib/browser-slm")
          const slmResult = await runBrowserSLM(textToSend)
          setMessages((prev) =>
            prev.filter((m) => !m.loading).concat({
              id: Date.now().toString(),
              sender: "aida",
              text: slmResult.text,
              route: "browser_slm",
              ai_mode: `Browser SLM (${slmResult.execution_provider.toUpperCase()})`,
              provider: "browser_slm",
              latency_ms: slmResult.latency_ms,
            })
          )
        } catch {
          setMessages((prev) =>
            prev.filter((m) => !m.loading).concat({
              id: Date.now().toString(),
              sender: "aida",
              text: `Processed via Browser SLM fallback: "${textToSend}"`,
              route: "browser_slm",
              ai_mode: "Browser SLM (Fallback)",
            })
          )
        }
        setIsLoading(false)
        return
      }

      // Parse tabular data if present
      let table: Message["table"] | undefined
      if (data.data?.rows && data.data?.columns) {
        table = {
          headers: data.data.columns,
          rows: data.data.rows.map((row: Record<string, unknown>) =>
            data.data.columns.map((col: string) => String(row[col] ?? "—"))
          ),
        }
      }

      const canEscalate =
        Boolean(quota?.cloud_ai_allowed && (quota?.limit ?? 0) > 0) &&
        !forceCloud &&
        data.route !== "cloud_llm" &&
        data.route !== "deterministic"

      const aidaMsg: Message = {
        id: Date.now().toString(),
        sender: "aida",
        text: data.answer || "I couldn't find an answer from department records.",
        route: data.route,
        intent: data.intent,
        ai_mode: data.ai_mode,
        provider: data.provider,
        tokens_out: data.tokens_out,
        latency_ms: data.latency_ms,
        cloud_calls_used: data.cloud_calls_used,
        cloud_calls_limit: data.cloud_calls_limit,
        sources: Array.isArray(data.sources) ? data.sources : undefined,
        table,
        can_escalate_cloud: canEscalate,
        query: textToSend,
      }

      if (data.cloud_calls_used != null) {
        setQuota((prev) =>
          prev
            ? { ...prev, used: data.cloud_calls_used, limit: data.cloud_calls_limit ?? prev.limit }
            : prev
        )
      }

      setMessages((prev) => prev.filter((m) => !m.loading).concat(aidaMsg))
    } catch (e: unknown) {
      const detail =
        (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "An error occurred. Please try again."
      setMessages((prev) =>
        prev.filter((m) => !m.loading).concat({
          id: Date.now().toString(),
          sender: "aida",
          text: typeof detail === "string" ? detail : "Request failed.",
          route: "blocked",
          ai_mode: "Error",
          error: true,
        })
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Escape key to close assistant
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  const handleSend = () => sendQuery(input)
  const handleEscalateCloud = (originalQuery: string) => sendQuery(originalQuery, "advanced", true)

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="AIDA Intelligence Assistant"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 flex h-[100dvh] max-h-[100dvh] w-full flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-250 sm:w-[460px]">

        {/* ── Hero Header with Robot ─────────────────────────────────────────── */}
        <div className="relative shrink-0 overflow-hidden bg-[#071b3d] px-6 pt-5 pb-0">
          {/* Background glows */}
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#0967d1] blur-[80px] opacity-60" />
          <div className="absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-[#b4731c] blur-[60px] opacity-40" />
          <span aria-hidden="true" className="absolute right-[45%] top-4 text-2xl text-[#5ac9ff] opacity-70">✦</span>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-20 rounded-xl p-1.5 text-[#C4D7EF] transition-colors hover:bg-white/15 hover:text-white"
            title="Close AIDA"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header text + robot side-by-side */}
          <div className="relative z-10 flex items-end justify-between">
            <div className="pb-5 max-w-[58%]">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#72b7ff]">✦ Ask the Department</p>
              <h2 className="mt-1.5 text-[1.45rem] font-black leading-tight tracking-[-0.04em] text-white">
                Hi! I&apos;m <span className="text-[#ffda48]">AIDA</span>
              </h2>
              <p className="mt-1 text-[11px] leading-relaxed text-[#bbd2ef] max-w-[200px]">
                Your AI department assistant. Ask me anything about AIMETRA.
              </p>

              {/* Mode tabs (compact) */}
              <div className="mt-3 flex gap-1 flex-wrap">
                {(["hybrid","fast","knowledge","analytics"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setActiveMode(m)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
                      activeMode === m
                        ? "bg-[#ffda48] text-[#071b3d]"
                        : "bg-white/10 text-[#bbd2ef] hover:bg-white/20"
                    }`}
                  >
                    {m === "hybrid" ? "Auto" : m === "fast" ? "⚡ Quick" : m === "knowledge" ? "📚 Know" : "📊 Data"}
                  </button>
                ))}
              </div>
            </div>

            {/* AIDA Robot — large, persistent, bottom-anchored */}
            <div className="relative h-[165px] w-[130px] shrink-0 self-end">
              <Image
                src="/images/aida-mascot.png"
                alt="AIDA robot assistant"
                fill
                priority
                sizes="130px"
                className="object-contain object-bottom drop-shadow-[0_8px_20px_rgba(9,103,209,0.35)]"
              />
            </div>
          </div>
        </div>

        {/* ── Quota / Status strip ─────────────────────────────────────────────── */}
        {quota && quota.cloud_ai_allowed && quota.limit > 0 ? (
          <div className="flex shrink-0 items-center justify-between border-b border-[#DCE5F1] bg-white px-4 py-2 text-[11px]">
            <span className="text-[#526783] flex items-center gap-1">
              <Cloud className="w-3.5 h-3.5 text-[#1E40AF]" />
              <span>Advanced AI quota:</span>
            </span>
            <div className="flex items-center gap-2">
              <div className="bg-[#DCE5F1] rounded-full h-1.5 w-20 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (quota.used / quota.limit) * 100)}%`,
                    background: quota.used >= quota.limit ? "#B85C5C" : "#94B0B8",
                  }}
                />
              </div>
              <span className="font-mono text-[#0F172A] text-[10px]">{quota.used}/{quota.limit}</span>
            </div>
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-2 border-b border-[#DCE5F1] bg-[#FAF3E2] px-4 py-1.5 text-[10px] text-[#92400E]">
            <Cpu className="w-3 h-3 text-[#EEBE1E] shrink-0" />
            <span>Local Department Intelligence — zero cloud required.</span>
          </div>
        )}

        {/* ── Main Content Area ─────────────────────────────────────────────── */}
        {!chatStarted ? (
          /* Welcome / Quick Actions Screen */
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Quick action tiles — matches mockup panel 20 */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9ab5d0] mb-3">Quick Actions</p>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => sendQuery(action.query)}
                    className="group flex flex-col gap-2 rounded-2xl border border-[#E8F0FB] bg-white p-3 text-left transition-all hover:-translate-y-0.5 hover:border-current hover:shadow-[0_4px_16px_rgba(9,25,54,0.10)]"
                    style={{ borderColor: undefined }}
                  >
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all group-hover:scale-110"
                      style={{ background: action.bg, color: action.color }}
                    >
                      <action.icon className="w-4 h-4" />
                    </span>
                    <span className="text-[11px] font-bold leading-tight text-[#091936]">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Suggested prompts */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9ab5d0] mb-3">Try asking…</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "What is the attendance policy?",
                  "Placement eligibility criteria?",
                  "Who is the HOD?",
                  "How many students enrolled?",
                  "Top 10 ranked students",
                  "Show AIML core courses",
                  "Upcoming events this month",
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => sendQuery(chip)}
                    className="rounded-full border border-[#D4E0F0] bg-[#F8FBFF] px-3 py-1.5 text-[11px] font-medium text-[#3D5A80] transition-all hover:border-[#1478ef] hover:bg-[#1478ef] hover:text-white"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Chat Messages */
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3.5" style={{ background: "#F4F8FD" }}>
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                {m.sender === "user" ? (
                  <div className="max-w-[85%] rounded-[18px] rounded-tr-sm bg-gradient-to-br from-[#071b3d] to-[#0d2d5e] text-white px-4 py-2.5 text-[12px] leading-relaxed shadow-[0_2px_8px_rgba(7,27,61,0.25)]">
                    {m.text}
                  </div>
                ) : m.loading ? (
                  <div className="flex items-center gap-2.5 rounded-2xl border border-[#D4E0F0] bg-white px-3.5 py-2.5 shadow-sm">
                    <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-[#DDEFFF] shadow-inner">
                      <Image src="/images/aida-mascot.png" alt="" fill sizes="28px" className="object-cover object-top" />
                    </div>
                    <div className="flex items-center gap-1">
                      {[0, 150, 300].map((delay) => (
                        <div
                          key={delay}
                          className="w-2 h-2 rounded-full bg-[#1478ef]/40 animate-bounce"
                          style={{ animationDelay: `${delay}ms` }}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-[#9ab5d0]">AIDA is thinking…</span>
                  </div>
                ) : (
                  <div className="w-full space-y-2">
                    <div className="flex items-start gap-2.5">
                      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#DDEFFF] mt-0.5 shadow-[0_2px_6px_rgba(20,120,239,0.2)]">
                        <Image src="/images/aida-mascot.png" alt="" fill sizes="32px" className="object-cover object-top" />
                      </div>
                      <div className="flex-1 rounded-[18px] rounded-tl-sm border border-[#D4E0F0] bg-white p-3.5 shadow-sm">
                        <p
                          className={`text-xs leading-relaxed whitespace-pre-wrap ${
                            m.error ? "text-[#B85C5C]" : "text-[#0F172A]"
                          }`}
                        >
                          {m.text}
                        </p>

                        {/* Sources */}
                        {m.sources && m.sources.length > 0 && (
                          <div className="mt-2.5 pt-2.5 border-t border-[#DCE5F1] space-y-1">
                            <div className="text-[10px] font-semibold text-[#667A93] uppercase tracking-wider flex items-center gap-1">
                              <BookOpen className="w-3 h-3 text-[#94B0B8]" />
                              <span>Sources</span>
                            </div>
                            {m.sources.map((src, sIdx) => (
                              <div
                                key={sIdx}
                                className="text-[11px] text-[#34465E] flex items-center justify-between bg-[#F6F8FC] px-2 py-1 rounded"
                              >
                                <span className="font-medium truncate mr-2">• {src.title || JSON.stringify(src)}</span>
                                {src.category && (
                                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white text-[#526783] font-mono shrink-0">
                                    {src.category}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Cloud escalation */}
                        {m.can_escalate_cloud && m.query && (
                          <div className="mt-3 pt-2.5 border-t border-dashed border-[#DCE5F1] flex items-center justify-between bg-[#FAF3E2]/50 p-2 rounded-lg">
                            <div className="text-[10px] text-[#526783]">
                              <span className="font-medium text-[#0F172A]">Authorized Staff:</span> Need deeper synthesis?
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEscalateCloud(m.query!)}
                              disabled={isLoading}
                              className="h-6 text-[10px] gap-1 px-2 border-[#DCE5F1] bg-white hover:bg-[#071b3d] hover:text-white"
                            >
                              Use Advanced AI
                            </Button>
                          </div>
                        )}

                        {/* Route badge */}
                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#F6F8FC]">
                          <RouteBadge route={m.route} mode={m.ai_mode} provider={m.provider} />
                          {m.latency_ms != null && (
                            <span className="text-[10px] font-mono text-[#71849B]">
                              {m.latency_ms}ms{m.tokens_out ? ` · ${m.tokens_out} toks` : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Tabular Data */}
                    {m.table && (
                      <div className="rounded-xl border border-[#DCE5F1] overflow-hidden bg-white text-xs shadow-sm ml-8 my-2">
                        <div className="max-h-60 overflow-x-auto overflow-y-auto">
                          <table className="w-full text-left">
                            <thead className="bg-[#F6F8FC] border-b border-[#DCE5F1] text-[10px] font-semibold text-[#526783] uppercase tracking-wider sticky top-0">
                              <tr>
                                {m.table.headers.map((h, i) => (
                                  <th key={i} className="p-2 font-medium">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#D6D6D6]">
                              {m.table.rows.map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-[#F6F8FC]/50">
                                  {row.map((cell, cIdx) => (
                                    <td
                                      key={cIdx}
                                      className={`p-2 text-[11px] ${cIdx === 0 ? "font-medium text-[#667A93]" : "text-[#0F172A]"}`}
                                    >
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="p-2 border-t border-[#DCE5F1] bg-[#F6F8FC] flex flex-wrap gap-1.5">
                          <Button size="sm" variant="secondary" className="h-6 text-[10px] gap-1 px-2 bg-white border border-[#DCE5F1]">
                            <Download className="w-2.5 h-2.5" /> Export CSV
                          </Button>
                          <Button size="sm" variant="secondary" className="h-6 text-[10px] gap-1 px-2 bg-white border border-[#DCE5F1]">
                            <BarChart2 className="w-2.5 h-2.5" /> View Insights
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Input Form ─────────────────────────────────────────────────────── */}
        <div
          className="shrink-0 border-t border-[#D4E0F0] bg-white px-3 pt-3"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" }}
        >
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend() }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask AIDA anything about the department…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="h-11 flex-1 rounded-2xl border border-[#D4E0F0] bg-[#F0F4FA] px-4 text-[12px] text-[#091936] placeholder:text-[#9ab5d0] transition-all focus:border-[#1478ef] focus:bg-white focus:outline-none focus:shadow-[0_0_0_3px_rgba(20,120,239,0.12)] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #1478ef, #0f5fcb)" }}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="mt-2 pb-0.5 text-center text-[10px] text-[#b0c4da]">
            ✦ AIDA · Local department intelligence · Privacy first
          </p>
        </div>
      </div>
    </div>
  )
}
