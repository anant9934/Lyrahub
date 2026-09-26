"use client"

import { useState, useRef, useEffect } from "react"
import { Sparkles, X, Send, Download, Eye, BarChart2, AlertCircle, Cpu, Cloud, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"

// ─── Types ────────────────────────────────────────────────────────────────────

interface TableData {
  columns?: string[]
  rows?: Record<string, unknown>[]
  headers?: string[]
}

interface Message {
  id: string
  sender: "user" | "aida"
  text: string
  ai_mode?: string
  signal?: string
  query?: string
  provider?: string
  tokens_out?: number
  latency_ms?: number
  cloud_calls_used?: number
  cloud_calls_limit?: number
  table?: {
    headers: string[]
    rows: (string | number)[][]
  }
  error?: boolean
  loading?: boolean
}

// ─── AI Mode Badge ────────────────────────────────────────────────────────────

function AIModeBadge({ mode, provider }: { mode?: string; provider?: string }) {
  if (!mode) return null

  const isCloud = mode === "Cloud LLM"
  const isDeterministic = mode?.startsWith("Deterministic")
  const isBrowserSLM = mode === "Browser SLM"
  const isBlocked = mode === "Quota Exceeded" || mode === "Blocked"

  return (
    <div className="flex items-center gap-1.5 mt-1">
      <span
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
        style={{
          background: isDeterministic ? "#D1FAE5" : isCloud ? "#DBEAFE" : isBrowserSLM ? "#FEF3C7" : isBlocked ? "#FEE2E2" : "#F5F5F5",
          color: isDeterministic ? "#065F46" : isCloud ? "#1E40AF" : isBrowserSLM ? "#92400E" : isBlocked ? "#991B1B" : "#555",
        }}
      >
        {isDeterministic && <Zap className="w-2.5 h-2.5" />}
        {isCloud && <Cloud className="w-2.5 h-2.5" />}
        {isBrowserSLM && <Cpu className="w-2.5 h-2.5" />}
        {mode}
        {provider && ` · ${provider}`}
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
      text: "Hello! I'm AIDA — the AI & ML Department Intelligent Assistant. Ask me about students, rankings, placements, events, or any complex query. I'll use the most efficient method to answer.",
      ai_mode: "Deterministic (SQL)",
    },
  ])

  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [quota, setQuota] = useState<{ used: number; limit: number; role: string; cloud_ai_allowed: boolean } | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Fetch quota on mount
  useEffect(() => {
    api.get("/ai/quota").then(r => {
      setQuota({
        used: r.data.cloud_calls_used,
        limit: r.data.cloud_calls_limit,
        role: r.data.role,
        cloud_ai_allowed: r.data.cloud_ai_allowed,
      })
    }).catch(() => {})
  }, [])

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userText = input.trim()
    const userMsg: Message = { id: Date.now().toString(), sender: "user", text: userText }
    const loadingMsg: Message = { id: `loading-${Date.now()}`, sender: "aida", text: "", loading: true }

    setMessages(prev => [...prev, userMsg, loadingMsg])
    setInput("")
    setIsLoading(true)

    try {
      const res = await api.post("/ai/query", { query: userText })
      const data = res.data

      // If frontend-browser SLM signal, handle locally
      if (data.signal === "__BROWSER_SLM__") {
        setMessages(prev => prev.filter(m => !m.loading).concat({
          id: Date.now().toString(),
          sender: "aida",
          text: `Processing your query locally via browser SLM (no cloud call needed):\n\n"${userText}"\n\nNote: For complex queries requiring deep analysis, please ask a faculty member or HOD to look this up.`,
          ai_mode: "Browser SLM",
        }))
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

      const aidaMsg: Message = {
        id: Date.now().toString(),
        sender: "aida",
        text: data.answer || "I couldn't find an answer to that query.",
        ai_mode: data.ai_mode,
        provider: data.provider,
        tokens_out: data.tokens_out,
        latency_ms: data.latency_ms,
        cloud_calls_used: data.cloud_calls_used,
        cloud_calls_limit: data.cloud_calls_limit,
        table,
      }

      // Update quota from response
      if (data.cloud_calls_used != null) {
        setQuota(prev => prev ? { ...prev, used: data.cloud_calls_used, limit: data.cloud_calls_limit } : prev)
      }

      setMessages(prev => prev.filter(m => !m.loading).concat(aidaMsg))
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "An error occurred. Please try again."
      setMessages(prev => prev.filter(m => !m.loading).concat({
        id: Date.now().toString(),
        sender: "aida",
        text: detail,
        ai_mode: "Error",
        error: true,
      }))
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white border-l border-[#E5E5E5] shadow-modal flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-[#E5E5E5] flex items-center justify-between bg-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#111111] text-white flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#111111] tracking-tight">
              AIDA — AI Dept Assistant
            </h3>
            <p className="text-[11px] text-[#777777]">
              Ask anything about students, faculty, projects, placements and more.
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-[#888888] hover:text-[#111111] hover:bg-[#F5F5F5] rounded-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quota bar (visible for non-students with cloud access) */}
      {quota && quota.cloud_ai_allowed && quota.limit > 0 && (
        <div className="px-4 py-2 bg-[#FAFAFA] border-b border-[#E5E5E5] flex items-center justify-between">
          <span className="text-[11px] text-[#777]">Cloud AI quota today</span>
          <div className="flex items-center gap-2">
            <div style={{ background: "#E5E5E5", borderRadius: 4, height: 6, width: 80, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.min(100, (quota.used / quota.limit) * 100)}%`,
                  height: "100%",
                  background: quota.used >= quota.limit ? "#EF4444" : "#2563EB",
                  borderRadius: 4,
                  transition: "width 0.3s",
                }}
              />
            </div>
            <span className="text-[11px] text-[#777]">{quota.used}/{quota.limit}</span>
          </div>
        </div>
      )}

      {/* Student note */}
      {quota && !quota.cloud_ai_allowed && (
        <div className="px-4 py-2 bg-[#F5F5F5] border-b border-[#E5E5E5] flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-[#777]" />
          <span className="text-[11px] text-[#777]">Using browser-side AI — deterministic tools + local processing only.</span>
        </div>
      )}

      {/* Suggested Quick Queries */}
      <div className="p-3 bg-[#FAFAFA] border-b border-[#E5E5E5] flex gap-2 overflow-x-auto text-[11px]">
        {[
          "How many students?",
          "Top 10 students",
          "Placed students",
          "CGPA above 8.5",
        ].map((chip) => (
          <button
            key={chip}
            onClick={() => setInput(chip)}
            className="px-2.5 py-1 rounded-md bg-white border border-[#E5E5E5] text-[#555555] hover:text-[#111111] hover:border-[#111111] whitespace-nowrap transition-colors"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
          >
            {m.sender === "user" ? (
              <div className="max-w-[85%] rounded-lg bg-[#111111] text-white px-3.5 py-2 text-xs font-normal">
                {m.text}
              </div>
            ) : m.loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#111111] text-white flex items-center justify-center text-[10px]">A</div>
                <div className="flex gap-1">
                  {[0, 150, 300].map(delay => (
                    <div
                      key={delay}
                      className="w-1.5 h-1.5 rounded-full bg-[#CCCCCC] animate-bounce"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#111111] text-white flex items-center justify-center text-[10px] mt-0.5 shrink-0">
                    A
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs leading-relaxed whitespace-pre-wrap ${m.error ? "text-red-600" : "text-[#333333]"}`}>
                      {m.text}
                    </p>
                    <AIModeBadge mode={m.ai_mode} provider={m.provider} />
                    {m.latency_ms && (
                      <span className="text-[10px] text-[#AAA] mt-0.5 block">
                        {m.latency_ms}ms · {m.tokens_out} tokens
                      </span>
                    )}
                  </div>
                </div>

                {m.table && (
                  <div className="rounded-lg border border-[#E5E5E5] overflow-hidden bg-white text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-[#FAFAFA] border-b border-[#E5E5E5] text-[11px] font-medium text-[#555555]">
                        <tr>
                          {m.table.headers.map((h, i) => (
                            <th key={i} className="p-2 font-medium">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5E5]">
                        {m.table.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-[#FAFAFA]">
                            {row.map((cell, cIdx) => (
                              <td
                                key={cIdx}
                                className={`p-2 ${cIdx === 0 ? "font-medium text-[#888888]" : "text-[#111111]"}`}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Table Quick Actions */}
                    <div className="p-2 border-t border-[#E5E5E5] bg-[#FAFAFA] flex flex-wrap gap-2">
                      <Button size="sm" variant="secondary" className="h-7 text-[10px] gap-1 px-2">
                        <Download className="w-3 h-3" /> Export CSV
                      </Button>
                      <Button size="sm" variant="secondary" className="h-7 text-[10px] gap-1 px-2">
                        <Eye className="w-3 h-3" /> View All
                      </Button>
                      <Button size="sm" variant="secondary" className="h-7 text-[10px] gap-1 px-2">
                        <BarChart2 className="w-3 h-3" /> Show Chart
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-[#E5E5E5] bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask anything about the department..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 h-9 px-3 rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] text-xs text-[#111111] placeholder:text-[#888888] focus:bg-white focus:outline-none focus:border-[#111111] disabled:opacity-50"
          />
          <Button
            type="submit"
            size="sm"
            disabled={isLoading || !input.trim()}
            className="h-9 px-3 bg-[#111111] text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </form>
      </div>
    </div>
  )
}
