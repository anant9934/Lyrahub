import Link from "next/link"

export function PublicFooter() {
  return (
    <footer className="border-t border-[#E5E5E5] bg-white text-[#555555]">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2">
            <span className="text-lg font-bold tracking-tight text-[#111111]">
              Lyrahub
            </span>
            <p className="mt-2 text-xs leading-relaxed text-[#777777] max-w-sm">
              The unified academic intelligence operating system for the AI &
              Machine Learning Department. Centralizing students, faculty, research,
              events, rankings, and career opportunities.
            </p>
            <div className="mt-4 text-xs text-[#888888]">
              Department of Artificial Intelligence & Machine Learning
              <br />
              Innovation Campus, Academic Block 4
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
              Academics
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/programs" className="hover:text-[#111111]">
                  Degree Programs
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-[#111111]">
                  Course Catalog
                </Link>
              </li>
              <li>
                <Link href="/opportunities" className="hover:text-[#111111]">
                  Internships & Training
                </Link>
              </li>
              <li>
                <Link href="/ranking" className="hover:text-[#111111]">
                  Student Rankings
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
              Ecosystem
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/projects" className="hover:text-[#111111]">
                  Research & Capstones
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-[#111111]">
                  Events & Hackathons
                </Link>
              </li>
              <li>
                <Link href="/groups" className="hover:text-[#111111]">
                  Clubs & SIGs
                </Link>
              </li>
              <li>
                <Link href="/alumni" className="hover:text-[#111111]">
                  Alumni Network
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
              Governance
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/leadership" className="hover:text-[#111111]">
                  Leadership Directory
                </Link>
              </li>
              <li>
                <Link href="/leadership/hod" className="hover:text-[#111111]">
                  HOD Secretariat
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#111111]">
                  Faculty Portal
                </Link>
              </li>
              <li>
                <Link href="/scan" className="hover:text-[#111111]">
                  Attendance Scanner
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-[#E5E5E5] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#888888]">
          <p>© {new Date().getFullYear()} Lyrahub. AI/ML Department. All rights reserved.</p>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <Link href="/privacy" className="hover:text-[#111111]">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#111111]">Terms of Service</Link>
            <Link href="/security" className="hover:text-[#111111]">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
