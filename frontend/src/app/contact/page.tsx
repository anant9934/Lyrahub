"use client"

import React, { useState } from "react"
import Link from "next/link"
import { PublicNav } from "@/components/layout/PublicNav"
import { PublicFooter } from "@/components/layout/PublicFooter"
import { Button } from "@/components/ui/button"
import {
  Mail,
  MapPin,
  Phone,
  Clock,
  Building,
  CheckCircle2,
  Send,
  MessageSquare,
  ShieldCheck,
  Globe,
} from "lucide-react"

export default function ContactPage() {
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "student",
    subject: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-white text-[#111111] flex flex-col">
      <PublicNav />

      <main className="flex-1">
        {/* Header */}
        <section className="border-b border-[#E5E5E5] bg-[#FAFAFA] py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#888888] mb-3">
                Institutional Inquiries &amp; Directory
              </p>
              <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#111111] mb-4">
                Contact the Department
              </h1>
              <p className="text-sm sm:text-base text-[#555555] leading-relaxed">
                Connect with our academic chairs, research liaisons, laboratory administrators, or
                the HOD secretariat for admissions, sponsored research, and institutional collaborations.
              </p>
            </div>
          </div>
        </section>

        {/* Contact info + Form grid */}
        <section className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Left: Contact Info & Desks */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-[#111111] mb-4">
                  Department Secretariat &amp; Desks
                </h2>
                <p className="text-xs text-[#555555] leading-relaxed mb-6">
                  Select the appropriate point of contact based on the nature of your academic,
                  research, or administrative inquiry.
                </p>

                <div className="space-y-4">
                  {[
                    {
                      desk: "HOD Secretariat",
                      person: "Office of Dr. K. S. Ramanathan",
                      email: "hod.aiml@institution.edu",
                      location: "Academic Block 4, Suite 401",
                    },
                    {
                      desk: "Academic Programs & Curriculum",
                      person: "Dr. Vikramaditya Sen, Head of Studies",
                      email: "academics.aiml@institution.edu",
                      location: "Academic Block 4, Suite 405",
                    },
                    {
                      desk: "Sponsored Research & Grants",
                      person: "Research Affairs & Lab Directorate",
                      email: "research.aiml@institution.edu",
                      location: "Academic Block 4, Suite 205",
                    },
                    {
                      desk: "Industry Relations & Placements",
                      person: "Corporate Career Office",
                      email: "careers.aiml@institution.edu",
                      location: "Innovation Annex, Room 102",
                    },
                  ].map((d, i) => (
                    <div
                      key={i}
                      className="border border-[#E5E5E5] rounded-xl p-4 bg-white hover:border-[#111111] transition-colors"
                    >
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-[#888888] mb-1">
                        {d.desk}
                      </div>
                      <div className="text-sm font-semibold text-[#111111]">{d.person}</div>
                      <div className="mt-2 pt-2 border-t border-[#F5F5F5] flex flex-col gap-1 text-xs text-[#666666]">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-[#888888]" />
                          <span className="font-mono text-[11px]">{d.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#888888]" />
                          <span>{d.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Physical Campus Coordinates */}
              <div className="border border-[#E5E5E5] rounded-xl p-6 bg-[#FAFAFA] space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#111111] uppercase tracking-wider">
                  <Building className="w-4 h-4" />
                  <span>Campus Address</span>
                </div>
                <p className="text-xs text-[#555555] leading-relaxed">
                  Department of Artificial Intelligence &amp; Machine Learning
                  <br />
                  Academic Block 4, Innovation Campus
                  <br />
                  Technology Corridor, Outer Ring Road
                  <br />
                  Bengaluru 560064, Karnataka, India
                </p>
                <div className="pt-2 border-t border-[#E5E5E5] flex items-center gap-2 text-xs text-[#777777]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Office Hours: Mon – Fri, 8:30 AM – 5:30 PM IST</span>
                </div>
              </div>
            </div>

            {/* Right: Message Form */}
            <div className="lg:col-span-7">
              <div className="border border-[#E5E5E5] rounded-2xl p-8 sm:p-10 bg-white">
                {formSubmitted ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#111111]">
                      Inquiry Dispatched Successfully
                    </h3>
                    <p className="text-xs text-[#555555] max-w-md mx-auto leading-relaxed">
                      Thank you for contacting the AIMETRA department. A confirmation has been logged,
                      and the relevant secretariat desk will respond to <strong>{formData.email}</strong> within 1–2 academic working days.
                    </p>
                    <div className="pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setFormSubmitted(false)
                          setFormData({ name: "", email: "", role: "student", subject: "", message: "" })
                        }}
                        className="text-xs"
                      >
                        Send Another Inquiry
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-[#111111]">
                        Submit an Institutional Inquiry
                      </h2>
                      <p className="text-xs text-[#555555] mt-1">
                        All communications are securely routed to the designated faculty or administrative office.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#111111]">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Dr. Jane Doe"
                          className="w-full h-10 px-3 rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#111111]">
                          Institutional / Official Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="name@university.edu or enterprise.com"
                          className="w-full h-10 px-3 rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#111111]">Inquirer Affiliation *</label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                      >
                        <option value="student">Current / Prospective Student</option>
                        <option value="faculty">Academic Faculty / Researcher</option>
                        <option value="industry">Industry Partner / Corporate Recruiter</option>
                        <option value="alumni">AIMETRA Alumnus</option>
                        <option value="media">Press / Conference Organizer</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#111111]">Subject *</label>
                      <input
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="e.g. Inquiry regarding M.Tech AI Capstone Sponsorship"
                        className="w-full h-10 px-3 rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#111111]">Message *</label>
                      <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Please detail your inquiry, specific program, or collaboration proposal..."
                        className="w-full p-3 rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] text-xs text-[#111111] focus:outline-none focus:border-[#111111] leading-relaxed"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11 bg-[#111111] text-white hover:bg-neutral-800 text-xs font-medium"
                    >
                      <Send className="w-3.5 h-3.5 mr-2" />
                      Submit Formal Inquiry
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
