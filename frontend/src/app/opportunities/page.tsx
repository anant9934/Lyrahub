'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Briefcase, Sparkles, PlusCircle, CheckCircle, Clock } from 'lucide-react';
import api from '@/lib/api';
import { OpportunityCard, Opportunity } from '@/components/features/opportunities/OpportunityCard';
import { OpportunityFilters } from '@/components/features/opportunities/OpportunityFilters';
import { useAuth } from '@/lib/auth-context';

export default function OpportunitiesPage() {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [opportunityType, setOpportunityType] = useState('all');
  const [mode, setMode] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [page, setPage] = useState(1);

  const canPost = user && ['faculty', 'hod', 'admin', 'alumni'].includes(user.role || '');
  const isHodOrAdmin = user && ['hod', 'admin'].includes(user.role || '');

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        page_size: 24,
      };
      if (search) params.search = search;
      if (opportunityType !== 'all') params.opportunity_type = opportunityType;
      if (mode !== 'all') params.mode = mode;
      if (verifiedOnly) params.verified_only = true;

      const res = await api.get('/opportunities', { params });
      setOpportunities(res.data?.items || []);
      setTotal(res.data?.total || 0);
    } catch (err) {
      console.error('Failed to load opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [search, opportunityType, mode, verifiedOnly, page]);

  const handleResetFilters = () => {
    setSearch('');
    setOpportunityType('all');
    setMode('all');
    setVerifiedOnly(false);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-[#111111] text-white p-8 md:p-12 mb-8 shadow-subtle">
          <div className="max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Career & Training Portal</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Internships & Training Opportunities
            </h1>
            <p className="text-[#D6D6D6] text-base md:text-lg leading-relaxed mb-6">
              Verified corporate internships, university research fellowships, specialized industrial workshops, and training tracks posted by faculty and alumni.
            </p>

            <div className="flex flex-wrap items-center gap-6 text-xs text-[#9A9A9A]">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#7A9A7E]" />
                <span>Department Verified Listings</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#EEBE1E]" />
                <span>Real-time Application Status Tracking</span>
              </div>
            </div>
          </div>

          <div className="mt-6 md:mt-0 md:absolute md:top-12 md:right-12 z-20 flex flex-col sm:flex-row gap-3">
            {canPost && (
              <Link
                href="/opportunities/create"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#EEBE1E] hover:bg-[#EEBE1E]/90 text-[#1E1E1E] font-semibold text-sm transition-all shadow-md"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post Opportunity</span>
              </Link>
            )}

            {isHodOrAdmin && (
              <Link
                href="/opportunities/verify"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-all"
              >
                <span>Verify Queue</span>
              </Link>
            )}

            {user && (
              <Link
                href="/opportunities/me"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#1E1E1E] hover:bg-[#F2F2F1] font-semibold text-sm transition-all"
              >
                <span>My Opportunities</span>
              </Link>
            )}
          </div>
        </div>

        {/* Filters */}
        <OpportunityFilters
          search={search}
          onSearchChange={setSearch}
          opportunityType={opportunityType}
          onOpportunityTypeChange={setOpportunityType}
          mode={mode}
          onModeChange={setMode}
          verifiedOnly={verifiedOnly}
          onVerifiedOnlyChange={setVerifiedOnly}
          onReset={handleResetFilters}
        />

        {/* Total counts badge */}
        <div className="flex items-center justify-between mb-6 px-1">
          <span className="text-xs font-semibold text-[#7A7A7A]">
            Showing {opportunities.length} of {total} active opportunities
          </span>
        </div>

        {/* Opportunities Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-white rounded-2xl border border-[#D6D6D6] animate-pulse p-6" />
            ))}
          </div>
        ) : opportunities.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#D6D6D6] p-12 text-center text-[#7A7A7A]">
            <Briefcase className="w-12 h-12 mx-auto text-[#9A9A9A] mb-3 opacity-50" />
            <h3 className="text-lg font-bold text-[#1E1E1E] mb-1">No Opportunities Found</h3>
            <p className="text-sm">No listings currently match your filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map(opp => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
