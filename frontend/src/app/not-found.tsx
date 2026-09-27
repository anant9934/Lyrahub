import Link from "next/link"
import { PublicNav } from "@/components/layout/PublicNav"
import { PublicFooter } from "@/components/layout/PublicFooter"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Compass, Search, BookOpen, Users, FileText } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white text-[#111111] flex flex-col">
      <PublicNav />

      <main id="main-content" className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#F5F5F5] text-[#555555] border border-[#E5E5E5]">
            <Compass className="w-3.5 h-3.5 text-[#111111]" />
            <span>404 — Page Not Found</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#111111]">
            Resource Not Located
          </h1>

          <p className="text-sm text-[#666666] leading-relaxed max-w-md mx-auto">
            The institutional record or page you requested does not exist or may have been relocated within the AIMETRA directory.
          </p>

          {/* Recovery destinations */}
          <div className="pt-4 border-t border-[#F0F0F0] max-w-md mx-auto">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#888888] mb-4">
              Suggested Institutional Navigation
            </p>
            <div className="grid grid-cols-2 gap-3 text-left">
              <Link
                href="/programs"
                className="p-3 rounded-lg border border-[#E5E5E5] hover:border-[#111111] transition-colors bg-[#FAFAFA]"
              >
                <div className="text-xs font-semibold text-[#111111]">Academic Programs</div>
                <div className="text-[11px] text-[#777777]">Degree catalog &amp; minors</div>
              </Link>
              <Link
                href="/people"
                className="p-3 rounded-lg border border-[#E5E5E5] hover:border-[#111111] transition-colors bg-[#FAFAFA]"
              >
                <div className="text-xs font-semibold text-[#111111]">Faculty Directory</div>
                <div className="text-[11px] text-[#777777]">Leadership &amp; scholars</div>
              </Link>
              <Link
                href="/research"
                className="p-3 rounded-lg border border-[#E5E5E5] hover:border-[#111111] transition-colors bg-[#FAFAFA]"
              >
                <div className="text-xs font-semibold text-[#111111]">Research &amp; Labs</div>
                <div className="text-[11px] text-[#777777]">Papers &amp; computing nodes</div>
              </Link>
              <Link
                href="/events"
                className="p-3 rounded-lg border border-[#E5E5E5] hover:border-[#111111] transition-colors bg-[#FAFAFA]"
              >
                <div className="text-xs font-semibold text-[#111111]">Events &amp; Hackathons</div>
                <div className="text-[11px] text-[#777777]">Department calendar</div>
              </Link>
            </div>
          </div>

          <div className="pt-6">
            <Link href="/">
              <Button className="h-10 px-6 rounded-md bg-[#111111] text-white hover:bg-neutral-800 text-xs font-medium">
                <ArrowLeft className="w-3.5 h-3.5 mr-2" />
                Return to Homepage
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
