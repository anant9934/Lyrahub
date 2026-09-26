'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  Award,
  Briefcase,
  Layers,
  GraduationCap,
  Users,
  CheckCircle2,
  Calendar,
  ChevronRight
} from 'lucide-react';
import api from '@/lib/api';
import { ProgramHero } from '@/components/features/programs/ProgramHero';
import { CurriculumTable } from '@/components/features/programs/CurriculumTable';
import { OutcomesList } from '@/components/features/programs/OutcomesList';

export default function ProgramDetailPage() {
  const { slug } = useParams();
  const [program, setProgram] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'outcomes' | 'careers' | 'faculty'>('overview');

  useEffect(() => {
    async function loadProgram() {
      try {
        setLoading(true);
        const res = await api.get(`/programs/${slug}`);
        setProgram(res.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Program not found');
      } finally {
        setLoading(false);
      }
    }
    if (slug) {
      loadProgram();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F2F1] py-12 px-4 max-w-7xl mx-auto">
        <div className="h-64 bg-white rounded-3xl border border-[#D6D6D6] animate-pulse mb-8" />
        <div className="h-96 bg-white rounded-2xl border border-[#D6D6D6] animate-pulse" />
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="min-h-screen bg-[#F2F2F1] py-16 px-4">
        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-[#D6D6D6] p-8 text-center">
          <GraduationCap className="w-12 h-12 text-[#9A9A9A] mx-auto mb-3" />
          <h2 className="text-xl font-bold text-[#1E1E1E] mb-2">Program Not Found</h2>
          <p className="text-sm text-[#5C5C5C] mb-6">{error || "The requested program could not be located."}</p>
          <Link
            href="/programs"
            className="px-4 py-2 rounded-xl bg-[#1E1E1E] text-white text-sm font-semibold"
          >
            Back to Programs
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'curriculum', label: 'Curriculum', icon: Layers },
    { id: 'outcomes', label: 'Outcomes (POs/PSOs)', icon: Award },
    { id: 'careers', label: 'Careers & Roles', icon: Briefcase },
    { id: 'faculty', label: 'Faculty & Mentors', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#F2F2F1] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero */}
        <ProgramHero
          name={program.name}
          short_name={program.short_name}
          code={program.code}
          degree={program.degree}
          level={program.level}
          duration_years={program.duration_years}
          total_credits={program.total_credits}
          cover_image_url={program.cover_image_url}
          brochure_url={program.brochure_url}
          description={program.description}
        />

        {/* Tab Navigation */}
        <div className="flex border-b border-[#D6D6D6] mb-8 overflow-x-auto gap-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                  isActive
                    ? 'border-[#1E1E1E] text-[#1E1E1E]'
                    : 'border-transparent text-[#7A7A7A] hover:text-[#1E1E1E] hover:border-[#D6D6D6]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#1E1E1E]' : 'text-[#9A9A9A]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-[#D6D6D6] p-6 md:p-8">
                <h3 className="text-xl font-bold text-[#1E1E1E] mb-4">About this Program</h3>
                <p className="text-sm md:text-base text-[#3A3A3A] leading-relaxed whitespace-pre-line">
                  {program.description || 'Program overview and academic structure details.'}
                </p>
              </div>

              {program.eligibility && (
                <div className="bg-white rounded-2xl border border-[#D6D6D6] p-6 md:p-8">
                  <h3 className="text-xl font-bold text-[#1E1E1E] mb-4">Eligibility Criteria</h3>
                  <div className="text-sm text-[#3A3A3A] leading-relaxed whitespace-pre-line">
                    {program.eligibility}
                  </div>
                </div>
              )}

              {program.admission_process && (
                <div className="bg-white rounded-2xl border border-[#D6D6D6] p-6 md:p-8">
                  <h3 className="text-xl font-bold text-[#1E1E1E] mb-4">Admission Process</h3>
                  <div className="text-sm text-[#3A3A3A] leading-relaxed whitespace-pre-line">
                    {program.admission_process}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-[#D6D6D6] p-6">
                <h4 className="text-sm font-bold uppercase tracking-wider text-[#7A7A7A] mb-4">Quick Facts</h4>
                <div className="space-y-3.5 text-sm">
                  <div className="flex justify-between py-2 border-b border-[#F2F2F1]">
                    <span className="text-[#7A7A7A]">Program Code</span>
                    <span className="font-mono font-bold text-[#1E1E1E]">{program.code}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#F2F2F1]">
                    <span className="text-[#7A7A7A]">Academic Degree</span>
                    <span className="font-semibold text-[#1E1E1E]">{program.degree}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#F2F2F1]">
                    <span className="text-[#7A7A7A]">Level</span>
                    <span className="capitalize font-semibold text-[#1E1E1E]">{program.level}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#F2F2F1]">
                    <span className="text-[#7A7A7A]">Duration</span>
                    <span className="font-semibold text-[#1E1E1E]">{program.duration_years} Years</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#F2F2F1]">
                    <span className="text-[#7A7A7A]">Total Credits</span>
                    <span className="font-bold text-[#1E1E1E]">{program.total_credits}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'curriculum' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#1E1E1E]">Semester-wise Curriculum</h3>
                <p className="text-xs text-[#7A7A7A]">Courses mapped to accreditation standards and credit frameworks</p>
              </div>
            </div>
            <CurriculumTable coursesBySemester={program.courses_by_semester || {}} />
          </div>
        )}

        {activeTab === 'outcomes' && (
          <OutcomesList
            programOutcomes={program.program_outcomes || []}
            programSpecificOutcomes={program.program_specific_outcomes || []}
          />
        )}

        {activeTab === 'careers' && (
          <div className="bg-white rounded-2xl border border-[#D6D6D6] p-6 md:p-8">
            <h3 className="text-xl font-bold text-[#1E1E1E] mb-4">Career Opportunities & Industry Pathways</h3>
            {program.career_opportunities ? (
              <div className="text-sm md:text-base text-[#3A3A3A] leading-relaxed whitespace-pre-line">
                {program.career_opportunities}
              </div>
            ) : (
              <div className="space-y-4 text-sm text-[#5C5C5C]">
                <p>Graduates from this program are equipped for high-impact roles across technology and research domains:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  {[
                    'AI / Machine Learning Engineer',
                    'Data Scientist & Analytics Architect',
                    'MLOps & Infrastructure Specialist',
                    'Deep Learning & Computer Vision Researcher',
                    'Natural Language Processing Specialist',
                    'Autonomous Systems Developer'
                  ].map((role, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-3 bg-[#F2F2F1] rounded-xl text-[#1E1E1E] font-medium">
                      <CheckCircle2 className="w-4 h-4 text-[#7A9A7E]" />
                      <span>{role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'faculty' && (
          <div className="bg-white rounded-2xl border border-[#D6D6D6] p-8 text-center">
            <Users className="w-12 h-12 text-[#9A9A9A] mx-auto mb-3 opacity-60" />
            <h3 className="text-lg font-bold text-[#1E1E1E] mb-1">Department Faculty & Academic Mentors</h3>
            <p className="text-sm text-[#5C5C5C] max-w-lg mx-auto mb-6">
              Our professors and industry fellows lead research labs in deep neural networks, vision transformers, and speech synthesis.
            </p>
            <Link
              href="/courses"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E1E1E] text-white text-xs font-semibold"
            >
              <span>Explore Department Courses & Assigned Faculty</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
