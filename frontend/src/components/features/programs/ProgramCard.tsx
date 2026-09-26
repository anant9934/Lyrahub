'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, Award, BookOpen, ArrowRight } from 'lucide-react';

export interface Program {
  id: string;
  slug: string;
  code: string;
  name: string;
  short_name?: string;
  degree?: string;
  level?: string;
  duration_years?: number;
  total_credits?: number;
  description?: string;
  cover_image_url?: string;
  brochure_url?: string;
  is_active?: boolean;
}

export const getDegreeBadge = (degree?: string, level?: string) => {
  const d = (degree || '').toLowerCase();
  const l = (level || '').toLowerCase();

  if (l === 'minor' || d.includes('minor')) {
    return 'bg-[#EAF0F3] text-[#6B8FA3] border border-[#6B8FA3]/40';
  }
  if (d.includes('m.tech') || l === 'postgraduate') {
    return 'bg-[#FAF3E2] text-[#B8860B] border border-[#EEBE1E]/50';
  }
  return 'bg-[#EEF3EE] text-[#7A9A7E] border border-[#7A9A7E]/40'; // sage for B.Tech
};

export const ProgramCard: React.FC<{ program: Program }> = ({ program }) => {
  return (
    <div className="bg-white rounded-2xl border border-[#D6D6D6] hover:border-[#94B0B8] transition-all hover:shadow-md flex flex-col justify-between overflow-hidden">
      <div>
        {/* Banner */}
        <div className="h-36 w-full bg-gradient-to-r from-[#94B0B8]/20 via-[#F2F2F1] to-[#FAF3E2] relative p-4 flex items-end">
          {program.cover_image_url && (
            <img
              src={program.cover_image_url}
              alt={program.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getDegreeBadge(program.degree, program.level)}`}>
              {program.degree || 'Degree'}
            </span>
            <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-[#1E1E1E]/80 text-white backdrop-blur-sm">
              {program.code}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-xl font-bold text-[#1E1E1E] leading-snug line-clamp-1">
            {program.name}
          </h3>
          {program.short_name && (
            <p className="text-sm font-medium text-[#7A7A7A] mt-0.5">
              {program.short_name}
            </p>
          )}

          <p className="text-sm text-[#5C5C5C] mt-3 line-clamp-2 leading-relaxed">
            {program.description || 'Specialized curriculum in AI and Machine Learning systems.'}
          </p>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 mt-5 pt-4 border-t border-[#F2F2F1] text-xs text-[#5C5C5C]">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#7A7A7A]" />
              <span>{program.duration_years || 4.0} Years</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#7A7A7A]" />
              <span>{program.total_credits || 160} Credits</span>
            </div>
            <div className="flex items-center gap-1.5 capitalize">
              <BookOpen className="w-4 h-4 text-[#7A7A7A]" />
              <span>{program.level || 'undergraduate'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 pt-0">
        <Link
          href={`/programs/${program.slug}`}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#F2F2F1] hover:bg-[#1E1E1E] text-[#1E1E1E] hover:text-white font-medium text-sm transition-all group"
        >
          <span>Explore Program</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
};
