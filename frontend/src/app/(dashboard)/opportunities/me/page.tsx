'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Briefcase, Send, CheckCircle, Clock, Trash2, ArrowRight, ExternalLink } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { ApplicationStatusBadge } from '@/components/features/opportunities/ApplicationStatusBadge';

export default function MyOpportunitiesPage() {
  const { user } = useAuth();
  const [data, setData] = useState<{ applications: any[]; posted: any[] }>({
    applications: [],
    posted: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'applications' | 'posted'>('applications');

  const isFacultyOrAlumni = user && ['faculty', 'hod', 'admin', 'alumni'].includes(user.role || '');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/opportunities/me');
      setData({
        applications: res.data?.applications || [],
        posted: res.data?.posted || [],
      });
      // Default tab based on role
      if (user && user.role !== 'student' && res.data?.posted?.length > 0) {
        setActiveTab('posted');
      }
    } catch (err) {
      console.error('Failed to load my opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleWithdraw = async (opportunityId: string) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return;
    try {
      await api.delete(`/opportunities/${opportunityId}/apply`);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to withdraw application');
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F1] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1E1E1E]">My Opportunities & Applications</h1>
            <p className="text-xs md:text-sm text-[#7A7A7A]">Track your expressed interest, application statuses, and posted openings</p>
          </div>

          {isFacultyOrAlumni && (
            <Link
              href="/opportunities/create"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E1E1E] text-white text-xs font-semibold hover:bg-black transition-all"
            >
              <span>Post New Opening</span>
            </Link>
          )}
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-[#D6D6D6] mb-6 gap-4">
          <button
            onClick={() => setActiveTab('applications')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'applications'
                ? 'border-[#1E1E1E] text-[#1E1E1E]'
                : 'border-transparent text-[#7A7A7A] hover:text-[#1E1E1E]'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>My Applications ({data.applications.length})</span>
          </button>

          {isFacultyOrAlumni && (
            <button
              onClick={() => setActiveTab('posted')}
              className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'posted'
                  ? 'border-[#1E1E1E] text-[#1E1E1E]'
                  : 'border-transparent text-[#7A7A7A] hover:text-[#1E1E1E]'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Posted by Me ({data.posted.length})</span>
            </button>
          )}
        </div>

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            {loading ? (
              <div className="h-48 bg-white rounded-2xl border border-[#D6D6D6] animate-pulse" />
            ) : data.applications.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#D6D6D6] p-12 text-center text-[#7A7A7A]">
                <Send className="w-12 h-12 mx-auto text-[#9A9A9A] mb-3 opacity-50" />
                <h4 className="text-base font-bold text-[#1E1E1E] mb-1">No Applications Yet</h4>
                <p className="text-sm mb-4">You have not expressed interest in any internships or trainings.</p>
                <Link
                  href="/opportunities"
                  className="px-4 py-2 rounded-xl bg-[#1E1E1E] text-white text-xs font-semibold"
                >
                  Browse Available Opportunities
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#D6D6D6] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-[#EAEAE8]/60 text-[#3A3A3A] font-semibold text-xs border-b border-[#E5E5E4]">
                        <th className="py-3 px-6">Opportunity</th>
                        <th className="py-3 px-6">Organization</th>
                        <th className="py-3 px-6">Type & Mode</th>
                        <th className="py-3 px-6">Status</th>
                        <th className="py-3 px-6">Applied On</th>
                        <th className="py-3 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5E4]">
                      {data.applications.map(app => (
                        <tr key={app.application_id} className="hover:bg-[#F2F2F1]/50 transition-colors">
                          <td className="py-3.5 px-6 font-semibold text-[#1E1E1E]">
                            <Link href={`/opportunities/${app.opportunity_slug}`} className="hover:underline">
                              {app.opportunity_title}
                            </Link>
                          </td>
                          <td className="py-3.5 px-6 text-xs text-[#5C5C5C]">
                            {app.organization}
                          </td>
                          <td className="py-3.5 px-6">
                            <span className="text-xs capitalize px-2 py-0.5 rounded bg-[#F2F2F1] text-[#1E1E1E]">
                              {app.opportunity_type} &bull; {app.mode}
                            </span>
                          </td>
                          <td className="py-3.5 px-6">
                            <ApplicationStatusBadge status={app.status} />
                          </td>
                          <td className="py-3.5 px-6 text-xs text-[#7A7A7A]">
                            {new Date(app.applied_at).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-6 text-right">
                            {app.status !== 'withdrawn' && (
                              <button
                                onClick={() => handleWithdraw(app.opportunity_id)}
                                className="text-xs text-[#B85C5C] hover:underline"
                              >
                                Withdraw
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Posted Tab */}
        {activeTab === 'posted' && (
          <div className="space-y-4">
            {loading ? (
              <div className="h-48 bg-white rounded-2xl border border-[#D6D6D6] animate-pulse" />
            ) : data.posted.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#D6D6D6] p-12 text-center text-[#7A7A7A]">
                <Briefcase className="w-12 h-12 mx-auto text-[#9A9A9A] mb-3 opacity-50" />
                <h4 className="text-base font-bold text-[#1E1E1E] mb-1">No Postings Yet</h4>
                <p className="text-sm mb-4">You have not posted any internship or training listings.</p>
                <Link
                  href="/opportunities/create"
                  className="px-4 py-2 rounded-xl bg-[#1E1E1E] text-white text-xs font-semibold"
                >
                  Create Your First Listing
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#D6D6D6] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-[#EAEAE8]/60 text-[#3A3A3A] font-semibold text-xs border-b border-[#E5E5E4]">
                        <th className="py-3 px-6">Title</th>
                        <th className="py-3 px-6">Organization</th>
                        <th className="py-3 px-6">Type</th>
                        <th className="py-3 px-6">Verification</th>
                        <th className="py-3 px-6">Posted Date</th>
                        <th className="py-3 px-6 text-right">Applicants</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5E4]">
                      {data.posted.map(opp => (
                        <tr key={opp.id} className="hover:bg-[#F2F2F1]/50 transition-colors">
                          <td className="py-3.5 px-6 font-semibold text-[#1E1E1E]">
                            <Link href={`/opportunities/${opp.slug}`} className="hover:underline">
                              {opp.title}
                            </Link>
                          </td>
                          <td className="py-3.5 px-6 text-xs text-[#5C5C5C]">
                            {opp.organization}
                          </td>
                          <td className="py-3.5 px-6 text-xs capitalize">
                            {opp.opportunity_type}
                          </td>
                          <td className="py-3.5 px-6">
                            {opp.is_verified ? (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-[#EEF3EE] text-[#7A9A7E] font-semibold">
                                Verified
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-[#FAF3E2] text-[#D9A441] font-semibold">
                                Pending HOD Review
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-6 text-xs text-[#7A7A7A]">
                            {new Date(opp.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-6 text-right">
                            <Link
                              href={`/opportunities/${opp.slug}/applicants`}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E1E1E] hover:text-[#7A9A7E]"
                            >
                              <span>Manage Applicants</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
