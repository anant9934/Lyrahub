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
      return 'bg-[#1E1E1E] text-white';
    case 'elective':
      return 'bg-[#EEF3EE] text-[#7A9A7E] border border-[#7A9A7E]/40';
    case 'lab':
      return 'bg-[#EAF0F3] text-[#6B8FA3] border border-[#6B8FA3]/40';
    case 'project':
      return 'bg-[#FAF3E2] text-[#B8860B] border border-[#EEBE1E]/50';
    default:
      return 'bg-[#F2F2F1] text-[#5C5C5C] border border-[#D6D6D6]';
  }
};

export const CourseCard: React.FC<{ course: Course }> = ({ course }) => {
  return (
    <div className="bg-white rounded-2xl border border-[#D6D6D6] hover:border-[#94B0B8] transition-all hover:shadow-md flex flex-col justify-between p-5">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#1E1E1E] text-white">
              {course.code}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${getCourseTypeBadge(course.course_type)}`}>
              {course.course_type || 'Core'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {course.semester && (
              <span className="text-xs font-medium text-[#7A7A7A] px-2 py-0.5 rounded bg-[#F2F2F1]">
                Sem {course.semester}
              </span>
            )}
            <span className="text-xs font-bold text-[#1E1E1E] px-2 py-0.5 rounded-full bg-[#FAF3E2] text-[#B8860B] border border-[#EEBE1E]/30">
              {course.credits} Credits
            </span>
          </div>
        </div>

        {/* Course Title */}
        <h3 className="text-lg font-bold text-[#1E1E1E] leading-snug line-clamp-1 mb-1">
          {course.name}
        </h3>
        {course.short_name && course.short_name !== course.name && (
          <p className="text-xs font-medium text-[#7A7A7A] mb-2">
            {course.short_name}
          </p>
        )}

        <p className="text-xs text-[#5C5C5C] line-clamp-2 leading-relaxed mb-4">
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

      <div className="pt-3 border-t border-[#F2F2F1] flex items-center justify-between">
        <span className="text-xs text-[#7A7A7A] capitalize">
          {course.category || 'Theory'}
        </span>

        <Link
          href={`/courses/${course.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E1E1E] hover:text-[#6B8FA3] transition-colors"
        >
          <span>View Syllabus</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
