import React from "react"
import Link from "next/link"
import Image from "next/image"
import { PublicNav } from "@/components/layout/PublicNav"
import { PublicFooter } from "@/components/layout/PublicFooter"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  Cpu,
  GraduationCap,
  Layers,
  Award,
  ShieldCheck,
  Building2,
  Atom,
  ChevronRight,
  Database,
  Network,
} from "lucide-react"

export const metadata = {
  title: "About AIMETRA | Department of Artificial Intelligence & Machine Learning",
  description:
    "Learn about AIMETRA — the institutional intelligence layer connecting students, faculty, research, and industry in the Department of AI & ML.",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-[#111111] flex flex-col">
      <PublicNav />

      <main className="flex-1">
        {/* ══ HERO SECTION ══ */}
        <section className="border-b border-[#E5E5E5] bg-[#FAFAFA] py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#888888] mb-4">
                About the Department &amp; Platform
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#111111] leading-[1.1] mb-6">
                Pioneering intelligence.
                <br />
                Structuring knowledge.
              </h1>
              <p className="text-base sm:text-lg text-[#555555] leading-relaxed mb-8">
                AIMETRA is the purpose-built intelligence ecosystem for the Department of Artificial
                Intelligence &amp; Machine Learning. We bridge the critical gap between academic
                theory, doctoral research, hands-on student engineering, and industry deployment.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/programs">
                  <Button className="h-11 px-6 rounded-md bg-[#111111] text-white hover:bg-neutral-800 text-xs font-medium">
                    Explore Academic Programs
                  </Button>
                </Link>
                <Link href="/people">
                  <Button
                    variant="outline"
                    className="h-11 px-6 rounded-md border-[#D0D0D0] text-[#111111] hover:bg-neutral-100 text-xs font-medium"
                  >
                    Meet Faculty &amp; Leadership
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ══ INSTITUTIONAL KEY NUMBERS ══ */}
        <section className="border-b border-[#E5E5E5] bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-14">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "840+", label: "Enrolled Scholars", sub: "Undergraduate & Graduate" },
                { value: "32", label: "Full-Time Faculty", sub: "100% PhD / Research Active" },
                { value: "₹4.8 Cr", label: "Active Grants", sub: "DST, MeitY & Industry Co-funded" },
                { value: "140+", label: "Peer-Reviewed Papers", sub: "NeurIPS, CVPR, ICML & IEEE" },
              ].map((stat, i) => (
                <div key={i} className="space-y-1">
                  <div className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#111111]">
                    {stat.value}
                  </div>
                  <div className="text-xs font-semibold text-[#111111]">{stat.label}</div>
                  <div className="text-[11px] text-[#777777]">{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ OUR MISSION & CHARTER ══ */}
        <section className="border-b border-[#E5E5E5] bg-white py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
              <div className="lg:col-span-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#888888] mb-4">
                  Institutional Mission
                </p>
                <h2 className="text-3xl font-semibold text-[#111111] leading-tight mb-6">
                  Transforming higher education into a connected research engine.
                </h2>
                <p className="text-sm text-[#555555] leading-relaxed">
                  Academic departments often operate with isolated silos: classroom syllabi remain
                  disconnected from lab research, and student achievements sit unverified on resumes.
                  AIMETRA systematically unifies these threads into verifiable institutional proof.
                </p>
              </div>

              <div className="lg:col-span-7 space-y-8">
                <div className="border border-[#E5E5E5] rounded-xl p-8 bg-[#FAFAFA]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[#111111] text-white flex items-center justify-center">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-semibold text-[#111111]">1. Rigorous Curriculum Grounded in Math &amp; Code</h3>
                  </div>
                  <p className="text-xs text-[#555555] leading-relaxed">
                    From linear algebra and probabilistic inference to distributed transformer training,
                    our curriculum is continuously updated with input from leading AI labs and tier-1 tech enterprises.
                  </p>
                </div>

                <div className="border border-[#E5E5E5] rounded-xl p-8 bg-[#FAFAFA]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[#111111] text-white flex items-center justify-center">
                      <Atom className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-semibold text-[#111111]">2. Frontier Research &amp; Open Source Labs</h3>
                  </div>
                  <p className="text-xs text-[#555555] leading-relaxed">
                    Undergraduate and doctoral students co-author papers in foundational computer vision,
                    reinforcement learning for autonomous robotics, and multi-modal generative systems.
                  </p>
                </div>

                <div className="border border-[#E5E5E5] rounded-xl p-8 bg-[#FAFAFA]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[#111111] text-white flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-semibold text-[#111111]">3. Verifiable Skill Signals &amp; Career Velocity</h3>
                  </div>
                  <p className="text-xs text-[#555555] leading-relaxed">
                    Student projects, Git commits, competitive benchmarks, and attendance records form an
                    immutable proof-of-work that top engineering teams and research labs rely on.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ RESEARCH FACILITIES & INFRASTRUCTURE ══ */}
        <section className="border-b border-[#E5E5E5] bg-[#FAFAFA] py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="max-w-2xl mb-16">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#888888] mb-3">
                Infrastructure
              </p>
              <h2 className="text-3xl font-semibold text-[#111111] tracking-tight">
                State-of-the-Art Computing Facilities
              </h2>
              <p className="mt-3 text-sm text-[#555555]">
                Our dedicated compute nodes, physical robotics arenas, and high-throughput data servers
                give researchers the firepower needed to train and benchmark modern models.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Cpu,
                  title: "NVIDIA DGX Cluster & GPU Farm",
                  desc: "Dedicated enterprise GPU server rack with high-bandwidth NVLink interconnect for large-scale distributed neural network training.",
                  badge: "Academic Block 4 — Server Room B",
                },
                {
                  icon: Network,
                  title: "Autonomous Systems & Robotics Arena",
                  desc: "Optical motion-capture workspace equipped with quadruped robots, drone test cages, and ROS-integrated mobile manipulators.",
                  badge: "Innovation Annex — Ground Floor",
                },
                {
                  icon: Database,
                  title: "Edge AI & Embedded Intelligence Lab",
                  desc: "FPGA boards, NVIDIA Jetson Orin micro-clusters, and low-power microcontrollers for real-time neuromorphic and edge inference.",
                  badge: "Lab Complex — Suite 204",
                },
                {
                  icon: Building2,
                  title: "Center for Healthcare AI",
                  desc: "HIPAA-compliant secure compute partition for processing biomedical MRI, CT, and histopathology diagnostic image pipelines.",
                  badge: "Collaborative Health Block",
                },
                {
                  icon: Layers,
                  title: "Speech & Audio Signal Processing Hub",
                  desc: "Anechoic recording chamber with multi-channel microphone arrays for regional language speech synthesis and acoustic modeling.",
                  badge: "Acoustics Center — Lab 102",
                },
                {
                  icon: Award,
                  title: "Incubation & Industry Co-Innovation Pod",
                  desc: "Joint engineering sandbox where student spin-outs build commercial AI applications under enterprise mentorship.",
                  badge: "AIMETRA Incubation Suite",
                },
              ].map((lab, i) => (
                <div
                  key={i}
                  className="bg-white border border-[#E5E5E5] rounded-xl p-6 flex flex-col justify-between hover:border-[#111111] transition-colors"
                >
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-[#F5F5F5] flex items-center justify-center text-[#111111] mb-5">
                      <lab.icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-semibold text-[#111111] mb-2">{lab.title}</h3>
                    <p className="text-xs text-[#555555] leading-relaxed">{lab.desc}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-[#F0F0F0] text-[11px] font-mono text-[#888888]">
                    {lab.badge}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ CTA SECTION ══ */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#111111] mb-4">
              Explore the Department Ecosystem
            </h2>
            <p className="text-sm text-[#555555] max-w-xl mx-auto mb-8">
              Discover current degree programs, meet the faculty driving research, or review upcoming events and conferences.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/people">
                <Button className="h-10 px-6 rounded-md bg-[#111111] text-white hover:bg-neutral-800 text-xs">
                  Faculty Directory
                </Button>
              </Link>
              <Link href="/research">
                <Button variant="outline" className="h-10 px-6 rounded-md border-[#D0D0D0] text-xs">
                  Research Initiatives
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="ghost" className="h-10 px-6 rounded-md text-xs text-[#555555] hover:text-[#111111]">
                  Contact Us <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
