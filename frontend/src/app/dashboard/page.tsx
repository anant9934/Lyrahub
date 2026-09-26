"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { 
  GraduationCap, 
  BookOpen, 
  Briefcase, 
  Trophy, 
  Users, 
  Calendar, 
  Sparkles, 
  ShieldCheck, 
  User as UserIcon, 
  ArrowRight,
  PlusCircle,
  FileCheck2,
  FolderGit2,
  Medal,
  Star,
  Quote,
  Clock,
  Compass
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();

  const rolesList: string[] = user?.roles ? user.roles.map((r: any) => r.name?.toLowerCase()) : [];
  const isAdminOrHOD = rolesList.includes("admin") || rolesList.includes("hod") || user?.email === "admin@aiml.hub";
  const isStudent = rolesList.includes("student") || (!isAdminOrHOD && user);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-surface via-surface to-primary/5 p-6 sm:p-8 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">👋</span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                Welcome to Lyrahub, {user?.email?.split("@")[0]}
              </h1>
            </div>
            <p className="text-sm sm:text-base text-ink-500 max-w-2xl">
              The centralized intelligence platform for the AI/ML Department. Explore degree curriculums, apply for verified internships, track student rankings, and connect with faculty and alumni.
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-2 shrink-0">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              {isAdminOrHOD ? "🛡️ Department Administrator / HOD" : "🎓 Student Account"}
            </div>
            <span className="text-xs text-ink-400">
              Account: {user?.email}
            </span>
          </div>
        </div>
      </div>

      {/* Admin / HOD Command Center (Only if Admin/HOD) */}
      {isAdminOrHOD && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-ink">Admin & HOD Command Center</h2>
            </div>
            <span className="text-xs font-medium text-amber-600 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
              Privileged Actions
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/programs/manage"
              className="group p-5 rounded-xl border border-border bg-surface hover:border-primary/40 hover:shadow-card transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                  <BookOpen className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-ink-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-base font-semibold text-ink group-hover:text-primary transition-colors">
                Manage Degree Programs
              </h3>
              <p className="text-xs text-ink-500 mt-1">
                Create & configure B.Tech, M.Tech, and Minor catalogs, update eligibility, and map semester courses.
              </p>
            </Link>

            <Link
              href="/courses/manage"
              className="group p-5 rounded-xl border border-border bg-surface hover:border-primary/40 hover:shadow-card transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-ink-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-base font-semibold text-ink group-hover:text-primary transition-colors">
                Manage Courses & CSV Import
              </h3>
              <p className="text-xs text-ink-500 mt-1">
                Add course units, update syllabi, assign teaching faculty, or perform bulk CSV syllabus imports.
              </p>
            </Link>

            <Link
              href="/opportunities/verify"
              className="group p-5 rounded-xl border border-border bg-surface hover:border-primary/40 hover:shadow-card transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-ink-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-base font-semibold text-ink group-hover:text-primary transition-colors">
                Verify Opportunities
              </h3>
              <p className="text-xs text-ink-500 mt-1">
                Review pending internship and training listings posted by faculty and alumni before public publishing.
              </p>
            </Link>

            <Link
              href="/achievements/verify"
              className="group p-5 rounded-xl border border-border bg-surface hover:border-primary/40 hover:shadow-card transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600">
                  <Trophy className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-ink-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-base font-semibold text-ink group-hover:text-primary transition-colors">
                Review Student Achievements
              </h3>
              <p className="text-xs text-ink-500 mt-1">
                Verify student hackathon certificates, research publications, and approve credit points.
              </p>
            </Link>

            <Link
              href="/events/manage"
              className="group p-5 rounded-xl border border-border bg-surface hover:border-primary/40 hover:shadow-card transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                  <Calendar className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-ink-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-base font-semibold text-ink group-hover:text-primary transition-colors">
                Manage Events & Seminars
              </h3>
              <p className="text-xs text-ink-500 mt-1">
                Schedule departmental workshops, guest talks, and track student registration lists.
              </p>
            </Link>

            <Link
              href="/groups/manage"
              className="group p-5 rounded-xl border border-border bg-surface hover:border-primary/40 hover:shadow-card transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-600">
                  <Users className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-ink-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-base font-semibold text-ink group-hover:text-primary transition-colors">
                Manage Clubs & Groups
              </h3>
              <p className="text-xs text-ink-500 mt-1">
                Oversee student AI clubs, assign group leads, and monitor technical activities.
              </p>
            </Link>
          </div>
        </section>
      )}

      {/* Student Action Bar */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Compass className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-ink">Quick Launchpad</h2>
          </div>
          <span className="text-xs text-ink-400">Direct student workflows</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            href="/dashboard/profile"
            className="flex flex-col items-center text-center p-4 rounded-xl border border-border bg-surface hover:bg-canvas hover:border-primary/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2 group-hover:scale-110 transition-transform">
              <UserIcon className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-ink">My Profile</span>
            <span className="text-[10px] text-ink-400 mt-0.5">Bio & Resume</span>
          </Link>

          <Link
            href="/opportunities"
            className="flex flex-col items-center text-center p-4 rounded-xl border border-border bg-surface hover:bg-canvas hover:border-primary/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-2 group-hover:scale-110 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-ink">Internships</span>
            <span className="text-[10px] text-ink-400 mt-0.5">Explore openings</span>
          </Link>

          <Link
            href="/opportunities/me"
            className="flex flex-col items-center text-center p-4 rounded-xl border border-border bg-surface hover:bg-canvas hover:border-primary/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 mb-2 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-ink">My Applications</span>
            <span className="text-[10px] text-ink-400 mt-0.5">Status tracker</span>
          </Link>

          <Link
            href="/achievements/submit"
            className="flex flex-col items-center text-center p-4 rounded-xl border border-border bg-surface hover:bg-canvas hover:border-primary/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 mb-2 group-hover:scale-110 transition-transform">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-ink">Submit Award</span>
            <span className="text-[10px] text-ink-400 mt-0.5">Earn badges</span>
          </Link>

          <Link
            href="/projects/create"
            className="flex flex-col items-center text-center p-4 rounded-xl border border-border bg-surface hover:bg-canvas hover:border-primary/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600 mb-2 group-hover:scale-110 transition-transform">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-ink">Post Project</span>
            <span className="text-[10px] text-ink-400 mt-0.5">Showcase demo</span>
          </Link>

          <Link
            href="/opportunities/create"
            className="flex flex-col items-center text-center p-4 rounded-xl border border-border bg-surface hover:bg-canvas hover:border-primary/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600 mb-2 group-hover:scale-110 transition-transform">
              <PlusCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-ink">Post Opening</span>
            <span className="text-[10px] text-ink-400 mt-0.5">For faculty & alumni</span>
          </Link>
        </div>
      </section>

      {/* Main Department Modules Grid */}
      <section className="space-y-6">
        <h2 className="text-lg font-bold text-ink flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <span>Department Ecosystem & Modules</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card: Degree Programs */}
          <div className="rounded-xl border border-border bg-surface p-6 flex flex-col justify-between hover:shadow-card transition-all">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-ink">Academic Programs</h3>
              <p className="text-xs text-ink-500 leading-relaxed">
                Explore B.Tech CSE (AI & ML), M.Tech AI & Data Science, and Minor in AI/ML degrees with full semester curriculums, credit structures, and career outcomes.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
              <Link href="/programs" className="text-xs font-semibold text-primary hover:underline flex items-center">
                Browse Programs <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
              {isAdminOrHOD && (
                <Link href="/programs/manage" className="text-xs text-ink-400 hover:text-ink">
                  Admin Setup
                </Link>
              )}
            </div>
          </div>

          {/* Card: Courses Catalog */}
          <div className="rounded-xl border border-border bg-surface p-6 flex flex-col justify-between hover:shadow-card transition-all">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-ink">Course Catalog & Syllabi</h3>
              <p className="text-xs text-ink-500 leading-relaxed">
                Detailed catalog of departmental courses (CS101, CS201, CS301...) with modular syllabus topics, textbooks, laboratory exercises, and assigned faculty professors.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
              <Link href="/courses" className="text-xs font-semibold text-primary hover:underline flex items-center">
                Explore Courses <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
              {isAdminOrHOD && (
                <Link href="/courses/manage" className="text-xs text-ink-400 hover:text-ink">
                  Manage & CSV
                </Link>
              )}
            </div>
          </div>

          {/* Card: Opportunities */}
          <div className="rounded-xl border border-border bg-surface p-6 flex flex-col justify-between hover:shadow-card transition-all">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-ink">Internships & Training</h3>
              <p className="text-xs text-ink-500 leading-relaxed">
                Apply for industry internships, faculty research apprenticeships, and summer trainings with instant application tracking and deadline alerts.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
              <Link href="/opportunities" className="text-xs font-semibold text-primary hover:underline flex items-center">
                View Openings <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
              <Link href="/opportunities/me" className="text-xs text-ink-400 hover:text-ink">
                My Tracker
              </Link>
            </div>
          </div>

          {/* Card: Student Rankings */}
          <div className="rounded-xl border border-border bg-surface p-6 flex flex-col justify-between hover:shadow-card transition-all">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-600">
                <Medal className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-ink">Department Rankings</h3>
              <p className="text-xs text-ink-500 leading-relaxed">
                Objective department leaderboard computing student rankings based on academic CGPA, verified hackathons, project contributions, and research output.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
              <Link href="/ranking" className="text-xs font-semibold text-primary hover:underline flex items-center">
                View Standings <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>

          {/* Card: Projects Showcase */}
          <div className="rounded-xl border border-border bg-surface p-6 flex flex-col justify-between hover:shadow-card transition-all">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
                <FolderGit2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-ink">Capstone & Research Projects</h3>
              <p className="text-xs text-ink-500 leading-relaxed">
                Showcase of student machine learning repositories, demos, architecture documents, and peer member attributions.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
              <Link href="/projects" className="text-xs font-semibold text-primary hover:underline flex items-center">
                Explore Projects <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
              <Link href="/projects/create" className="text-xs text-ink-400 hover:text-ink">
                Submit Repo
              </Link>
            </div>
          </div>

          {/* Card: Alumni Directory */}
          <div className="rounded-xl border border-border bg-surface p-6 flex flex-col justify-between hover:shadow-card transition-all">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-ink">Alumni Network & Mentors</h3>
              <p className="text-xs text-ink-500 leading-relaxed">
                Connect with graduates now working at Microsoft, Google, AWS, and AI startups who offer guidance, resume reviews, and referrals.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
              <Link href="/alumni" className="text-xs font-semibold text-primary hover:underline flex items-center">
                Browse Alumni <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
              <Link href="/alumni/register" className="text-xs text-ink-400 hover:text-ink">
                Join Directory
              </Link>
            </div>
          </div>

          {/* Card: Student Clubs & Groups */}
          <div className="rounded-xl border border-border bg-surface p-6 flex flex-col justify-between hover:shadow-card transition-all">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-600">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-ink">Clubs & Reading Groups</h3>
              <p className="text-xs text-ink-500 leading-relaxed">
                Join specialized student circles like Computer Vision Club, NLP Reading Group, and Kaggle competitive teams.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
              <Link href="/groups" className="text-xs font-semibold text-primary hover:underline flex items-center">
                Explore Groups <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>

          {/* Card: Events & Hackathons */}
          <div className="rounded-xl border border-border bg-surface p-6 flex flex-col justify-between hover:shadow-card transition-all">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-ink">Events & Workshops</h3>
              <p className="text-xs text-ink-500 leading-relaxed">
                Calendar of guest technical seminars, hackathons, and symposiums with one-click RSVP and digital badge certificates.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
              <Link href="/events" className="text-xs font-semibold text-primary hover:underline flex items-center">
                View Calendar <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>

          {/* Card: Success Stories & Testimonials */}
          <div className="rounded-xl border border-border bg-surface p-6 flex flex-col justify-between hover:shadow-card transition-all">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600">
                <Quote className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-ink">Success Stories & Voices</h3>
              <p className="text-xs text-ink-500 leading-relaxed">
                Inspiring placement journeys, high-package offers, patent grants, and feedback from recruiters and graduates.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
              <Link href="/stories" className="text-xs font-semibold text-primary hover:underline flex items-center">
                Read Stories <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
              <Link href="/testimonials" className="text-xs text-ink-400 hover:text-ink">
                Testimonials
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
