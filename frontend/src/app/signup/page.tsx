"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Sparkles, ArrowRight, CheckCircle2, ChevronRight, User, Mail, Hash, BookOpen, Layers } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import api from "@/lib/api"

export default function SignupPage() {
  const router = useRouter()
  const { login } = useAuth()

  const [step, setStep] = useState(1)
  const [regNo, setRegNo] = useState("")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [program, setProgram] = useState("B.Tech AI & ML")
  const [section, setSection] = useState("Section A")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const steps = [
    { num: 1, label: "Identity" },
    { num: 2, label: "Verification" },
    { num: 3, label: "Profile" },
    { num: 4, label: "Complete" },
  ]

  const handleNextOrSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (step === 1) {
      if (!regNo || !fullName || !email) {
        setError("Please fill in all identity fields")
        return
      }
      setStep(2)
      return
    }

    if (step === 2) {
      // Step 2: Set credentials & submit
      setIsLoading(true)
      try {
        await api.post("/auth/register", {
          email,
          password: password || "aimetra2026!",
          full_name: fullName,
          reg_no: regNo,
        })

        // Log in automatically
        const formData = new URLSearchParams()
        formData.append("username", email)
        formData.append("password", password || "aimetra2026!")

        const { data } = await api.post("/auth/login", formData, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        })

        await login(data)
        setStep(4)
        setTimeout(() => {
          router.push("/dashboard")
        }, 1200)
      } catch (err: any) {
        setError(err.response?.data?.detail?.title || "Registration failed. Try with another email or check connection.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="flex min-h-screen bg-[#F4F8FD]">
      {/* ── Left Form Column ────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col justify-between p-6 sm:p-10 lg:p-14">
        {/* Top Branding */}
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1478ef] text-[#ffcf36] shadow-[0_4px_12px_rgba(20,120,239,0.3)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-base font-black tracking-[-0.04em] text-[#071b3d]">
              AIMETRA
            </span>
          </Link>
        </div>

        {/* Center Card */}
        <div className="my-auto mx-auto w-full max-w-lg space-y-6 py-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#071b3d] sm:text-4xl">
              Join <span className="text-[#1478ef]">AIMETRA.</span>
            </h1>
            <p className="mt-1.5 text-xs text-[#526783] sm:text-sm">
              Your gateway to departmental research, rankings, and AI opportunities.
            </p>
          </div>

          {/* Stepper (Matching Panel 12) */}
          <div className="flex items-center justify-between rounded-2xl border border-[#D4E0F0] bg-white p-3 shadow-sm">
            {steps.map((s, idx) => {
              const isCurrent = step === s.num
              const isDone = step > s.num
              return (
                <div key={s.num} className="flex items-center gap-1.5 sm:gap-2">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-black transition-all ${
                      isDone
                        ? "bg-emerald-500 text-white"
                        : isCurrent
                        ? "bg-[#1478ef] text-white shadow-sm"
                        : "bg-[#F0F4FA] text-[#9ab5d0]"
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : s.num}
                  </div>
                  <span
                    className={`text-[11px] font-bold ${
                      isCurrent
                        ? "text-[#071b3d]"
                        : isDone
                        ? "text-emerald-600"
                        : "text-[#9ab5d0]"
                    }`}
                  >
                    {s.label}
                  </span>
                  {idx < steps.length - 1 && (
                    <ChevronRight className="h-3 w-3 text-[#CBD5E1]" />
                  )}
                </div>
              )
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleNextOrSubmit} className="space-y-4 rounded-3xl border border-[#D4E0F0] bg-white p-6 shadow-[0_8px_30px_rgba(9,25,54,0.06)] sm:p-8">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600">
                {error}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#526783]">
                    Registration Number
                  </label>
                  <div className="relative mt-1">
                    <Hash className="absolute left-3.5 top-3 h-4 w-4 text-[#9ab5d0]" />
                    <input
                      type="text"
                      placeholder="e.g. 22AIML042"
                      value={regNo}
                      onChange={(e) => setRegNo(e.target.value)}
                      required
                      className="h-10 w-full rounded-xl border border-[#D4E0F0] bg-[#FAFBFD] pl-10 pr-3 text-xs text-[#091936] outline-none focus:border-[#1478ef] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#526783]">
                    Full Name
                  </label>
                  <div className="relative mt-1">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-[#9ab5d0]" />
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="h-10 w-full rounded-xl border border-[#D4E0F0] bg-[#FAFBFD] pl-10 pr-3 text-xs text-[#091936] outline-none focus:border-[#1478ef] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#526783]">
                    University Email
                  </label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[#9ab5d0]" />
                    <input
                      type="email"
                      placeholder="rahul@university.edu.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-10 w-full rounded-xl border border-[#D4E0F0] bg-[#FAFBFD] pl-10 pr-3 text-xs text-[#091936] outline-none focus:border-[#1478ef] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#526783]">
                      Program
                    </label>
                    <select
                      value={program}
                      onChange={(e) => setProgram(e.target.value)}
                      className="mt-1 h-10 w-full rounded-xl border border-[#D4E0F0] bg-[#FAFBFD] px-3 text-xs text-[#091936] outline-none focus:border-[#1478ef]"
                    >
                      <option>B.Tech AI & ML</option>
                      <option>M.Tech Data Science</option>
                      <option>Ph.D Systems</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#526783]">
                      Section
                    </label>
                    <select
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      className="mt-1 h-10 w-full rounded-xl border border-[#D4E0F0] bg-[#FAFBFD] px-3 text-xs text-[#091936] outline-none focus:border-[#1478ef]"
                    >
                      <option>Section A</option>
                      <option>Section B</option>
                      <option>Section C</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#526783]">
                    Create Password
                  </label>
                  <input
                    type="password"
                    placeholder="Create a secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-1 h-10 w-full rounded-xl border border-[#D4E0F0] bg-[#FAFBFD] px-3 text-xs text-[#091936] outline-none focus:border-[#1478ef]"
                  />
                  <p className="mt-1 text-[11px] text-[#9ab5d0]">
                    At least 8 characters with letters and numbers.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#D4E0F0] bg-[#F8FBFE] p-4 text-xs text-[#526783]">
                  <p className="font-bold text-[#071b3d]">Confirm Details:</p>
                  <p className="mt-1">{fullName} ({regNo})</p>
                  <p>{email} · {program}</p>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="py-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="mt-3 text-base font-black text-[#071b3d]">
                  Welcome to AIMETRA!
                </h3>
                <p className="mt-1 text-xs text-[#526783]">
                  Redirecting you to your student dashboard…
                </p>
              </div>
            )}

            {step < 4 && (
              <button
                type="submit"
                disabled={isLoading}
                className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#EA6E22] font-black text-white shadow-md transition hover:bg-[#d45d15] hover:scale-[1.01] disabled:opacity-50"
              >
                <span>{isLoading ? "Setting up account…" : "Continue"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            <div className="pt-2 text-center text-xs text-[#526783]">
              Already registered?{" "}
              <Link href="/login" className="font-bold text-[#1478ef] hover:underline">
                Sign in here
              </Link>
            </div>
          </form>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-[#9ab5d0]">
          Department of AI & Machine Learning · Secure Verification Gateway
        </div>
      </div>

      {/* ── Right Showcase Column (Matching Panel 12) ────────────────────── */}
      <div className="relative hidden w-[45%] overflow-hidden bg-gradient-to-br from-[#124285] via-[#0b2b5c] to-[#071b3d] lg:flex lg:flex-col lg:justify-between lg:p-12 text-white">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-80 w-80 rounded-full bg-[#1478ef]/30 blur-[80px]" />
        <div className="pointer-events-none absolute bottom-10 left-10 h-72 w-72 rounded-full bg-[#ffcf36]/20 blur-[80px]" />
        <span aria-hidden className="pointer-events-none absolute right-12 top-10 text-4xl text-[#ffcf36]/30">✦</span>

        {/* Top Header Badge */}
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[11px] font-bold text-[#8ec9ff] backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-[#ffcf36]" />
            Multimodal AI for Real-world Applications
          </span>
          <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight sm:text-4xl text-white">
            Learn. Build. <br />
            <span className="text-[#ffcf36]">Research. Lead.</span>
          </h2>
        </div>

        {/* Mascot Centerpiece */}
        <div className="relative z-10 flex flex-1 items-center justify-center my-6">
          <div className="relative h-[320px] w-[300px]">
            <Image
              src="/images/aida-mascot.png"
              alt="AIDA Robot"
              fill
              priority
              sizes="320px"
              className="object-contain drop-shadow-[0_25px_30px_rgba(0,0,0,0.4)]"
            />
          </div>
        </div>

        {/* Bottom Floating Card / Sticker */}
        <div className="relative z-10 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ffcf36] text-xl font-black text-[#071b3d]">
              ★
            </span>
            <div>
              <div className="text-xs font-black text-white">
                Start Your Journey
              </div>
              <div className="text-[11px] text-[#c4d8f1]">
                Same Learning · Bigger Possibilities
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
