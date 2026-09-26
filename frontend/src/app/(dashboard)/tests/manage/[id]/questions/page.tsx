"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Plus, 
  Sparkles, 
  Trash2, 
  HelpCircle, 
  CheckCircle2, 
  Layers, 
  BrainCircuit,
  Award
} from "lucide-react";
import api from "@/lib/api";

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: { id: string; text: string }[];
  correct_answer: any;
  explanation: string;
  marks: number;
  difficulty: string;
  topic: string;
  display_order: number;
}

export default function TestQuestionsEditorPage() {
  const params = useParams();
  const testId = params?.id as string;

  const [test, setTest] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiTopic, setAiTopic] = useState("Transformers & LLM Architecture");
  const [aiCount, setAiCount] = useState(5);
  const [aiDifficulty, setAiDifficulty] = useState("intermediate");
  const [aiGenerating, setAiGenerating] = useState(false);

  // Manual Question Form
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState("mcq");
  const [marks, setMarks] = useState(1);
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [explanation, setExplanation] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctMCQ, setCorrectMCQ] = useState("a");
  const [shortAnswerKeyword, setShortAnswerKeyword] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      // Get test details & questions
      const res = await api.get(`/tests/${testId}/attempts`); // or test by ID
      // Let's get questions via attempts or questions endpoint
      // Our router has: POST /tests/{id}/questions, and GET /tests/{slug}
      // Let's get questions by calling endpoint
      const listRes = await api.get("/tests?published=false");
      const currentTest = listRes.data.items?.find((t: any) => t.id === testId);
      if (currentTest) {
        setTest(currentTest);
        // Start endpoint or attempts gives questions
        const startRes = await api.get(`/tests/${currentTest.slug}`);
        // Let's get questions list
        // Note: we can also create a direct endpoint if needed, or call start
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [testId]);

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let optionsList: any[] = [];
      let correctAns: any = [correctMCQ];

      if (questionType === "mcq" || questionType === "multi_select") {
        optionsList = [
          { id: "a", text: optionA },
          { id: "b", text: optionB },
          { id: "c", text: optionC },
          { id: "d", text: optionD }
        ].filter(opt => opt.text.trim().length > 0);
      } else {
        correctAns = shortAnswerKeyword.trim().toLowerCase();
      }

      const payload = {
        question_text: questionText,
        question_type: questionType,
        options: optionsList,
        correct_answer: correctAns,
        explanation: explanation,
        marks: marks,
        difficulty: difficulty,
        topic: topic
      };

      await api.post(`/tests/${testId}/questions`, payload);
      setShowAddModal(false);
      // Reset form
      setQuestionText("");
      setExplanation("");
      setOptionA(""); setOptionB(""); setOptionC(""); setOptionD("");
      setShortAnswerKeyword("");
      loadData();
    } catch (err: any) {
      alert("Error adding question: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAiGenerating(true);
      const res = await api.post(`/tests/${testId}/generate-questions`, {
        topic: aiTopic,
        count: aiCount,
        difficulty: aiDifficulty
      });
      alert(res.data.message);
      setShowAIModal(false);
      loadData();
    } catch (err: any) {
      alert("Error generating questions: " + (err.response?.data?.detail || err.message));
    } finally {
      setAiGenerating(false);
    }
  };

  const handleDeleteQuestion = async (qid: string) => {
    if (!confirm("Are you sure you want to remove this question?")) return;
    try {
      await api.delete(`/tests/${testId}/questions/${qid}`);
      loadData();
    } catch (err: any) {
      alert("Error deleting question: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/tests/manage"
            className="inline-flex items-center gap-1.5 text-xs text-ink-500 hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Tests Management</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink">
            {test?.title || "Assessment Questions Editor"}
          </h1>
          <p className="text-xs text-ink-500">
            Author questions, set answer keys & explanations, or leverage AI question generation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAIModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate via AI</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Question</span>
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-surface border border-border text-center shadow-card">
        <div>
          <span className="block text-[11px] font-semibold text-ink-400 uppercase">Total Questions</span>
          <span className="text-lg font-bold text-ink mt-0.5">{test?.total_questions || 0}</span>
        </div>
        <div>
          <span className="block text-[11px] font-semibold text-ink-400 uppercase">Total Marks</span>
          <span className="text-lg font-bold text-ink mt-0.5">{test?.total_marks || 0}</span>
        </div>
        <div>
          <span className="block text-[11px] font-semibold text-ink-400 uppercase">Passing Score</span>
          <span className="text-lg font-bold text-ink mt-0.5">{test?.passing_marks || 0}</span>
        </div>
        <div>
          <span className="block text-[11px] font-semibold text-ink-400 uppercase">Status</span>
          <span className={`text-xs font-bold mt-1 inline-block px-2.5 py-0.5 rounded-full ${test?.is_published ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
            {test?.is_published ? "Published" : "Draft"}
          </span>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-ink flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-primary" />
          <span>Configured Questions</span>
        </h2>

        <div className="rounded-2xl border border-border bg-surface p-8 text-center space-y-3 shadow-card">
          <BrainCircuit className="w-10 h-10 text-primary/60 mx-auto" />
          <h3 className="text-sm font-bold text-ink">Author Assessment Items</h3>
          <p className="text-xs text-ink-500 max-w-md mx-auto leading-relaxed">
            Click <strong>Generate via AI</strong> to instantly populate 5 benchmark AI/ML questions, or <strong>Add Question</strong> to manually author custom items.
          </p>
        </div>
      </div>

      {/* AI Generate Modal */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-ink flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span>AI Question Generator</span>
            </h3>

            <form onSubmit={handleAIGenerate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-ink">Syllabus Topic *</label>
                <input
                  type="text"
                  required
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="e.g. Transformer Attention, Convolutional Layers, Loss Functions"
                  className="w-full p-2.5 rounded-lg border border-border bg-canvas text-ink focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-ink">Question Count</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={aiCount}
                    onChange={(e) => setAiCount(parseInt(e.target.value) || 5)}
                    className="w-full p-2.5 rounded-lg border border-border bg-canvas text-ink focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-ink">Difficulty</label>
                  <select
                    value={aiDifficulty}
                    onChange={(e) => setAiDifficulty(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-border bg-canvas text-ink focus:outline-none focus:border-primary"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAIModal(false)}
                  className="px-4 py-2 rounded-lg border border-border text-ink hover:bg-canvas font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={aiGenerating}
                  className="px-5 py-2 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-700 disabled:opacity-50"
                >
                  {aiGenerating ? "Generating..." : "Generate & Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Add Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-ink">Add New Question</h3>

            <form onSubmit={handleManualAdd} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-ink">Question Prompt *</label>
                <textarea
                  rows={3}
                  required
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Enter the question text..."
                  className="w-full p-2.5 rounded-lg border border-border bg-canvas text-ink focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-ink">Type</label>
                  <select
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value)}
                    className="w-full p-2 rounded-lg border border-border bg-canvas text-ink"
                  >
                    <option value="mcq">Single MCQ</option>
                    <option value="multi_select">Multi-Select</option>
                    <option value="short_answer">Short Answer</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-ink">Marks</label>
                  <input
                    type="number"
                    min={1}
                    value={marks}
                    onChange={(e) => setMarks(parseInt(e.target.value) || 1)}
                    className="w-full p-2 rounded-lg border border-border bg-canvas text-ink"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-ink">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full p-2 rounded-lg border border-border bg-canvas text-ink"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {/* MCQ Options */}
              {questionType !== "short_answer" ? (
                <div className="space-y-2 p-3 rounded-xl bg-canvas border border-border">
                  <span className="font-bold text-ink block">Options & Answer Key</span>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Option A text..."
                      value={optionA}
                      onChange={(e) => setOptionA(e.target.value)}
                      className="w-full p-2 rounded border border-border bg-surface text-ink"
                    />
                    <input
                      type="text"
                      placeholder="Option B text..."
                      value={optionB}
                      onChange={(e) => setOptionB(e.target.value)}
                      className="w-full p-2 rounded border border-border bg-surface text-ink"
                    />
                    <input
                      type="text"
                      placeholder="Option C text..."
                      value={optionC}
                      onChange={(e) => setOptionC(e.target.value)}
                      className="w-full p-2 rounded border border-border bg-surface text-ink"
                    />
                    <input
                      type="text"
                      placeholder="Option D text..."
                      value={optionD}
                      onChange={(e) => setOptionD(e.target.value)}
                      className="w-full p-2 rounded border border-border bg-surface text-ink"
                    />
                  </div>
                  <div className="pt-2">
                    <label className="font-semibold text-ink mr-2">Correct Option:</label>
                    <select
                      value={correctMCQ}
                      onChange={(e) => setCorrectMCQ(e.target.value)}
                      className="p-1.5 rounded border border-border bg-surface text-ink font-bold"
                    >
                      <option value="a">A</option>
                      <option value="b">B</option>
                      <option value="c">C</option>
                      <option value="d">D</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="font-semibold text-ink">Keyword / Phrase to match *</label>
                  <input
                    type="text"
                    required
                    value={shortAnswerKeyword}
                    onChange={(e) => setShortAnswerKeyword(e.target.value)}
                    placeholder="e.g. cross entropy, gradient descent"
                    className="w-full p-2.5 rounded-lg border border-border bg-canvas text-ink"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-ink">Explanation (shown to student after submit)</label>
                <textarea
                  rows={2}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Explain why this answer is correct..."
                  className="w-full p-2.5 rounded-lg border border-border bg-canvas text-ink"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-border text-ink hover:bg-canvas font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-primary text-white font-bold hover:bg-primary/90"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
