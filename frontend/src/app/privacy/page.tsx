import React from "react"
import Link from "next/link"
import { PublicNav } from "@/components/layout/PublicNav"
import { PublicFooter } from "@/components/layout/PublicFooter"
import { ShieldCheck, Lock, Eye, FileCheck } from "lucide-react"

export const metadata = {
  title: "Privacy Policy | AIMETRA",
  description: "Institutional privacy principles and student data governance for the AIMETRA platform.",
}

export default function PrivacyPage() {
  return (
    <div className="aimetra-public theme-legal min-h-screen bg-white text-[#0F172A] flex flex-col">
      <PublicNav />

      <main className="flex-1 py-16 px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="mb-10 pb-6 border-b border-[#DCE5F1]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#71849B] mb-2">
            Data Governance &amp; Ethics
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#0F172A]">
            Institutional Privacy Policy
          </h1>
          <p className="text-xs text-[#667A93] mt-2">
            Last Updated: September 2026 • Department of Artificial Intelligence &amp; Machine Learning
          </p>
        </div>

        <div className="space-y-8 text-xs text-[#444444] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-[#0F172A]">1. Scope &amp; Purpose</h2>
            <p>
              AIMETRA operates as the centralized intelligence and academic record repository for students,
              doctoral scholars, faculty members, and research staff within the Department of Artificial
              Intelligence &amp; Machine Learning. We are committed to upholding strict institutional data
              governance and preserving academic confidentiality.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-[#0F172A]">2. Data Collected &amp; Processed</h2>
            <p>
              AIMETRA processes departmental records including student enrollment details, academic transcripts,
              attendance logs, capstone project repositories, and research manuscripts. No personal data is
              monetized, rented, or transferred to third-party advertising networks.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-[#0F172A]">3. Storage &amp; Encryption Standards</h2>
            <p>
              All academic dossiers, vector embeddings, and session credentials are encrypted in transit via
              TLS 1.3 and at rest using AES-256 standards. Access is governed by strict Role-Based Access
              Control (RBAC) enforced through verified JSON Web Tokens (JWT).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-[#0F172A]">4. Contact the Data Protection Officer</h2>
            <p>
              For inquiries regarding data retention, record export, or profile deletion requests, please contact:
              <br />
              <strong>Institutional Data Protection Desk:</strong>{" "}
              <a href="mailto:privacy.aiml@institution.edu" className="text-[#0F172A] underline">
                privacy.aiml@institution.edu
              </a>
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
