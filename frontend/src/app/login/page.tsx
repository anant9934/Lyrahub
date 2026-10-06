"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import api from "@/lib/api"
import { QrCode, Mail, ArrowRight, Sparkles } from "lucide-react"

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"email" | "qr">("email")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  // Explicit login states: idle | authenticating | success | error
  const [authState, setAuthState] = useState<"idle" | "authenticating" | "success">("idle")
  const router = useRouter()
  const { login } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setAuthState("authenticating")

    // 15-second timeout — never leave user stuck in "Authenticating..."
    const controller = new AbortController()
    const timeout = setTimeout(() => {
      controller.abort()
      setAuthState("idle")
      setError("Login request timed out. Please check your connection and try again.")
    }, 15_000)

    try {
      const formData = new URLSearchParams()
      formData.append("username", email)
      formData.append("password", password)

      const { data } = await api.post("/auth/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        signal: controller.signal,
      })

      clearTimeout(timeout)
      setAuthState("success")

      // Login caches the user, then navigate — no need to refetch on dashboard
      await login(data)
      router.push("/dashboard")
    } catch (error: unknown) {
      clearTimeout(timeout)
      if (controller.signal.aborted) return // Already handled by timeout

      setAuthState("idle")
      const err = error as {
        response?: { status?: number; data?: { detail?: string | { title?: string } } };
        normalized?: { message?: string };
      };

      if (!err.response) {
        // Network error (no response at all)
        setError("Cannot connect to AIMETRA services. Please check your network and try again.")
      } else if (err.response?.status === 401) {
        setError("Incorrect email or password. Please verify your credentials.")
      } else if (err.response?.status === 429) {
        setError("Too many login attempts. Please wait a moment before trying again.")
      } else if (err.response?.status && err.response.status >= 500) {
        setError("AIMETRA services are temporarily unavailable. Please try again shortly.")
      } else {
        // Use the normalized safe message from the API interceptor
        const detail = err.response?.data?.detail;
        const detailMsg = typeof detail === "object" && detail !== null ? detail.title : (detail as string);
        setError(
          err.normalized?.message ||
          detailMsg ||
          "Sign-in failed. Please try again."
        )
      }
    }
  }

  const loading = authState === "authenticating" || authState === "success"

  // Pre-fill helper for test/demo accounts
  const quickFill = (userEmail: string, userPass: string) => {
    setEmail(userEmail)
    setPassword(userPass)
  }

  return (
    <div className="flex min-h-screen bg-[#f6f8fc] dark:bg-[#101827]">
      {/* Left Column: Form (Matching Panel 2) */}
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-between p-5 sm:p-8 lg:p-16">
        {/* Top Brand Logo */}
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl shadow-[0_4px_12px_rgba(20,120,239,0.30)]" style={{ background: "linear-gradient(135deg, #1478ef, #0f5fcb)" }}>
              <span className="text-lg font-black text-[#ffdb45]">✦</span>
            </div>
            <div>
              <span className="block text-[13px] font-black uppercase tracking-[-0.03em] text-[#091936] dark:text-white leading-tight">
                AIMETRA
              </span>
              <span className="block text-[9px] font-medium tracking-wider text-[#9ab5d0] uppercase">AI · ML · Hub</span>
            </div>
          </Link>
        </div>

        {/* Center: Main Login Content */}
        <div className="my-auto py-8">
          <div className="space-y-2 mb-7">
            <h1 className="text-3xl font-black tracking-[-0.05em] text-[#091936] sm:text-4xl dark:text-white">
              Welcome back
            </h1>
            <p className="text-[12px] text-[#526783]">
              Sign in to AIMETRA with your department credentials.
            </p>
          </div>

          {/* Segmented Pill Tabs: [Email] [QR Code] (Matching Panel 2) */}
          <div className="inline-flex h-9 items-center rounded-lg bg-[#EDF4FC] p-1 text-xs font-medium text-[#526783] mb-6 w-full max-w-xs">
            <button
              type="button"
              onClick={() => setActiveTab("email")}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-1 transition-all ${
                activeTab === "email"
                  ? "bg-white text-[#0F172A] shadow-subtle"
                  : "text-[#526783] hover:text-[#0F172A]"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("qr")}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-1 transition-all ${
                activeTab === "qr"
                  ? "bg-white text-[#0F172A] shadow-subtle"
                  : "text-[#526783] hover:text-[#0F172A]"
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QR Code</span>
            </button>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-[#FEE2E2] bg-[#FEF2F2] p-3.5 text-[12px] text-[#B91C1C]">
              <span className="mt-0.5 shrink-0 text-base">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {activeTab === "email" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-medium text-[#0F172A]"
                >
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your university email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-10 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-xs font-medium text-[#0F172A]"
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-[#667A93] hover:text-[#0F172A] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-10 text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 h-12 w-full rounded-2xl text-[13px] font-bold text-white transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ background: loading ? "#9ab5d0" : "linear-gradient(135deg, #071b3d, #1478ef)" }}
              >
                {authState === "success"
                  ? "✓ Signed in — redirecting…"
                  : authState === "authenticating"
                  ? "Authenticating…"
                  : "Sign in →"}
              </button>

              <div className="pt-3 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9ab5d0]">Quick demo login</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "Student",  email: "student@aiml.hub",  pass: "student123",  color: "#1478ef" },
                    { label: "Faculty",  email: "faculty@aiml.hub",  pass: "faculty123",  color: "#0D9488" },
                    { label: "HOD",      email: "hod@aiml.hub",      pass: "hod123",      color: "#7C3AED" },
                    { label: "Admin",    email: "admin@aiml.hub",    pass: "admin123",    color: "#D97706" },
                    { label: "Alumni",   email: "alumni@aiml.hub",   pass: "alumni123",   color: "#526783" },
                    { label: "Staff",    email: "staff@aiml.hub",    pass: "staff123",    color: "#526783" },
                    { label: "COS",      email: "cos@aiml.hub",      pass: "cos123",      color: "#526783" },
                    { label: "HOS",      email: "hos@aiml.hub",      pass: "hos123",      color: "#526783" },
                  ].map(({ label, email: e, pass, color }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => quickFill(e, pass)}
                      className="rounded-full border border-[#D4E0F0] bg-white px-3 py-1 text-[11px] font-semibold transition-all hover:-translate-y-0.5 hover:shadow-sm"
                      style={{ color }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

            </form>
          ) : (
            /* QR Code Tab */
            <div className="space-y-4 py-4 text-center">
              <div className="mx-auto w-40 h-40 border-2 border-dashed border-[#D0D0D0] rounded-xl flex flex-col items-center justify-center p-4 bg-[#F6F8FC]">
                <QrCode className="w-12 h-12 text-[#0F172A] mb-2" />
                <span className="text-[11px] text-[#526783]">
                  Point camera at student QR code badge
                </span>
              </div>
              <Link href="/scan">
                <Button className="w-full h-10 bg-[#0F172A] text-white text-xs">
                  Launch QR Camera Scanner
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Footer Link matching Panel 2 */}
        <div className="text-center pt-4 border-t border-[#DCE5F1]">
          <Link
            href="/signup"
            className="text-xs text-[#526783] hover:text-[#0F172A] inline-flex items-center gap-1 group"
          >
            <span>New here? Scan QR code for student registration</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Right Panel — AIDA mascot + branding */}
      <div className="relative hidden flex-1 overflow-hidden lg:block" style={{ background: "linear-gradient(160deg, #071b3d 0%, #0d2d5e 50%, #071b3d 100%)" }}>
        {/* Ambient glows */}
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-[#0967d1]/40 blur-[90px]" />
        <div className="absolute -bottom-24 left-0 h-80 w-80 rounded-full bg-[#a66e23]/35 blur-[90px]" />
        <div className="absolute left-[35%] top-[30%] h-64 w-64 rounded-full bg-[#FFCF36]/08 blur-[80px]" />

        {/* Decorative stars */}
        <span aria-hidden className="absolute left-10 top-12 text-3xl text-[#5ac9ff]/40 select-none">✦</span>
        <span aria-hidden className="absolute right-14 top-[45%] text-xl text-[#FFCF36]/30 select-none">✦</span>

        <div className="relative z-10 p-12 xl:p-16">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#72b7ff]">✦ Welcome to AIMETRA</p>
          <h2 className="mt-5 max-w-md text-4xl font-black leading-[1.06] tracking-[-0.055em] text-white xl:text-5xl">
            Your ideas belong <span className="text-[#FFCF36]">here.</span>
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#bbd2ef]">
            Connect with people, find opportunities, and make your work count in the AIML department.
          </p>

          {/* Stats row */}
          <div className="mt-8 flex flex-wrap gap-4">
            {[
              { val: "600+", label: "Students" },
              { val: "50+",  label: "Faculty" },
              { val: "120+", label: "Projects" },
            ].map(({ val, label }) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/[0.07] px-4 py-2.5 backdrop-blur-sm">
                <div className="text-[18px] font-black text-white">{val}</div>
                <div className="text-[10px] text-[#79bbff]">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* AIDA robot — large, prominent */}
        <div className="absolute bottom-[3%] left-[9%] right-[9%] h-[60%]">
          <Image
            src="/images/aida-mascot.png"
            alt="AIDA, AIMETRA's AI department assistant"
            fill
            priority
            sizes="50vw"
            className="object-contain object-bottom drop-shadow-[0_22px_40px_rgba(0,0,0,0.30)] aida-glow"
          />
        </div>
      </div>
    </div>
  )
}
