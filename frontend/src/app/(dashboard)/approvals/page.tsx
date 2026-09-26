"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  FileCheck2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ArrowRight,
  Filter,
  ShieldCheck,
  History
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface ChangeRequestItem {
  id: string;
  requester_email: string;
  resource_type: string;
  resource_id: string;
  action: string;
  status: string;
  created_at: string;
  reviewer_comment?: string;
}

export default function ApprovalsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ChangeRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [pendingCount, setPendingCount] = useState(0);

  const rolesList: string[] = user?.roles ? user.roles.map((r: any) => r.name?.toLowerCase()) : [];
  const isHodOrAdmin = rolesList.includes("admin") || rolesList.includes("hod") || user?.email === "admin@aiml.hub";

  const loadRequests = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await api.get("/approvals/requests", { params });
      setRequests(res.data.items || []);

      const countRes = await api.get("/approvals/requests/pending-count");
      setPendingCount(countRes.data.pending_count || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "pending":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-300">Pending Review</span>;
      case "approved":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-300">Approved</span>;
      case "rejected":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-300">Rejected</span>;
      case "withdrawn":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-canvas text-ink-500 border border-border">Withdrawn</span>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-card">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Faculty → HOD Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            Change Approval Requests
          </h1>
          <p className="text-sm text-ink-500 max-w-xl">
            Track student profile edits, achievement verifications, and academic modifications requiring departmental leadership approval.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/approvals/history"
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-border bg-surface text-ink hover:bg-canvas transition-colors flex items-center gap-2"
          >
            <History className="w-4 h-4 text-ink-400" />
            <span>Decision History</span>
          </Link>

          {isHodOrAdmin && (
            <Link
              href="/approvals/pending"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors flex items-center gap-2 shadow-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Pending Queue ({pendingCount})</span>
            </Link>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between bg-surface p-4 rounded-xl border border-border shadow-card">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-ink-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-medium bg-canvas border border-border rounded-lg px-3 py-1.5 text-ink focus:outline-none focus:border-primary"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </div>

        <span className="text-xs text-ink-400">Total requests: {requests.length}</span>
      </div>

      {/* Requests List Table */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-card">
        {loading ? (
          <div className="p-8 text-center text-xs text-ink-500">Loading change requests...</div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FileCheck2 className="w-10 h-10 text-ink-300 mx-auto" />
            <p className="text-xs font-semibold text-ink-600">No change requests found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas border-b border-border text-ink-500 font-semibold uppercase">
                <tr>
                  <th className="p-4">Resource & Action</th>
                  <th className="p-4">Requester</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Submitted</th>
                  <th className="p-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-canvas/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-ink uppercase text-[11px] tracking-wider text-primary">
                        {r.resource_type.replace("_", " ")}
                      </div>
                      <div className="text-xs text-ink-600 capitalize font-medium mt-0.5">
                        Action: {r.action}
                      </div>
                    </td>

                    <td className="p-4 font-medium text-ink">
                      {r.requester_email || "Faculty"}
                    </td>

                    <td className="p-4">
                      {getStatusBadge(r.status)}
                    </td>

                    <td className="p-4 text-ink-400 text-[11px]">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>

                    <td className="p-4 text-right">
                      <Link
                        href={`/approvals/${r.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas font-semibold text-xs transition-colors"
                      >
                        <span>View Diff</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
