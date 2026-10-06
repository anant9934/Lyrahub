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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#526783] hover:text-[#0F172A] mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Testimonials
        </Link>
        <h1 className="text-2xl font-bold text-[#0F172A]">Share Your Experience</h1>
        <p className="text-xs text-[#526783] mt-0.5">
          Your feedback and reflections help prospective students, recruiters, and the department flourish.
        </p>
      </div>

      <TestimonialForm />
    </div>
  );
}
