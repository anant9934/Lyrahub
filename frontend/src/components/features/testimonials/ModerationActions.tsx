'use client';

import React, { useState } from 'react';
import { apiPost } from '@/lib/api';
import { Check, X, Sparkles } from 'lucide-react';

interface ModerationActionsProps {
  testimonialId: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  onActionComplete: () => void;
}

export const ModerationActions: React.FC<ModerationActionsProps> = ({
  testimonialId,
  isPublished,
  isFeatured,
  onActionComplete
}) => {
  const [loading, setLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('Does not meet department guidelines');

  const handleApprove = async () => {
    setLoading(true);
    try {
      await apiPost(`/testimonials/${testimonialId}/approve`, {});
      onActionComplete();
    } catch (err) {
      console.error('Failed to approve', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await apiPost(`/testimonials/${testimonialId}/reject`, { reason: rejectReason });
      setShowRejectModal(false);
      onActionComplete();
    } catch (err) {
      console.error('Failed to reject', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeature = async () => {
    setLoading(true);
    try {
      await apiPost(`/testimonials/${testimonialId}/feature`, {});
      onActionComplete();
    } catch (err) {
      console.error('Failed to toggle feature', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {!isPublished ? (
        <>
          <button
            type="button"
            disabled={loading}
            onClick={handleApprove}
            className="inline-flex items-center gap-1 bg-[#EEF3EE] hover:bg-[#7A9A7E] text-[#7A9A7E] hover:text-white border border-[#7A9A7E]/30 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" /> Approve
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => setShowRejectModal(true)}
            className="inline-flex items-center gap-1 bg-[#F5EAEA] hover:bg-[#B85C5C] text-[#B85C5C] hover:text-white border border-[#B85C5C]/30 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <X className="w-3.5 h-3.5" /> Reject
          </button>
        </>
      ) : (
        <button
          type="button"
          disabled={loading}
          onClick={handleToggleFeature}
          className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border font-semibold transition-colors ${
            isFeatured
              ? 'bg-[#FACC15] text-[#0F172A] border-[#FACC15]'
              : 'bg-white hover:bg-[#FAF3E2] text-[#0F172A] border-[#DCE5F1]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          {isFeatured ? 'Featured' : 'Feature'}
        </button>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-[#DCE5F1]">
            <h3 className="text-base font-bold text-[#0F172A]">Reject Testimonial</h3>
            <p className="text-xs text-[#526783]">
              Please state why this testimonial is being rejected for the department audit log:
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-2.5 border border-[#DCE5F1] rounded-lg text-xs bg-white focus:outline-none focus:border-[#94B0B8]"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-3 py-1.5 text-xs text-[#526783] hover:text-[#0F172A]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleReject}
                className="px-3.5 py-1.5 bg-[#B85C5C] text-white rounded-lg text-xs font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
