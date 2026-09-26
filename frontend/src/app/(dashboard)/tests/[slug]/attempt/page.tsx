"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Bookmark, 
  ChevronLeft, 
  ChevronRight, 
  Send,
  HelpCircle
} from "lucide-react";
import api from "@/lib/api";

interface Question {
  id: string;
  test_id: string;
  question_text: string;
  question_type: string; // mcq, multi_select, short_answer
  options: { id: string; text: string }[];
  marks: number;
  difficulty?: string;
  topic?: string;
  display_order: number;
}

export default function TestAttemptLivePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [test, setTest] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const autoSubmittedRef = useRef(false);

  // 1. Start test attempt
  useEffect(() => {
    async function initAttempt() {
      try {
        setLoading(true);
        // First get test details by slug to get test id
        const detailRes = await api.get(`/tests/${slug}`);
        const testData = detailRes.data;
        setTest(testData);

        // Call start endpoint
        const startRes = await api.post(`/tests/${testData.id}/start`);
        const { questions: qList, duration_minutes, expires_at } = startRes.data;
        
        setQuestions(qList || []);
        
        // Calculate remaining seconds
        const expiresTime = new Date(expires_at).getTime();
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((expiresTime - now) / 1000));
        setTimeLeftSeconds(remaining > 0 ? remaining : duration_minutes * 60);
      } catch (err: any) {
        if (err.response?.status === 409) {
          // Already attempted -> redirect to result
          router.push(`/tests/${slug}/result`);
          return;
        }
        setError(err.response?.data?.detail || "Failed to start test attempt");
      } finally {
        setLoading(false);
      }
    }
    if (slug) initAttempt();
  }, [slug, router]);

  // 2. Countdown timer & auto-submit
  useEffect(() => {
    if (timeLeftSeconds === null || timeLeftSeconds <= 0 || submitting) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(timer);
          if (!autoSubmittedRef.current) {
            autoSubmittedRef.current = true;
            handleSubmit(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeftSeconds, submitting]);

  // Handle Answer selection
  const handleSelectOption = (qid: string, optionId: string, qtype: string) => {
    if (qtype === "mcq") {
      setAnswers((prev) => ({ ...prev, [qid]: [optionId] }));
    } else if (qtype === "multi_select") {
      setAnswers((prev) => {
        const currentList = Array.isArray(prev[qid]) ? [...prev[qid]] : [];
        if (currentList.includes(optionId)) {
          return { ...prev, [qid]: currentList.filter((x) => x !== optionId) };
        } else {
          return { ...prev, [qid]: [...currentList, optionId] };
        }
      });
    }
  };

  const handleShortAnswerChange = (qid: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: val }));
  };

  const toggleMarkForReview = (qid: string) => {
    setMarkedForReview((prev) => ({ ...prev, [qid]: !prev[qid] }));
  };

  // Submit
  const handleSubmit = async (isAuto = false) => {
    if (submitting || !test) return;
    try {
      setSubmitting(true);
      await api.post(`/tests/${test.id}/submit`, { answers });
      router.push(`/tests/${slug}/result`);
    } catch (err: any) {
      alert("Submission error: " + (err.response?.data?.detail || err.message));
      setSubmitting(false);
    }
  };

  // Format timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimerColorClass = () => {
    if (timeLeftSeconds === null) return "bg-surface text-ink";
    if (timeLeftSeconds < 60) return "bg-rose-500 text-white animate-pulse border-rose-600";
    if (timeLeftSeconds < 300) return "bg-amber-500 text-white border-amber-600";
    return "bg-surface text-ink border-border";
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-sm font-semibold text-ink-600">Initializing secure assessment environment...</p>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-ink">{error || "No questions found for this test"}</h2>
        <button
          onClick={() => router.push(`/tests/${slug}`)}
          className="px-4 py-2 rounded-lg bg-surface border border-border text-xs font-semibold"
        >
          Return to Details
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const totalCount = questions.length;
  const answeredCount = Object.keys(answers).filter((k) => {
    const a = answers[k];
    return a !== undefined && a !== "" && (!Array.isArray(a) || a.length > 0);
  }).length;
  const unansweredCount = totalCount - answeredCount;
  const progressPercent = Math.round(((currentIndex + 1) / totalCount) * 100);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Sticky Top Header with Fixed-Style Timer & Progress */}
      <div className="sticky top-20 z-40 bg-surface/95 backdrop-blur border border-border rounded-2xl p-4 shadow-card flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
            {currentIndex + 1}
          </div>
          <div>
            <h2 className="text-sm font-bold text-ink truncate max-w-[200px] sm:max-w-md">{test?.title}</h2>
            <span className="text-[11px] text-ink-400">
              Question {currentIndex + 1} of {totalCount} ({answeredCount} answered)
            </span>
          </div>
        </div>

        {/* Floating Timer */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-sm shadow-sm transition-colors ${getTimerColorClass()}`}>
            <Clock className="w-4 h-4" />
            <span>{timeLeftSeconds !== null ? formatTime(timeLeftSeconds) : "--:--"}</span>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Finish &</span> Submit
          </button>
        </div>
      </div>

      {/* Sage Progress Bar */}
      <div className="w-full bg-border/50 h-2 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#94B0B8] transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Question Card & Navigation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Area (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 space-y-6 shadow-card">
            {/* Question Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-primary/10 text-primary">
                  Question #{currentIndex + 1}
                </span>
                <span className="text-xs font-semibold text-ink-400">
                  [{currentQ.marks} {currentQ.marks === 1 ? "mark" : "marks"}]
                </span>
                {currentQ.topic && (
                  <span className="text-[11px] text-ink-500 font-medium">
                    Topic: {currentQ.topic.replace("_", " ")}
                  </span>
                )}
              </div>

              <button
                onClick={() => toggleMarkForReview(currentQ.id)}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                  markedForReview[currentQ.id]
                    ? "bg-amber-500/10 text-amber-600 border-amber-300"
                    : "text-ink-400 border-border hover:bg-canvas"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{markedForReview[currentQ.id] ? "Marked" : "Mark for review"}</span>
              </button>
            </div>

            {/* Question Text */}
            <div className="text-base sm:text-lg font-medium text-ink leading-relaxed">
              {currentQ.question_text}
            </div>

            {/* Options or Input */}
            <div className="space-y-3 pt-2">
              {currentQ.question_type === "mcq" && (
                <div className="space-y-2.5">
                  {currentQ.options?.map((opt) => {
                    const isSelected = answers[currentQ.id]?.[0] === opt.id;
                    return (
                      <label
                        key={opt.id}
                        onClick={() => handleSelectOption(currentQ.id, opt.id, "mcq")}
                        className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-medium cursor-pointer transition-all ${
                          isSelected
                            ? "bg-primary/5 border-primary text-primary shadow-sm ring-1 ring-primary"
                            : "bg-canvas border-border text-ink hover:border-ink-300"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-xs font-bold ${
                            isSelected ? "border-primary bg-primary text-white" : "border-border bg-surface text-ink-500"
                          }`}
                        >
                          {opt.id.toUpperCase()}
                        </div>
                        <span className="leading-snug">{opt.text}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {currentQ.question_type === "multi_select" && (
                <div className="space-y-2.5">
                  <span className="text-[11px] text-ink-400 font-semibold block mb-1">Select all correct options:</span>
                  {currentQ.options?.map((opt) => {
                    const isChecked = Array.isArray(answers[currentQ.id]) && answers[currentQ.id].includes(opt.id);
                    return (
                      <label
                        key={opt.id}
                        onClick={() => handleSelectOption(currentQ.id, opt.id, "multi_select")}
                        className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-medium cursor-pointer transition-all ${
                          isChecked
                            ? "bg-primary/5 border-primary text-primary shadow-sm ring-1 ring-primary"
                            : "bg-canvas border-border text-ink hover:border-ink-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-primary border-border focus:ring-primary"
                        />
                        <span className="font-bold text-xs mr-1">[{opt.id.toUpperCase()}]</span>
                        <span className="leading-snug">{opt.text}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {currentQ.question_type === "short_answer" && (
                <div className="space-y-2">
                  <span className="text-[11px] text-ink-400 font-semibold block">Type your answer:</span>
                  <input
                    type="text"
                    value={answers[currentQ.id] || ""}
                    onChange={(e) => handleShortAnswerChange(currentQ.id, e.target.value)}
                    placeholder="Type keyword or phrase..."
                    className="w-full p-4 rounded-xl border border-border bg-canvas text-ink text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              )}
            </div>

            {/* Bottom Controls */}
            <div className="pt-6 border-t border-border flex items-center justify-between">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-surface text-xs font-semibold text-ink hover:bg-canvas disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                disabled={currentIndex === totalCount - 1}
                onClick={() => setCurrentIndex((prev) => Math.min(totalCount - 1, prev + 1))}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 disabled:opacity-40 transition-colors shadow-sm"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Question Palette Sidebar (1 col) */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-surface p-5 space-y-4 shadow-card">
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Question Navigator</h3>

            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = answers[q.id] !== undefined && answers[q.id] !== "" && (!Array.isArray(answers[q.id]) || answers[q.id].length > 0);
                const isMarked = markedForReview[q.id];

                let btnBg = "bg-canvas border-border text-ink hover:border-primary/50";
                if (isCurrent) btnBg = "bg-primary text-white border-primary shadow-sm font-bold ring-2 ring-primary/30";
                else if (isMarked) btnBg = "bg-amber-500/10 text-amber-600 border-amber-300 font-semibold";
                else if (isAnswered) btnBg = "bg-emerald-500/10 text-emerald-600 border-emerald-300 font-semibold";

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-lg border text-xs flex items-center justify-center transition-all relative ${btnBg}`}
                  >
                    {idx + 1}
                    {isMarked && (
                      <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-4 border-t border-border space-y-1.5 text-[11px] text-ink-500">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-500/10 border border-emerald-300"></span>
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-amber-500/10 border border-amber-300"></span>
                <span>Marked for review</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-canvas border border-border"></span>
                <span>Unanswered ({unansweredCount})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-ink flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" />
              <span>Submit Assessment?</span>
            </h3>

            <p className="text-xs text-ink-600 leading-relaxed">
              Are you sure you want to finish this attempt? Once submitted, your answers will be automatically graded and your final score will be recorded.
            </p>

            <div className="p-3 rounded-xl bg-canvas border border-border text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-ink-500">Answered Questions:</span>
                <strong className="text-emerald-600">{answeredCount}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">Unanswered Questions:</span>
                <strong className={unansweredCount > 0 ? "text-rose-500" : "text-ink"}>{unansweredCount}</strong>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={submitting}
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-xl border border-border bg-surface text-xs font-semibold text-ink hover:bg-canvas"
              >
                Continue Test
              </button>
              <button
                disabled={submitting}
                onClick={() => handleSubmit(false)}
                className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 shadow-sm"
              >
                {submitting ? "Grading..." : "Confirm & Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
