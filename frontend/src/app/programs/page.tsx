'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { GraduationCap, BookOpen, Layers, Award, Sparkles, PlusCircle } from 'lucide-react';
import api from '@/lib/api';
import { ProgramCard, Program } from '@/components/features/programs/ProgramCard';
import { useAuth } from '@/lib/auth-context';

export default function ProgramsPage() {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [degreeFilter, setDegreeFilter] = useState<string>('all');

  const isHodOrAdmin = user && (user.role === 'hod' || user.role === 'admin');

  useEffect(() => {
    async function loadPrograms() {
      try {
        setLoading(true);
        const params: any = {};
        if (degreeFilter !== 'all') {
          params.degree = degreeFilter;
        }
        const res = await api.get('/programs', { params });
        setPrograms(res.data || []);
      } catch (err) {
        console.error('Failed to load programs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPrograms();
  }, [degreeFilter]);

  return (
    <div className="min-h-screen bg-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-[#111111] text-white p-8 md:p-12 mb-10 shadow-subtle">
          <div className="max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Academic Catalog</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Degree Programs & Minors
            </h1>
            <p className="text-[#D6D6D6] text-base md:text-lg leading-relaxed mb-6">
              Explore undergraduate and postgraduate degrees in Artificial Intelligence, Machine Learning, and specialized Engineering Minors.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-[#9A9A9A]">
                <Layers className="w-4 h-4 text-[#EEBE1E]" />
                <span>Industry-aligned syllabi</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#9A9A9A]">
                <Award className="w-4 h-4 text-[#7A9A7E]" />
                <span>EduRev & RPL credit eligible</span>
              </div>
            </div>
          </div>

          {isHodOrAdmin && (
            <div className="mt-6 md:mt-0 md:absolute md:top-12 md:right-12 z-20">
              <Link
                href="/programs/manage"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#EEBE1E] hover:bg-[#EEBE1E]/90 text-[#1E1E1E] font-semibold text-sm transition-all shadow-md"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Manage Programs</span>
              </Link>
            </div>
          )}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-[#D6D6D6]">
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
                    ? 'bg-[#1E1E1E] text-white shadow-sm'
                    : 'text-[#5C5C5C] hover:text-[#1E1E1E] hover:bg-[#F2F2F1]'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <p className="text-xs font-medium text-[#7A7A7A]">
            Showing {programs.length} {programs.length === 1 ? 'Program' : 'Programs'}
          </p>
        </div>

        {/* Grid of Programs */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 bg-white rounded-2xl border border-[#D6D6D6] animate-pulse p-6" />
            ))}
          </div>
        ) : programs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#D6D6D6] p-12 text-center text-[#7A7A7A]">
            <GraduationCap className="w-12 h-12 mx-auto text-[#9A9A9A] mb-3 opacity-50" />
            <h3 className="text-lg font-bold text-[#1E1E1E] mb-1">No Programs Found</h3>
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
    </div>
  );
}
