"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  History, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowRight,
  MessageSquare
} from "lucide-react";
import api from "@/lib/api";

interface HistoryItem {
  id: string;
  requester_email: string;
  resource_type: string;
  action: string;
  status: string;
  reviewer_email?: string;
  reviewer_comment?: string;
  reviewed_at?: string;
  created_at: string;
}

export default function ApprovalsHistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        const res = await api.get("/approvals/history");
        setHistory(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <Link
          href="/approvals"
          className="inline-flex items-center gap-1.5 text-xs text-ink-500 hover:text-ink transition-colors font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Requests</span>
        </Link>
        <h1 className="text-2xl font-bold text-ink mt-2">Approval Decision History</h1>
        <p className="text-xs text-ink-500">Historical archive of finalized faculty change requests and HOD determinations.</p>
      </div>

      <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-card">
        {loading ? (
          <div className="p-8 text-center text-xs text-ink-500">Loading historical decisions...</div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <History className="w-10 h-10 text-ink-300 mx-auto" />
            <p className="text-xs font-semibold text-ink-600">No past decisions recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas border-b border-border text-ink-500 font-semibold uppercase">
                <tr>
                  <th className="p-4">Resource & Action</th>
                  <th className="p-4">Requester</th>
                  <th className="p-4">Determination</th>
                  <th className="p-4">Reviewer Comment</th>
                  <th className="p-4">Decided On</th>
                  <th className="p-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-canvas/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-ink uppercase text-[11px] text-primary">
                        {h.resource_type.replace("_", " ")}
                      </div>
                      <div className="text-[11px] text-ink-500 capitalize">
                        {h.action}
                      </div>
                    </td>

                    <td className="p-4 font-medium text-ink">
                      {h.requester_email || "Faculty"}
                    </td>

                    <td className="p-4">
                      {h.status === "approved" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Approved
                        </span>
                      ) : h.status === "rejected" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-500/10 px-2.5 py-0.5 rounded-full">
                          <XCircle className="w-3 h-3" /> Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-ink-500 bg-canvas px-2.5 py-0.5 rounded-full border border-border">
                          Withdrawn
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-ink-600 max-w-xs truncate">
                      {h.reviewer_comment || "--"}
                    </td>

                    <td className="p-4 text-ink-400 text-[11px]">
                      {h.reviewed_at ? new Date(h.reviewed_at).toLocaleDateString() : "--"}
                    </td>

                    <td className="p-4 text-right">
                      <Link
                        href={`/approvals/${h.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas font-semibold text-xs"
                      >
                        <span>View</span>
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
