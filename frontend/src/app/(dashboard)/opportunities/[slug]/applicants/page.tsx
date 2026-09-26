'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, Building2, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { ApplicantTable, Applicant } from '@/components/features/opportunities/ApplicantTable';

export default function OpportunityApplicantsPage() {
  const { slug } = useParams();
  const { user } = useAuth();

  const [opp, setOpp] = useState<any>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      // First get the opportunity details to find id and authorize
      const oppRes = await api.get(`/opportunities/${slug}`);
      setOpp(oppRes.data);

      // Now fetch applicants
      const appRes = await api.get(`/opportunities/${oppRes.data.id}/applications`);
      setApplicants(appRes.data || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load applicant records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      loadData();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F2F1] py-12 px-4 max-w-5xl mx-auto">
        <div className="h-40 bg-white rounded-3xl border border-[#D6D6D6] animate-pulse mb-8" />
        <div className="h-64 bg-white rounded-2xl border border-[#D6D6D6] animate-pulse" />
      </div>
    );
  }

  if (error || !opp) {
    return (
      <div className="min-h-screen bg-[#F2F2F1] p-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-[#D6D6D6] p-8 text-center max-w-md shadow-sm">
          <AlertCircle className="w-12 h-12 text-[#B85C5C] mx-auto mb-3" />
          <h2 className="text-xl font-bold text-[#1E1E1E] mb-2">Access Denied or Not Found</h2>
          <p className="text-sm text-[#5C5C5C] mb-6">{error || 'You must be the listing creator or an administrator to view applicants.'}</p>
          <Link href="/opportunities" className="px-4 py-2 rounded-xl bg-[#1E1E1E] text-white text-sm font-semibold">
            Back to Opportunities
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F1] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/opportunities/${opp.slug}`}
            className="inline-flex items-center gap-1.5 text-xs text-[#7A7A7A] hover:text-[#1E1E1E] transition-colors mb-3 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Opportunity Listing</span>
          </Link>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#F2F2F1] text-[#1E1E1E]">
                  {opp.opportunity_type}
                </span>
                <span className="text-xs text-[#7A7A7A]">{opp.organization}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#1E1E1E]">
                Applicant Pipeline: {opp.title}
              </h1>
              <p className="text-xs md:text-sm text-[#7A7A7A] mt-1">
                Manage candidate submissions and update statuses across selection stages
              </p>
            </div>

            <div className="px-4 py-2 rounded-xl bg-white border border-[#D6D6D6] text-xs font-bold text-[#1E1E1E]">
              Total Applicants: {applicants.length}
            </div>
          </div>
        </div>

        {/* Applicant Table */}
        <ApplicantTable
          opportunityId={opp.id}
          applicants={applicants}
          onStatusUpdated={loadData}
          canManageStatus={true}
        />
      </div>
    </div>
  );
}
