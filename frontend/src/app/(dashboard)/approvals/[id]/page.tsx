"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileCheck2, 
  AlertTriangle,
  Send,
  MessageSquare
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function ChangeRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params?.id as string;

  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectComment, setRejectComment] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const rolesList: string[] = user?.roles ? user.roles.map((r: any) => r.name?.toLowerCase()) : [];
  const isHodOrAdmin = rolesList.includes("admin") || rolesList.includes("hod") || user?.email === "admin@aiml.hub";

  const loadDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/approvals/requests/${id}`);
      setRequest(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load change request");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadDetail();
  }, [id]);

  const handleApprove = async () => {
    if (!confirm("Are you sure you want to approve this change request and apply the changes?")) return;
    try {
      setActionLoading(true);
      await api.post(`/approvals/requests/${id}/approve`);
      loadDetail();
    } catch (err: any) {
      alert("Error approving request: " + (err.response?.data?.detail || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await api.post(`/approvals/requests/${id}/reject`, { comment: rejectComment });
      setShowRejectModal(false);
      loadDetail();
    } catch (err: any) {
      alert("Error rejecting request: " + (err.response?.data?.detail || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!confirm("Withdraw this change request?")) return;
    try {
      setActionLoading(true);
      await api.post(`/approvals/requests/${id}/withdraw`);
      loadDetail();
    } catch (err: any) {
      alert("Error withdrawing request: " + (err.response?.data?.detail || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-xs text-ink-500">
        Loading change request diff...
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-ink">{error || "Request not found"}</h2>
        <Link href="/approvals" className="text-xs text-primary font-semibold hover:underline">
          Back to Approvals
        </Link>
      </div>
    );
  }

  const payloadKeys = Object.keys(request.payload || {});
  const isPending = request.status === "pending";
  const isRequester = user && user.id === request.requester_id;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb */}
      <div>
        <Link
          href="/approvals"
          className="inline-flex items-center gap-1.5 text-xs text-ink-500 hover:text-ink transition-colors font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Requests</span>
        </Link>
      </div>

      {/* Header Summary */}
      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 space-y-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-primary uppercase tracking-wider px-2.5 py-0.5 rounded bg-primary/10">
                {request.resource_type.replace("_", " ")}
              </span>
              <span className="text-xs text-ink-400 capitalize">Action: {request.action}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-ink">Change Request Evaluation</h1>
            <p className="text-xs text-ink-500">Submitted by: {request.requester_email || "Faculty"}</p>
          </div>

          <div>
            {request.status === "pending" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-300">
                <Clock className="w-3.5 h-3.5" /> Pending Review
              </span>
            )}
            {request.status === "approved" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" /> Approved
              </span>
            )}
            {request.status === "rejected" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-300">
                <XCircle className="w-3.5 h-3.5" /> Rejected
              </span>
            )}
            {request.status === "withdrawn" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-canvas text-ink-500 border border-border">
                Withdrawn
              </span>
            )}
          </div>
        </div>

        {/* Reviewer Note if available */}
        {request.reviewer_comment && (
          <div className="p-4 rounded-xl bg-canvas border border-border space-y-1">
            <span className="text-xs font-bold text-ink flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-primary" />
              <span>Reviewer Feedback ({request.reviewer_email || "HOD"}):</span>
            </span>
            <p className="text-xs text-ink-600 pl-5">{request.reviewer_comment}</p>
          </div>
        )}

        {/* Side-by-Side Diff View */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-ink uppercase tracking-wider">Side-by-Side Diff View</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Current State */}
            <div className="rounded-xl border border-border bg-canvas/40 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-xs font-bold text-ink-500 uppercase">Current Snapshot</span>
                <span className="text-[11px] text-ink-400">Existing database state</span>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                {payloadKeys.map((key) => {
                  const currentVal = request.current_state?.[key];
                  return (
                    <div key={key} className="p-2.5 rounded-lg bg-surface border border-border">
                      <span className="font-sans font-bold text-ink-400 block text-[10px] uppercase mb-0.5">{key}</span>
                      <span className="text-ink-600 break-words">
                        {currentVal !== undefined && currentVal !== null ? JSON.stringify(currentVal) : "null"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Proposed Payload */}
            <div className="rounded-xl border border-border bg-[#94B0B8]/10 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-xs font-bold text-[#7A9A7E] uppercase">Proposed Changes</span>
                <span className="text-[11px] text-[#7A9A7E] font-semibold">New values to apply</span>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                {payloadKeys.map((key) => {
                  const newVal = request.payload?.[key];
                  return (
                    <div key={key} className="p-2.5 rounded-lg bg-white border border-[#94B0B8]/30 shadow-sm">
                      <span className="font-sans font-bold text-[#7A9A7E] block text-[10px] uppercase mb-0.5">{key}</span>
                      <span className="text-ink font-semibold break-words">
                        {newVal !== undefined && newVal !== null ? JSON.stringify(newVal) : "null"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isPending && (
          <div className="pt-6 border-t border-border flex flex-wrap items-center justify-end gap-3">
            {isRequester && (
              <button
                disabled={actionLoading}
                onClick={handleWithdraw}
                className="px-4 py-2 rounded-xl border border-border bg-surface text-ink hover:bg-canvas text-xs font-semibold"
              >
                Withdraw Request
              </button>
            )}

            {isHodOrAdmin && (
              <>
                <button
                  disabled={actionLoading}
                  onClick={() => setShowRejectModal(true)}
                  className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 text-xs font-bold transition-colors"
                >
                  Reject with Feedback
                </button>

                <button
                  disabled={actionLoading}
                  onClick={handleApprove}
                  className="px-6 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold transition-colors shadow-sm"
                >
                  {actionLoading ? "Applying..." : "Approve & Apply Changes"}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-ink">Reject Change Request</h3>
            <p className="text-xs text-ink-500">Please provide a reason or constructive feedback to the faculty requester:</p>

            <form onSubmit={handleReject} className="space-y-4 text-xs">
              <textarea
                required
                rows={3}
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                placeholder="e.g. CGPA documentation required before updating official record..."
                className="w-full p-2.5 rounded-lg border border-border bg-canvas text-ink focus:outline-none focus:border-primary"
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 rounded-lg border border-border text-ink hover:bg-canvas font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700"
                >
                  {actionLoading ? "Submitting..." : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
