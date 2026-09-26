'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiGet, apiDelete } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { ArrowLeft, Plus, MessageSquare, Star, Trash2 } from 'lucide-react';

export default function MyTestimonialsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyTestimonials = async () => {
    setLoading(true);
    try {
      // Get all testimonials and filter by author_id
      const res = await apiGet('/testimonials?page_size=100');
      const all = res.items || [];
      const mine = all.filter((t: any) => t.author_id === user?.id || !t.author_id);
      setItems(mine);
    } catch (err) {
      console.error('Failed to load my testimonials', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyTestimonials();
    }
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      await apiDelete(`/testimonials/${id}`);
      fetchMyTestimonials();
    } catch (err) {
      console.error('Failed to delete testimonial', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D6D6D6] pb-6">
        <div>
          <Link
            href="/testimonials"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C5C5C] hover:text-[#1E1E1E] mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Testimonials
          </Link>
          <h1 className="text-3xl font-bold text-[#1E1E1E]">My Testimonials</h1>
          <p className="text-sm text-[#5C5C5C] mt-1">
            Track status and visibility of your reflections and department reviews.
          </p>
        </div>

        <Link
          href="/testimonials/create"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E1E1E] text-white hover:bg-[#EEBE1E] hover:text-[#1E1E1E] rounded-lg text-xs font-semibold transition-colors shadow-sm self-start"
        >
          <Plus className="w-4 h-4" /> Submit Another
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#1E1E1E] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#7A7A7A]">Loading your testimonials...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-[#D6D6D6] rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 bg-[#F2F2F1] rounded-full flex items-center justify-center mx-auto text-[#7A7A7A]">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#1E1E1E]">No submissions found</h3>
          <p className="text-xs text-[#7A7A7A]">
            You have not submitted any testimonials yet. Share your experience today!
          </p>
          <Link
            href="/testimonials/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E1E1E] text-white hover:bg-[#EEBE1E] hover:text-[#1E1E1E] rounded-lg text-xs font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" /> Submit Testimonial
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((t) => (
            <div
              key={t.id}
              className="bg-white border border-[#D6D6D6] rounded-2xl p-6 space-y-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                      t.is_published
                        ? 'bg-[#EEF3EE] text-[#7A9A7E]'
                        : 'bg-[#FAF3E2] text-[#D9A441]'
                    }`}
                  >
                    {t.is_published ? 'Approved & Public' : 'Pending Moderation'}
                  </span>

                  <span className="text-[11px] bg-[#F2F2F1] text-[#5C5C5C] px-2 py-0.5 rounded-md font-medium capitalize">
                    {t.context?.replace('_', ' ')}
                  </span>
                </div>

                {!t.is_published && (
                  <button
                    type="button"
                    onClick={() => handleDelete(t.id)}
                    className="p-1.5 text-[#B85C5C] hover:text-red-700 hover:bg-[#F5EAEA] rounded transition-colors"
                    title="Delete submission"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <p className="text-sm text-[#1E1E1E] leading-relaxed italic bg-[#F2F2F1]/40 p-4 rounded-xl">
                "{t.text}"
              </p>

              <div className="flex items-center justify-between text-xs text-[#7A7A7A] pt-1">
                {t.rating && (
                  <div className="flex items-center gap-1 text-[#EEBE1E]">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="font-semibold text-[#1E1E1E]">{t.rating}/5</span>
                  </div>
                )}
                <span>
                  Submitted: {t.created_at ? new Date(t.created_at).toLocaleDateString() : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
