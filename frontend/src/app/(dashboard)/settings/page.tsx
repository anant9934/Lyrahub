"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  User,
  Shield,
  Bell,
  Key,
  Sliders,
  Camera,
  Check,
  Mail,
  Smartphone,
  Save,
  Lock,
  Moon,
  Sun,
  Eye,
  Settings2,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { WorkspaceHero } from "@/components/layout/WorkspaceHero"

export default function SettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<"account" | "security" | "notifications" | "api" | "preferences">("account")
  const [savedSuccess, setSavedSuccess] = useState(false)

  // Account form fields
  const [fullName, setFullName] = useState("Rahul Sharma")
  const [email, setEmail] = useState(user?.email || "rahul@aiml.hub")
  const [phone, setPhone] = useState("+91 98765 43210")
  const [regNo, setRegNo] = useState("22AIML042")

  // Preferences
  const [reducedMotion, setReducedMotion] = useState(false)
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [eventAlerts, setEventAlerts] = useState(true)

  useEffect(() => {
    setReducedMotion(localStorage.getItem("aimetra-reduced-motion") === "true")
  }, [])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2500)
  }

  const toggleMotion = () => {
    const next = !reducedMotion
    setReducedMotion(next)
    localStorage.setItem("aimetra-reduced-motion", String(next))
    document.documentElement.classList.toggle("motion-reduced", next)
  }

  const navTabs = [
    { id: "account", label: "Account", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "api", label: "API Keys", icon: Key },
    { id: "preferences", label: "Preferences", icon: Sliders },
  ] as const

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      <WorkspaceHero
        eyebrow="AIMETRA Preferences · Panel 24"
        title={<>Account <span className="text-[#1478ef]">Settings.</span></>}
        description="Manage your identity credentials, department visibility, security keys, and UI options."
        tone="blue"
        icon={Settings2}
      />

      {/* ── Main Settings Panel (Matching Panel 24) ───────────────────────── */}
      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        {/* Left Sidebar Tabs */}
        <aside className="space-y-1 rounded-[24px] border border-[#D4E0F0] bg-white p-3 shadow-sm">
          {navTabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold transition-all ${
                activeTab === id
                  ? "bg-[#071b3d] text-white shadow-sm"
                  : "text-[#526783] hover:bg-[#F0F4FA] hover:text-[#091936]"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </aside>

        {/* Right Settings Content */}
        <div className="rounded-[24px] border border-[#D4E0F0] bg-white p-6 shadow-[0_4px_20px_rgba(9,25,54,0.06)] sm:p-8">
          {/* Tab 1: Account Information */}
          {activeTab === "account" && (
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <h2 className="text-lg font-black tracking-tight text-[#091936]">
                  Account Settings
                </h2>
                <p className="text-xs text-[#526783]">
                  Update your profile information and student registration details.
                </p>
              </div>

              {/* Avatar Row */}
              <div className="flex items-center gap-5 border-y border-[#F0F4FA] py-5">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-[#1478ef] to-[#071b3d] text-2xl font-black text-white shadow-md">
                  RS
                  <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#1478ef] shadow-sm">
                    <Camera className="h-3.5 w-3.5" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#091936]">Profile Avatar</h4>
                  <p className="text-[11px] text-[#9ab5d0]">PNG or JPG up to 2MB</p>
                  <button
                    type="button"
                    onClick={() => alert("Avatar upload dialog")}
                    className="mt-2 rounded-full border border-[#D4E0F0] bg-white px-3.5 py-1 text-xs font-bold text-[#091936] transition hover:border-[#1478ef] hover:text-[#1478ef]"
                  >
                    Change Picture
                  </button>
                </div>
              </div>

              {/* Form Inputs Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#526783]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1 h-10 w-full rounded-xl border border-[#D4E0F0] bg-[#FAFBFD] px-3.5 text-xs text-[#091936] outline-none focus:border-[#1478ef] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#526783]">
                    Registration No
                  </label>
                  <input
                    type="text"
                    value={regNo}
                    disabled
                    className="mt-1 h-10 w-full rounded-xl border border-[#D4E0F0] bg-[#F0F4FA] px-3.5 text-xs text-[#526783] cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#526783]">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 h-10 w-full rounded-xl border border-[#D4E0F0] bg-[#FAFBFD] px-3.5 text-xs text-[#091936] outline-none focus:border-[#1478ef] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#526783]">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 h-10 w-full rounded-xl border border-[#D4E0F0] bg-[#FAFBFD] px-3.5 text-xs text-[#091936] outline-none focus:border-[#1478ef] focus:bg-white"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-[#F0F4FA]">
                {savedSuccess ? (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                    <Check className="h-4 w-4" /> Changes saved successfully!
                  </span>
                ) : (
                  <span className="text-[11px] text-[#9ab5d0]">
                    Last updated 2 days ago
                  </span>
                )}

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-[#1478ef] px-6 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#0f64cc] hover:scale-105"
                >
                  <Save className="h-3.5 w-3.5" />
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {/* Tab 2: Security */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-black tracking-tight text-[#091936]">
                  Security Credentials
                </h2>
                <p className="text-xs text-[#526783]">
                  Change your password and manage two-factor authentication.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#526783]">
                    Current Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    className="mt-1 h-10 w-full rounded-xl border border-[#D4E0F0] px-3.5 text-xs outline-none focus:border-[#1478ef]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#526783]">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Min 8 characters, letters & symbols"
                    className="mt-1 h-10 w-full rounded-xl border border-[#D4E0F0] px-3.5 text-xs outline-none focus:border-[#1478ef]"
                  />
                </div>

                <button
                  onClick={() => alert("Password updated")}
                  className="rounded-full bg-[#071b3d] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#1478ef]"
                >
                  Update Password
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Notifications */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-black tracking-tight text-[#091936]">
                  Notification Preferences
                </h2>
                <p className="text-xs text-[#526783]">
                  Configure announcements, test results, and placement notifications.
                </p>
              </div>

              <div className="space-y-4">
                <label className="flex items-center justify-between rounded-2xl border border-[#F0F4FA] p-4 transition hover:bg-[#FAFBFD]">
                  <div>
                    <span className="text-xs font-bold text-[#091936]">Email Summaries</span>
                    <p className="text-[11px] text-[#526783]">Receive weekly digest of research calls and department tests.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailNotifs}
                    onChange={(e) => setEmailNotifs(e.target.checked)}
                    className="h-4 w-4 rounded accent-[#1478ef]"
                  />
                </label>

                <label className="flex items-center justify-between rounded-2xl border border-[#F0F4FA] p-4 transition hover:bg-[#FAFBFD]">
                  <div>
                    <span className="text-xs font-bold text-[#091936]">Event & Hackathon Alerts</span>
                    <p className="text-[11px] text-[#526783]">Immediate notice when new hackathons or guest lectures open.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={eventAlerts}
                    onChange={(e) => setEventAlerts(e.target.checked)}
                    className="h-4 w-4 rounded accent-[#1478ef]"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Tab 4: API Keys */}
          {activeTab === "api" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-black tracking-tight text-[#091936]">
                  API Access Keys
                </h2>
                <p className="text-xs text-[#526783]">
                  Personal access tokens for AIMETRA CLI and programmatic test submission.
                </p>
              </div>

              <div className="rounded-2xl border border-[#D4E0F0] bg-[#F8FBFE] p-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[#091936]">aimetra_live_sec_77a94f0...</span>
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Active</span>
                </div>
                <p className="mt-2 text-[11px] text-[#526783]">Scopes: `read:tests`, `write:projects`, `read:rankings`</p>
              </div>

              <button
                onClick={() => alert("New API Key generated: aimetra_live_sec_99b08d")}
                className="rounded-full bg-[#1478ef] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#0f64cc]"
              >
                Generate New Key
              </button>
            </div>
          )}

          {/* Tab 5: Preferences */}
          {activeTab === "preferences" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-black tracking-tight text-[#091936]">
                  UI & Accessibility Preferences
                </h2>
                <p className="text-xs text-[#526783]">
                  Customize motion, contrast, and layout behaviour.
                </p>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-[#F8FBFE] p-4">
                <div>
                  <span className="text-xs font-bold text-[#091936]">Reduce Decorative Motion</span>
                  <p className="text-[11px] text-[#526783]">Minimizes animated banners and particle floats.</p>
                </div>
                <button
                  type="button"
                  onClick={toggleMotion}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    reducedMotion ? "bg-[#1478ef]" : "bg-[#CBD5E1]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      reducedMotion ? "left-5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
