"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  BrainCircuit, 
  Clock, 
  Award, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Play, 
  ArrowLeft,
  ShieldAlert,
  Calendar
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { WorkspaceHero } from "@/components/layout/WorkspaceHero";

export default function TestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const slug = params?.slug as string;

  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTest() {
      try {
        setLoading(true);
        const res = await api.get(`/tests/${slug}`);
        setTest(res.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to load test details");
      } finally {
        setLoading(false);
      }
    }
    if (slug) loadTest();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-sm text-ink-500">Loading assessment details...</p>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-ink">{error || "Test not found"}</h2>
        <Link
          href="/tests"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border text-sm font-semibold hover:bg-canvas"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tests</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back link */}
      <div>
        <Link
          href="/tests"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Knowledge Tests</span>
        </Link>
      </div>

      <WorkspaceHero
        eyebrow="Assessment overview"
        title={test.title}
        description={test.description || "Review the assessment details before you begin."}
        tone="orange"
        icon={BrainCircuit}
      />

      {/* Main Card */}
      <div className="rounded-[26px] border border-[#dce5f1] bg-white p-6 shadow-[0_14px_38px_rgba(8,26,57,0.07)] sm:p-8 space-y-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-primary px-3 py-1 rounded-full bg-primary/10">
              {test.domain.toUpperCase().replace("_", " ")}
            </span>
            <span className="text-xs font-semibold text-ink-600 px-3 py-1 rounded-full bg-canvas border border-border">
              {test.difficulty.toUpperCase()}
            </span>
          </div>

          <h2 className="text-xl font-black tracking-tight text-[#081a39]">At a glance</h2>
        </div>

        {/* Quick Spec Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-canvas border border-border text-center">
          <div>
            <span className="block text-[11px] font-semibold uppercase text-ink-400">Duration</span>
            <span className="text-lg font-bold text-ink flex items-center justify-center gap-1 mt-0.5">
              <Clock className="w-4 h-4 text-primary" />
              {test.duration_minutes} min
            </span>
          </div>
          <div>
            <span className="block text-[11px] font-semibold uppercase text-ink-400">Questions</span>
            <span className="text-lg font-bold text-ink flex items-center justify-center gap-1 mt-0.5">
              <HelpCircle className="w-4 h-4 text-blue-500" />
              {test.total_questions || test.questions_count}
            </span>
          </div>
          <div>
            <span className="block text-[11px] font-semibold uppercase text-ink-400">Total Marks</span>
            <span className="text-lg font-bold text-ink flex items-center justify-center gap-1 mt-0.5">
              <Award className="w-4 h-4 text-amber-500" />
              {test.total_marks}
            </span>
          </div>
          <div>
            <span className="block text-[11px] font-semibold uppercase text-ink-400">Passing Score</span>
            <span className="text-lg font-bold text-ink flex items-center justify-center gap-1 mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              {test.passing_marks || Math.ceil(test.total_marks / 2)}
            </span>
          </div>
        </div>

        {/* Instructions & Proctoring Rules */}
        <div className="rounded-xl border border-border bg-amber-500/5 p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>Important Assessment Guidelines</span>
          </div>
          <ul className="text-xs text-ink-600 space-y-1.5 list-disc list-inside">
            <li><strong>Single Attempt Rule:</strong> You can attempt this assessment exactly once. Once you start, you cannot restart.</li>
            <li><strong>Server-Side Timer:</strong> The timer runs continuously on the server. If the timer runs out, your answers are automatically submitted.</li>
            <li><strong>Ranking Credit Weight:</strong> Your test score is integrated into the Department Ranking criteria (25% weight).</li>
            <li><strong>Proctoring:</strong> Your client IP address and submission timestamps are logged for academic integrity.</li>
          </ul>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-ink-500">
            {test.has_attempted ? (
              <span className="text-emerald-600 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Assessment completed
              </span>
            ) : (
              <span>Ready when you are. Ensure a stable internet connection.</span>
            )}
          </div>

          <div>
            {test.has_attempted ? (
              <Link
                href={`/tests/${test.slug}/result`}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-surface border border-border text-ink font-semibold text-sm hover:bg-canvas transition-colors shadow-sm"
              >
                <span>View My Results & Answers</span>
              </Link>
            ) : (
              <Link
                href={`/tests/${test.slug}/attempt`}
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Assessment</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
