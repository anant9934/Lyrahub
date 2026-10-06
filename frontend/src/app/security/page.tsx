import React from "react"
import Link from "next/link"
import { PublicNav } from "@/components/layout/PublicNav"
import { PublicFooter } from "@/components/layout/PublicFooter"
import { ShieldCheck, Lock, Server, Key, EyeOff } from "lucide-react"

export const metadata = {
  title: "Security & Infrastructure | AIMETRA",
  description: "Enterprise security architecture, access controls, and compliance for the AIMETRA platform.",
}

export default function SecurityPage() {
  return (
    <div className="aimetra-public theme-legal min-h-screen bg-white text-[#0F172A] flex flex-col">
      <PublicNav />

      <main className="flex-1 py-16 px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="mb-10 pb-6 border-b border-[#DCE5F1]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#71849B] mb-2">
            Infrastructure &amp; Compliance
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#0F172A]">
            Security Architecture
          </h1>
          <p className="text-xs text-[#667A93] mt-2">
            Institutional standards for zero-trust isolation and auditability.
          </p>
        </div>

        <div className="space-y-8 text-xs text-[#444444] leading-relaxed">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="border border-[#DCE5F1] rounded-xl p-5 bg-[#F6F8FC]">
              <Lock className="w-5 h-5 text-[#0F172A] mb-2" />
              <h3 className="text-xs font-semibold text-[#0F172A] mb-1">Encrypted in Transit &amp; Rest</h3>
              <p className="text-[11px] text-[#666666]">
                TLS 1.3 cryptographic transport with AES-256 encrypted database partitions on Neon PostgreSQL.
              </p>
            </div>
            <div className="border border-[#DCE5F1] rounded-xl p-5 bg-[#F6F8FC]">
              <ShieldCheck className="w-5 h-5 text-[#0F172A] mb-2" />
              <h3 className="text-xs font-semibold text-[#0F172A] mb-1">Role-Based Access Control</h3>
              <p className="text-[11px] text-[#666666]">
                Granular permission matrix partitioning students, faculty mentors, reviewers, and HOD administration.
              </p>
            </div>
            <div className="border border-[#DCE5F1] rounded-xl p-5 bg-[#F6F8FC]">
              <EyeOff className="w-5 h-5 text-[#0F172A] mb-2" />
              <h3 className="text-xs font-semibold text-[#0F172A] mb-1">Audit Trail &amp; Versioning</h3>
              <p className="text-[11px] text-[#666666]">
                Immutable historical logs for profile modifications, attendance scans, and credential issuances.
              </p>
            </div>
          </div>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-[#0F172A]">1. Authentication Architecture</h2>
            <p>
              Session management uses digitally signed JWT bearer tokens stored securely with short expiration
              windows and sliding refresh tokens. Multi-factor QR badge authentication provides cryptographic
              on-campus verification.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-[#0F172A]">2. Vulnerability Disclosure &amp; Reporting</h2>
            <p>
              Security researchers and students who identify potential vulnerabilities within AIMETRA infrastructure
              are encouraged to submit coordinated reports directly to:
              <br />
              <strong>Institutional CERT Desk:</strong>{" "}
              <a href="mailto:security.aiml@institution.edu" className="text-[#0F172A] underline">
                security.aiml@institution.edu
              </a>
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
