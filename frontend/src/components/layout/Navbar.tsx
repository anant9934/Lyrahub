"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { 
  GraduationCap, 
  Briefcase, 
  Trophy, 
  Users, 
  Calendar, 
  BookOpen, 
  Sparkles, 
  Menu, 
  X, 
  ShieldCheck, 
  User as UserIcon, 
  LogOut,
  ChevronDown
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [academicsOpen, setAcademicsOpen] = useState(false);
  const [opportunitiesOpen, setOpportunitiesOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);

  // Check roles
  const rolesList: string[] = user?.roles ? user.roles.map((r: any) => r.name?.toLowerCase()) : [];
  const isAdminOrHOD = rolesList.includes("admin") || rolesList.includes("hod") || user?.email === "admin@aiml.hub";
  const isStudent = rolesList.includes("student") || (!isAdminOrHOD && user);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/dashboard" className="flex items-center space-x-2 group">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <span className="text-sm font-bold text-ink tracking-[0.1em] uppercase">AIMETRA</span>
                <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary uppercase">
                  AI &amp; ML
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              href="/dashboard"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pathname === "/dashboard"
                  ? "bg-primary/10 text-primary"
                  : "text-ink-500 hover:text-ink hover:bg-canvas"
              }`}
            >
              Dashboard
            </Link>

            <Link
              href="/leadership"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pathname.startsWith("/leadership")
                  ? "bg-primary/10 text-primary"
                  : "text-ink-500 hover:text-ink hover:bg-canvas"
              }`}
            >
              Leadership
            </Link>


            {/* Academics Dropdown */}
            <div className="relative group" onMouseEnter={() => setAcademicsOpen(true)} onMouseLeave={() => setAcademicsOpen(false)}>
              <button 
                className="flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium text-ink-500 hover:text-ink hover:bg-canvas transition-colors"
                onClick={() => setAcademicsOpen(!academicsOpen)}
              >
                <GraduationCap className="w-4 h-4 text-ink-400" />
                <span>Academics</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>
              {academicsOpen && (
                <div className="absolute left-0 mt-1 w-52 bg-surface rounded-lg shadow-dropdown border border-border py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <Link
                    href="/programs"
                    className="flex items-center px-4 py-2 text-sm text-ink-700 hover:bg-canvas hover:text-primary"
                  >
                    <BookOpen className="w-4 h-4 mr-2.5 text-primary" />
                    Degree Programs
                  </Link>
                  <Link
                    href="/courses"
                    className="flex items-center px-4 py-2 text-sm text-ink-700 hover:bg-canvas hover:text-primary"
                  >
                    <GraduationCap className="w-4 h-4 mr-2.5 text-primary" />
                    Course Catalog & Syllabus
                  </Link>
                  {isAdminOrHOD && (
                    <div className="border-t border-border mt-1 pt-1">
                      <div className="px-4 py-1 text-xs font-semibold text-ink-400 uppercase tracking-wider">Management</div>
                      <Link href="/programs/manage" className="flex items-center px-4 py-1.5 text-xs text-ink-700 hover:bg-canvas hover:text-primary">
                        Manage Programs
                      </Link>
                      <Link href="/courses/manage" className="flex items-center px-4 py-1.5 text-xs text-ink-700 hover:bg-canvas hover:text-primary">
                        Manage Courses & Import
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Opportunities Dropdown */}
            <div className="relative group" onMouseEnter={() => setOpportunitiesOpen(true)} onMouseLeave={() => setOpportunitiesOpen(false)}>
              <button 
                className="flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium text-ink-500 hover:text-ink hover:bg-canvas transition-colors"
                onClick={() => setOpportunitiesOpen(!opportunitiesOpen)}
              >
                <Briefcase className="w-4 h-4 text-ink-400" />
                <span>Opportunities</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>
              {opportunitiesOpen && (
                <div className="absolute left-0 mt-1 w-56 bg-surface rounded-lg shadow-dropdown border border-border py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <Link
                    href="/opportunities"
                    className="flex items-center px-4 py-2 text-sm text-ink-700 hover:bg-canvas hover:text-primary"
                  >
                    <Briefcase className="w-4 h-4 mr-2.5 text-primary" />
                    Browse Internships & Training
                  </Link>
                  <Link
                    href="/opportunities/me"
                    className="flex items-center px-4 py-2 text-sm text-ink-700 hover:bg-canvas hover:text-primary"
                  >
                    <UserIcon className="w-4 h-4 mr-2.5 text-primary" />
                    My Applications
                  </Link>
                  <Link
                    href="/opportunities/create"
                    className="flex items-center px-4 py-2 text-sm text-ink-700 hover:bg-canvas hover:text-primary"
                  >
                    <Sparkles className="w-4 h-4 mr-2.5 text-primary" />
                    Post New Opportunity
                  </Link>
                  {isAdminOrHOD && (
                    <div className="border-t border-border mt-1 pt-1">
                      <Link href="/opportunities/verify" className="flex items-center px-4 py-1.5 text-xs font-medium text-amber-600 hover:bg-canvas">
                        <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                        Verification Queue
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Department Hub & Community */}
            <div className="relative group" onMouseEnter={() => setCommunityOpen(true)} onMouseLeave={() => setCommunityOpen(false)}>
              <button 
                className="flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium text-ink-500 hover:text-ink hover:bg-canvas transition-colors"
                onClick={() => setCommunityOpen(!communityOpen)}
              >
                <Users className="w-4 h-4 text-ink-400" />
                <span>Community</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>
              {communityOpen && (
                <div className="absolute left-0 mt-1 w-52 bg-surface rounded-lg shadow-dropdown border border-border py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <Link href="/ranking" className="flex items-center px-4 py-2 text-sm text-ink-700 hover:bg-canvas hover:text-primary">
                    <Trophy className="w-4 h-4 mr-2.5 text-amber-500" />
                    Department Rankings
                  </Link>
                  <Link href="/projects" className="flex items-center px-4 py-2 text-sm text-ink-700 hover:bg-canvas hover:text-primary">
                    <BookOpen className="w-4 h-4 mr-2.5 text-blue-500" />
                    Project Showcase
                  </Link>
                  <Link href="/alumni" className="flex items-center px-4 py-2 text-sm text-ink-700 hover:bg-canvas hover:text-primary">
                    <Users className="w-4 h-4 mr-2.5 text-emerald-500" />
                    Alumni Network
                  </Link>
                  <Link href="/groups" className="flex items-center px-4 py-2 text-sm text-ink-700 hover:bg-canvas hover:text-primary">
                    <Users className="w-4 h-4 mr-2.5 text-purple-500" />
                    Clubs & Study Groups
                  </Link>
                  <Link href="/events" className="flex items-center px-4 py-2 text-sm text-ink-700 hover:bg-canvas hover:text-primary">
                    <Calendar className="w-4 h-4 mr-2.5 text-indigo-500" />
                    Events & Seminars
                  </Link>
                  <Link href="/achievements" className="flex items-center px-4 py-2 text-sm text-ink-700 hover:bg-canvas hover:text-primary">
                    <Trophy className="w-4 h-4 mr-2.5 text-yellow-500" />
                    Achievements & Badges
                  </Link>
                  <div className="border-t border-border mt-1 pt-1">
                    <Link href="/stories" className="flex items-center px-4 py-1.5 text-xs text-ink-600 hover:bg-canvas hover:text-primary">
                      Success Stories
                    </Link>
                    <Link href="/testimonials" className="flex items-center px-4 py-1.5 text-xs text-ink-600 hover:bg-canvas hover:text-primary">
                      Testimonials
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User Profile / Status */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3 bg-canvas border border-border rounded-full pl-3 pr-1.5 py-1">
                <div className="text-left">
                  <div className="text-xs font-semibold text-ink truncate max-w-[130px]">{user.email}</div>
                  <div className="text-[10px] text-ink-500 flex items-center space-x-1">
                    {isAdminOrHOD ? (
                      <span className="inline-block px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 font-semibold">
                        Admin / HOD
                      </span>
                    ) : (
                      <span className="inline-block px-1.5 py-0.2 rounded bg-primary/10 text-primary font-semibold">
                        Student
                      </span>
                    )}
                  </div>
                </div>
                <Link
                  href="/dashboard/profile"
                  className="p-1.5 rounded-full hover:bg-surface text-ink-500 hover:text-primary transition-colors"
                  title="My Profile"
                >
                  <UserIcon className="w-4 h-4" />
                </Link>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-full hover:bg-red-50 text-ink-400 hover:text-red-600 transition-colors"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="text-sm font-medium px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-ink-500 hover:text-ink hover:bg-canvas"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-surface px-4 pt-2 pb-6 space-y-3">
          <div className="space-y-1">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-ink hover:bg-canvas"
            >
              Dashboard
            </Link>
            <Link
              href="/programs"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-ink-700 hover:bg-canvas"
            >
              🎓 Degree Programs
            </Link>
            <Link
              href="/courses"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-ink-700 hover:bg-canvas"
            >
              📚 Course Catalog
            </Link>
            <Link
              href="/opportunities"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-ink-700 hover:bg-canvas"
            >
              💼 Opportunities & Internships
            </Link>
            <Link
              href="/ranking"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-ink-700 hover:bg-canvas"
            >
              🥇 Student Rankings
            </Link>
            <Link
              href="/projects"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-ink-700 hover:bg-canvas"
            >
              💻 Projects
            </Link>
            <Link
              href="/alumni"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-ink-700 hover:bg-canvas"
            >
              🤝 Alumni
            </Link>
            <Link
              href="/groups"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-ink-700 hover:bg-canvas"
            >
              👥 Clubs & Groups
            </Link>
            <Link
              href="/events"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-ink-700 hover:bg-canvas"
            >
              📅 Events
            </Link>
            <Link
              href="/dashboard/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-ink-700 hover:bg-canvas"
            >
              👤 My Profile
            </Link>
          </div>
          {user && (
            <div className="pt-4 border-t border-border flex items-center justify-between">
              <span className="text-xs text-ink-500">{user.email}</span>
              <button
                onClick={logout}
                className="text-xs text-red-600 font-medium px-3 py-1 rounded bg-red-50"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
