import React from "react"
import Link from "next/link"
import { PublicNav } from "@/components/layout/PublicNav"
import { PublicFooter } from "@/components/layout/PublicFooter"

export const metadata = {
  title: "Terms of Service | AIMETRA",
  description: "Terms of academic usage and acceptable conduct for the AIMETRA platform.",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-[#111111] flex flex-col">
      <PublicNav />

      <main className="flex-1 py-16 px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="mb-10 pb-6 border-b border-[#E5E5E5]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#888888] mb-2">
            Academic Charter
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#111111]">
            Terms of Service &amp; Acceptable Use
          </h1>
          <p className="text-xs text-[#777777] mt-2">
            Effective: Academic Year 2026–2027 • Department of Artificial Intelligence &amp; Machine Learning
          </p>
        </div>

        <div className="space-y-8 text-xs text-[#444444] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-[#111111]">1. Authorized Campus Access</h2>
            <p>
              AIMETRA is accessible to matriculated students, research scholars, teaching faculty, and authorized
              departmental staff. Account credentials must remain confidential and may not be shared.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-[#111111]">2. Academic Integrity &amp; Code of Ethics</h2>
            <p>
              Submissions logged on AIMETRA—including project codebases, dataset contributions, research drafts, and
              test evaluations—must reflect original scholarly effort. Any unauthorized model plagiarism or data
              falsification constitutes a violation of the departmental code of conduct.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-[#111111]">3. Computing Resource Allocation</h2>
            <p>
              Access to department GPU nodes, cloud training partitions, and laboratory hardware must conform to
              scheduled quota limits. Unauthorized high-volume scraping or commercial usage is strictly prohibited.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-[#111111]">4. Governance &amp; Administration</h2>
            <p>
              The Department reserves the right to suspend or audit access privileges in response to reported
              security breaches or non-compliance with institutional regulations.
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
