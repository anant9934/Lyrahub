"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Award, 
  FileText
} from "lucide-react";
import api from "@/lib/api";

interface AttemptRecord {
  id: string;
  student_id: string;
  student_email: string;
  student_reg_no: string;
  started_at: string;
  submitted_at: string;
  time_taken_seconds: number;
  score: number;
  total_marks: number;
  percentage: number;
  passed: boolean;
  status: string;
}

export default function TestAttemptsTablePage() {
  const params = useParams();
  const testId = params?.id as string;

  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAttempts() {
      try {
        setLoading(true);
        const res = await api.get(`/tests/${testId}/attempts`);
        setAttempts(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (testId) loadAttempts();
  }, [testId]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <Link
          href="/tests/manage"
          className="inline-flex items-center gap-1.5 text-xs text-ink-500 hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Tests Management</span>
        </Link>
        <h1 className="text-2xl font-bold text-ink mt-2">Student Assessment Submissions</h1>
        <p className="text-xs text-ink-500">Real-time candidate attempts, grading breakdown, and completion statuses.</p>
      </div>

      <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-card">
        <div className="p-4 border-b border-border bg-canvas/50 flex items-center justify-between">
          <span className="text-xs font-bold text-ink uppercase tracking-wider">Candidate Submissions</span>
          <span className="text-xs text-ink-500">Total Attempts: {attempts.length}</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-ink-500">Loading candidate attempts...</div>
        ) : attempts.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users className="w-10 h-10 text-ink-300 mx-auto" />
            <p className="text-xs font-semibold text-ink-600">No attempts submitted yet for this assessment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas border-b border-border text-ink-500 font-semibold uppercase">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Score</th>
                  <th className="p-4">Percentage</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Time Taken</th>
                  <th className="p-4">Submitted At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {attempts.map((a) => (
                  <tr key={a.id} className="hover:bg-canvas/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-ink">{a.student_email}</div>
                      <div className="text-[11px] text-ink-400 font-mono">{a.student_reg_no}</div>
                    </td>

                    <td className="p-4 font-bold text-ink">
                      {a.score !== null ? `${a.score} / ${a.total_marks}` : "In Progress"}
                    </td>

                    <td className="p-4">
                      {a.percentage !== null ? (
                        <span className={`font-bold ${a.passed ? "text-emerald-600" : "text-amber-600"}`}>
                          {a.percentage}%
                        </span>
                      ) : (
                        "--"
                      )}
                    </td>

                    <td className="p-4">
                      {a.passed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Passed
                        </span>
                      ) : a.status === "in_progress" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" /> In Progress
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded-full">
                          <XCircle className="w-3 h-3" /> Failed
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-ink-600">
                      {a.time_taken_seconds ? `${Math.floor(a.time_taken_seconds / 60)}m ${a.time_taken_seconds % 60}s` : "--"}
                    </td>

                    <td className="p-4 text-ink-400 text-[11px]">
                      {a.submitted_at ? new Date(a.submitted_at).toLocaleString() : "Not submitted"}
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
