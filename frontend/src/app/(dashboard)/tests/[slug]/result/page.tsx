"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Award, 
  ArrowLeft, 
  ArrowRight,
  BookOpen,
  HelpCircle,
  AlertTriangle
} from "lucide-react";
import api from "@/lib/api";

export default function TestResultPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadResult() {
      try {
        setLoading(true);
        // Get test id by slug first
        const testRes = await api.get(`/tests/${slug}`);
        const testId = testRes.data.id;

        // Get attempt
        const attRes = await api.get(`/tests/${testId}/my-attempt`);
        setResult(attRes.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to load test results");
      } finally {
        setLoading(false);
      }
    }
    if (slug) loadResult();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-sm font-semibold text-ink-600">Calculating your official score breakdown...</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-ink">{error || "No attempt results found"}</h2>
        <Link
          href={`/tests/${slug}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border text-xs font-semibold hover:bg-canvas"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Test Overview</span>
        </Link>
      </div>
    );
  }

  const formatSeconds = (sec?: number) => {
    if (!sec) return "0s";
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}m ${s}s`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb */}
      <div>
        <Link
          href="/tests"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Assessments</span>
        </Link>
      </div>

      {/* Score Hero Card */}
      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 space-y-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-ink-400 uppercase tracking-wider">Assessment Results</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-ink">{result.test_title}</h1>
          </div>

          <div>
            {result.passed ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4" />
                <span>PASSED</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                <XCircle className="w-4 h-4" />
                <span>NEEDS IMPROVEMENT</span>
              </span>
            )}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-xl bg-canvas border border-border">
            <span className="block text-[11px] font-semibold uppercase text-ink-400">Score</span>
            <span className="text-2xl font-black text-ink mt-0.5">
              {result.score} / {result.total_marks}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-canvas border border-border">
            <span className="block text-[11px] font-semibold uppercase text-ink-400">Percentage</span>
            <span className={`text-2xl font-black mt-0.5 ${result.passed ? "text-emerald-600" : "text-amber-600"}`}>
              {result.percentage}%
            </span>
          </div>

          <div className="p-4 rounded-xl bg-canvas border border-border">
            <span className="block text-[11px] font-semibold uppercase text-ink-400">Time Taken</span>
            <span className="text-xl font-bold text-ink mt-0.5 flex items-center justify-center gap-1">
              <Clock className="w-4 h-4 text-primary" />
              {formatSeconds(result.time_taken_seconds)}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-canvas border border-border">
            <span className="block text-[11px] font-semibold uppercase text-ink-400">Ranking Weight</span>
            <span className="text-xl font-bold text-amber-500 mt-0.5 flex items-center justify-center gap-1">
              <Award className="w-4 h-4" />
              25%
            </span>
          </div>
        </div>
      </div>

      {/* Question by Question Detailed Breakdown */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-ink flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <span>Detailed Answer Explanations</span>
        </h2>

        <div className="space-y-4">
          {result.questions_breakdown?.map((q: any, idx: number) => {
            const userAnsStr = Array.isArray(q.user_answer)
              ? q.user_answer.join(", ").toUpperCase()
              : (q.user_answer || "Not answered");
            const correctAnsStr = Array.isArray(q.correct_answer)
              ? q.correct_answer.join(", ").toUpperCase()
              : String(q.correct_answer);

            const isCorrect = Array.isArray(q.correct_answer)
              ? JSON.stringify(q.user_answer) === JSON.stringify(q.correct_answer)
              : String(q.user_answer).trim().toLowerCase() === String(q.correct_answer).trim().toLowerCase();

            return (
              <div
                key={q.id || idx}
                className="rounded-xl border border-border bg-surface p-5 space-y-4 shadow-card"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-canvas text-ink-600 border border-border">
                      Q{idx + 1}
                    </span>
                    <span className="text-xs text-ink-400">({q.marks} {q.marks === 1 ? "mark" : "marks"})</span>
                  </div>

                  <div>
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Correct (+{q.marks})</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-500/10 px-2.5 py-0.5 rounded-full">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Incorrect (0)</span>
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm font-semibold text-ink leading-relaxed">
                  {q.question_text}
                </p>

                {/* Options if MCQ */}
                {q.options && q.options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt: any) => {
                      const isUserChoice = Array.isArray(q.user_answer)
                        ? q.user_answer.includes(opt.id)
                        : q.user_answer === opt.id;
                      const isCorrectChoice = Array.isArray(q.correct_answer)
                        ? q.correct_answer.includes(opt.id)
                        : q.correct_answer === opt.id;

                      let borderClass = "border-border bg-canvas text-ink-600";
                      if (isCorrectChoice) borderClass = "border-emerald-400 bg-emerald-50 text-emerald-900 font-semibold";
                      else if (isUserChoice && !isCorrectChoice) borderClass = "border-rose-300 bg-rose-50 text-rose-800";

                      return (
                        <div key={opt.id} className={`p-2.5 rounded-lg border flex items-center gap-2 ${borderClass}`}>
                          <span className="w-5 h-5 rounded-full bg-surface border flex items-center justify-center font-bold text-[10px] shrink-0">
                            {opt.id.toUpperCase()}
                          </span>
                          <span>{opt.text}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Answer Summary Box */}
                <div className="p-3 rounded-lg bg-canvas border border-border text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-ink-500">Your Answer:</span>
                    <strong className={isCorrect ? "text-emerald-600" : "text-rose-600"}>
                      {userAnsStr}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ink-500">Correct Answer:</span>
                    <strong className="text-emerald-700">{correctAnsStr}</strong>
                  </div>
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div className="text-xs text-ink-600 bg-primary/5 p-3 rounded-lg border border-primary/10">
                    <strong className="text-primary font-semibold block mb-0.5">Explanation:</strong>
                    <span>{q.explanation}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 flex items-center justify-between">
        <Link
          href="/tests"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-surface text-xs font-semibold text-ink hover:bg-canvas"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tests</span>
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 shadow-sm"
        >
          <span>Return to Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
