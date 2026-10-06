import React from "react"
import Link from "next/link"
import { PublicNav } from "@/components/layout/PublicNav"
import { PublicFooter } from "@/components/layout/PublicFooter"
import { PublicShowcaseHero } from "@/components/layout/PublicShowcaseHero"
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
    <div className="aimetra-public theme-about min-h-screen bg-white text-[#0F172A] flex flex-col">
      <PublicNav />

      <main className="flex-1">
        {/* ══ HERO SECTION ══ */}
        <PublicShowcaseHero
          eyebrow="Our Story & Mission"
          title={<>From <span className="text-[#1478ef]">curiosity</span> to real impact.</>}
          description="AIMETRA was built to fix a simple problem: students have incredible potential, but campus info is often scattered and hard to find. We bring courses, faculty mentors, research labs, and dream careers into one clear, supportive home."
          tone="sun"
          visual="campus"
          visualLabel="Learn · Build · Lead"
        >
          <Link href="/programs"><Button className="h-11 rounded-full bg-[#1478ef] px-6 text-xs font-bold text-white hover:bg-[#075fc9]">Explore programs <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
          <Link href="/people"><Button variant="outline" className="h-11 rounded-full border-[#a9bed9] bg-white px-6 text-xs font-bold text-[#081a39]">Meet our mentors</Button></Link>
        </PublicShowcaseHero>

        {/* ══ INSTITUTIONAL KEY NUMBERS ══ */}
        <section className="border-b border-[#DCE5F1] bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-14">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "840+", label: "Enrolled Scholars", sub: "Undergraduate & Graduate" },
                { value: "32", label: "Full-Time Faculty", sub: "100% PhD / Research Active" },
                { value: "₹4.8 Cr", label: "Active Grants", sub: "DST, MeitY & Industry Co-funded" },
                { value: "140+", label: "Peer-Reviewed Papers", sub: "NeurIPS, CVPR, ICML & IEEE" },
              ].map((stat, i) => (
                <div key={i} className="space-y-1">
                  <div className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#0F172A]">
                    {stat.value}
                  </div>
                  <div className="text-xs font-semibold text-[#0F172A]">{stat.label}</div>
                  <div className="text-[11px] text-[#667A93]">{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ OUR MISSION & CHARTER ══ */}
        <section className="border-b border-[#DCE5F1] bg-white py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
              <div className="lg:col-span-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#71849B] mb-4">
                  Why We Built This
                </p>
                <h2 className="text-3xl font-semibold text-[#0F172A] leading-tight mb-6">
                  Connecting classrooms with real research and dream careers.
                </h2>
                <p className="text-sm text-[#526783] leading-relaxed">
                  In traditional departments, course syllabi sit in one silo, lab research stays behind closed doors, and student talent gets lost on paper resumes. AIMETRA bridges these gaps — giving you direct mentorship, hands-on lab access, and verifiable credentials that top employers trust.
                </p>
              </div>

              <div className="lg:col-span-7 space-y-8">
                <div className="border border-[#DCE5F1] rounded-xl p-8 bg-[#F6F8FC]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[#0F172A] text-white flex items-center justify-center">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-semibold text-[#0F172A]">1. Curriculum That Teaches Real Engineering</h3>
                  </div>
                  <p className="text-xs text-[#526783] leading-relaxed">
                    From linear algebra and neural networks to large language models and autonomous agents, you learn by writing code and solving challenges that mirror actual industry demands.
                  </p>
                </div>

                <div className="border border-[#DCE5F1] rounded-xl p-8 bg-[#F6F8FC]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[#0F172A] text-white flex items-center justify-center">
                      <Atom className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-semibold text-[#0F172A]">2. Research Labs With Open Doors</h3>
                  </div>
                  <p className="text-xs text-[#526783] leading-relaxed">
                    You don't need to wait until graduate school to do groundbreaking work. Join faculty labs early, collaborate on frontier papers, and publish in venues like CVPR, NeurIPS, and IEEE.
                  </p>
                </div>

                <div className="border border-[#DCE5F1] rounded-xl p-8 bg-[#F6F8FC]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[#0F172A] text-white flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-semibold text-[#0F172A]">3. Verified Proof, Not Just Paper Resumes</h3>
                  </div>
                  <p className="text-xs text-[#526783] leading-relaxed">
                    Your GitHub repos, capstone submissions, hackathon wins, and peer rankings form an authentic digital track record that recruiters and hiring managers can verify in seconds.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ RESEARCH FACILITIES & INFRASTRUCTURE ══ */}
        <section className="border-b border-[#DCE5F1] bg-[#F6F8FC] py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="max-w-2xl mb-16">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#71849B] mb-3">
                Hardware &amp; Facilities
              </p>
              <h2 className="text-3xl font-semibold text-[#0F172A] tracking-tight">
                High-Performance Compute &amp; Modern Labs
              </h2>
              <p className="mt-3 text-sm text-[#526783]">
                From high-density GPU clusters to motion-capture robotics arenas, we provide the compute and experimental spaces you need to train and benchmark models at scale.
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
                  className="bg-white border border-[#DCE5F1] rounded-xl p-6 flex flex-col justify-between hover:border-[#0F172A] transition-colors"
                >
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-[#EDF4FC] flex items-center justify-center text-[#0F172A] mb-5">
                      <lab.icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-semibold text-[#0F172A] mb-2">{lab.title}</h3>
                    <p className="text-xs text-[#526783] leading-relaxed">{lab.desc}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-[#F0F0F0] text-[11px] font-mono text-[#71849B]">
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
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#0F172A] mb-4">
              Explore the Department Ecosystem
            </h2>
            <p className="text-sm text-[#526783] max-w-xl mx-auto mb-8">
              Discover current degree programs, meet the faculty driving research, or review upcoming events and conferences.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/people">
                <Button className="h-10 px-6 rounded-md bg-[#0F172A] text-white hover:bg-neutral-800 text-xs">
                  Faculty Directory
                </Button>
              </Link>
              <Link href="/research">
                <Button variant="outline" className="h-10 px-6 rounded-md border-[#D0D0D0] text-xs">
                  Research Initiatives
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="ghost" className="h-10 px-6 rounded-md text-xs text-[#526783] hover:text-[#0F172A]">
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
