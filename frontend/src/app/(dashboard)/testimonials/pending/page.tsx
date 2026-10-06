'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { ModerationActions } from '@/components/features/testimonials/ModerationActions';
import { ArrowLeft, ShieldCheck, Star, Clock, AlertCircle } from 'lucide-react';

export default function PendingTestimonialsPage() {
  const { user } = useAuth();
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isHODorAdmin = Boolean(
    user && ['admin', 'hod'].includes(user.role?.toLowerCase() || '')
  );

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await apiGet('/testimonials/pending?page_size=50');
      setPending(res.items || []);
    } catch (err) {
      console.error('Failed to load pending testimonials', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isHODorAdmin) {
      fetchPending();
    }
  }, [isHODorAdmin]);

  if (!isHODorAdmin) {
    return (
      <div className="bg-white border border-[#DCE5F1] rounded-2xl p-12 text-center max-w-md mx-auto my-12 space-y-4">
        <div className="w-12 h-12 bg-[#F5EAEA] text-[#B85C5C] rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-[#0F172A]">Access Denied</h2>
        <p className="text-xs text-[#667A93]">Only HOD or Administrators can access the moderation queue.</p>
        <Link
          href="/testimonials"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F172A] bg-[#F6F8FC] hover:bg-[#DCE5F1] px-4 py-2 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Testimonials
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCE5F1] pb-6">
        <div>
          <Link
            href="/testimonials"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#526783] hover:text-[#0F172A] mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Public Testimonials
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-[#0F172A]">Testimonial Moderation Queue</h1>
            <span className="text-xs bg-[#FAF3E2] text-[#D9A441] border border-[#D9A441]/30 font-bold px-2.5 py-0.5 rounded-full">
              {pending.length} Pending
            </span>
          </div>
          <p className="text-sm text-[#526783] mt-1">
            Review, approve, or reject student, alumni, and partner testimonials before public display.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#0F172A] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#667A93]">Loading moderation queue...</p>
        </div>
      ) : pending.length === 0 ? (
        <div className="bg-white border border-[#DCE5F1] rounded-2xl p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 bg-[#EEF3EE] text-[#7A9A7E] rounded-full flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#0F172A]">Queue is Clean!</h3>
          <p className="text-xs text-[#667A93]">
            All submitted testimonials have been reviewed and moderated.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-[#DCE5F1] rounded-2xl p-6 flex flex-col md:flex-row md:items-start justify-between gap-6 shadow-sm"
            >
              <div className="space-y-3 flex-1">
                {/* Meta Header */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] bg-[#EAF0F3] text-[#6B8FA3] px-2.5 py-0.5 rounded-full font-semibold capitalize">
                    {item.author_type}
                  </span>
                  <span className="text-[11px] bg-[#F6F8FC] text-[#526783] px-2.5 py-0.5 rounded-full font-medium capitalize">
                    {item.context?.replace('_', ' ')}
                  </span>
                  {item.rating && (
                    <div className="flex items-center gap-0.5 text-xs text-[#EEBE1E]">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="font-semibold text-[#0F172A]">{item.rating}/5</span>
                    </div>
                  )}
                  <span className="text-[11px] text-[#667A93] flex items-center gap-1 ml-auto md:ml-0">
                    <Clock className="w-3 h-3" />
                    {item.created_at ? new Date(item.created_at).toLocaleString() : ''}
                  </span>
                </div>

                {/* Testimonial Quote */}
                <p className="text-sm text-[#0F172A] font-medium leading-relaxed italic bg-[#F6F8FC]/50 p-4 rounded-xl border border-[#DCE5F1]/50">
                  "{item.text}"
                </p>

                {/* Author Info */}
                <div className="text-xs text-[#526783]">
                  <strong>{item.author_name}</strong> {item.author_role ? `• ${item.author_role}` : ''}
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2 md:pt-0 self-end md:self-center">
                <ModerationActions
                  testimonialId={item.id}
                  isPublished={item.is_published}
                  isFeatured={item.is_featured}
                  onActionComplete={fetchPending}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
