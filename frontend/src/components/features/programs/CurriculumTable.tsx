'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, ChevronDown, ChevronRight, CheckCircle2, ArrowUpRight } from 'lucide-react';

export const getCourseTypeBadge = (type?: string) => {
  switch ((type || '').toLowerCase()) {
    case 'core':
      return 'bg-[#1E1E1E] text-white';
    case 'elective':
      return 'bg-[#EEF3EE] text-[#7A9A7E] border border-[#7A9A7E]/30';
    case 'lab':
      return 'bg-[#EAF0F3] text-[#6B8FA3] border border-[#6B8FA3]/30';
    case 'project':
      return 'bg-[#FAF3E2] text-[#B8860B] border border-[#EEBE1E]/40';
    default:
      return 'bg-[#F2F2F1] text-[#5C5C5C] border border-[#D6D6D6]';
  }
};

interface CourseMapping {
  id: string;
  course_id: string;
  semester: number;
  is_mandatory: boolean;
  code: string;
  name: string;
  short_name?: string;
  slug: string;
  credits: number;
  course_type?: string;
  category?: string;
}

interface CurriculumTableProps {
  coursesBySemester: Record<number, CourseMapping[]>;
}

export const CurriculumTable: React.FC<CurriculumTableProps> = ({ coursesBySemester }) => {
  const semesters = Object.keys(coursesBySemester)
    .map(Number)
    .sort((a, b) => a - b);

  // Default expand all semesters
  const [expandedSemesters, setExpandedSemesters] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {};
    semesters.forEach(s => { initial[s] = true; });
    return initial;
  });

  const toggleSemester = (sem: number) => {
    setExpandedSemesters(prev => ({
      ...prev,
      [sem]: !prev[sem]
    }));
  };

  if (semesters.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#D6D6D6] p-12 text-center text-[#7A7A7A]">
        <BookOpen className="w-12 h-12 mx-auto text-[#9A9A9A] mb-3 opacity-60" />
        <h4 className="text-base font-bold text-[#1E1E1E] mb-1">Curriculum Pending Publication</h4>
        <p className="text-sm">Course mappings for this academic program are being finalized by the department board.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {semesters.map(semester => {
        const list = coursesBySemester[semester] || [];
        const semCredits = list.reduce((acc, c) => acc + (c.credits || 0), 0);
        const isOpen = !!expandedSemesters[semester];

        return (
          <div
            key={semester}
            className="bg-white rounded-2xl border border-[#D6D6D6] overflow-hidden transition-all shadow-sm"
          >
            {/* Header */}
            <button
              onClick={() => toggleSemester(semester)}
              className="w-full px-6 py-4 flex items-center justify-between bg-[#F2F2F1]/50 hover:bg-[#F2F2F1] transition-colors border-b border-[#E5E5E4] text-left"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#1E1E1E] text-white flex items-center justify-center font-bold text-sm">
                  {semester}
                </span>
                <div>
                  <h3 className="font-bold text-[#1E1E1E] text-base">Semester {semester}</h3>
                  <p className="text-xs text-[#7A7A7A]">
                    {list.length} {list.length === 1 ? 'Course' : 'Courses'} &bull; {semCredits} Total Credits
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white border border-[#D6D6D6] text-[#5C5C5C]">
                  {semCredits} Credits
                </span>
                {isOpen ? (
                  <ChevronDown className="w-5 h-5 text-[#7A7A7A]" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-[#7A7A7A]" />
                )}
              </div>
            </button>

            {/* Courses Table */}
            {isOpen && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-[#EAEAE8]/60 text-[#3A3A3A] font-semibold text-xs border-b border-[#E5E5E4]">
                      <th className="py-3 px-6">Code</th>
                      <th className="py-3 px-6">Course Name</th>
                      <th className="py-3 px-6">Type</th>
                      <th className="py-3 px-6">Category</th>
                      <th className="py-3 px-6 text-center">Credits</th>
                      <th className="py-3 px-6 text-center">Status</th>
                      <th className="py-3 px-6 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E4]">
                    {list.map(c => (
                      <tr key={c.id} className="hover:bg-[#F2F2F1]/60 transition-colors">
                        <td className="py-3.5 px-6 font-mono font-bold text-xs text-[#1E1E1E]">
                          {c.code}
                        </td>
                        <td className="py-3.5 px-6 font-medium text-[#1E1E1E]">
                          <Link
                            href={`/courses/${c.slug}`}
                            className="hover:text-[#6B8FA3] transition-colors inline-flex items-center gap-1.5"
                          >
                            <span>{c.name}</span>
                          </Link>
                          {c.short_name && c.short_name !== c.name && (
                            <span className="block text-xs text-[#7A7A7A] mt-0.5">{c.short_name}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-6">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${getCourseTypeBadge(c.course_type)}`}>
                            {c.course_type || 'Core'}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-xs text-[#5C5C5C] capitalize">
                          {c.category || 'Theory'}
                        </td>
                        <td className="py-3.5 px-6 text-center font-bold text-[#1E1E1E]">
                          {c.credits}
                        </td>
                        <td className="py-3.5 px-6 text-center">
                          {c.is_mandatory ? (
                            <span className="inline-flex items-center gap-1 text-xs text-[#7A9A7E] font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Mandatory
                            </span>
                          ) : (
                            <span className="text-xs text-[#7A7A7A]">Elective</span>
                          )}
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <Link
                            href={`/courses/${c.slug}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E1E1E] hover:text-[#7A9A7E] transition-colors"
                          >
                            <span>Syllabus</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
