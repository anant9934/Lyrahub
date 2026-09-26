'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, Award, BookOpen, Download, ChevronRight } from 'lucide-react';
import { getDegreeBadge } from './ProgramCard';

interface ProgramHeroProps {
  name: string;
  short_name?: string;
  code: string;
  degree?: string;
  level?: string;
  duration_years?: number;
  total_credits?: number;
  cover_image_url?: string;
  brochure_url?: string;
  description?: string;
}

export const ProgramHero: React.FC<ProgramHeroProps> = ({
  name,
  short_name,
  code,
  degree,
  level,
  duration_years,
  total_credits,
  cover_image_url,
  brochure_url,
  description
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E1E1E] to-[#2D3748] text-white p-8 md:p-12 mb-8 shadow-sm">
      {cover_image_url && (
        <div className="absolute inset-0 opacity-20 mix-blend-overlay">
          <img src={cover_image_url} alt={name} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="relative z-10 max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#9A9A9A] mb-4">
          <Link href="/programs" className="hover:text-white transition-colors">Programs</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#EEBE1E] font-medium">{code}</span>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2.5 mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getDegreeBadge(degree, level)}`}>
            {degree || 'Degree Program'}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-mono bg-white/10 text-white backdrop-blur-sm border border-white/20">
            {code}
          </span>
          <span className="px-3 py-1 rounded-full text-xs capitalize bg-white/10 text-[#FAF3E2] border border-white/10">
            {level || 'undergraduate'}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">
          {name}
        </h1>
        {short_name && short_name !== name && (
          <p className="text-lg text-[#94B0B8] font-medium mb-4">
            {short_name}
          </p>
        )}

        {/* Overview */}
        <p className="text-[#D6D6D6] text-base md:text-lg max-w-3xl leading-relaxed mb-8">
          {description || 'Comprehensive curriculum combining theoretical rigor with applied artificial intelligence and machine learning practices.'}
        </p>

        {/* Meta Pills & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-white/10">
          <div className="flex flex-wrap items-center gap-6 text-sm text-[#D6D6D6]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#EEBE1E]" />
              <span className="font-semibold text-white">{duration_years || 4.0}</span> Years Duration
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#EEBE1E]" />
              <span className="font-semibold text-white">{total_credits || 160}</span> Total Credits
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#EEBE1E]" />
              <span>Full-time Academic Degree</span>
            </div>
          </div>

          {brochure_url && (
            <a
              href={brochure_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#1E1E1E] font-medium text-sm hover:bg-[#F2F2F1] transition-all shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download Syllabus / Brochure</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
