'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { TestimonialCard } from '@/components/features/testimonials/TestimonialCard';
import { Plus, MessageSquare, ShieldCheck, UserCheck } from 'lucide-react';

export default function TestimonialsPage() {
  const { user } = useAuth();
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorTypeFilter, setAuthorTypeFilter] = useState('');
  const [contextFilter, setContextFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const isHODorAdmin = Boolean(
    user && ['admin', 'hod'].includes(user.role?.toLowerCase() || '')
  );

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (authorTypeFilter) params.append('author_type', authorTypeFilter);
      if (contextFilter) params.append('context', contextFilter);
      params.append('page', page.toString());
      params.append('page_size', '20');

      const res = await apiGet(`/testimonials?${params.toString()}`);
      setTestimonials(res.items || []);
      setTotalPages(res.pages || 1);
      setTotalCount(res.total || 0);
    } catch (err) {
      console.error('Failed to load testimonials', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, [authorTypeFilter, contextFilter, page]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D6D6D6] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-[#EAF0F3] text-[#6B8FA3] px-2.5 py-0.5 rounded-full font-semibold">
              Community Voices
            </span>
          </div>
          <h1 className="text-3xl font-bold text-[#1E1E1E]">Testimonials & Reviews</h1>
          <p className="text-sm text-[#5C5C5C] mt-1">
            What our students, alumni, faculty, and industry partners say about the AI/ML department.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {user && (
            <Link
              href="/testimonials/me"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-[#D6D6D6] rounded-lg text-xs font-semibold text-[#1E1E1E] hover:bg-[#F2F2F1] transition-colors"
            >
              <UserCheck className="w-4 h-4 text-[#5C5C5C]" /> My Submissions
            </Link>
          )}

          {isHODorAdmin && (
            <Link
              href="/testimonials/pending"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-[#94B0B8] bg-[#EAF0F3] text-[#6B8FA3] rounded-lg text-xs font-semibold hover:bg-[#94B0B8]/20 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" /> Moderation Queue
            </Link>
          )}

          <Link
            href="/testimonials/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E1E1E] text-white hover:bg-[#EEBE1E] hover:text-[#1E1E1E] rounded-lg text-xs font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Share Your Experience
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#D6D6D6] flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Author Type Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: '', label: 'All Voices' },
            { id: 'student', label: 'Students' },
            { id: 'alumni', label: 'Alumni' },
            { id: 'faculty', label: 'Faculty' },
            { id: 'recruiter', label: 'Recruiters' }
          ].map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => {
                setAuthorTypeFilter(type.id);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                authorTypeFilter === type.id
                  ? 'bg-[#1E1E1E] text-white font-semibold'
                  : 'bg-[#F2F2F1] text-[#5C5C5C] hover:text-[#1E1E1E]'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Context Select */}
        <div className="w-full sm:w-auto">
          <select
            value={contextFilter}
            onChange={(e) => {
              setContextFilter(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-60 py-2 px-3 border border-[#D6D6D6] rounded-lg text-xs bg-white text-[#1E1E1E] focus:outline-none focus:border-[#94B0B8]"
          >
            <option value="">All Contexts</option>
            <option value="about_department">About Department</option>
            <option value="about_course">About Course / Labs</option>
            <option value="about_faculty">About Faculty Guidance</option>
            <option value="about_placement">About Placements & Career</option>
          </select>
        </div>
      </div>

      {/* Testimonials Masonry / Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#1E1E1E] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#7A7A7A]">Loading testimonials...</p>
        </div>
      ) : totalCount === 0 ? (
        <div className="bg-white border border-[#D6D6D6] rounded-2xl p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 bg-[#F2F2F1] rounded-full flex items-center justify-center mx-auto text-[#7A7A7A]">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#1E1E1E]">No testimonials yet</h3>
          <p className="text-xs text-[#7A7A7A] leading-relaxed">
            Be the first to share your experience with the department!
          </p>
          <Link
            href="/testimonials/create"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E1E1E] bg-[#EEBE1E] px-4 py-2 rounded-lg"
          >
            Submit Testimonial
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {testimonials.map((t) => (
            <TestimonialCard key={t.id} testimonial={t} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 border border-[#D6D6D6] rounded-md text-xs font-medium text-[#1E1E1E] disabled:opacity-40 hover:bg-[#F2F2F1]"
          >
            Previous
          </button>
          <span className="text-xs text-[#5C5C5C] px-2">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 border border-[#D6D6D6] rounded-md text-xs font-medium text-[#1E1E1E] disabled:opacity-40 hover:bg-[#F2F2F1]"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
