"use client"

import React, { useState } from "react"
import Link from "next/link"
import { PublicNav } from "@/components/layout/PublicNav"
import { PublicFooter } from "@/components/layout/PublicFooter"
import { Button } from "@/components/ui/button"
import {
  BookOpen,
  Atom,
  Cpu,
  FileText,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Database,
  Layers,
  Award,
  Download,
  Share2,
} from "lucide-react"

export default function ResearchPage() {
  const [activeArea, setActiveArea] = useState<string>("all")

  const thrustAreas = [
    {
      id: "foundation-models",
      title: "Foundation Models & Agentic Reasoning",
      lead: "Dr. Ananya Mukherjee",
      desc: "Investigating long-context attention mechanisms, neuro-symbolic reasoning graphs, and multilingual parameter-efficient adaptation for low-resource languages.",
      topics: ["Long-Context Attention", "Tool-Using Agents", "Indic LLM Alignment"],
      grants: "MeitY Language Technologies Grant",
    },
    {
      id: "computer-vision",
      title: "Computer Vision & Spatial Intelligence",
      lead: "Dr. Vikramaditya Sen",
      desc: "Pioneering 3D Gaussian Splatting, neural radiance fields for inverse scene decomposition, and self-supervised visual representation learning.",
      topics: ["3D Scene Reconstruction", "Gaussian Splatting", "Egocentric Video"],
      grants: "DST SERB Core Research Grant",
    },
    {
      id: "edge-ai",
      title: "Edge AI & Hardware-Software Co-Design",
      lead: "Dr. Rajeshwar Rao",
      desc: "Developing 4-bit integer quantization frameworks, structured weight pruning, and systolic array acceleration for on-device inference under 5 Watts.",
      topics: ["Sub-8-Bit Quantization", "Neuromorphic Vision", "FPGA Accelerators"],
      grants: "NVIDIA Academic Hardware Grant",
    },
    {
      id: "healthcare-ai",
      title: "Biomedical Informatics & Medical Imaging",
      lead: "Dr. Vikramaditya Sen & Health Lab",
      desc: "Deploying deep convolutional networks and vision transformers for automated histopathology tissue classification, MRI segmentation, and early diabetic retinopathy screening.",
      topics: ["Multimodal EHR Synthesis", "Histopathology ViTs", "Federated Clinical Trials"],
      grants: "ICMR Advanced Medical AI Project",
    },
    {
      id: "safety-alignment",
      title: "Mechanistic Interpretability & AI Safety",
      lead: "Dr. Meera Nambiar",
      desc: "Probing circuit-level representations inside transformer attention heads, preventing hallucination cascades, and establishing cryptographic dataset watermarking.",
      topics: ["Circuit Discovery", "Adversarial Robustness", "Watermarking & Provenance"],
      grants: "Institutional AI Ethics Trust",
    },
  ]

  const publications = [
    {
      id: "pub-1",
      title: "Sparse Gaussian Splatting for Real-Time Dynamic Scene Synthesis from Monocular Video",
      authors: "Siddharth Verma, Dr. Vikramaditya Sen",
      venue: "CVPR 2025",
      year: "2025",
      citations: 28,
      arxivId: "2504.10821",
      doi: "10.1109/CVPR.2025.0118",
      abstract:
        "We introduce a sparse voxel-guided Gaussian pruning methodology that reduces active primitives by 43% without sacrificing PSNR on standard dynamic benchmarks.",
    },
    {
      id: "pub-2",
      title: "Cross-Lingual Chain-of-Thought Distillation for Low-Resource Regional Syntheses",
      authors: "Tanvi Deshmukh, Dr. Ananya Mukherjee",
      venue: "NeurIPS 2025",
      year: "2025",
      citations: 34,
      arxivId: "2509.04312",
      doi: "10.5555/neurips.2025.992",
      abstract:
        "Demonstrates direct latent alignment across 14 Indic languages, reducing bilingual teacher-student token perplexity disparity by 31.4%.",
    },
    {
      id: "pub-3",
      title: "Sub-4-Bit Integer Quantization for Real-Time Edge Vision Transformers on Low-Power RISC-V",
      authors: "Aakash Patel, Dr. Rajeshwar Rao",
      venue: "IEEE Micro / DATE 2025",
      year: "2025",
      citations: 19,
      arxivId: "2502.08711",
      doi: "10.1109/DATE.2025.1042",
      abstract:
        "Presents a hardware-aware calibration technique retaining 98.7% ImageNet top-1 accuracy while executing at 4.2 FPS on a 2.5W embedded board.",
    },
    {
      id: "pub-4",
      title: "Mechanistic Circuit Attribution for Hallucination Suppression in Retrieval-Augmented Generation",
      authors: "Aditya Nair, Dr. Meera Nambiar, Dr. K. S. Ramanathan",
      venue: "ICLR 2025",
      year: "2025",
      citations: 41,
      arxivId: "2501.12904",
      doi: "10.48550/arXiv.2501.12904",
      abstract:
        "Isolates causal attention head pathways responsible for factual deviation and proposes linear intervention vectors to suppress false outputs at test-time.",
    },
  ]

  const datasets = [
    {
      name: "IndicDialogue-Bench-v2",
      size: "2.4M Dialogue Pairs",
      license: "Apache 2.0",
      description: "Extensive multi-turn synthetic & curated conversational dataset across 12 Indian regional vernaculars with rigorous safety annotations.",
    },
    {
      name: "EdgeDepth-Outdoor-3D",
      size: "180,000 Synchronized Frames",
      license: "CC-BY-4.0",
      description: "Synchronized dual-fisheye stereo and LiDAR depth point clouds captured under diverse weather conditions for mobile robotics.",
    },
    {
      name: "RetinaPath-MultiModal",
      size: "45,000 Anonymized Scans",
      license: "Research Non-Commercial",
      description: "Expert-annotated fundus photographs paired with optical coherence tomography scans for automated diabetic staging.",
    },
  ]

  return (
    <div className="min-h-screen bg-white text-[#111111] flex flex-col">
      <PublicNav />

      <main className="flex-1">
        {/* ══ HERO ══ */}
        <section className="border-b border-[#E5E5E5] bg-[#FAFAFA] py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#888888] mb-4">
                Department Research &amp; Publications
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#111111] leading-[1.1] mb-6">
                Advancing the frontiers
                <br />
                of machine intelligence.
              </h1>
              <p className="text-base sm:text-lg text-[#555555] leading-relaxed mb-8">
                From foundational mathematical theory to deployable edge silicon and healthcare
                diagnostics, our laboratories conduct high-impact, peer-reviewed AI research funded
                by premier government bodies and technology leaders.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <a href="#publications">
                  <Button className="h-11 px-6 rounded-md bg-[#111111] text-white hover:bg-neutral-800 text-xs font-medium">
                    View Recent Publications
                  </Button>
                </a>
                <a href="#thrust-areas">
                  <Button
                    variant="outline"
                    className="h-11 px-6 rounded-md border-[#D0D0D0] text-[#111111] text-xs font-medium"
                  >
                    Research Thrust Areas
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ══ SUMMARY STATS ══ */}
        <section className="border-b border-[#E5E5E5] bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: "Peer-Reviewed Papers", val: "140+" },
                { label: "Active Research Labs", val: "6 Labs" },
                { label: "Funded Research Grants", val: "₹4.8 Cr" },
                { label: "Open Datasets Released", val: "12 Datasets" },
              ].map((s, i) => (
                <div key={i} className="border-l-2 border-[#111111] pl-4">
                  <div className="text-2xl sm:text-3xl font-semibold text-[#111111]">{s.val}</div>
                  <div className="text-xs text-[#777777] mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ RESEARCH THRUST AREAS ══ */}
        <section id="thrust-areas" className="border-b border-[#E5E5E5] bg-[#FAFAFA] py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="max-w-2xl mb-14">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#888888] mb-3">
                Core Domains
              </p>
              <h2 className="text-3xl font-semibold text-[#111111] tracking-tight">
                Department Research Thrusts
              </h2>
              <p className="mt-3 text-sm text-[#555555]">
                Our research groups bring together faculty, postdoctoral scholars, and student
                fellows to tackle foundational and applied engineering challenges.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {thrustAreas.map((thrust) => (
                <div
                  key={thrust.id}
                  className="bg-white border border-[#E5E5E5] rounded-xl p-6 flex flex-col justify-between hover:border-[#111111] transition-colors"
                >
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#888888] block mb-2">
                      Lead: {thrust.lead}
                    </span>
                    <h3 className="text-base font-semibold text-[#111111] mb-3">{thrust.title}</h3>
                    <p className="text-xs text-[#555555] leading-relaxed mb-5">{thrust.desc}</p>

                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {thrust.topics.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-[#F5F5F5] text-[10px] text-[#444444] border border-[#EBEBEB]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#F0F0F0] text-[11px] text-[#777777] flex items-center justify-between">
                    <span className="font-medium text-[#111111]">Grant Support</span>
                    <span className="text-[10px] bg-[#FAFAFA] px-2 py-0.5 rounded border border-[#E5E5E5]">
                      {thrust.grants}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ FLAGSHIP PUBLICATIONS ══ */}
        <section id="publications" className="border-b border-[#E5E5E5] bg-white py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#888888] mb-3">
                  Selected Publications
                </p>
                <h2 className="text-3xl font-semibold text-[#111111] tracking-tight">
                  Recent Scientific Papers
                </h2>
              </div>
              <p className="text-xs text-[#777777] max-w-md">
                All publications undergo strict peer review at top tier international conferences and
                IEEE / ACM transactions.
              </p>
            </div>

            <div className="space-y-4">
              {publications.map((pub) => (
                <div
                  key={pub.id}
                  className="border border-[#E5E5E5] rounded-xl p-6 hover:border-[#111111] transition-all bg-white"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-[#111111] text-white text-[10px] font-semibold tracking-wide">
                          {pub.venue}
                        </span>
                        <span className="text-xs font-mono text-[#888888]">{pub.year}</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-[#111111]">
                        {pub.title}
                      </h3>
                      <p className="text-xs text-[#555555] font-medium">{pub.authors}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-medium text-[#111111] bg-[#FAFAFA] border border-[#E5E5E5] px-2.5 py-1 rounded">
                        {pub.citations} Citations
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#666666] leading-relaxed mb-4">{pub.abstract}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs pt-3 border-t border-[#F5F5F5]">
                    <span className="font-mono text-[11px] text-[#777777]">
                      arXiv:{pub.arxivId}
                    </span>
                    <span className="text-[#CCCCCC]">•</span>
                    <span className="font-mono text-[11px] text-[#777777]">
                      DOI: {pub.doi}
                    </span>
                    <a
                      href={`https://arxiv.org/abs/${pub.arxivId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-[#111111] hover:underline"
                    >
                      <span>Read Paper</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ OPEN DATASETS & SOFTWARE ══ */}
        <section className="bg-[#FAFAFA] py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="max-w-2xl mb-12">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#888888] mb-3">
                Open Science
              </p>
              <h2 className="text-3xl font-semibold text-[#111111] tracking-tight">
                Curated Datasets &amp; Benchmarks
              </h2>
              <p className="mt-3 text-sm text-[#555555]">
                In keeping with open research principles, the AIMETRA department releases vetted
                benchmark datasets and evaluation protocols to the broader scientific community.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {datasets.map((ds, i) => (
                <div
                  key={i}
                  className="bg-white border border-[#E5E5E5] rounded-xl p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono font-medium text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded">
                        {ds.size}
                      </span>
                      <span className="text-[10px] text-[#777777]">{ds.license}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-[#111111] mb-2">{ds.name}</h3>
                    <p className="text-xs text-[#555555] leading-relaxed mb-4">{ds.description}</p>
                  </div>
                  <div className="pt-4 border-t border-[#F0F0F0] flex items-center justify-between">
                    <span className="text-[11px] text-[#888888]">Verified Benchmark</span>
                    <button
                      type="button"
                      className="text-xs font-medium text-[#111111] hover:underline inline-flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Dataset Card</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
