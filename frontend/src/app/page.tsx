import Link from "next/link"
import Image from "next/image"
import { PublicNav } from "@/components/layout/PublicNav"
import { PublicFooter } from "@/components/layout/PublicFooter"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-[#111111] flex flex-col">
      <PublicNav />

      <main id="main-content" className="flex-1">

        {/* ══ HERO — Full-bleed campus image with text overlay ══ */}
        <section className="relative w-full overflow-hidden" style={{ height: "calc(100vh - 64px)", minHeight: "560px", maxHeight: "820px" }}>
          {/* Campus image — fills entire hero */}
          <Image
            src="/images/hero-campus.png"
            alt="AI & Machine Learning Department Campus"
            fill
            priority
            className="object-cover object-center"
          />

          {/* Left-side dark gradient scrim — text sits here */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
          {/* Bottom fade for smooth section transition */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />

          {/* Hero text — left-aligned, white, over the scrim */}
          <div className="absolute inset-0 flex items-center">
            <div className="mx-auto max-w-7xl w-full px-6 lg:px-8">
              <div className="max-w-2xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60 mb-6">
                  AI &amp; ML Education, Talent, Research &amp; Analytics
                </p>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-[1.08] mb-6">
                  The intelligence layer
                  <br />
                  for the AI &amp; ML
                  <br />
                  department.
                </h1>
                <p className="text-base sm:text-lg text-white/80 max-w-lg leading-relaxed mb-10">
                  AIMETRA connects students, faculty, projects, research, opportunities, alumni and institutional data into one intelligent academic environment.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <Link href="/login">
                    <Button className="h-12 px-8 rounded-lg bg-white text-[#111111] hover:bg-neutral-100 font-semibold text-sm shadow-lg">
                      Explore AIMETRA
                    </Button>
                  </Link>
                  <Link
                    href="#system"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white transition-colors"
                  >
                    See how it works <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom-right: institution label */}
          <div className="absolute bottom-8 right-6 lg:right-10 text-right">
            <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-white/40">
              Department of Artificial Intelligence &amp; Machine Learning
            </p>
          </div>
        </section>

        {/* ══ SIGNAL CHAIN STRIP ══ */}
        <section className="border-b border-[#E5E5E5] bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-6">
            <div className="flex flex-wrap gap-x-0 gap-y-3">
              {["Students","Faculty","Projects","Research","Skills","Achievements","Opportunities","Alumni","Analytics"].map((label, i, arr) => (
                <div key={label} className="flex items-center">
                  <span className="text-xs font-medium text-[#333333]">{label}</span>
                  {i < arr.length - 1 && (
                    <span className="mx-3 text-[#CCCCCC] text-xs select-none">→</span>
                  )}
                </div>
              ))}
              <div className="flex items-center">
                <span className="mx-3 text-[#CCCCCC] text-xs select-none">→</span>
                <span className="text-xs font-semibold text-[#111111] tracking-[0.1em] uppercase">AIMETRA</span>
              </div>
            </div>
            <p className="mt-2 text-xs text-[#AAAAAA]">Connected — not scattered.</p>
          </div>
        </section>



        {/* ══ THE PROBLEM ══ */}
        <section className="border-t border-[#E5E5E5] bg-[#FAFAFA]">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 items-start">
              <div className="lg:col-span-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#AAAAAA] mb-6">
                  The problem
                </p>
                <h2 className="text-3xl sm:text-4xl font-semibold text-[#111111] leading-[1.2]">
                  Your department has the data.
                  <br />
                  <span className="text-[#888888]">It just does not connect.</span>
                </h2>
              </div>
              <div className="lg:col-span-7">
                <div className="space-y-0 divide-y divide-[#E8E8E8]">
                  {[
                    { place: "Student records", location: "one system" },
                    { place: "Projects", location: "another" },
                    { place: "Research", location: "somewhere else" },
                    { place: "Achievements", location: "a spreadsheet" },
                    { place: "Opportunities", location: "a message thread" },
                    { place: "Faculty expertise", location: "difficult to find" },
                    { place: "Alumni knowledge", location: "disconnected" },
                  ].map((row) => (
                    <div key={row.place} className="flex items-baseline justify-between py-4 gap-4">
                      <span className="text-sm font-medium text-[#111111]">{row.place}</span>
                      <span className="text-sm text-[#AAAAAA] shrink-0">{row.location}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-10 pt-8 border-t border-[#E5E5E5]">
                  <p className="text-base text-[#333333] leading-relaxed max-w-lg">
                    The information exists. The connection does not.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ THE QUESTION ══ */}
        <section className="border-t border-[#E5E5E5] bg-white" id="system">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-28 lg:py-36">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#AAAAAA] mb-10">
              The question
            </p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#111111] leading-[1.1] max-w-4xl">
              What happens when an academic department
              can finally see itself as one system?
            </h2>
            <div className="mt-12 max-w-2xl space-y-3 text-sm text-[#666666] leading-relaxed">
              <p>Skills connect with projects.</p>
              <p>Projects connect with opportunities.</p>
              <p>Research connects with people.</p>
              <p>Faculty expertise connects with students.</p>
              <p>Alumni experience connects with the next cohort.</p>
              <p>Decisions connect with actual evidence.</p>
            </div>
            <p className="mt-10 text-sm font-medium text-[#111111]">
              That is the problem AIMETRA is designed around.
            </p>
          </div>
        </section>

        {/* ══ MEET AIMETRA + FROM → TO ══ */}
        <section className="border-t border-[#E5E5E5] bg-[#F5F5F4]">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
              <div className="lg:col-span-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#AAAAAA] mb-6">The answer</p>
                <h2 className="text-4xl sm:text-5xl font-semibold text-[#111111] leading-[1.1] mb-4">Meet AIMETRA.</h2>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#999999] mb-8">
                  AI &amp; ML Education, Talent, Research &amp; Analytics
                </p>
                <p className="text-base text-[#444444] leading-relaxed mb-4 max-w-sm">
                  A connected intelligence layer for the modern AI &amp; ML department.
                </p>
                <p className="text-sm text-[#666666] leading-relaxed max-w-sm">
                  AIMETRA brings the department&rsquo;s people, knowledge,
                  evidence, opportunities and outcomes into one structured institutional system.
                </p>
              </div>
              <div className="lg:col-span-7">
                <div className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden">
                  <div className="grid grid-cols-2 divide-x divide-[#E8E8E8]">
                    <div className="p-8">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#BBBBBB] mb-6">Before</p>
                      <ul className="space-y-4">
                        {["Scattered records","Disconnected platforms","Hidden expertise","Manual searches","Fragmented evidence","Decisions without context"].map((item) => (
                          <li key={item} className="text-sm text-[#888888] leading-snug">{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-8">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#111111] mb-6">With AIMETRA</p>
                      <ul className="space-y-4">
                        {["Connected student profiles","Institutional intelligence","Discoverable expertise","Structured evidence","Faster, informed analysis","Context-aware AI assistance"].map((item) => (
                          <li key={item} className="text-sm text-[#111111] font-medium leading-snug">{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ STUDENT ══ */}
        <section className="border-t border-[#E5E5E5] bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
              <div className="lg:col-span-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#AAAAAA] mb-6">Student</p>
                <h2 className="text-3xl sm:text-4xl font-semibold text-[#111111] mb-8 leading-[1.2]">
                  Your academic journey should leave a trail of evidence.
                </h2>
                <p className="text-xl font-semibold text-[#111111] leading-tight mb-8">
                  &ldquo;A resume is a snapshot.
                  <br />
                  A student&rsquo;s journey is a dataset.&rdquo;
                </p>
                <p className="text-sm text-[#666666] leading-relaxed">
                  AIMETRA is designed to turn fragmented achievements into a
                  connected academic profile — organized around evidence,
                  not empty self-reporting.
                </p>
              </div>
              <div className="lg:col-span-7">
                <div className="bg-[#FAFAFA] rounded-2xl border border-[#E5E5E5] overflow-hidden">
                  <div className="px-6 py-5 border-b border-[#E5E5E5] flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#111111] flex items-center justify-center text-white text-sm font-bold shrink-0">
                      RS
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#111111]">Rahul Sharma</div>
                      <div className="text-xs text-[#888888]">B.Tech CSE (AI &amp; ML) · Semester 6</div>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="text-xs font-semibold text-[#111111]">Rank #4</div>
                      <div className="text-[11px] text-[#888888]">Dept. · 2024</div>
                    </div>
                  </div>
                  <div className="divide-y divide-[#EEEEEE]">
                    {[
                      { label: "CGPA", value: "8.7 / 10.0", sub: "6 semesters" },
                      { label: "Skills verified", value: "12", sub: "Python, PyTorch, SQL, Docker +8" },
                      { label: "Projects", value: "4 active", sub: "LLM fine-tuning · NLP pipeline · CV model" },
                      { label: "Research", value: "1 paper", sub: "Conference submission · under review" },
                      { label: "Certifications", value: "6", sub: "Coursera, NPTEL, AWS ML" },
                      { label: "Internship", value: "1 completed", sub: "AI Startup · 3 months" },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between px-6 py-3.5">
                        <span className="text-xs text-[#888888] w-28 shrink-0">{row.label}</span>
                        <span className="text-xs font-semibold text-[#111111] w-24 shrink-0">{row.value}</span>
                        <span className="text-[11px] text-[#AAAAAA] text-right truncate">{row.sub}</span>
                      </div>
                    ))}
                  </div>
                  <div className="px-6 py-4 border-t border-[#E5E5E5] bg-white">
                    <p className="text-[11px] text-[#AAAAAA]">Each signal part of a connected profile — not a scattered list.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ FACULTY ══ */}
        <section className="border-t border-[#E5E5E5] bg-[#FAFAFA]">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-5 order-last lg:order-first">
                <div className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden">
                  <div className="px-6 py-5 border-b border-[#E5E5E5]">
                    <div className="text-xs font-semibold text-[#111111]">Dr. Priya Menon</div>
                    <div className="text-[11px] text-[#888888]">Associate Professor · AI &amp; ML</div>
                  </div>
                  <div className="divide-y divide-[#EEEEEE]">
                    {[
                      { label: "Expertise", items: "NLP, Transformers, Generative AI" },
                      { label: "Courses", items: "Deep Learning · NLP Engineering" },
                      { label: "Projects supervised", items: "7 active capstones" },
                      { label: "Research", items: "4 publications · 2 under review" },
                      { label: "Mentees", items: "12 students" },
                    ].map((row) => (
                      <div key={row.label} className="px-6 py-3.5 flex items-start gap-4">
                        <span className="text-[11px] text-[#AAAAAA] w-32 shrink-0 pt-0.5">{row.label}</span>
                        <span className="text-xs text-[#333333] leading-relaxed">{row.items}</span>
                      </div>
                    ))}
                  </div>
                  <div className="px-6 py-4 border-t border-[#E5E5E5] bg-[#FAFAFA]">
                    <p className="text-[11px] text-[#AAAAAA]">Expertise structured and visible — not locked in a CV.</p>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#AAAAAA] mb-6">Faculty</p>
                <h2 className="text-3xl sm:text-4xl font-semibold text-[#111111] mb-6 leading-[1.2]">
                  Expertise should be discoverable.
                </h2>
                <p className="text-base text-[#444444] leading-relaxed mb-4 max-w-lg">
                  A department becomes stronger when expertise is visible, connected and easier to find.
                </p>
                <p className="text-sm text-[#666666] leading-relaxed max-w-lg">
                  AIMETRA gives faculty a structured presence within the institutional system —
                  linking expertise to courses, projects, research and students rather than
                  leaving it in isolated profiles.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ══ LEADERSHIP ══ */}
        <section className="border-t border-[#E5E5E5] bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
              <div className="lg:col-span-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#AAAAAA] mb-6">
                  Department leadership
                </p>
                <h2 className="text-3xl sm:text-4xl font-semibold text-[#111111] mb-6 leading-[1.2]">
                  Better decisions begin with better visibility.
                </h2>
                <p className="text-sm text-[#666666] leading-relaxed max-w-sm mb-6">
                  AIMETRA provides authorized leadership with a connected view
                  across the department — grounded in evidence.
                </p>
                <p className="text-xs text-[#AAAAAA] font-medium uppercase tracking-wider">
                  Evidence-backed visibility — not surveillance.
                </p>
              </div>
              <div className="lg:col-span-7">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 border-t border-[#E5E5E5] pt-8">
                  {[
                    {
                      group: "Academic",
                      items: ["Student performance","Attendance patterns","Skills landscape","Curriculum coverage"],
                    },
                    {
                      group: "Research & Output",
                      items: ["Research activity","Faculty contribution","Placement outcomes","Achievement data"],
                    },
                    {
                      group: "Operations",
                      items: ["Opportunity pipeline","Department trends","Approval workflows","Institutional records"],
                    },
                  ].map((col) => (
                    <div key={col.group}>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#AAAAAA] mb-4">{col.group}</p>
                      <ul className="space-y-3 mb-8">
                        {col.items.map((item) => (
                          <li key={item} className="text-sm text-[#444444]">{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ AIDA ══ */}
        <section className="border-t border-[#E5E5E5] bg-[#FAFAFA]">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
              <div className="lg:col-span-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#AAAAAA] mb-6">AIDA</p>
                <h2 className="text-3xl sm:text-4xl font-semibold text-[#111111] mb-2 leading-[1.1]">
                  Ask AIMETRA.
                </h2>
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#AAAAAA] mb-8">
                  AIMETRA Intelligence &amp; Data Assistant
                </p>
                <p className="text-base text-[#444444] leading-relaxed mb-4 max-w-sm">
                  AIDA is the conversational intelligence layer of AIMETRA —
                  connected to the department&rsquo;s actual institutional data.
                </p>
                <p className="text-sm text-[#666666] leading-relaxed max-w-sm">
                  The differentiator is not that AIDA uses AI.
                  The differentiator is that AIDA understands institutional context.
                </p>
              </div>
              <div className="lg:col-span-8">
                {/* Visual Sequence Pipeline Indicator */}
                <div className="hidden sm:flex items-center gap-2 mb-4 px-4 py-2 rounded-lg bg-white border border-[#E5E5E5] text-[11px] font-medium text-[#777777]">
                  <span className="text-[#111111] font-semibold">Question</span>
                  <span className="text-[#CCCCCC]">→</span>
                  <span className="text-[#111111] font-semibold">AIDA</span>
                  <span className="text-[#CCCCCC]">→</span>
                  <span className="text-[#555555]">Department Data &amp; Institutional Knowledge</span>
                  <span className="text-[#CCCCCC]">→</span>
                  <span className="text-[#16A34A] font-semibold">Structured Answer</span>
                </div>

                <div className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden shadow-sm">
                  <div className="px-5 py-3.5 border-b border-[#E5E5E5] flex items-center justify-between bg-[#FAFAFA]">
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#111111]" />
                      <span className="text-xs font-semibold text-[#111111]">AIDA</span>
                      <span className="text-xs text-[#AAAAAA]">—</span>
                      <span className="text-xs text-[#AAAAAA]">AIMETRA Intelligence &amp; Data Assistant</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#888888] bg-white px-2 py-0.5 rounded border border-[#E5E5E5]">
                      Context: Dept. Verified Records
                    </span>
                  </div>

                  {/* Sample Query Presets */}
                  <div className="px-5 py-2.5 bg-[#FCFCFC] border-b border-[#F0F0F0] flex flex-wrap gap-1.5 text-[10px]">
                    <span className="text-[#888888] py-0.5 mr-1 font-medium">Try:</span>
                    {[
                      "Show students working on LLM projects.",
                      "How many students have an 8+ CGPA?",
                      "Which certifications are most common?",
                      "Which students have computer vision research experience?",
                    ].map((sampleQuery, idx) => (
                      <span
                        key={idx}
                        className={`px-2.5 py-1 rounded-md border ${
                          idx === 0
                            ? "bg-[#111111] text-white border-[#111111]"
                            : "bg-white text-[#555555] border-[#E5E5E5]"
                        }`}
                      >
                        {sampleQuery}
                      </span>
                    ))}
                  </div>

                  <div className="px-5 py-4 border-b border-[#F0F0F0] bg-white">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#111111] flex items-center justify-center text-white text-[9px] font-bold shrink-0 mt-0.5">
                        U
                      </div>
                      <p className="text-sm text-[#333333] pt-0.5 font-medium">
                        Show students working on LLM projects with a CGPA above 8.0.
                      </p>
                    </div>
                  </div>
                  <div className="px-5 py-4">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-6 h-6 rounded-full bg-[#F5F5F5] border border-[#E5E5E5] flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="w-3 h-3 text-[#555555]" />
                      </div>
                      <p className="text-xs text-[#555555] pt-1">
                        Found <span className="font-semibold text-[#111111]">7 students</span> matching this criteria across active project records.
                      </p>
                    </div>
                    <div className="rounded-lg border border-[#EEEEEE] overflow-hidden sm:ml-9">
                      <div className="overflow-x-auto">
                        <div className="min-w-[360px]">
                          <div className="grid grid-cols-12 text-[10px] font-semibold uppercase tracking-wider text-[#AAAAAA] bg-[#FAFAFA] px-4 py-2.5 border-b border-[#EEEEEE]">
                            <span className="col-span-5">Name</span>
                            <span className="col-span-2">CGPA</span>
                            <span className="col-span-5">Project</span>
                          </div>
                          {[
                            { name: "Rahul Sharma", cgpa: "8.7", project: "LLM fine-tuning", sem: "Sem 6" },
                            { name: "Divya Nair", cgpa: "8.9", project: "RAG pipeline", sem: "Sem 6" },
                            { name: "Arjun Menon", cgpa: "8.4", project: "Prompt engineering", sem: "Sem 7" },
                            { name: "Shreya Iyer", cgpa: "8.2", project: "LLM evaluation", sem: "Sem 5" },
                          ].map((row, i) => (
                            <div key={row.name} className={`grid grid-cols-12 px-4 py-2.5 text-xs ${i < 3 ? "border-b border-[#F5F5F5]" : ""}`}>
                              <span className="col-span-5 font-medium text-[#111111] truncate pr-2">{row.name}</span>
                              <span className="col-span-2 text-[#333333] font-mono">{row.cgpa}</span>
                              <span className="col-span-5 text-[#666666] truncate">{row.project}</span>
                            </div>
                          ))}
                          <div className="px-4 py-2 bg-[#FAFAFA] border-t border-[#EEEEEE] flex items-center justify-between">
                            <span className="text-[10px] text-[#AAAAAA]">+3 more · sorted by CGPA</span>
                            <span className="text-[10px] text-[#888888] font-mono">Source: AIMETRA Projects DB + Academic Records</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="sm:ml-9 mt-4 flex flex-wrap gap-2">
                      {["Export as CSV","Show their certifications","Filter by semester"].map((q) => (
                        <span key={q} className="text-[11px] text-[#555555] bg-[#F5F5F5] border border-[#E5E5E5] rounded-md px-3 py-1 cursor-default">
                          {q}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="px-5 py-3 border-t border-[#F0F0F0] bg-[#FAFAFA] flex items-center justify-between text-[10px] text-[#888888]">
                    <span>AIDA finds, analyzes and presents. Decisions remain with authorized people.</span>
                    <span className="font-medium text-[#111111]">Evidence-backed visibility</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ ECOSYSTEM — One system. Multiple perspectives. ══ */}
        <section className="border-t border-[#E5E5E5] bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
              <div className="lg:col-span-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#AAAAAA] mb-6">
                  System architecture
                </p>
                <h2 className="text-3xl sm:text-4xl font-semibold text-[#111111] mb-6 leading-[1.2]">
                  One system.
                  <br />
                  Multiple perspectives.
                </h2>
                <p className="text-sm text-[#666666] leading-relaxed">
                  Each role accesses AIMETRA from a different perspective —
                  connected to the same institutional source of truth.
                </p>
              </div>
              <div className="lg:col-span-8">
                <div className="divide-y divide-[#E8E8E8] border-t border-[#E8E8E8]">
                  {[
                    { role: "Student", view: "My journey", desc: "Performance, skills, projects, achievements and career readiness — in one place." },
                    { role: "Faculty", view: "My students & expertise", desc: "Student oversight, mentorship, courses, research and academic engagement." },
                    { role: "Leadership", view: "My department", desc: "Department-wide visibility: performance, research, rankings and institutional trends." },
                    { role: "Alumni", view: "My network", desc: "Mentorship, community and knowledge exchange with the current department." },
                    { role: "Opportunity", view: "Find relevant talent", desc: "Evidence-based access to student capability — structured by skills and performance." },
                    { role: "AIDA", view: "Ask the system", desc: "Conversational intelligence — find, analyze and present institutional information." },
                  ].map((item) => (
                    <div key={item.role} className="flex items-start gap-6 py-5">
                      <div className="w-28 shrink-0">
                        <span className="text-xs font-semibold text-[#111111]">{item.role}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-[#888888] italic block mb-1">&ldquo;{item.view}&rdquo;</span>
                        <span className="text-xs text-[#555555] leading-relaxed">{item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ MANIFESTO ══ */}
        <section className="border-t border-[#E5E5E5] bg-[#F5F5F4]">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-28 lg:py-36">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#111111] leading-[1.15] mb-14 max-w-3xl">
              We believe academic information should not live in silos.
            </h2>
            <div className="space-y-5 max-w-xl">
              {[
                "A student is more than a CGPA.",
                "A project is more than a title.",
                "A faculty profile is more than a designation.",
                "Research is more than a publication list.",
                "An opportunity is more than a notice.",
                "A department is more than a dashboard.",
              ].map((line) => (
                <p key={line} className="text-base text-[#555555] leading-relaxed">{line}</p>
              ))}
            </div>
            <div className="mt-16 pt-10 border-t border-[#DDDDDD] max-w-xl">
              <p className="text-2xl font-semibold text-[#111111] mb-2">There is a system underneath it all.</p>
              <p className="text-base text-[#777777]">AIMETRA is built to connect it.</p>
            </div>
          </div>
        </section>

        {/* ══ CAPABILITIES — table format ══ */}
        <section className="border-t border-[#E5E5E5] bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
            <div className="mb-12">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#AAAAAA] mb-3">
                Platform capabilities
              </p>
              <h2 className="text-2xl sm:text-3xl font-semibold text-[#111111]">Built around evidence.</h2>
            </div>
            <div className="divide-y divide-[#EEEEEE] border-t border-[#EEEEEE]">
              {[
                { title: "AHP + TOPSIS Rankings", desc: "Multi-criteria student evaluation indexing CGPA, hackathons, peer-reviewed work and verified skills — not opinions.", tag: "Talent intelligence" },
                { title: "Opportunity Pipeline", desc: "Internships and placements connected directly to student profiles — evidence-based, not keyword-matched.", tag: "Career readiness" },
                { title: "QR Attendance & Events", desc: "Encrypted QR codes for contactless attendance, event registration and digital credential verification.", tag: "Operations" },
                { title: "Faculty → HOD Approvals", desc: "Multi-role governance with audit logging and diff inspections before any data is published to the system.", tag: "Governance" },
              ].map((cap) => (
                <div key={cap.title} className="flex items-start gap-6 py-6 sm:gap-12">
                  <div className="w-32 sm:w-40 shrink-0">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#CCCCCC]">{cap.tag}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-[#111111] mb-1">{cap.title}</h3>
                    <p className="text-sm text-[#666666] leading-relaxed">{cap.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ FINAL CTA ══ */}
        <section className="border-t border-[#E5E5E5] bg-[#111111]">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
            <div className="max-w-2xl">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white leading-[1.1] mb-6">
                See your department as a system.
              </h2>
              <p className="text-base text-[#888888] leading-relaxed mb-10 max-w-lg">
                Explore how AIMETRA connects education, talent, research and analytics
                in one institutional intelligence layer.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/login">
                  <Button className="h-12 px-8 rounded-lg bg-white text-[#111111] hover:bg-neutral-100 font-medium text-sm">
                    Explore AIMETRA
                  </Button>
                </Link>
                <Link href="/programs">
                  <Button
                    variant="outline"
                    className="h-12 px-8 rounded-lg border-[#333333] text-[#888888] bg-transparent hover:bg-[#1A1A1A] hover:text-white font-medium text-sm"
                  >
                    View the platform
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>
      <PublicFooter />
    </div>
  )
}
