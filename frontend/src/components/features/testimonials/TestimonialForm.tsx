'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Star, Send, CheckCircle2 } from 'lucide-react';

export const TestimonialForm: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    author_role: '',
    rating: 5,
    text: '',
    context: 'about_department'
  });

  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const charCount = formData.text.length;
  const maxChars = 500;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.text.trim()) {
      setError('Please provide your testimonial text');
      return;
    }

    if (formData.text.length > maxChars) {
      setError(`Testimonial cannot exceed ${maxChars} characters`);
      return;
    }

    setLoading(true);
    try {
      await apiPost('/testimonials', {
        text: formData.text.trim(),
        author_role: formData.author_role.trim() || undefined,
        rating: formData.rating,
        context: formData.context
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/testimonials');
      }, 2500);
    } catch (err: unknown) {
      console.error('Failed to submit testimonial', err);
      const message = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to submit testimonial. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white border border-[#DCE5F1] rounded-2xl p-10 text-center max-w-md mx-auto space-y-4">
        <div className="w-14 h-14 bg-[#EEF3EE] text-[#7A9A7E] rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#0F172A]">Testimonial Submitted!</h2>
        <p className="text-sm text-[#526783] leading-relaxed">
          Thank you for sharing your experience. Your submission has been sent to the department moderation queue and will be published once approved.
        </p>
        <p className="text-xs text-[#667A93]">Redirecting to testimonials...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-[#DCE5F1] rounded-2xl p-6 md:p-8 space-y-6">
      {error && (
        <div className="p-3.5 bg-[#F5EAEA] border border-[#B85C5C]/30 text-[#B85C5C] rounded-lg text-xs font-medium">
          {error}
        </div>
      )}

      {/* Auto-detected role banner */}
      <div className="p-4 bg-[#F6F8FC] rounded-xl border border-[#DCE5F1] flex items-center justify-between">
        <div>
          <div className="text-xs text-[#667A93]">Submitting as:</div>
          <div className="text-sm font-bold text-[#0F172A]">
            {user?.email || 'Authenticated User'}
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 bg-white border border-[#DCE5F1] rounded-full font-semibold capitalize text-[#526783]">
          Role: {user?.role || 'Student'}
        </span>
      </div>

      {/* Context Selection */}
      <div>
        <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
          What is your testimonial about? *
        </label>
        <select
          value={formData.context}
          onChange={(e) => setFormData({ ...formData, context: e.target.value })}
          className="w-full px-3.5 py-2.5 border border-[#DCE5F1] rounded-lg text-sm bg-white focus:outline-none focus:border-[#94B0B8]"
        >
          <option value="about_department">Overall Department Experience</option>
          <option value="about_course">Courses, Labs & Curriculum</option>
          <option value="about_faculty">Faculty Guidance & Mentorship</option>
          <option value="about_placement">Placements, Internships & Career Growth</option>
        </select>
      </div>

      {/* Rating */}
      <div>
        <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
          Rating (1 to 5 Stars)
        </label>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(null)}
              onClick={() => setFormData({ ...formData, rating: star })}
              className="p-1 focus:outline-none"
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  star <= (hoverRating ?? formData.rating)
                    ? 'text-[#EEBE1E] fill-[#EEBE1E]'
                    : 'text-[#DCE5F1]'
                }`}
              />
            </button>
          ))}
          <span className="text-xs font-semibold text-[#526783] ml-2">
            {formData.rating} / 5
          </span>
        </div>
      </div>

      {/* Custom title / role tagline */}
      <div>
        <label className="block text-xs font-semibold text-[#0F172A] mb-1">
          Your Designation / Tagline (Optional)
        </label>
        <input
          type="text"
          value={formData.author_role}
          onChange={(e) => setFormData({ ...formData, author_role: e.target.value })}
          placeholder="e.g. SDE at Google, 2024 AI Graduate, ML Researcher"
          className="w-full px-3.5 py-2.5 border border-[#DCE5F1] rounded-lg text-sm bg-white focus:outline-none focus:border-[#94B0B8]"
        />
      </div>

      {/* Testimonial Text */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-semibold text-[#0F172A]">
            Your Testimonial (Max 500 characters) *
          </label>
          <span
            className={`text-xs ${
              charCount > maxChars ? 'text-[#B85C5C] font-bold' : 'text-[#667A93]'
            }`}
          >
            {charCount} / {maxChars}
          </span>
        </div>
        <textarea
          rows={4}
          maxLength={maxChars}
          value={formData.text}
          onChange={(e) => setFormData({ ...formData, text: e.target.value })}
          placeholder="Share your experience with the AI/ML department, what you learned, mentorship received, or how it prepared you for your career..."
          className="w-full p-3.5 border border-[#DCE5F1] rounded-xl text-sm bg-white focus:outline-none focus:border-[#94B0B8] leading-relaxed"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading || charCount === 0 || charCount > maxChars}
          className="w-full inline-flex items-center justify-center gap-2 bg-[#0F172A] text-white hover:bg-[#FACC15] hover:text-[#0F172A] py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" /> Submit Testimonial for Review
            </>
          )}
        </button>
      </div>
    </form>
  );
};
