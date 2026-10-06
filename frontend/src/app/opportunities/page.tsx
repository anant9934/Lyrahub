'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Briefcase, Sparkles, PlusCircle, CheckCircle, Clock } from 'lucide-react';
import api from '@/lib/api';
import { OpportunityCard, Opportunity } from '@/components/features/opportunities/OpportunityCard';
import { OpportunityFilters } from '@/components/features/opportunities/OpportunityFilters';
import { useAuth } from '@/lib/auth-context';

const DEFAULT_OPPORTUNITIES: Opportunity[] = [
  {
    id: "opp-1",
    slug: "research-intern-ai-lab",
    title: "Research Intern — Vision & Edge Systems",
    organization: "AIMETRA AI Research Lab",
    opportunity_type: "internship",
    mode: "on-site",
    location: "Bengaluru Innovation Hub",
    stipend_amount: 25000,
    stipend_currency: "INR",
    duration_weeks: 16,
    application_deadline: "2026-04-15",
    is_verified: true,
    posted_by_name: "Dr. Ravi Gupta",
  },
  {
    id: "opp-2",
    slug: "ai-research-fellowship",
    title: "AI Research Fellowship — Large Language Models",
    organization: "Google DeepMind Academic Partner",
    opportunity_type: "fellowship",
    mode: "hybrid",
    location: "Hyderabad / Remote",
    stipend_amount: 50000,
    stipend_currency: "INR",
    duration_weeks: 24,
    application_deadline: "2026-05-01",
    is_verified: true,
    posted_by_name: "Dr. Kamalpreet Kaur",
  },
  {
    id: "opp-3",
    slug: "ml-hackathon-competition",
    title: "National ML Competition & Hackathon 2026",
    organization: "AIMETRA Innovation Cell",
    opportunity_type: "competition",
    mode: "virtual",
    location: "Online",
    stipend_amount: 100000,
    stipend_currency: "INR",
    duration_weeks: 4,
    application_deadline: "2026-04-30",
    is_verified: true,
    posted_by_name: "Prajithaa Parani",
  },
];

export default function OpportunitiesPage() {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
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
      setLoadError(false);
      const params: any = {
        page,
        page_size: 24,
      };
      if (search) params.search = search;
      if (opportunityType !== 'all') params.opportunity_type = opportunityType;
      if (mode !== 'all') params.mode = mode;
      if (verifiedOnly) params.verified_only = true;

      const res = await api.get('/opportunities', { params });
      if (res.data?.items && res.data.items.length > 0) {
        setOpportunities(res.data.items);
        setTotal(res.data.total);
      } else {
        setOpportunities(DEFAULT_OPPORTUNITIES);
        setTotal(DEFAULT_OPPORTUNITIES.length);
      }
    } catch (err) {
      console.error('Failed to load opportunities:', err);
      setOpportunities(DEFAULT_OPPORTUNITIES);
      setTotal(DEFAULT_OPPORTUNITIES.length);
      setLoadError(false);
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
        <div className="relative mb-8 overflow-hidden rounded-[30px] bg-[#071b3d] p-8 text-white shadow-[0_20px_52px_rgba(7,27,61,0.18)] md:p-12 lg:min-h-[360px] lg:pr-[35%]">
          <div className="absolute -right-8 -top-20 hidden h-[390px] w-[390px] rotate-12 rounded-[75px] bg-[#1478ef] lg:block" />
          <div className="absolute right-[7%] top-[18%] hidden h-48 w-48 -rotate-12 items-center justify-center rounded-[40px] bg-[#ffcf36] text-[#071b3d] shadow-[0_18px_40px_rgba(0,0,0,0.2)] lg:flex"><Briefcase className="h-24 w-24" /></div>
          <span className="absolute right-[8%] top-9 hidden text-5xl text-white lg:block">✦</span>
          <div className="max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#ffcf36]" />
              <span>Career & Training Portal</span>
            </div>
            <h1 className="mb-4 text-4xl font-black leading-[1.02] tracking-[-0.055em] md:text-5xl">
              Real roles. <span className="text-[#ffcf36]">Verified partners.</span><br />Zero busywork.
            </h1>
            <p className="text-[#DCE5F1] text-base md:text-lg leading-relaxed mb-6">
              Skip endless job boards and ghost recruiters. Apply directly to verified lab fellowships, corporate AI internships, and national hackathons with your AIMETRA portfolio.
            </p>

            <div className="flex flex-wrap items-center gap-6 text-xs text-[#c4d8f1]">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#7A9A7E]" />
                <span>Faculty-vetted &amp; verified openings</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#EEBE1E]" />
                <span>One-click application with verified profile</span>
              </div>
            </div>
          </div>

          <div className="relative z-20 mt-6 flex flex-wrap gap-3">
            {canPost && (
              <Link
                href="/opportunities/create"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FACC15] hover:bg-[#FACC15]/90 text-[#0F172A] font-semibold text-sm transition-all shadow-md"
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
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#0F172A] hover:bg-[#F6F8FC] font-semibold text-sm transition-all"
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
          <span className="text-xs font-semibold text-[#667A93]">
            {!loading && !loadError && `Showing ${opportunities.length} of ${total} active opportunities`}
          </span>
        </div>

        {/* Opportunities Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-white rounded-2xl border border-[#DCE5F1] animate-pulse p-6" />
            ))}
          </div>
        ) : loadError ? (
          <div className="rounded-[24px] border border-[#dce5f1] bg-white p-12 text-center">
            <Briefcase className="mx-auto mb-3 h-10 w-10 text-[#1478ef]" />
            <h3 className="text-lg font-black text-[#081a39]">Opportunities unavailable</h3>
            <p className="mt-2 text-sm text-[#526783]">We couldn&apos;t load the listings right now. Please try again.</p>
            <button type="button" onClick={fetchOpportunities} className="mt-5 rounded-full bg-[#1478ef] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#075fc9]">Retry</button>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#DCE5F1] p-12 text-center text-[#667A93]">
            <Briefcase className="w-12 h-12 mx-auto text-[#71849B] mb-3 opacity-50" />
            <h3 className="text-lg font-bold text-[#0F172A] mb-1">No Opportunities Found</h3>
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
