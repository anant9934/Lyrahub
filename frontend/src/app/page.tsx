import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"
import {
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  ChartNoAxesCombined,
  GraduationCap,
  Handshake,
  Lightbulb,
  Rocket,
  Search,
  Sparkles,
  Trophy,
  Users,
  Compass,
  FolderGit2,
  Calendar,
  CheckCircle2,
  Bot,
} from "lucide-react"
import { PublicNav } from "@/components/layout/PublicNav"
import { PublicFooter } from "@/components/layout/PublicFooter"
import { InteractiveAidaMascot } from "@/components/features/ai/InteractiveAidaMascot"

const STATS = [
  { label: "Student Builders", value: "1,240+", icon: Users, color: "#1478ef", bg: "#EDF5FF" },
  { label: "Dedicated Mentors", value: "52+", icon: GraduationCap, color: "#7C3AED", bg: "#F3EEFF" },
  { label: "Live AI Projects", value: "320+", icon: Lightbulb, color: "#D97706", bg: "#FFF8E8" },
  { label: "Verified Career Placement", value: "78%", icon: Trophy, color: "#16A34A", bg: "#EAF9F0" },
]

const PROGRAMS = [
  {
    title: "AI & Machine Learning",
    description: "Learn how modern AI thinks. Train neural networks, build intelligent agents, and turn code into applications people love.",
    icon: BrainCircuit,
    tag: "Flagship Program",
    color: "#1478ef",
    bg: "#EDF5FF",
  },
  {
    title: "Data Science & Analytics",
    description: "Turn messy numbers into clear answers. Master big data pipelines, visual insights, and predictive machine learning models.",
    icon: ChartNoAxesCombined,
    tag: "Applied Track",
    color: "#0D9488",
    bg: "#E6FAFA",
  },
  {
    title: "Research & Innovation",
    description: "Don't just study AI — invent it. Work inside faculty research labs, publish in top IEEE/ACM journals, and patent novel ideas.",
    icon: Lightbulb,
    tag: "Lab Track",
    color: "#D97706",
    bg: "#FFF8E8",
  },
  {
    title: "Industry & Careers",
    description: "Bridge college and your dream job. Connect directly with hiring managers, land paid internships, and launch your career.",
    icon: Handshake,
    tag: "Career Track",
    color: "#7C3AED",
    bg: "#F3EEFF",
  },
]

