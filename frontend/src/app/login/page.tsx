"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import api from "@/lib/api"
import { QrCode, Mail, ArrowRight, ShieldCheck } from "lucide-react"

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"email" | "qr">("email")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const formData = new URLSearchParams()
      formData.append("username", email)
      formData.append("password", password)

      const { data } = await api.post("/auth/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      })

      await login(data)
      router.push("/dashboard")
    } catch (err: any) {
      setError(
        err.response?.data?.detail?.title ||
          err.response?.data?.detail ||
          "Invalid credentials. Please verify your email and password."
      )
    } finally {
      setLoading(false)
    }
  }

  // Pre-fill helper for test/demo accounts
  const quickFill = (userEmail: string, userPass: string) => {
    setEmail(userEmail)
    setPassword(userPass)
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Column: Form (Matching Panel 2) */}
      <div className="flex-1 flex flex-col justify-between p-8 sm:p-12 lg:p-16 max-w-xl mx-auto w-full">
        {/* Top Brand Logo */}
        <div>
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#111111] flex items-center justify-center text-white text-[9px] font-bold tracking-tight">
              AM
            </div>
            <span className="text-sm font-bold tracking-[0.1em] text-[#111111] uppercase">
              AIMETRA
            </span>
          </Link>
        </div>

        {/* Center: Main Login Content */}
        <div className="my-auto py-8">
          <div className="space-y-1 mb-6">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111]">
              Welcome back
            </h1>
            <p className="text-xs text-[#555555]">
              Sign in to AIMETRA with your department credentials.
            </p>
          </div>

          {/* Segmented Pill Tabs: [Email] [QR Code] (Matching Panel 2) */}
          <div className="inline-flex h-9 items-center rounded-lg bg-[#F5F5F5] p-1 text-xs font-medium text-[#555555] mb-6 w-full max-w-xs">
            <button
              type="button"
              onClick={() => setActiveTab("email")}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-1 transition-all ${
                activeTab === "email"
                  ? "bg-white text-[#111111] shadow-subtle"
                  : "text-[#555555] hover:text-[#111111]"
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
                  ? "bg-white text-[#111111] shadow-subtle"
                  : "text-[#555555] hover:text-[#111111]"
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QR Code</span>
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-[#FEF2F2] border border-[#FEE2E2] p-3 text-xs text-[#B91C1C]">
              {error}
            </div>
          )}

          {activeTab === "email" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-medium text-[#111111]"
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
                    className="text-xs font-medium text-[#111111]"
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-[#777777] hover:text-[#111111] hover:underline"
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

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-lg bg-[#111111] text-white hover:bg-neutral-800 font-medium text-xs mt-2"
              >
                {loading ? "Authenticating..." : "Login"}
              </Button>

              {/* Demo Quick Logins */}
              <div className="pt-2 flex flex-wrap gap-2 text-[10px] text-[#777777]">
                <span>Quick demo:</span>
                <button
                  type="button"
                  onClick={() => quickFill("student@aiml.hub", "student123")}
                  className="underline hover:text-[#111111]"
                >
                  Student
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => quickFill("faculty@aiml.hub", "faculty123")}
                  className="underline hover:text-[#111111]"
                >
                  Faculty
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => quickFill("hod@aiml.hub", "hod123")}
                  className="underline hover:text-[#111111]"
                >
                  HOD
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => quickFill("admin@aiml.hub", "admin123")}
                  className="underline hover:text-[#111111]"
                >
                  Admin
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => quickFill("alumni@aiml.hub", "alumni123")}
                  className="underline hover:text-[#111111]"
                >
                  Alumni
                </button>
              </div>

              {/* Divider: Or continue with */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E5E5E5]" />
                </div>
                <div className="relative flex justify-center text-[11px]">
                  <span className="bg-white px-2 text-[#777777]">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* SSO Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    quickFill("student@aiml.hub", "password123")
                  }}
                  className="flex items-center justify-center gap-2 h-9 px-3 rounded-lg border border-[#E5E5E5] bg-white text-xs font-medium text-[#555555] hover:bg-[#FAFAFA] hover:text-[#111111] transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Google (univ)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    quickFill("admin@aiml.hub", "admin123")
                  }}
                  className="flex items-center justify-center gap-2 h-9 px-3 rounded-lg border border-[#E5E5E5] bg-white text-xs font-medium text-[#555555] hover:bg-[#FAFAFA] hover:text-[#111111] transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 23 23">
                    <path fill="#f35325" d="M1 1h10v10H1z" />
                    <path fill="#81bc06" d="M12 1h10v10H12z" />
                    <path fill="#05a6f0" d="M1 12h10v10H1z" />
                    <path fill="#ffba08" d="M12 12h10v10H12z" />
                  </svg>
                  <span>Microsoft</span>
                </button>
              </div>
            </form>
          ) : (
            /* QR Code Tab */
            <div className="space-y-4 py-4 text-center">
              <div className="mx-auto w-40 h-40 border-2 border-dashed border-[#D0D0D0] rounded-xl flex flex-col items-center justify-center p-4 bg-[#FAFAFA]">
                <QrCode className="w-12 h-12 text-[#111111] mb-2" />
                <span className="text-[11px] text-[#555555]">
                  Point camera at student QR code badge
                </span>
              </div>
              <Link href="/scan">
                <Button className="w-full h-10 bg-[#111111] text-white text-xs">
                  Launch QR Camera Scanner
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Footer Link matching Panel 2 */}
        <div className="text-center pt-4 border-t border-[#E5E5E5]">
          <Link
            href="/signup"
            className="text-xs text-[#555555] hover:text-[#111111] inline-flex items-center gap-1 group"
          >
            <span>New here? Scan QR code for student registration</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Right Column: Campus photography — flowering building */}
      <div className="hidden lg:block lg:flex-1 relative overflow-hidden border-l border-[#E5E5E5]">
        <Image
          src="/images/login-campus.png"
          alt="AI & Machine Learning Department — Campus"
          fill
          priority
          className="object-cover object-top"
        />
        {/* Strong bottom gradient so text is always readable */}
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
        {/* Subtle left edge darkening */}
        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/10 to-transparent" />

        {/* Brand text — bottom of panel */}
        <div className="absolute bottom-0 inset-x-0 p-10 space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
            AI &amp; ML Education, Talent, Research &amp; Analytics
          </p>
          <p className="text-2xl font-semibold leading-tight text-white tracking-tight">
            The intelligence layer for the AI &amp; ML department.
          </p>
          <p className="text-xs text-white/50 pt-1">
            Department of Artificial Intelligence &amp; Machine Learning
          </p>
        </div>
      </div>
    </div>
  )
}
