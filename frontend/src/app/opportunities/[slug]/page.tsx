'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  Clock,
  Banknote,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Users,
  Send,
  AlertCircle
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { getOpportunityTypeBadge } from '@/components/features/opportunities/OpportunityCard';
import { DeadlineCountdown } from '@/components/features/opportunities/DeadlineCountdown';
import { ApplicationStatusBadge } from '@/components/features/opportunities/ApplicationStatusBadge';

export default function OpportunityDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [opp, setOpp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Application state for logged-in student
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const isStudent = user && user.role === 'student';
  const isCreatorOrAdmin = user && opp && (
    user.id === opp.posted_by || ['hod', 'admin'].includes(user.role || '')
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/opportunities/${slug}`);
      setOpp(res.data);

      // If student, check if they already applied
      if (user && user.role === 'student') {
        const myRes = await api.get('/opportunities/me');
        const myApps = myRes.data?.applications || [];
        const found = myApps.find((a: any) => a.opportunity_id === res.data.id);
        if (found) {
          setApplicationStatus(found.status);
        } else {
          setApplicationStatus(null);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Opportunity not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      loadData();
    }
  }, [slug, user]);

  const handleApply = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!opp) return;

    try {
      setActionLoading(true);
      await api.post(`/opportunities/${opp.id}/apply`);
      setApplicationStatus('interested');
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to submit application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!confirm('Are you sure you want to withdraw your application?')) return;
    try {
      setActionLoading(true);
      await api.delete(`/opportunities/${opp.id}/apply`);
      setApplicationStatus('withdrawn');
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to withdraw');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F2F1] py-12 px-4 max-w-7xl mx-auto">
        <div className="h-64 bg-white rounded-3xl border border-[#D6D6D6] animate-pulse mb-8" />
        <div className="h-96 bg-white rounded-2xl border border-[#D6D6D6] animate-pulse" />
      </div>
    );
  }

  if (error || !opp) {
    return (
      <div className="min-h-screen bg-[#F2F2F1] py-16 px-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-[#D6D6D6] p-8 text-center max-w-md shadow-sm">
          <Briefcase className="w-12 h-12 text-[#9A9A9A] mx-auto mb-3" />
          <h2 className="text-xl font-bold text-[#1E1E1E] mb-2">Opportunity Not Found</h2>
          <p className="text-sm text-[#5C5C5C] mb-6">{error || 'This listing may have expired or is awaiting verification.'}</p>
          <Link
            href="/opportunities"
            className="px-4 py-2 rounded-xl bg-[#1E1E1E] text-white text-sm font-semibold"
          >
            Back to Opportunities
          </Link>
        </div>
      </div>
    );
  }

  const formattedStipend =
    opp.stipend_amount && opp.stipend_amount > 0
      ? `${opp.stipend_currency || 'INR'} ${opp.stipend_amount.toLocaleString()}/mo`
      : 'Unpaid / Research Credit';

  return (
    <div className="min-h-screen bg-[#F2F2F1] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#7A7A7A] mb-4">
          <Link href="/opportunities" className="hover:text-[#1E1E1E] transition-colors">Opportunities</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#1E1E1E] font-medium">{opp.organization}</span>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl border border-[#D6D6D6] p-6 md:p-10 mb-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getOpportunityTypeBadge(opp.opportunity_type)}`}>
                  {opp.opportunity_type}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#F2F2F1] text-[#1E1E1E] capitalize">
                  {opp.mode || 'Remote'}
                </span>
                {opp.is_verified && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EEF3EE] text-[#7A9A7E] border border-[#7A9A7E]/30">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Verified Listing</span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-4xl font-bold text-[#1E1E1E] mb-2 leading-tight">
                {opp.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-[#5C5C5C] mb-6">
                <span className="font-semibold text-[#1E1E1E] flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#7A7A7A]" />
                  {opp.organization}
                </span>
                {opp.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#7A7A7A]" />
                    {opp.location}
                  </span>
                )}
                {opp.duration_weeks && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#7A7A7A]" />
                    {opp.duration_weeks} Weeks
                  </span>
                )}
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-[#F2F2F1] text-xs">
                <div>
                  <span className="text-[#7A7A7A] block mb-0.5">Stipend / Grant</span>
                  <span className="font-bold text-[#1E1E1E] text-sm">{formattedStipend}</span>
                </div>
                <div>
                  <span className="text-[#7A7A7A] block mb-0.5">Application Deadline</span>
                  <div className="text-sm font-semibold text-[#1E1E1E]">
                    <DeadlineCountdown deadline={opp.application_deadline} />
                  </div>
                </div>
                <div>
                  <span className="text-[#7A7A7A] block mb-0.5">Applicants Expressed Interest</span>
                  <span className="font-bold text-[#1E1E1E] text-sm">{opp.applicants_count || 0} Students</span>
                </div>
              </div>
            </div>

            {/* Action Box */}
            <div className="w-full md:w-auto flex flex-col gap-3">
              {/* If student */}
              {isStudent && (
                <div className="p-5 rounded-2xl bg-[#F2F2F1] border border-[#D6D6D6] flex flex-col gap-3 min-w-[260px]">
                  <div className="text-xs text-[#5C5C5C]">
                    <span>Application Status:</span>
                    <div className="mt-1">
                      {applicationStatus ? (
                        <ApplicationStatusBadge status={applicationStatus} />
                      ) : (
                        <span className="text-xs font-medium text-[#7A7A7A]">Not yet applied</span>
                      )}
                    </div>
                  </div>

                  {!applicationStatus || applicationStatus === 'withdrawn' ? (
                    <button
                      onClick={handleApply}
                      disabled={actionLoading}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1E1E1E] hover:bg-black text-white font-semibold text-sm transition-all shadow-sm"
                    >
                      <Send className="w-4 h-4" />
                      <span>Express Interest / Apply</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleWithdraw}
                      disabled={actionLoading}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#B85C5C] hover:bg-[#F5EAEA] transition-all"
                    >
                      <span>Withdraw Interest</span>
                    </button>
                  )}
                </div>
              )}

              {/* Creator or Admin actions */}
              {isCreatorOrAdmin && (
                <Link
                  href={`/opportunities/${opp.slug}/applicants`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#EEBE1E] hover:bg-[#EEBE1E]/90 text-[#1E1E1E] font-semibold text-sm transition-all shadow-sm"
                >
                  <Users className="w-4 h-4" />
                  <span>View Applicants ({opp.applicants_count || 0})</span>
                </Link>
              )}

              {opp.application_url && (
                <a
                  href={opp.application_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[#D6D6D6] bg-white hover:bg-[#F2F2F1] text-[#1E1E1E] font-medium text-xs transition-all"
                >
                  <span>Official Application Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-2xl border border-[#D6D6D6] p-6 md:p-8">
              <h3 className="text-xl font-bold text-[#1E1E1E] mb-4">Role Overview & Responsibilities</h3>
              <p className="text-sm md:text-base text-[#3A3A3A] leading-relaxed whitespace-pre-line">
                {opp.description || 'Detailed specifications and project goals for this role.'}
              </p>
            </div>

            {/* Eligibility */}
            {opp.eligibility && (
              <div className="bg-white rounded-2xl border border-[#D6D6D6] p-6 md:p-8">
                <h3 className="text-xl font-bold text-[#1E1E1E] mb-4">Eligibility Criteria</h3>
                <div className="text-sm text-[#3A3A3A] leading-relaxed whitespace-pre-line">
                  {opp.eligibility}
                </div>
              </div>
            )}

            {/* Required Skills */}
            {opp.required_skills && opp.required_skills.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#D6D6D6] p-6">
                <h3 className="text-base font-bold text-[#1E1E1E] mb-3">Required Technical Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {opp.required_skills.map((skill: string, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-xl bg-[#F2F2F1] text-xs font-semibold text-[#1E1E1E] border border-[#E5E5E4]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#D6D6D6] p-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A7A7A] mb-4">Listing Metadata</h4>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#F2F2F1]">
                  <span className="text-[#7A7A7A]">Posted By</span>
                  <span className="font-semibold text-[#1E1E1E]">{opp.posted_by_name || 'Member'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F2F2F1]">
                  <span className="text-[#7A7A7A]">Contact Email</span>
                  <span className="font-mono text-[#1E1E1E]">{opp.contact_email || 'dept@hub.edu'}</span>
                </div>
                {opp.start_date && (
                  <div className="flex justify-between py-1.5 border-b border-[#F2F2F1]">
                    <span className="text-[#7A7A7A]">Expected Start Date</span>
                    <span className="font-medium text-[#1E1E1E]">{new Date(opp.start_date).toLocaleDateString()}</span>
                  </div>
                )}
                {opp.tags && opp.tags.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[#7A7A7A] block mb-2">Tags</span>
                    <div className="flex flex-wrap gap-1.5">
                      {opp.tags.map((tag: string, i: number) => (
                        <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-[#F2F2F1] text-[#5C5C5C]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