const STEPS = [
  {
    number: "01",
    title: "Claim your profile",
    detail: "Bring your code, course achievements, and verified skills into one clean portfolio. Say goodbye to messy paper resumes.",
    icon: GraduationCap,
  },
  {
    number: "02",
    title: "Find your tribe & mentor",
    detail: "Discover active research labs, match with professors who care about your focus, and team up with passionate classmates.",
    icon: Search,
  },
  {
    number: "03",
    title: "Build projects that matter",
    detail: "Work on real capstones and hackathons. Get continuous feedback from professors and test your code against industry standards.",
    icon: Rocket,
  },
  {
    number: "04",
    title: "Get noticed & hired",
    detail: "Earn official department verification, see your ranking rise, and let top companies and research institutes reach out to you.",
    icon: Trophy,
  },
]

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#1478ef] dark:text-[#79b6ff]">
      <Sparkles className="h-3.5 w-3.5 text-[#ffcf36]" />
      {children}
    </p>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F6F8FC] text-[#091936] dark:bg-[#0F172A] dark:text-white">
      <PublicNav />

      <main id="main-content" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-14">
        {/* ── 01. HERO SECTION (Full-Width Card Matching Panel 01) ────────── */}
        <section className="relative overflow-hidden rounded-[36px] border border-[#DCE5F1] bg-gradient-to-br from-[#EBF5FF] via-[#F7FAFD] to-[#E8F3FD] p-8 shadow-[0_16px_50px_rgba(9,25,54,0.06)] sm:p-12 lg:p-16 dark:border-[#1E3456] dark:bg-[#112239]">
          {/* Subtle Ambient Glows */}
          <div className="pointer-events-none absolute -right-20 -top-24 h-96 w-96 rounded-full bg-[#1478ef]/15 blur-[80px]" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-[#ffcf36]/15 blur-[90px]" />
          <span aria-hidden className="pointer-events-none absolute right-1/2 top-10 text-3xl text-[#ffcf36]/40 select-none">✦</span>
          <span aria-hidden className="pointer-events-none absolute right-16 top-16 text-4xl text-[#1478ef]/25 select-none">✦</span>

          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Left Content */}
            <div className="space-y-6">
              {/* Category Pill */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#C4DCF7] bg-white/90 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-[#1478ef] shadow-sm backdrop-blur-sm dark:border-[#2A4468] dark:bg-[#162D4A] dark:text-[#88BEF8]">
                <Sparkles className="h-3.5 w-3.5 text-[#ffcf36]" />
                Your AI & ML Learning Hub
              </div>

              {/* Main Headline (Panel 01 Typography) */}
              <div className="space-y-1">
                <h1 className="text-[clamp(2.75rem,5.6vw,5rem)] font-black uppercase leading-[0.93] tracking-[-0.055em] text-[#071b3d] dark:text-white">
                  LEARN AI.<br />
                  <span className="text-[#1478ef]">BUiLD REAL.</span><br />
                  GET NOTiCED.
                </h1>

                {/* Highlight Badge */}
                <div className="pt-2">
                  <div className="inline-block rounded-2xl bg-[#FFCF36] px-4 py-1.5 shadow-[0_4px_16px_rgba(255,207,54,0.35)]">
                    <span className="text-sm font-black italic tracking-tight text-[#071b3d] sm:text-base">
                      Where curiosity becomes real-world impact.
                    </span>
                  </div>
                </div>
              </div>

              {/* Subtitle Paragraph */}
              <p className="max-w-xl text-sm leading-relaxed text-[#526783] sm:text-base dark:text-[#C4D8F1]">
                No more scattered notices, lost emails, or confusing requirements. AIMETRA brings your courses, faculty mentors, research labs, and dream career opportunities together in one clear, intelligent place.
              </p>

              {/* Motto Ribbon */}
              <p className="font-serif text-xs font-bold italic tracking-wide text-[#071b3d]/70 dark:text-[#88BEF8]">
                Explore Courses · Find Mentors · Build Capstones · Land Internships
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/signup"
                  className="inline-flex h-12 items-center gap-2.5 rounded-full bg-[#071b3d] px-6 text-sm font-black text-white shadow-[0_8px_20px_rgba(7,27,61,0.20)] transition hover:-translate-y-0.5 hover:bg-[#1478ef]"
                >
                  <span>Start Your Journey</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/aida"
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-[#C4DCF7] bg-white px-5 text-sm font-bold text-[#1478ef] shadow-sm transition hover:bg-[#EDF5FF] hover:border-[#1478ef] dark:bg-[#162D4A] dark:border-[#2A4468] dark:text-[#88BEF8]"
                >
                  <Bot className="h-4 w-4" />
                  <span>Ask AIDA Anything ✦</span>
                </Link>
              </div>
            </div>

            {/* Right Visual (Interactive Mascot with Live Glowing Energy Ball) */}
            <div className="relative flex items-center justify-center">
              <InteractiveAidaMascot
                priority
                className="w-full max-w-[360px] sm:max-w-[420px] mx-auto"
              />
            </div>
          </div>
        </section>

        {/* ── 02. STAT METRICS STRIP (Directly Below Hero) ────────────────── */}
        <section aria-label="Department Statistics" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map(({ label, value, icon: Icon, color, bg }) => (
            <div
              key={label}
              className="flex items-center gap-4 rounded-3xl border border-[#DCE5F1] bg-white p-5 shadow-[0_4px_16px_rgba(9,25,54,0.04)] transition hover:-translate-y-0.5 hover:shadow-md dark:border-[#1E3456] dark:bg-[#112239]"
            >
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                style={{ background: bg, color }}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-black tracking-tight text-[#071b3d] dark:text-white">
                  {value}
                </div>
                <div className="text-xs font-semibold text-[#526783] dark:text-[#94A3B8]">
                  {label}
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* ── 03. ACADEMIC PROGRAM PILLARS ─────────────────────────────────── */}
        <section className="space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Eyebrow>Choose Your Direction</Eyebrow>
              <h2 className="mt-1 text-3xl font-black tracking-tight text-[#071b3d] sm:text-4xl dark:text-white">
                Four paths to take you from <span className="text-[#1478ef]">curious student to industry leader.</span>
              </h2>
            </div>
            <Link
              href="/programs"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1478ef] hover:underline"
            >
              <span>Explore all degree programs</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PROGRAMS.map((p) => {
              const Icon = p.icon
              return (
                <Link
                  key={p.title}
                  href="/programs"
                  className="group flex flex-col justify-between rounded-3xl border border-[#DCE5F1] bg-white p-6 shadow-[0_4px_16px_rgba(9,25,54,0.04)] transition-all duration-200 hover:-translate-y-1 hover:border-[#A8C8FF] hover:shadow-[0_12px_28px_rgba(9,25,54,0.09)] dark:border-[#1E3456] dark:bg-[#112239]"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-2xl transition group-hover:scale-105"
                        style={{ background: p.bg, color: p.color }}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="rounded-full bg-[#F0F4FA] px-2.5 py-0.5 text-[10px] font-bold text-[#526783] dark:bg-[#1E3456] dark:text-[#94A3B8]">
                        {p.tag}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-[#071b3d] group-hover:text-[#1478ef] transition-colors dark:text-white">
                      {p.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-[#526783] dark:text-[#94A3B8]">
                      {p.description}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center gap-1 text-xs font-bold text-[#1478ef]">
                    <span>Learn what you&apos;ll build</span>
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* ── 04. HOW IT WORKS: THE 4-STEP JOURNEY ─────────────────────────── */}
        <section className="rounded-[36px] border border-[#DCE5F1] bg-white p-8 sm:p-12 shadow-[0_4px_20px_rgba(9,25,54,0.04)] dark:border-[#1E3456] dark:bg-[#112239]">
          <div className="max-w-2xl space-y-2">
            <Eyebrow>Your Roadmap</Eyebrow>
            <h2 className="text-3xl font-black tracking-tight text-[#071b3d] sm:text-4xl dark:text-white">
              How you grow from <span className="text-[#1478ef]">day one</span> to career ready.
            </h2>
            <p className="text-xs text-[#526783] sm:text-sm dark:text-[#94A3B8]">
              A stress-free, step-by-step path designed to turn your curiosity into verified skills and dream offers.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => {
              const Icon = s.icon
              return (
                <div
                  key={s.number}
                  className="flex flex-col justify-between rounded-2xl bg-[#F8FBFE] p-5 border border-[#E8F0FA] transition hover:border-[#1478ef]/30 dark:bg-[#162D4A] dark:border-[#1E3456]"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#1478ef] shadow-sm dark:bg-[#112239]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-mono text-sm font-black text-[#9AB5D0]">
                        {s.number}
                      </span>
                    </div>

                    <h3 className="mt-4 text-sm font-black text-[#071b3d] dark:text-white">
                      {s.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-[#526783] dark:text-[#94A3B8]">
                      {s.detail}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-[#1478ef] px-6 py-3 text-xs font-bold text-white shadow-md transition hover:bg-[#0f64cc] hover:scale-105"
            >
              <span>Create your free student profile</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* ── 05. MEET AIDA SPOTLIGHT BANNER ───────────────────────────────── */}
        <section className="relative overflow-hidden rounded-[36px] bg-[#071b3d] p-8 sm:p-12 text-white shadow-[0_16px_40px_rgba(7,27,61,0.25)]">
          {/* Ambient Glows */}
          <div className="pointer-events-none absolute -right-16 -top-20 h-80 w-80 rounded-full bg-[#1478ef]/35 blur-[80px]" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[#ffcf36]/20 blur-[80px]" />
          <span aria-hidden className="pointer-events-none absolute left-8 top-6 text-3xl text-[#ffcf36]/30">✦</span>
          <span aria-hidden className="pointer-events-none absolute right-1/3 top-10 text-2xl text-[#60a5fa]/40">✦</span>

          <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-[#8ec9ff] backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-[#ffcf36]" />
                Your 24/7 Campus AI Guide
              </span>

              <h2 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl">
                Meet AIDA. <br />
                <span className="text-[#ffcf36]">Instant answers, anytime you need them.</span>
              </h2>

              <p className="max-w-lg text-xs leading-relaxed text-[#C4D8F1] sm:text-sm">
                Stuck on a question at midnight? Wondering which elective matches your dream job, or how to join a research lab? AIDA has read every course syllabus, exam guide, faculty directory, and placement record to give you friendly, accurate answers in seconds.
              </p>

              {/* Quick Prompt Chips */}
              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  "Which electives help me get into AI? ↗",
                  "How do I join an AI research lab? ↗",
                  "When are faculty office hours? ↗",
                  "What hackathons can I join this month? ↗",
                ].map((chip) => (
                  <Link
                    key={chip}
                    href="/aida"
                    className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white transition hover:border-[#ffcf36] hover:bg-[#ffcf36] hover:text-[#071b3d]"
                  >
                    {chip}
                  </Link>
                ))}
              </div>

              <div className="pt-2">
                <Link
                  href="/aida"
                  className="inline-flex items-center gap-2.5 rounded-full bg-[#ffcf36] px-6 py-3 text-xs font-black text-[#071b3d] shadow-lg transition hover:bg-[#ffe06e] hover:scale-105"
                >
                  <Bot className="h-4 w-4" />
                  <span>Ask AIDA a Question</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Mascot with Live Energy Ball */}
            <div className="relative flex items-center justify-center">
              <InteractiveAidaMascot
                showBadge={false}
                className="w-full max-w-[260px] sm:max-w-[300px] mx-auto"
              />
            </div>
          </div>
        </section>

        {/* ── 06. QUICK NAVIGATION CARDS ───────────────────────────────────── */}
        <section className="grid gap-5 md:grid-cols-3">
          <Link
            href="/people"
            className="group rounded-3xl border border-[#DCE5F1] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#1478ef] hover:shadow-md dark:border-[#1E3456] dark:bg-[#112239]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EDF5FF] text-[#1478ef]">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-black text-[#071b3d] group-hover:text-[#1478ef] transition-colors dark:text-white">
              Faculty &amp; Mentors
            </h3>
            <p className="mt-1 text-xs text-[#526783] dark:text-[#94A3B8]">
              Connect with professors, research advisors, and alumni leaders who are passionate about guiding your growth.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#1478ef]">
              Meet your mentors <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          <Link
            href="/projects"
            className="group rounded-3xl border border-[#DCE5F1] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#1478ef] hover:shadow-md dark:border-[#1E3456] dark:bg-[#112239]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF8E8] text-[#D97706]">
              <FolderGit2 className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-black text-[#071b3d] group-hover:text-[#D97706] transition-colors dark:text-white">
              Student Project Showcase
            </h3>
            <p className="mt-1 text-xs text-[#526783] dark:text-[#94A3B8]">
              Explore real code, autonomous robotics, vision models, and LLMs engineered by students right here.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#D97706]">
              Browse student builds <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          <Link
            href="/opportunities"
            className="group rounded-3xl border border-[#DCE5F1] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#1478ef] hover:shadow-md dark:border-[#1E3456] dark:bg-[#112239]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F3EEFF] text-[#7C3AED]">
              <Compass className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-black text-[#071b3d] group-hover:text-[#7C3AED] transition-colors dark:text-white">
              Internships &amp; Careers
            </h3>
            <p className="mt-1 text-xs text-[#526783] dark:text-[#94A3B8]">
              Apply for verified department fellowships, sponsored industry internships, and competitive hackathons.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#7C3AED]">
              Explore opportunities <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </section>

        {/* ── 07. FINAL CALL TO ACTION ─────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-[#EBF5FF] via-[#F4F9FF] to-[#DCEBFC] p-8 sm:p-12 text-center border border-[#DCE5F1] shadow-sm dark:bg-[#112239] dark:border-[#1E3456]">
          <div className="mx-auto max-w-2xl space-y-3">
            <Eyebrow>Take The First Step</Eyebrow>
            <h2 className="text-3xl font-black tracking-tight text-[#071b3d] sm:text-4xl dark:text-white">
              Your future in AI starts <span className="text-[#1478ef]">right now.</span>
            </h2>
            <p className="text-xs text-[#526783] sm:text-sm dark:text-[#94A3B8]">
              Join over 1,200 students building, researching, and launching careers in the Department of AI &amp; Machine Learning.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-[#071b3d] px-6 py-3 text-xs font-black text-white shadow-md transition hover:bg-[#1478ef]"
              >
                <span>Get Started for Free</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full border border-[#DCE5F1] bg-white px-6 py-3 text-xs font-bold text-[#071b3d] transition hover:bg-[#F0F4FA]"
              >
                <span>Sign In to Your Account</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
