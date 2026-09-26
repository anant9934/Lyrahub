'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Briefcase, ArrowLeft, Plus, AlertCircle, Sparkles } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function CreateOpportunityPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    opportunity_type: 'internship',
    mode: 'remote',
    location: '',
    stipend_amount: '',
    stipend_currency: 'INR',
    duration_weeks: '',
    application_deadline: '',
    application_url: '',
    contact_email: user?.email || '',
    description: '',
    eligibility: '',
    required_skills: '',
    tags: '',
  });

  const canPost = user && ['faculty', 'hod', 'admin', 'alumni'].includes(user.role || '');

  if (!canPost) {
    return (
      <div className="min-h-screen bg-[#F2F2F1] p-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-[#D6D6D6] p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-[#B85C5C] mx-auto mb-3" />
          <h2 className="text-xl font-bold text-[#1E1E1E] mb-2">Access Restricted</h2>
          <p className="text-sm text-[#5C5C5C] mb-6">
            Only Faculty, Alumni, and Department Administrators can publish internships and training opportunities.
          </p>
          <Link href="/opportunities" className="px-4 py-2 rounded-xl bg-[#1E1E1E] text-white text-sm font-semibold">
            Browse Opportunities
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      const skillsList = formData.required_skills
        ? formData.required_skills.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      const tagsList = formData.tags
        ? formData.tags.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean)
        : [];

      const payload: any = {
        title: formData.title,
        organization: formData.organization,
        opportunity_type: formData.opportunity_type,
        mode: formData.mode,
        location: formData.location || null,
        description: formData.description || null,
        eligibility: formData.eligibility || null,
        required_skills: skillsList,
        stipend_amount: formData.stipend_amount ? parseFloat(formData.stipend_amount) : null,
        stipend_currency: formData.stipend_currency || 'INR',
        duration_weeks: formData.duration_weeks ? parseInt(formData.duration_weeks) : null,
        application_deadline: formData.application_deadline ? new Date(formData.application_deadline).toISOString() : null,
        application_url: formData.application_url || null,
        contact_email: formData.contact_email || null,
        tags: tagsList,
      };

      const res = await api.post('/opportunities', payload);
      alert('Opportunity posted successfully! It is currently pending HOD verification.');
      router.push('/opportunities/me');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit opportunity listing');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F1] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Back Link */}
        <Link
          href="/opportunities"
          className="inline-flex items-center gap-1.5 text-xs text-[#7A7A7A] hover:text-[#1E1E1E] transition-colors mb-6 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Opportunities</span>
        </Link>

        {/* Card Form */}
        <div className="bg-white rounded-3xl border border-[#D6D6D6] p-6 md:p-10 shadow-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#1E1E1E]">Post Opportunity or Training</h1>
            <p className="text-xs md:text-sm text-[#7A7A7A] mt-1">
              Share corporate openings, research internships, or workshops with AI/ML department students.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-[#F5EAEA] border border-[#B85C5C]/30 text-xs font-semibold text-[#B85C5C] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#1E1E1E] block mb-1.5">Opportunity Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Research Intern (Vision Models)"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-[#D6D6D6] bg-white focus:outline-none focus:border-[#1E1E1E]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#1E1E1E] block mb-1.5">Organization / Company *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Microsoft Research India"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-[#D6D6D6] bg-white focus:outline-none focus:border-[#1E1E1E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-[#1E1E1E] block mb-1.5">Type</label>
                <select
                  value={formData.opportunity_type}
                  onChange={(e) => setFormData({ ...formData, opportunity_type: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-[#D6D6D6] bg-white focus:outline-none focus:border-[#1E1E1E]"
                >
                  <option value="internship">Internship</option>
                  <option value="training">Industrial Training</option>
                  <option value="workshop">Workshop</option>
                  <option value="fellowship">Research Fellowship</option>
                  <option value="scholarship">Scholarship</option>
                  <option value="course">External Course</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#1E1E1E] block mb-1.5">Working Mode</label>
                <select
                  value={formData.mode}
                  onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-[#D6D6D6] bg-white focus:outline-none focus:border-[#1E1E1E]"
                >
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#1E1E1E] block mb-1.5">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Bengaluru, India"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-[#D6D6D6] bg-white focus:outline-none focus:border-[#1E1E1E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-[#1E1E1E] block mb-1.5">Stipend Amount (Monthly)</label>
                <input
                  type="number"
                  placeholder="e.g. 35000"
                  value={formData.stipend_amount}
                  onChange={(e) => setFormData({ ...formData, stipend_amount: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-[#D6D6D6] bg-white focus:outline-none focus:border-[#1E1E1E]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#1E1E1E] block mb-1.5">Duration (Weeks)</label>
                <input
                  type="number"
                  placeholder="e.g. 12"
                  value={formData.duration_weeks}
                  onChange={(e) => setFormData({ ...formData, duration_weeks: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-[#D6D6D6] bg-white focus:outline-none focus:border-[#1E1E1E]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#1E1E1E] block mb-1.5">Application Deadline</label>
                <input
                  type="datetime-local"
                  value={formData.application_deadline}
                  onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-[#D6D6D6] bg-white focus:outline-none focus:border-[#1E1E1E]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#1E1E1E] block mb-1.5">Description & Role Responsibilities *</label>
              <textarea
                required
                rows={4}
                placeholder="Overview of the work, expected outcomes, mentoring environment..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-[#D6D6D6] bg-white focus:outline-none focus:border-[#1E1E1E]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#1E1E1E] block mb-1.5">Eligibility Criteria</label>
              <textarea
                rows={2}
                placeholder="e.g. B.Tech Sem 6+ or M.Tech students with CGPA > 7.5"
                value={formData.eligibility}
                onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-[#D6D6D6] bg-white focus:outline-none focus:border-[#1E1E1E]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#1E1E1E] block mb-1.5">Required Skills (Comma separated)</label>
                <input
                  type="text"
                  placeholder="PyTorch, OpenCV, Transformers, Linux"
                  value={formData.required_skills}
                  onChange={(e) => setFormData({ ...formData, required_skills: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-[#D6D6D6] bg-white focus:outline-none focus:border-[#1E1E1E]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#1E1E1E] block mb-1.5">Official Application URL</label>
                <input
                  type="url"
                  placeholder="https://careers.company.com/job/12345"
                  value={formData.application_url}
                  onChange={(e) => setFormData({ ...formData, application_url: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-[#D6D6D6] bg-white focus:outline-none focus:border-[#1E1E1E]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#F2F2F1] flex items-center justify-between">
              <span className="text-xs text-[#7A7A7A]">
                Submitted postings will be reviewed by the HOD prior to public student broadcast.
              </span>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 rounded-xl bg-[#1E1E1E] hover:bg-black text-white text-xs font-bold transition-all shadow-sm"
              >
                {submitting ? 'Submitting...' : 'Post Listing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
