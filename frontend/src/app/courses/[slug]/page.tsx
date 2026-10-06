'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  Users,
  Layers,
  GraduationCap,
  Calendar,
  FileText,
  ChevronRight,
  Award,
  ArrowRight
} from 'lucide-react';
import api from '@/lib/api';
import { getCourseTypeBadge } from '@/components/features/courses/CourseCard';
import { SyllabusViewer } from '@/components/features/courses/SyllabusViewer';
import { FacultyAssignmentList } from '@/components/features/courses/FacultyAssignmentList';

export default function CourseDetailPage() {
  const { slug } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'syllabus' | 'faculty' | 'programs'>('overview');

  useEffect(() => {
    async function loadCourse() {
      try {
        setLoading(true);
        const res = await api.get(`/courses/${slug}`);
        setCourse(res.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Course not found');
      } finally {
        setLoading(false);
      }
    }
    if (slug) {
      loadCourse();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F8FC] py-12 px-4 max-w-7xl mx-auto">
        <div className="h-60 bg-white rounded-3xl border border-[#DCE5F1] animate-pulse mb-8" />
        <div className="h-96 bg-white rounded-2xl border border-[#DCE5F1] animate-pulse" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-[#F6F8FC] py-16 px-4">
        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-[#DCE5F1] p-8 text-center">
          <BookOpen className="w-12 h-12 text-[#71849B] mx-auto mb-3" />
          <h2 className="text-xl font-bold text-[#0F172A] mb-2">Course Not Found</h2>
          <p className="text-sm text-[#526783] mb-6">{error || 'The requested course does not exist.'}</p>
          <Link
            href="/courses"
            className="px-4 py-2 rounded-xl bg-[#0F172A] text-white text-sm font-semibold"
          >
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'syllabus', label: 'Syllabus & Outcomes', icon: FileText },
    { id: 'faculty', label: 'Assigned Faculty', icon: Users },
    { id: 'programs', label: 'Included in Programs', icon: Layers },
  ];

  return (
    <div className="min-h-screen bg-[#F6F8FC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Course Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E1E1E] to-[#2D3748] text-white p-8 md:p-12 mb-8 shadow-sm">
          <div className="max-w-4xl relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-[#71849B] mb-4">
              <Link href="/courses" className="hover:text-white transition-colors">Courses</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-[#EEBE1E] font-medium">{course.code}</span>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-[#FACC15] text-[#0F172A]">
                {course.code}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getCourseTypeBadge(course.course_type)}`}>
                {course.course_type || 'Core'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs bg-white/10 text-white border border-white/20 capitalize">
                {course.category || 'Theory'}
              </span>
              {course.semester && (
                <span className="px-3 py-1 rounded-full text-xs bg-white/10 text-[#FAF3E2] border border-white/10">
                  Semester {course.semester}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-2">
              {course.name}
            </h1>
            {course.short_name && course.short_name !== course.name && (
              <p className="text-base text-[#94B0B8] font-medium mb-4">
                {course.short_name}
              </p>
            )}

            <p className="text-[#DCE5F1] text-sm md:text-base leading-relaxed mb-6 max-w-3xl">
              {course.description || 'Specialized deep learning curriculum with PyTorch laboratory implementations and research paper seminars.'}
            </p>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-white/10 text-sm text-[#DCE5F1]">
              <div>
                <span className="text-[#EEBE1E] font-bold text-lg">{course.credits}</span> Credits
              </div>
              <div>
                <span>Academic Year: <strong>{course.year ? `Year ${course.year}` : 'Advanced'}</strong></span>
              </div>
              {course.faculty && (
                <div>
                  <span>Faculty Mentors: <strong>{course.faculty.length}</strong></span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#DCE5F1] mb-8 overflow-x-auto gap-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                  isActive
                    ? 'border-[#0F172A] text-[#0F172A]'
                    : 'border-transparent text-[#667A93] hover:text-[#0F172A] hover:border-[#DCE5F1]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#0F172A]' : 'text-[#71849B]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-[#DCE5F1] p-6 md:p-8">
                <h3 className="text-xl font-bold text-[#0F172A] mb-4">Course Overview</h3>
                <p className="text-sm md:text-base text-[#34465E] leading-relaxed whitespace-pre-line">
                  {course.description || 'Course overview and description.'}
                </p>
              </div>

              {course.prerequisites && (
                <div className="bg-white rounded-2xl border border-[#DCE5F1] p-6">
                  <h4 className="text-base font-bold text-[#0F172A] mb-2">Prerequisites</h4>
                  <p className="text-sm text-[#526783] leading-relaxed">
                    {course.prerequisites}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-[#DCE5F1] p-6">
                <h4 className="text-sm font-bold uppercase tracking-wider text-[#667A93] mb-4">Course Info</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-1.5 border-b border-[#F6F8FC]">
                    <span className="text-[#667A93]">Course Code</span>
                    <span className="font-mono font-bold text-[#0F172A]">{course.code}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#F6F8FC]">
                    <span className="text-[#667A93]">Credits</span>
                    <span className="font-bold text-[#0F172A]">{course.credits}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#F6F8FC]">
                    <span className="text-[#667A93]">Type</span>
                    <span className="capitalize font-semibold text-[#0F172A]">{course.course_type}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#F6F8FC]">
                    <span className="text-[#667A93]">Category</span>
                    <span className="capitalize font-semibold text-[#0F172A]">{course.category}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#F6F8FC]">
                    <span className="text-[#667A93]">Semester</span>
                    <span className="font-semibold text-[#0F172A]">{course.semester || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {course.edurev_benefits && course.edurev_benefits.length > 0 && (
                <div className="bg-[#FAF3E2] rounded-2xl border border-[#FACC15]/40 p-6">
                  <h4 className="text-sm font-bold text-[#B8860B] mb-2 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[#EEBE1E]" />
                    <span>EduRev & RPL Benefits</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-[#0F172A]">
                    {course.edurev_benefits.map((b: string, i: number) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FACC15]" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'syllabus' && (
          <SyllabusViewer
            syllabus={course.syllabus}
            learningOutcomes={course.learning_outcomes || []}
            evaluationScheme={course.evaluation_scheme || {}}
            references={course.references || []}
            prerequisites={course.prerequisites}
            edurevBenefits={course.edurev_benefits || []}
          />
        )}

        {activeTab === 'faculty' && (
          <div>
            <h3 className="text-xl font-bold text-[#0F172A] mb-4">Assigned Course Faculty</h3>
            <FacultyAssignmentList facultyList={course.faculty || []} />
          </div>
        )}

        {activeTab === 'programs' && (
          <div className="bg-white rounded-2xl border border-[#DCE5F1] p-6 md:p-8">
            <h3 className="text-xl font-bold text-[#0F172A] mb-4">Degree Programs Offering This Course</h3>
            {course.programs && course.programs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.programs.map((prog: any) => (
                  <Link
                    key={prog.program_id}
                    href={`/programs/${prog.program_slug}`}
                    className="p-5 rounded-xl border border-[#DCE5F1] hover:border-[#94B0B8] transition-all flex items-center justify-between group"
                  >
                    <div>
                      <span className="font-mono text-xs font-bold text-[#EEBE1E] bg-[#0F172A] px-2 py-0.5 rounded">
                        {prog.program_code}
                      </span>
                      <h4 className="font-bold text-sm text-[#0F172A] mt-1 group-hover:text-[#6B8FA3] transition-colors">
                        {prog.program_name}
                      </h4>
                      <p className="text-xs text-[#667A93] mt-0.5">
                        Semester {prog.semester} &bull; {prog.is_mandatory ? 'Mandatory Course' : 'Elective'}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#667A93] group-hover:translate-x-1 transition-transform" />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#667A93]">This course has not been mapped to any degree program yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
