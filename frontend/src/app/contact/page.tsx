"use client"

import React, { useState } from "react"
import Link from "next/link"
import { PublicNav } from "@/components/layout/PublicNav"
import { PublicFooter } from "@/components/layout/PublicFooter"
import { PublicShowcaseHero } from "@/components/layout/PublicShowcaseHero"
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
  ArrowRight,
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
    <div className="aimetra-public theme-contact min-h-screen bg-white text-[#0F172A] flex flex-col">
      <PublicNav />

      <main className="flex-1">
        {/* Header */}
        <PublicShowcaseHero
          eyebrow="Start a conversation"
          title={<>Let&apos;s <span className="text-[#ec7a16]">connect.</span></>}
          description="Reach the right team for admissions, academic programs, research, or a new collaboration."
          tone="cream"
          visual="campus"
          visualLabel="We are here to help"
        >
          <a href="#contact-form" className="inline-flex h-11 items-center rounded-full bg-[#1478ef] px-6 text-xs font-bold text-white transition hover:bg-[#075fc9]">Send a message <ArrowRight className="ml-2 h-4 w-4" /></a>
        </PublicShowcaseHero>

        {/* Contact info + Form grid */}
        <section id="contact-form" className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Left: Contact Info & Desks */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-[#0F172A] mb-4">
                  Department Secretariat &amp; Desks
                </h2>
                <p className="text-xs text-[#526783] leading-relaxed mb-6">
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
                      className="border border-[#DCE5F1] rounded-xl p-4 bg-white hover:border-[#0F172A] transition-colors"
                    >
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-[#71849B] mb-1">
                        {d.desk}
                      </div>
                      <div className="text-sm font-semibold text-[#0F172A]">{d.person}</div>
                      <div className="mt-2 pt-2 border-t border-[#EDF4FC] flex flex-col gap-1 text-xs text-[#666666]">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-[#71849B]" />
                          <span className="font-mono text-[11px]">{d.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#71849B]" />
                          <span>{d.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Physical Campus Coordinates */}
              <div className="border border-[#DCE5F1] rounded-xl p-6 bg-[#F6F8FC] space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#0F172A] uppercase tracking-wider">
                  <Building className="w-4 h-4" />
                  <span>Campus Address</span>
                </div>
                <p className="text-xs text-[#526783] leading-relaxed">
                  Department of Artificial Intelligence &amp; Machine Learning
                  <br />
                  Academic Block 4, Innovation Campus
                  <br />
                  Technology Corridor, Outer Ring Road
                  <br />
                  Bengaluru 560064, Karnataka, India
                </p>
                <div className="pt-2 border-t border-[#DCE5F1] flex items-center gap-2 text-xs text-[#667A93]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Office Hours: Mon – Fri, 8:30 AM – 5:30 PM IST</span>
                </div>
              </div>
            </div>

            {/* Right: Message Form */}
            <div className="lg:col-span-7">
              <div className="border border-[#DCE5F1] rounded-2xl p-8 sm:p-10 bg-white">
                {formSubmitted ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e7f3ff] text-[#1478ef]">
                      <MessageSquare className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#0F172A]">
                      Message ready for review
                    </h3>
                    <p className="text-xs text-[#526783] max-w-md mx-auto leading-relaxed">
                      This form is a preview and has not sent your inquiry. Use a verified department email address to send it, or return to edit your message.
                    </p>
                    <div className="pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setFormSubmitted(false)
                        }}
                        className="text-xs"
                      >
                        Edit message
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-[#0F172A]">
                        Write an Institutional Inquiry
                      </h2>
                      <p className="text-xs text-[#526783] mt-1">
                        Compose your message here. Sending will be available when the department connects this form.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#0F172A]">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Dr. Jane Doe"
                          className="w-full h-10 px-3 rounded-lg border border-[#DCE5F1] bg-[#F6F8FC] text-xs text-[#0F172A] focus:outline-none focus:border-[#0F172A]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#0F172A]">
                          Institutional / Official Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="name@university.edu or enterprise.com"
                          className="w-full h-10 px-3 rounded-lg border border-[#DCE5F1] bg-[#F6F8FC] text-xs text-[#0F172A] focus:outline-none focus:border-[#0F172A]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#0F172A]">Inquirer Affiliation *</label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg border border-[#DCE5F1] bg-[#F6F8FC] text-xs text-[#0F172A] focus:outline-none focus:border-[#0F172A]"
                      >
                        <option value="student">Current / Prospective Student</option>
                        <option value="faculty">Academic Faculty / Researcher</option>
                        <option value="industry">Industry Partner / Corporate Recruiter</option>
                        <option value="alumni">AIMETRA Alumnus</option>
                        <option value="media">Press / Conference Organizer</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#0F172A]">Subject *</label>
                      <input
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="e.g. Inquiry regarding M.Tech AI Capstone Sponsorship"
                        className="w-full h-10 px-3 rounded-lg border border-[#DCE5F1] bg-[#F6F8FC] text-xs text-[#0F172A] focus:outline-none focus:border-[#0F172A]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#0F172A]">Message *</label>
                      <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Please detail your inquiry, specific program, or collaboration proposal..."
                        className="w-full p-3 rounded-lg border border-[#DCE5F1] bg-[#F6F8FC] text-xs text-[#0F172A] focus:outline-none focus:border-[#0F172A] leading-relaxed"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="h-11 w-full rounded-full bg-[#1478ef] text-xs font-bold text-white hover:bg-[#075fc9]"
                    >
                      <Send className="w-3.5 h-3.5 mr-2" />
                      Preview message
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
