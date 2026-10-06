import Link from "next/link"
import { Sparkles } from "lucide-react"

export function PublicFooter() {
  return (
    <footer className="border-t-4 border-[#FACC15] bg-[#EAF3FE] text-[#526783] dark:bg-[#132842]">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="mb-10 border-b border-[#C8DCF5] pb-8 dark:border-[#335271]">
          <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#2563EB] dark:text-[#79B6FF]">Learn · Build · Connect</p>
          <p className="max-w-3xl text-2xl font-black leading-tight tracking-[-0.04em] text-[#0F172A] sm:text-3xl dark:text-white">The central hub for students, faculty, and future AI pioneers.</p>
        </div>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2">
            <span className="inline-flex items-center gap-2 text-sm font-black tracking-[-0.04em] text-[#0F172A] uppercase dark:text-white"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2563EB] text-[#FACC15]"><Sparkles className="h-4 w-4" /></span>
              AIMETRA
            </span>
            <p className="mt-1 text-[10px] font-medium tracking-wider text-[#71849B] uppercase">
              AI &amp; ML Education, Talent, Research &amp; Analytics
            </p>
            <p className="mt-3 text-xs leading-relaxed text-[#667A93] max-w-sm">
              We bring coursework, faculty mentors, research labs, and dream career opportunities together into one supportive, intelligent environment.
            </p>
            <div className="mt-4 text-xs text-[#71849B]">
              Department of Artificial Intelligence &amp; Machine Learning
              <br />
              Innovation Campus, Academic Block 4
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#0F172A]">
              Education
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/programs" className="hover:text-[#0F172A]">
                  Degree Programs
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-[#0F172A]">
                  Course Catalog
                </Link>
              </li>
              <li>
                <Link href="/opportunities" className="hover:text-[#0F172A]">
                  Internships &amp; Training
                </Link>
              </li>
              <li>
                <Link href="/ranking" className="hover:text-[#0F172A]">
                  Student Rankings
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#0F172A]">
              Ecosystem
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/projects" className="hover:text-[#0F172A]">
                  Research &amp; Projects
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-[#0F172A]">
                  Events &amp; Hackathons
                </Link>
              </li>
              <li>
                <Link href="/groups" className="hover:text-[#0F172A]">
                  Clubs &amp; SIGs
                </Link>
              </li>
              <li>
                <Link href="/alumni" className="hover:text-[#0F172A]">
                  Alumni Network
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#0F172A]">
              Governance
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/leadership" className="hover:text-[#0F172A]">
                  Leadership Directory
                </Link>
              </li>
              <li>
                <Link href="/leadership/hod" className="hover:text-[#0F172A]">
                  HOD Secretariat
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#0F172A]">
                  Faculty Portal
                </Link>
              </li>
              <li>
                <Link href="/scan" className="hover:text-[#0F172A]">
                  Attendance Scanner
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-[#DCE5F1] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#71849B]">
          <p>© {new Date().getFullYear()} AIMETRA. Department of AI &amp; ML. All rights reserved.</p>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <Link href="/privacy" className="hover:text-[#0F172A]">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#0F172A]">Terms of Service</Link>
            <Link href="/security" className="hover:text-[#0F172A]">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
