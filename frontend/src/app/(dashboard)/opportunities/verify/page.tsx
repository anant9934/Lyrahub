'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, XCircle, AlertCircle, ArrowLeft, Building2, MapPin, ExternalLink } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function VerifyOpportunitiesPage() {
  const { user } = useAuth();
  const [unverified, setUnverified] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const isHodOrAdmin = user && ['hod', 'admin'].includes(user.role || '');

  const loadUnverified = async () => {
    try {
      setLoading(true);
      const res = await api.get('/opportunities?verified_only=false&page_size=50');
      // Filter out those already verified
      const pending = (res.data?.items || []).filter((item: any) => !item.is_verified);
      setUnverified(pending);
    } catch (err) {
      console.error('Failed to load unverified opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnverified();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      setActionId(id);
      await api.post(`/opportunities/${id}/verify`);
      await loadUnverified();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to verify opportunity');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Reject and delete this opportunity listing?')) return;
    try {
      setActionId(id);
      await api.delete(`/opportunities/${id}`);
      await loadUnverified();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to reject opportunity');
    } finally {
      setActionId(null);
    }
  };

  if (!isHodOrAdmin && !loading) {
    return (
      <div className="min-h-screen bg-[#F6F8FC] p-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-[#DCE5F1] p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-[#B85C5C] mx-auto mb-3" />
          <h2 className="text-xl font-bold text-[#0F172A] mb-2">Access Restricted</h2>
          <p className="text-sm text-[#526783] mb-6">Only HOD or Administrators can verify and approve official opportunities.</p>
          <Link href="/opportunities" className="px-4 py-2 rounded-xl bg-[#0F172A] text-white text-sm font-semibold">
            Browse Opportunities
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8FC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-1.5 text-xs text-[#667A93] hover:text-[#0F172A] transition-colors mb-3 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Opportunities</span>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A]">Opportunities Verification Queue</h1>
          <p className="text-xs md:text-sm text-[#667A93]">Review pending internship and training submissions from faculty and alumni</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-white rounded-2xl border border-[#DCE5F1] animate-pulse" />
            ))}
          </div>
        ) : unverified.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#DCE5F1] p-12 text-center text-[#667A93]">
            <CheckCircle2 className="w-12 h-12 mx-auto text-[#7A9A7E] mb-3 opacity-60" />
            <h4 className="text-base font-bold text-[#0F172A] mb-1">Queue is Empty</h4>
            <p className="text-sm">All posted opportunities have been reviewed and verified.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {unverified.map(opp => (
              <div
                key={opp.id}
                className="bg-white rounded-2xl border border-[#DCE5F1] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#94B0B8] transition-all shadow-sm"
              >
                <div className="max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize bg-[#FAF3E2] text-[#B8860B] border border-[#FACC15]/40">
                      {opp.opportunity_type}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs bg-[#F6F8FC] text-[#526783] capitalize">
                      {opp.mode}
                    </span>
                    <span className="text-xs text-[#667A93]">
                      Posted by <strong>{opp.posted_by_name || 'Member'}</strong>
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#0F172A] mb-1">
                    {opp.title}
                  </h3>
                  <p className="text-xs font-semibold text-[#526783] mb-2 flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-[#667A93]" />
                    <span>{opp.organization}</span>
                    {opp.location && <span>&bull; {opp.location}</span>}
                  </p>

                  <p className="text-xs text-[#526783] line-clamp-2 leading-relaxed">
                    {opp.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => handleReject(opp.id)}
                    disabled={actionId === opp.id}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#DCE5F1] hover:bg-[#F5EAEA] text-[#B85C5C] font-semibold text-xs transition-all"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() => handleApprove(opp.id)}
                    disabled={actionId === opp.id}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#7A9A7E] hover:bg-[#68856C] text-white font-semibold text-xs transition-all shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Broadcast</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
