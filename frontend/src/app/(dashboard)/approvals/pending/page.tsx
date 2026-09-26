"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  Clock,
  Layers
} from "lucide-react";
import api from "@/lib/api";

interface ChangeRequestItem {
  id: string;
  requester_email: string;
  resource_type: string;
  resource_id: string;
  action: string;
  status: string;
  created_at: string;
  payload: any;
}

export default function PendingApprovalsQueuePage() {
  const [requests, setRequests] = useState<ChangeRequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPending = async () => {
    try {
      setLoading(true);
      const res = await api.get("/approvals/requests?status=pending");
      setRequests(res.data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleQuickApprove = async (id: string) => {
    if (!confirm("Approve this change request and apply updates to database?")) return;
    try {
      await api.post(`/approvals/requests/${id}/approve`);
      loadPending();
    } catch (err: any) {
      alert("Error approving: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <Link
          href="/approvals"
          className="inline-flex items-center gap-1.5 text-xs text-ink-500 hover:text-ink transition-colors font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Change Requests</span>
        </Link>
        <h1 className="text-2xl font-bold text-ink mt-2">HOD Pending Approvals Queue</h1>
        <p className="text-xs text-ink-500">Review and authorize pending faculty modification requests.</p>
      </div>

      <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-card">
        <div className="p-4 border-b border-border bg-amber-500/10 flex items-center justify-between">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Pending Authorizations Queue</span>
          </span>
          <span className="text-xs font-bold text-amber-700">{requests.length} Pending</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-ink-500">Loading pending requests...</div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-ink">Queue is Empty</h3>
            <p className="text-xs text-ink-500">All faculty change requests have been evaluated.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {requests.map((r) => (
              <div key={r.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-canvas/30 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary uppercase bg-primary/10 px-2.5 py-0.5 rounded">
                      {r.resource_type.replace("_", " ")}
                    </span>
                    <span className="text-xs font-medium text-ink-600">Action: {r.action}</span>
                  </div>
                  <div className="text-sm font-bold text-ink">
                    Requested by: {r.requester_email || "Faculty"}
                  </div>
                  <div className="text-xs text-ink-400 font-mono">
                    Changes: {Object.keys(r.payload || {}).join(", ")}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/approvals/${r.id}`}
                    className="px-3.5 py-2 rounded-xl border border-border bg-surface text-ink hover:bg-canvas font-semibold text-xs flex items-center gap-1.5"
                  >
                    <span>Inspect Diff</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => handleQuickApprove(r.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs shadow-sm transition-colors"
                  >
                    Quick Approve
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
