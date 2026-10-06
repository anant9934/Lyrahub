'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, BookOpen } from 'lucide-react';
import api from '@/lib/api';

export default function CourseCodeRedirectPage() {
  const { code } = useParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function resolveCode() {
      try {
        const res = await api.get(`/courses/code/${code}`);
        if (res.data?.slug) {
          router.replace(`/courses/${res.data.slug}`);
        } else {
          setError('Course slug could not be determined');
        }
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Course not found by code');
      }
    }

    if (code) {
      resolveCode();
    }
  }, [code, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#F6F8FC] py-16 px-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-[#DCE5F1] p-8 text-center max-w-md shadow-sm">
          <BookOpen className="w-12 h-12 text-[#71849B] mx-auto mb-3" />
          <h2 className="text-xl font-bold text-[#0F172A] mb-2">Course Not Found</h2>
          <p className="text-sm text-[#526783] mb-6">{error}</p>
          <Link
            href="/courses"
            className="px-4 py-2 rounded-xl bg-[#0F172A] text-white text-sm font-semibold"
          >
            Browse All Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8FC] flex flex-col items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#0F172A] mb-3" />
      <p className="text-xs font-semibold text-[#667A93]">Redirecting to course details for {code}...</p>
    </div>
  );
}
