"use client"

import { useState, useRef, useEffect } from "react"
import {
  Sparkles,
  X,
  Send,
  Download,
  Eye,
  BarChart2,
  AlertCircle,
  Cpu,
  Cloud,
  Zap,
  BookOpen,
  Layers,
  ChevronDown,
  ChevronRight,
  Database,
  Search,
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

// ─── Route & Mode Badge ───────────────────────────────────────────────────────

function RouteBadge({ route, mode, provider }: { route?: string; mode?: string; provider?: string }) {
  if (!route && !mode) return null

  // Palette mapped to Unidale status styling
  let bg = "#F5F5F5"
  let color = "#5C5C5C"
  let icon = <Database className="w-2.5 h-2.5" />

  switch (route) {
    case "deterministic":
      bg = "#EEF3EE"
      color = "#2E5E35"
      icon = <Zap className="w-2.5 h-2.5" />
      break
    case "cache":
      bg = "#EAF0F3"
      color = "#1E40AF"
      icon = <Zap className="w-2.5 h-2.5" />
      break
    case "okf":
      bg = "#F3E8FF"
      color = "#6B21A8"
      icon = <BookOpen className="w-2.5 h-2.5" />
      break
    case "rag":
      bg = "#EDE9FE"
      color = "#5B21B6"
      icon = <Search className="w-2.5 h-2.5" />
      break
    case "local_llm":
      bg = "#E0F2FE"
      color = "#0369A1"
      icon = <Cpu className="w-2.5 h-2.5" />
      break
    case "browser_slm":
      bg = "#FEF3C7"
      color = "#92400E"
      icon = <Cpu className="w-2.5 h-2.5" />
      break
    case "cloud_llm":
      bg = "#DBEAFE"
      color = "#1E40AF"
      icon = <Cloud className="w-2.5 h-2.5" />
      break
    case "blocked":
    case "quota_exceeded":
      bg = "#FEE2E2"
      color = "#991B1B"
      icon = <AlertCircle className="w-2.5 h-2.5" />
      break
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

// ─── Main AIDA Component ──────────────────────────────────────────────────────

export function AIDAAssistant({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "aida",
      text: "Hello! I'm AIDA — the AI & ML Department Intelligent Assistant.\n\nI answer queries deterministically and via institutional knowledge without unnecessary cloud usage. Ask me about students, rankings, curriculum, attendance rules, placement policies, or faculty.",
      route: "okf",
      ai_mode: "Department Intelligence",
    },
  ])

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
        } catch (err: any) {
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

      // Determine if staff can escalate to cloud
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

      // Update quota if cloud was consumed
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

  const handleSend = () => sendQuery(input)

  const handleEscalateCloud = (originalQuery: string) => {
    sendQuery(originalQuery, "advanced", true)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] bg-white border-l border-[#D6D6D6] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="p-4 border-b border-[#D6D6D6] flex items-center justify-between bg-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1E1E1E] text-white flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#EEBE1E]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[#1E1E1E] tracking-tight">
                AIDA Intelligence
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#F2F2F1] text-[#5C5C5C] rounded">
                Hybrid 7-Tier
              </span>
            </div>
            <p className="text-[11px] text-[#7A7A7A]">
              Deterministic • OKF • RAG • Local SLM • Cloud Fallback
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-[#7A7A7A] hover:text-[#1E1E1E] hover:bg-[#F2F2F1] rounded-md transition-colors"
          title="Close drawer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ── Mode Selector Tabs (§32) ────────────────────────────────────────── */}
      <div className="px-4 py-2 bg-[#F2F2F1] border-b border-[#D6D6D6] flex items-center gap-1.5 text-[11px] overflow-x-auto">
        <span className="text-[10px] uppercase tracking-wider text-[#7A7A7A] font-medium mr-1">
          Mode:
        </span>
        {(
          [
            { id: "hybrid", label: "Auto", desc: "Cheapest capable route" },
            { id: "fast", label: "⚡ Fast", desc: "SQL tools + cache only" },
            { id: "knowledge", label: "📚 Knowledge", desc: "OKF + RAG docs" },
            { id: "analytics", label: "📊 Analytics", desc: "SQL stats & aggregates" },
            { id: "advanced", label: "✨ Advanced", desc: "Local synthesis + Cloud" },
          ] as const
        ).map((m) => (
          <button
            key={m.id}
            onClick={() => setActiveMode(m.id)}
            title={m.desc}
            className={`px-2.5 py-1 rounded-full font-medium transition-all ${
              activeMode === m.id
                ? "bg-[#1E1E1E] text-white shadow-xs"
                : "bg-white text-[#5C5C5C] border border-[#D6D6D6] hover:text-[#1E1E1E]"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* ── Quota Bar (§40) ─────────────────────────────────────────────────── */}
      {quota && quota.cloud_ai_allowed && quota.limit > 0 ? (
        <div className="px-4 py-2 bg-white border-b border-[#D6D6D6] flex items-center justify-between text-[11px]">
          <span className="text-[#5C5C5C] flex items-center gap-1">
            <Cloud className="w-3.5 h-3.5 text-[#1E40AF]" />
            <span>Advanced AI Cloud Quota:</span>
          </span>
          <div className="flex items-center gap-2">
            <div className="bg-[#E5E5E5] rounded-full h-1.5 w-20 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (quota.used / quota.limit) * 100)}%`,
                  background: quota.used >= quota.limit ? "#B85C5C" : "#94B0B8",
                }}
              />
            </div>
            <span className="font-mono text-[#1E1E1E] text-[10px]">
              {quota.used} / {quota.limit} today
            </span>
          </div>
        </div>
      ) : (
        <div className="px-4 py-1.5 bg-[#FAF3E2] border-b border-[#D6D6D6] flex items-center gap-2 text-[10px] text-[#92400E]">
          <Cpu className="w-3 h-3 text-[#EEBE1E] shrink-0" />
          <span>Local Department Intelligence active. Zero cloud consumption required.</span>
        </div>
      )}

      {/* ── Quick Prompts ───────────────────────────────────────────────────── */}
      <div className="p-2.5 bg-white border-b border-[#D6D6D6] flex gap-1.5 overflow-x-auto text-[11px]">
        {[
          "What is the attendance policy?",
          "Placement eligibility criteria?",
          "Who is the HOD?",
          "How many students enrolled?",
          "Top 10 ranked students",
          "Show AIML core courses",
        ].map((chip) => (
          <button
            key={chip}
            onClick={() => sendQuery(chip)}
            className="px-2.5 py-1 rounded-md bg-[#F2F2F1] text-[#3A3A3A] hover:bg-[#1E1E1E] hover:text-white whitespace-nowrap transition-colors text-[10px]"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* ── Messages Scroll Area ────────────────────────────────────────────── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F2F2F1]/30">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
          >
            {m.sender === "user" ? (
              <div className="max-w-[85%] rounded-2xl bg-[#1E1E1E] text-white px-4 py-2.5 text-xs font-normal shadow-xs">
                {m.text}
              </div>
            ) : m.loading ? (
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-[#D6D6D6] shadow-xs">
                <div className="w-5 h-5 rounded-full bg-[#1E1E1E] text-white flex items-center justify-center text-[10px]">
                  A
                </div>
                <div className="flex gap-1">
                  {[0, 150, 300].map((delay) => (
                    <div
                      key={delay}
                      className="w-1.5 h-1.5 rounded-full bg-[#94B0B8] animate-bounce"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-[#7A7A7A] ml-1">Routing query...</span>
              </div>
            ) : (
              <div className="w-full space-y-2">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[#1E1E1E] text-white flex items-center justify-center text-[11px] font-bold mt-0.5 shrink-0 shadow-xs">
                    A
                  </div>
                  <div className="flex-1 bg-white p-3.5 rounded-xl border border-[#D6D6D6] shadow-xs">
                    <p
                      className={`text-xs leading-relaxed whitespace-pre-wrap ${
                        m.error ? "text-[#B85C5C]" : "text-[#1E1E1E]"
                      }`}
                    >
                      {m.text}
                    </p>

                    {/* Sources Citations (§42) */}
                    {m.sources && m.sources.length > 0 && (
                      <div className="mt-2.5 pt-2.5 border-t border-[#D6D6D6] space-y-1">
                        <div className="text-[10px] font-semibold text-[#7A7A7A] uppercase tracking-wider flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-[#94B0B8]" />
                          <span>Sources & Documents</span>
                        </div>
                        <div className="space-y-1">
                          {m.sources.map((src, sIdx) => (
                            <div
                              key={sIdx}
                              className="text-[11px] text-[#3A3A3A] flex items-center justify-between bg-[#F2F2F1] px-2 py-1 rounded"
                            >
                              <span className="font-medium truncate mr-2">
                                • {src.title || JSON.stringify(src)}
                              </span>
                              {src.category && (
                                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white text-[#5C5C5C] font-mono shrink-0">
                                  {src.category}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Explicit Cloud Escalation (§39) */}
                    {m.can_escalate_cloud && m.query && (
                      <div className="mt-3 pt-2.5 border-t border-dashed border-[#D6D6D6] flex items-center justify-between bg-[#FAF3E2]/50 p-2 rounded-lg">
                        <div className="text-[10px] text-[#5C5C5C]">
                          <span className="font-medium text-[#1E1E1E]">Authorized Staff:</span> Need deeper cross-department synthesis?
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEscalateCloud(m.query!)}
                          disabled={isLoading}
                          className="h-6 text-[10px] gap-1 px-2 border-[#D6D6D6] bg-white hover:bg-[#1E1E1E] hover:text-white"
                        >
                          <Sparkles className="w-2.5 h-2.5 text-[#EEBE1E]" />
                          Use Advanced AI
                        </Button>
                      </div>
                    )}

                    {/* Route badge and latency metrics */}
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#F2F2F1]">
                      <RouteBadge route={m.route} mode={m.ai_mode} provider={m.provider} />
                      {m.latency_ms != null && (
                        <span className="text-[10px] font-mono text-[#9A9A9A]">
                          {m.latency_ms}ms
                          {m.tokens_out ? ` · ${m.tokens_out} toks` : ""}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tabular Data View */}
                {m.table && (
                  <div className="rounded-xl border border-[#D6D6D6] overflow-hidden bg-white text-xs shadow-xs ml-8">
                    <div className="max-h-60 overflow-y-auto">
                      <table className="w-full text-left">
                        <thead className="bg-[#F2F2F1] border-b border-[#D6D6D6] text-[10px] font-semibold text-[#5C5C5C] uppercase tracking-wider sticky top-0">
                          <tr>
                            {m.table.headers.map((h, i) => (
                              <th key={i} className="p-2 font-medium">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#D6D6D6]">
                          {m.table.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-[#F2F2F1]/50">
                              {row.map((cell, cIdx) => (
                                <td
                                  key={cIdx}
                                  className={`p-2 text-[11px] ${
                                    cIdx === 0
                                      ? "font-medium text-[#7A7A7A]"
                                      : "text-[#1E1E1E]"
                                  }`}
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-2 border-t border-[#D6D6D6] bg-[#F2F2F1] flex flex-wrap gap-1.5">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-6 text-[10px] gap-1 px-2 bg-white border border-[#D6D6D6]"
                      >
                        <Download className="w-2.5 h-2.5" /> Export CSV
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-6 text-[10px] gap-1 px-2 bg-white border border-[#D6D6D6]"
                      >
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

      {/* ── Input Form ──────────────────────────────────────────────────────── */}
      <div className="p-3 border-t border-[#D6D6D6] bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask AIDA anything about the department..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 h-9 px-3 rounded-lg border border-[#D6D6D6] bg-[#F2F2F1] text-xs text-[#1E1E1E] placeholder:text-[#9A9A9A] focus:bg-white focus:outline-none focus:border-[#1E1E1E] disabled:opacity-50 transition-colors"
          />
          <Button
            type="submit"
            size="sm"
            disabled={isLoading || !input.trim()}
            className="h-9 px-3 bg-[#1E1E1E] text-white hover:bg-neutral-800 disabled:opacity-50 rounded-lg"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </form>
      </div>
    </div>
  )
}
