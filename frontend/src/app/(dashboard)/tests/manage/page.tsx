"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Plus, 
  BrainCircuit, 
  Settings, 
  Trash2, 
  HelpCircle, 
  Users, 
  CheckCircle, 
  Clock, 
  ArrowLeft,
  Sparkles,
  Layers
} from "lucide-react";
import api from "@/lib/api";

interface TestItem {
  id: string;
  title: string;
  slug: string;
  domain: string;
  difficulty: string;
  duration_minutes: number;
  total_questions: number;
  total_marks: number;
  passing_marks: number;
  is_published: boolean;
  created_at: string;
}

export default function TestsManagePage() {
  const [tests, setTests] = useState<TestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    domain: "ai_ml_general",
    difficulty: "intermediate",
    duration_minutes: 30,
    passing_marks: 5
  });

  const loadTests = async () => {
    try {
      setLoading(true);
      const res = await api.get("/tests?published=false");
      setTests(res.data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, []);

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/tests", formData);
      setShowCreateModal(false);
      setFormData({
        title: "",
        description: "",
        domain: "ai_ml_general",
        difficulty: "intermediate",
        duration_minutes: 30,
        passing_marks: 5
      });
      loadTests();
    } catch (err: any) {
      alert("Error creating test: " + (err.response?.data?.detail || err.message));
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await api.post(`/tests/${id}/publish`);
      loadTests();
    } catch (err: any) {
      alert("Error publishing test: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this test?")) return;
    try {
      await api.delete(`/tests/${id}`);
      loadTests();
    } catch (err: any) {
      alert("Error deleting test: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/tests" className="text-xs text-ink-500 hover:text-ink flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Tests
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink">Manage Knowledge Tests</h1>
          <p className="text-xs text-ink-500">Configure benchmark tests, author questions, or generate questions via AI.</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Assessment</span>
        </button>
      </div>

      {/* Tests Table */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-card">
        <div className="p-4 border-b border-border bg-canvas/50 flex items-center justify-between">
          <span className="text-xs font-bold text-ink uppercase tracking-wider">All Assessments</span>
          <span className="text-xs text-ink-500">Total: {tests.length}</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-ink-500">Loading assessments...</div>
        ) : tests.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <BrainCircuit className="w-10 h-10 text-ink-300 mx-auto" />
            <p className="text-xs font-semibold text-ink-600">No tests created yet.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-xs text-primary font-semibold hover:underline"
            >
              Create your first test
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas border-b border-border text-ink-500 font-semibold uppercase">
                <tr>
                  <th className="p-4">Title / Domain</th>
                  <th className="p-4">Questions & Marks</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tests.map((t) => (
                  <tr key={t.id} className="hover:bg-canvas/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-ink text-sm">{t.title}</div>
                      <div className="text-[11px] text-ink-400 mt-0.5 flex items-center gap-2">
                        <span className="capitalize">{t.domain.replace("_", " ")}</span>
                        <span>•</span>
                        <span className="capitalize">{t.difficulty}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-semibold text-ink">{t.total_questions} Questions</div>
                      <div className="text-[11px] text-ink-400">{t.total_marks} Total Marks (Pass: {t.passing_marks})</div>
                    </td>

                    <td className="p-4">
                      <span className="font-semibold text-ink">{t.duration_minutes} min</span>
                    </td>

                    <td className="p-4">
                      {t.is_published ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                          Draft
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right space-x-2">
                      <Link
                        href={`/tests/manage/${t.id}/questions`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas font-semibold"
                        title="Edit Questions"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-primary" />
                        <span>Questions</span>
                      </Link>

                      <Link
                        href={`/tests/manage/${t.id}/attempts`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-surface text-ink hover:bg-canvas font-semibold"
                        title="View Student Attempts"
                      >
                        <Users className="w-3.5 h-3.5 text-blue-500" />
                        <span>Attempts</span>
                      </Link>

                      {!t.is_published && (
                        <button
                          onClick={() => handlePublish(t.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                        >
                          Publish
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1.5 rounded-lg text-ink-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-ink">Create New Assessment</h3>

            <form onSubmit={handleCreateTest} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-ink">Assessment Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Deep Learning & Transformers Mid-Term"
                  className="w-full p-2.5 rounded-lg border border-border bg-canvas text-ink focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-ink">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of topics covered..."
                  className="w-full p-2.5 rounded-lg border border-border bg-canvas text-ink focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-ink">Domain</label>
                  <select
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-border bg-canvas text-ink focus:outline-none focus:border-primary"
                  >
                    <option value="ai_ml_general">AI & ML Fundamentals</option>
                    <option value="llm">Large Language Models</option>
                    <option value="cv">Computer Vision</option>
                    <option value="nlp">Natural Language Processing</option>
                    <option value="mlops">MLOps</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-ink">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-border bg-canvas text-ink focus:outline-none focus:border-primary"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-ink">Duration (minutes)</label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 30 })}
                    className="w-full p-2.5 rounded-lg border border-border bg-canvas text-ink focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-ink">Passing Marks</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.passing_marks}
                    onChange={(e) => setFormData({ ...formData, passing_marks: parseInt(e.target.value) || 5 })}
                    className="w-full p-2.5 rounded-lg border border-border bg-canvas text-ink focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border border-border text-ink hover:bg-canvas font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-primary text-white font-bold hover:bg-primary/90"
                >
                  Create Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
