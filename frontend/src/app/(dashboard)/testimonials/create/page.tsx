'use client';

import React from 'react';
import Link from 'next/link';
import { TestimonialForm } from '@/components/features/testimonials/TestimonialForm';
import { ArrowLeft } from 'lucide-react';

export default function CreateTestimonialPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/testimonials"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C5C5C] hover:text-[#1E1E1E] mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Testimonials
        </Link>
        <h1 className="text-2xl font-bold text-[#1E1E1E]">Share Your Experience</h1>
        <p className="text-xs text-[#5C5C5C] mt-0.5">
          Your feedback and reflections help prospective students, recruiters, and the department flourish.
        </p>
      </div>

      <TestimonialForm />
    </div>
  );
}
