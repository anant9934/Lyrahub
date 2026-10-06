'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { GraduationCap, Layers, Award, Sparkles, PlusCircle, BrainCircuit, ChartNoAxesCombined, Lightbulb, Handshake, ArrowUpRight } from 'lucide-react';
import api from '@/lib/api';
import { ProgramCard, Program } from '@/components/features/programs/ProgramCard';
import { useAuth } from '@/lib/auth-context';
import { PublicFooter } from '@/components/layout/PublicFooter';

export default function ProgramsPage() {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const [degreeFilter, setDegreeFilter] = useState<string>('all');

  const isHodOrAdmin = user && (user.role === 'hod' || user.role === 'admin');

  useEffect(() => {
    async function loadPrograms() {
      try {
        setLoading(true);
        setLoadError(false);
        const params: any = {};
        if (degreeFilter !== 'all') {
          params.degree = degreeFilter;
        }
        const res = await api.get('/programs', { params });
        setPrograms(res.data || []);
      } catch (err) {
        console.error('Failed to load programs:', err);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    }
    loadPrograms();
  }, [degreeFilter, retryToken]);

  return (
    <div className="aimetra-public theme-programs min-h-screen bg-white text-[#0F172A] flex flex-col">
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="relative mb-7 overflow-hidden rounded-[30px] bg-[#071b3d] p-8 text-white shadow-[0_20px_52px_rgba(7,27,61,0.18)] md:p-12 lg:min-h-[360px] lg:pr-[43%]">
          <div className="absolute inset-y-0 right-0 hidden w-[45%] overflow-hidden lg:block [clip-path:polygon(18%_0,100%_0,100%_100%,0_100%)]"><Image src="/images/hero-campus.webp" alt="Students outside a modern university building" fill sizes="45vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-r from-[#071b3d]/70 to-transparent" /></div>
          <span className="absolute bottom-8 right-9 hidden rotate-[-7deg] rounded-xl bg-[#ffcf36] px-4 py-2 font-serif text-lg font-black italic text-[#071b3d] shadow-xl lg:block">Learn. Build. Lead.</span>
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#ffcf36]" />
              <span>Academic Programs</span>
            </div>
            <h1 className="mb-4 text-4xl font-black leading-[1.02] tracking-[-0.055em] md:text-6xl">
              Find your <span className="text-[#ffcf36]">focus.</span><br />Build your future.
            </h1>
            <p className="text-[#DCE5F1] text-base md:text-lg leading-relaxed mb-6">
              Choose from industry-backed undergraduate degrees, advanced master&apos;s specializations, and engineering minors designed to give you real-world AI skills.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-[#c4d8f1]">
                <Layers className="w-4 h-4 text-[#EEBE1E]" />
                <span>Hands-on, project-first curriculum</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#c4d8f1]">
                <Award className="w-4 h-4 text-[#7A9A7E]" />
                <span>Direct credit &amp; research grant eligible</span>
              </div>
            </div>
          </div>

          {isHodOrAdmin && (
            <div className="relative z-20 mt-6 lg:absolute lg:right-12 lg:top-12 lg:mt-0">
              <Link
                href="/programs/manage"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FACC15] hover:bg-[#FACC15]/90 text-[#0F172A] font-semibold text-sm transition-all shadow-md"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Manage Programs</span>
              </Link>
            </div>
          )}
        </div>

        <div className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: 'AI & Machine Learning', detail: 'Train neural nets and build smart apps.', href: '/courses', icon: BrainCircuit, tint: 'bg-[#e7f2ff]', iconTint: 'bg-[#d3e9ff] text-[#1478ef]' },
            { title: 'Data Science & Big Data', detail: 'Turn messy numbers into clear decisions.', href: '/courses', icon: ChartNoAxesCombined, tint: 'bg-[#e7faff]', iconTint: 'bg-[#cff2ff] text-[#0785ae]' },
            { title: 'Research & Labs', detail: 'Publish papers and patent new ideas.', href: '/research', icon: Lightbulb, tint: 'bg-[#fff6dd]', iconTint: 'bg-[#ffeab0] text-[#b87a00]' },
            { title: 'Industry Placements', detail: 'Land dream internships and top offers.', href: '/opportunities', icon: Handshake, tint: 'bg-[#f5ecff]', iconTint: 'bg-[#ead8ff] text-[#7c3aed]' },
          ].map((pathway) => (
            <Link href={pathway.href} key={pathway.title} className={`group relative flex min-h-[190px] flex-col rounded-[24px] border border-white p-5 shadow-[0_8px_24px_rgba(8,26,57,0.06)] transition hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(8,26,57,0.11)] ${pathway.tint}`}>
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${pathway.iconTint}`}><pathway.icon className="h-6 w-6" /></span>
              <h2 className="mt-6 text-base font-black leading-tight tracking-[-0.03em] text-[#081a39]">{pathway.title}</h2>
              <p className="mt-1 text-xs text-[#526783]">{pathway.detail}</p>
              <ArrowUpRight className="absolute right-5 top-5 h-4 w-4 text-[#526783] transition group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-[#DCE5F1]">
            {[
              { label: 'All Programs', value: 'all' },
              { label: 'B.Tech', value: 'B.Tech' },
              { label: 'M.Tech', value: 'M.Tech' },
            ].map(btn => (
              <button
                key={btn.value}
                onClick={() => setDegreeFilter(btn.value)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  degreeFilter === btn.value
                    ? 'bg-[#0F172A] text-white shadow-sm'
                    : 'text-[#526783] hover:text-[#0F172A] hover:bg-[#F6F8FC]'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <p className="text-xs font-medium text-[#667A93]">
            {!loading && !loadError && `Showing ${programs.length} ${programs.length === 1 ? 'Program' : 'Programs'}`}
          </p>
        </div>

        {/* Grid of Programs */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 bg-white rounded-2xl border border-[#DCE5F1] animate-pulse p-6" />
            ))}
          </div>
        ) : loadError ? (
          <div className="rounded-[24px] border border-[#dce5f1] bg-white p-12 text-center">
            <GraduationCap className="mx-auto mb-3 h-10 w-10 text-[#1478ef]" />
            <h3 className="text-lg font-black text-[#081a39]">Catalog unavailable</h3>
            <p className="mt-2 text-sm text-[#526783]">We couldn&apos;t load programs right now. Please try again.</p>
            <button type="button" onClick={() => setRetryToken((value) => value + 1)} className="mt-5 rounded-full bg-[#1478ef] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#075fc9]">Retry</button>
          </div>
        ) : programs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#DCE5F1] p-12 text-center text-[#667A93]">
            <GraduationCap className="w-12 h-12 mx-auto text-[#71849B] mb-3 opacity-50" />
            <h3 className="text-lg font-bold text-[#0F172A] mb-1">No Programs Found</h3>
            <p className="text-sm">No degree programs matched the selected filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map(prog => (
              <ProgramCard key={prog.id} program={prog} />
            ))}
          </div>
        )}
      </div>
      </main>
      <PublicFooter />
    </div>
  );
}
