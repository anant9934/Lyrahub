"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MentorAutocomplete } from "@/components/features/projects/MentorAutocomplete";

export default function CreateProjectPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    description: "",
    domain: "cv",
    tech_stack: "",
    mentor_id: "",
    github_url: "",
    demo_url: "",
    paper_url: "",
    outcomes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        title: formData.title,
        summary: formData.summary || undefined,
        description: formData.description || undefined,
        domain: formData.domain,
        tech_stack: formData.tech_stack
          ? formData.tech_stack.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        mentor_id: formData.mentor_id || undefined,
        github_url: formData.github_url || undefined,
        demo_url: formData.demo_url || undefined,
        paper_url: formData.paper_url || undefined,
        outcomes: formData.outcomes || undefined,
      };

      const res = await fetch("http://localhost:8000/api/v1/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to create project");
      }

      const created = await res.json();
      router.push(`/projects/${created.slug}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6 bg-[#F6F8FC] min-h-screen">
      <Link href="/projects" className="text-xs font-semibold text-[#526783] hover:text-[#0F172A]">
        ← Back to Projects
      </Link>

      <div className="bg-white border border-[#DCE5F1] rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-extrabold text-[#0F172A] mb-2">Create New Project</h1>
        <p className="text-xs text-[#526783] mb-6">
          Submit your AI/ML capstone, hackathon or research project into the department repository.
        </p>

        {error && (
          <div className="p-3 mb-6 bg-[#F5EAEA] border border-[#B85C5C] text-[#B85C5C] text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {/* Step indicator */}
        <div className="flex border-b border-[#DCE5F1] mb-6">
          {["Basics", "Mentorship", "Tech & Links"].map((name, i) => (
            <button
              key={name}
              type="button"
              onClick={() => setStep(i + 1)}
              className={`pb-2.5 px-4 text-xs font-bold transition ${
                step === i + 1
                  ? "text-[#0F172A] border-b-2 border-[#0F172A]"
                  : "text-[#526783]"
              }`}
            >
              {i + 1}. {name}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Real-Time Vision Transformer for Autonomous Navigation"
                  className="w-full px-3.5 py-2 text-sm bg-[#F6F8FC] border border-[#DCE5F1] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0F172A]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Domain
                </label>
                <select
                  name="domain"
                  value={formData.domain}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm bg-[#F6F8FC] border border-[#DCE5F1] rounded-xl focus:outline-none"
                >
                  <option value="cv">Computer Vision (CV)</option>
                  <option value="nlp">Natural Language Processing (NLP)</option>
                  <option value="llm">Large Language Models (LLM)</option>
                  <option value="mlops">MLOps</option>
                  <option value="robotics">Robotics</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Short Summary
                </label>
                <input
                  type="text"
                  name="summary"
                  value={formData.summary}
                  onChange={handleChange}
                  placeholder="Brief one-line summary (max 500 chars)"
                  className="w-full px-3.5 py-2 text-sm bg-[#F6F8FC] border border-[#DCE5F1] rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Full Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Detailed architectural approach, dataset, model design..."
                  className="w-full px-3.5 py-2 text-sm bg-[#F6F8FC] border border-[#DCE5F1] rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2 bg-[#0F172A] text-white text-xs font-semibold rounded-xl hover:bg-gray-800"
                >
                  Next: Mentorship →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <MentorAutocomplete
                value={formData.mentor_id}
                onChange={(id) => setFormData({ ...formData, mentor_id: id })}
                required={true}
              />

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Outcomes / Deliverables
                </label>
                <textarea
                  name="outcomes"
                  value={formData.outcomes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Achieved latency, mAP score, live deployment metrics..."
                  className="w-full px-3.5 py-2 text-sm bg-[#F6F8FC] border border-[#DCE5F1] rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2 bg-[#F6F8FC] text-xs font-semibold rounded-xl hover:bg-gray-200"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2 bg-[#0F172A] text-white text-xs font-semibold rounded-xl hover:bg-gray-800"
                >
                  Next: Tech & Links →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Tech Stack (comma-separated)
                </label>
                <input
                  type="text"
                  name="tech_stack"
                  value={formData.tech_stack}
                  onChange={handleChange}
                  placeholder="PyTorch, FastAPI, ONNX, Docker, ROS"
                  className="w-full px-3.5 py-2 text-sm bg-[#F6F8FC] border border-[#DCE5F1] rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  GitHub URL
                </label>
                <input
                  type="url"
                  name="github_url"
                  value={formData.github_url}
                  onChange={handleChange}
                  placeholder="https://github.com/..."
                  className="w-full px-3.5 py-2 text-sm bg-[#F6F8FC] border border-[#DCE5F1] rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Live Demo URL
                </label>
                <input
                  type="url"
                  name="demo_url"
                  value={formData.demo_url}
                  onChange={handleChange}
                  placeholder="https://demo..."
                  className="w-full px-3.5 py-2 text-sm bg-[#F6F8FC] border border-[#DCE5F1] rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Paper / Preprint URL
                </label>
                <input
                  type="url"
                  name="paper_url"
                  value={formData.paper_url}
                  onChange={handleChange}
                  placeholder="https://arxiv.org/..."
                  className="w-full px-3.5 py-2 text-sm bg-[#F6F8FC] border border-[#DCE5F1] rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex justify-between pt-6 border-t border-[#DCE5F1]">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2 bg-[#F6F8FC] text-xs font-semibold rounded-xl hover:bg-gray-200"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-[#0F172A] text-white text-xs font-bold rounded-xl hover:bg-gray-800 disabled:opacity-50 shadow-sm"
                >
                  {loading ? "Publishing..." : "Publish Project"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
