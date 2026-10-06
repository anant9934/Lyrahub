'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Sparkles, ArrowRight, Award } from 'lucide-react';

export interface Course {
  id: string;
  slug: string;
  code: string;
  name: string;
  short_name?: string;
  description?: string;
  credits: number;
  semester?: number;
  year?: number;
  course_type?: string;
  category?: string;
  edurev_benefits?: string[];
  is_active?: boolean;
}

export const getCourseTypeBadge = (type?: string) => {
  switch ((type || '').toLowerCase()) {
    case 'core':
      return 'bg-[#0F172A] text-white';
    case 'elective':
      return 'bg-[#EEF3EE] text-[#7A9A7E] border border-[#7A9A7E]/40';
    case 'lab':
      return 'bg-[#EAF0F3] text-[#6B8FA3] border border-[#6B8FA3]/40';
    case 'project':
      return 'bg-[#FAF3E2] text-[#B8860B] border border-[#FACC15]/50';
    default:
      return 'bg-[#F6F8FC] text-[#526783] border border-[#DCE5F1]';
  }
};

export const CourseCard: React.FC<{ course: Course }> = ({ course }) => {
  return (
    <div className="responsive-card bg-white rounded-2xl border border-[#DCE5F1] hover:border-[#94B0B8] transition-all hover:shadow-md flex flex-col justify-between p-5">
      <div>
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#0F172A] text-white">
              {course.code}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${getCourseTypeBadge(course.course_type)}`}>
              {course.course_type || 'Core'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {course.semester && (
              <span className="text-xs font-medium text-[#667A93] px-2 py-0.5 rounded bg-[#F6F8FC]">
                Sem {course.semester}
              </span>
            )}
            <span className="text-xs font-bold text-[#0F172A] px-2 py-0.5 rounded-full bg-[#FAF3E2] text-[#B8860B] border border-[#FACC15]/30">
              {course.credits} Credits
            </span>
          </div>
        </div>

        {/* Course Title */}
        <h3 className="text-base sm:text-lg font-bold text-[#0F172A] leading-snug mb-1.5">
          {course.name}
        </h3>
        {course.short_name && course.short_name !== course.name && (
          <p className="text-xs font-medium text-[#667A93] mb-2">
            {course.short_name}
          </p>
        )}

        <p className="text-xs text-[#526783] line-clamp-2 leading-relaxed mb-4">
          {course.description || 'Core syllabus covering foundational algorithmic and deep architectural patterns.'}
        </p>

        {/* EduRev / RPL Benefits */}
        {course.edurev_benefits && course.edurev_benefits.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {course.edurev_benefits.slice(0, 2).map((benefit, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#EEF3EE] text-[#7A9A7E]"
              >
                <Award className="w-3 h-3" />
                <span>{benefit}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-[#F6F8FC] flex items-center justify-between">
        <span className="text-xs text-[#667A93] capitalize">
          {course.category || 'Theory'}
        </span>

        <Link
          href={`/courses/${course.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F172A] hover:text-[#6B8FA3] transition-colors"
        >
          <span>View Syllabus</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
