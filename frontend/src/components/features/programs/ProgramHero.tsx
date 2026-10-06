'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
    <div className="relative mb-8 overflow-hidden rounded-[30px] bg-[#071b3d] p-8 text-white shadow-[0_20px_50px_rgba(7,27,61,0.18)] md:p-12 lg:pr-[37%]">
      <div className="absolute inset-y-0 right-0 hidden w-[43%] overflow-hidden [clip-path:polygon(20%_0,100%_0,100%_100%,0_100%)] lg:block">
        {cover_image_url ? <img src={cover_image_url} alt="" className="h-full w-full object-cover" /> : <Image src="/images/hero-campus.webp" alt="" fill sizes="43vw" className="object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-r from-[#071b3d]/60 to-transparent" />
      </div>
      <span className="absolute bottom-8 right-8 hidden rotate-[-7deg] rounded-xl bg-[#ffcf36] px-4 py-2 font-serif text-lg font-black italic text-[#071b3d] shadow-lg lg:block">Learn · Build · Lead</span>

      <div className="relative z-10 max-w-3xl">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-xs text-[#b9cce7]">
          <Link href="/programs" className="hover:text-white transition-colors">Programs</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-medium text-[#ffcf36]">{code}</span>
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
        <h1 className="mb-3 text-3xl font-black leading-[1.04] tracking-[-0.055em] text-white md:text-5xl">
          {name}
        </h1>
        {short_name && short_name !== name && (
          <p className="text-lg text-[#94B0B8] font-medium mb-4">
            {short_name}
          </p>
        )}

        {/* Overview */}
        <p className="text-[#DCE5F1] text-base md:text-lg max-w-3xl leading-relaxed mb-8">
          {description || 'Comprehensive curriculum combining theoretical rigor with applied artificial intelligence and machine learning practices.'}
        </p>

        {/* Meta Pills & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-white/10">
          <div className="flex flex-wrap items-center gap-6 text-sm text-[#DCE5F1]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#EEBE1E]" />
              <span className="font-semibold text-white">{duration_years ?? '—'}</span> Years Duration
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#EEBE1E]" />
              <span className="font-semibold text-white">{total_credits ?? '—'}</span> Total Credits
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#0F172A] font-medium text-sm hover:bg-[#F6F8FC] transition-all shadow-sm"
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
