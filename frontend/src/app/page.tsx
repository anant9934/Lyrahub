import Link from "next/link"
import Image from "next/image"
import { PublicNav } from "@/components/layout/PublicNav"
import { PublicFooter } from "@/components/layout/PublicFooter"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Briefcase,
  Users,
  Trophy,
  Calendar,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-[#111111] flex flex-col">
      {/* 1. Public Top Navigation */}
      <PublicNav />

      <main className="flex-1">
        {/* 2. Hero Section (Matching Panel 1) */}
        <section className="mx-auto max-w-7xl px-6 pt-12 pb-16 lg:px-8 lg:pt-16 lg:pb-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Hero Text Column */}
            <div className="lg:col-span-7 space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#111111] leading-[1.12]">
                Mapping the
                <br />
                brightest minds
                <br />
                in Machine Learning.
              </h1>

              <p className="text-base sm:text-lg text-[#555555] max-w-xl font-normal leading-relaxed">
                A unified platform for students, faculty, alumni, recruiters
                and the AI & ML department ecosystem.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href="/programs">
                  <Button className="h-11 px-7 rounded-lg bg-[#111111] text-white hover:bg-neutral-800 font-medium">
                    Explore
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="h-11 px-7 rounded-lg border-[#E5E5E5] text-[#111111] hover:bg-[#FAFAFA] font-medium"
                  >
                    Login
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Hero Image Card with Architectural Photo */}
            <div className="lg:col-span-5 relative">
              <div className="relative overflow-hidden rounded-2xl border border-[#E5E5E5] bg-[#FAFAFA] shadow-subtle group">
                <div className="relative h-[360px] sm:h-[420px] w-full">
                  <Image
                    src="/images/hero-campus.jpg"
                    alt="AI & Machine Learning Academic Institute Architecture"
                    fill
                    priority
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Subtle clean badge overlay matching Panel 1 */}
                  <div className="absolute top-5 right-5 rounded-lg bg-white/95 px-4 py-3 border border-[#E5E5E5] backdrop-blur text-right">
                    <div className="text-xs font-semibold text-[#111111]">
                      AI & ML Department
                    </div>
                    <div className="text-[11px] text-[#555555]">
                      Innovation Today
                    </div>
                    <div className="text-[11px] text-[#2563EB] font-medium">
                      Impact Tomorrow
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Department Metrics Strip (Matching Panel 1) */}
          <div className="mt-16 border-t border-b border-[#E5E5E5] py-8">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5 text-center sm:text-left">
              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111]">
                  1,240
                </div>
                <div className="text-xs text-[#777777]">Students</div>
              </div>

              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111]">
                  52
                </div>
                <div className="text-xs text-[#777777]">Faculty</div>
              </div>

              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111]">
                  320+
                </div>
                <div className="text-xs text-[#777777]">Projects</div>
              </div>

              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111]">
                  150+
                </div>
                <div className="text-xs text-[#777777]">Placements</div>
              </div>

              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111]">
                  25+
                </div>
                <div className="text-xs text-[#777777]">Global Partners</div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Academic Degree Programs Preview */}
        <section className="bg-[#FAFAFA] py-16 border-b border-[#E5E5E5]">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
                  Academics
                </span>
                <h2 className="mt-1 text-2xl sm:text-3xl font-semibold text-[#111111]">
                  Degree Programs & Specializations
                </h2>
                <p className="mt-2 text-sm text-[#555555] max-w-2xl">
                  Accredited undergraduate, graduate, and minor programs
                  grounded in theoretical rigor and real-world applied intelligence.
                </p>
              </div>
              <Link href="/programs">
                <Button variant="secondary" size="sm" className="gap-1.5">
                  View All Programs <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Program 1 */}
              <div className="rounded-lg border border-[#E5E5E5] bg-white p-6 flex flex-col justify-between hover:border-[#111111] transition-colors">
                <div className="space-y-3">
                  <div className="w-9 h-9 rounded-md bg-[#F5F5F5] flex items-center justify-center text-[#111111]">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-[#111111]">
                    B.Tech CSE (AI & Machine Learning)
                  </h3>
                  <p className="text-xs text-[#555555] leading-relaxed">
                    4-year comprehensive undergraduate program covering linear
                    algebra, probabilistic graphical models, deep learning, computer vision, and LLM engineering.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#E5E5E5] flex items-center justify-between text-xs text-[#777777]">
                  <span>160 Credits • 8 Semesters</span>
                  <Link href="/programs" className="font-medium text-[#111111] hover:underline">
                    Curriculum →
                  </Link>
                </div>
              </div>

              {/* Program 2 */}
              <div className="rounded-lg border border-[#E5E5E5] bg-white p-6 flex flex-col justify-between hover:border-[#111111] transition-colors">
                <div className="space-y-3">
                  <div className="w-9 h-9 rounded-md bg-[#F5F5F5] flex items-center justify-center text-[#111111]">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-[#111111]">
                    M.Tech AI & Data Science
                  </h3>
                  <p className="text-xs text-[#555555] leading-relaxed">
                    2-year postgraduate program focused on foundational research,
                    distributed computing, optimization, Bayesian inference, and thesis work.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#E5E5E5] flex items-center justify-between text-xs text-[#777777]">
                  <span>80 Credits • 4 Semesters</span>
                  <Link href="/programs" className="font-medium text-[#111111] hover:underline">
                    Curriculum →
                  </Link>
                </div>
              </div>

              {/* Program 3 */}
              <div className="rounded-lg border border-[#E5E5E5] bg-white p-6 flex flex-col justify-between hover:border-[#111111] transition-colors">
                <div className="space-y-3">
                  <div className="w-9 h-9 rounded-md bg-[#F5F5F5] flex items-center justify-center text-[#111111]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-[#111111]">
                    Minor in Machine Learning
                  </h3>
                  <p className="text-xs text-[#555555] leading-relaxed">
                    Multi-disciplinary 20-credit minor track allowing engineering
                    students across other branches to specialize in modern AI.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#E5E5E5] flex items-center justify-between text-xs text-[#777777]">
                  <span>20 Credits • Open Electives</span>
                  <Link href="/programs" className="font-medium text-[#111111] hover:underline">
                    Curriculum →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Department Highlights & Operational Pillars */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-semibold text-[#111111]">
                An Integrated Academic Intelligence OS
              </h2>
              <p className="text-sm text-[#555555]">
                Bridging curriculum, industry recruitment, faculty mentorship,
                and verifiable student credentials in one connected hub.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-lg border border-[#E5E5E5] bg-white space-y-3">
                <div className="w-8 h-8 rounded bg-[#F5F5F5] flex items-center justify-center text-[#111111]">
                  <Trophy className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-semibold text-[#111111]">
                  AHP + TOPSIS Rankings
                </h4>
                <p className="text-xs text-[#555555] leading-relaxed">
                  Objective multi-criteria evaluation indexing CGPA, hackathons,
                  peer-reviewed papers, and verified skills.
                </p>
              </div>

              <div className="p-5 rounded-lg border border-[#E5E5E5] bg-white space-y-3">
                <div className="w-8 h-8 rounded bg-[#F5F5F5] flex items-center justify-center text-[#111111]">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-semibold text-[#111111]">
                  Internship Marketplace
                </h4>
                <p className="text-xs text-[#555555] leading-relaxed">
                  Direct employer and alumni recruiting pipeline with verified student
                  skills and one-click application tracking.
                </p>
              </div>

              <div className="p-5 rounded-lg border border-[#E5E5E5] bg-white space-y-3">
                <div className="w-8 h-8 rounded bg-[#F5F5F5] flex items-center justify-center text-[#111111]">
                  <Calendar className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-semibold text-[#111111]">
                  QR Attendance & Events
                </h4>
                <p className="text-xs text-[#555555] leading-relaxed">
                  Live encrypted QR codes for contactless event registration,
                  lab attendance, and digital credential verification.
                </p>
              </div>

              <div className="p-5 rounded-lg border border-[#E5E5E5] bg-white space-y-3">
                <div className="w-8 h-8 rounded bg-[#F5F5F5] flex items-center justify-center text-[#111111]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-semibold text-[#111111]">
                  Faculty→HOD Approvals
                </h4>
                <p className="text-xs text-[#555555] leading-relaxed">
                  Formal multi-role governance with audit logging and change
                  request diff inspections before data publication.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Call to Action Section */}
        <section className="bg-[#111111] text-white py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center space-y-6">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              Ready to explore the AI & ML ecosystem?
            </h2>
            <p className="text-sm text-[#A3A3A3] max-w-xl mx-auto">
              Log in with your university credentials to view verified rankings,
              apply for capstones, and access department intelligence.
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/login">
                <Button className="h-10 px-6 rounded-lg bg-white text-[#111111] hover:bg-neutral-200 font-medium">
                  Sign In to Lyrahub
                </Button>
              </Link>
              <Link href="/leadership">
                <Button
                  variant="outline"
                  className="h-10 px-6 rounded-lg border-neutral-700 text-white bg-transparent hover:bg-neutral-900"
                >
                  Meet Leadership
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 7. Institutional Footer */}
      <PublicFooter />
    </div>
  )
}
