'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, PlusCircle, Sparkles } from 'lucide-react';
import { CourseCard, Course } from '@/components/features/courses/CourseCard';
import { CourseFilters } from '@/components/features/courses/CourseFilters';
import { CoursesGridSkeleton } from '@/components/ui/skeletons';
import { useAuth } from '@/lib/auth-context';
import { useCourses } from '@/lib/hooks';
import { useDebounce } from '@/lib/use-debounce';

export default function CoursesPage() {
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [semester, setSemester] = useState('all');
  const [courseType, setCourseType] = useState('all');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);

  // Debounce search to reduce API calls on rapid typing
  const debouncedSearch = useDebounce(search, 350);

  const isHodOrAdmin =
    user &&
    (user.roles?.some((r) => ['hod', 'admin'].includes(r.name?.toLowerCase())) ||
      user.email === 'hod@aiml.hub' ||
      user.email === 'admin@aiml.hub');

  const { data, isLoading, isFetching, isError } = useCourses<Course>({
    search: debouncedSearch,
    semester,
    courseType,
    category,
    page,
  });

  const courses: Course[] = Array.isArray(data) ? data : (data?.items ?? []);
  const total: number = Array.isArray(data) ? data.length : (data?.total ?? courses.length);

  const isInitialLoad = isLoading;
  const isRefreshing = isFetching && !isLoading;

  const handleResetFilters = () => {
    setSearch('');
    setSemester('all');
    setCourseType('all');
    setCategory('all');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section — always immediate */}
        <div className="relative mb-8 overflow-hidden rounded-[30px] bg-[#071b3d] p-8 text-white shadow-[0_20px_52px_rgba(7,27,61,0.18)] md:p-12 lg:min-h-[320px] lg:pr-[40%]">
          <div className="absolute inset-y-0 right-0 hidden w-[43%] [clip-path:polygon(20%_0,100%_0,100%_100%,0_100%)] lg:block"><Image src="/images/hero-campus.webp" alt="" fill sizes="43vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-r from-[#071b3d]/75 to-transparent" /></div>
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#ffcf36]" />
              <span>Department Syllabus Catalog</span>
            </div>
            <h1 className="mb-4 text-4xl font-black leading-[1.02] tracking-[-0.055em] md:text-5xl">
              Learn what <span className="text-[#ffcf36]">moves you.</span>
            </h1>
            <p className="text-[#DCE5F1] text-base md:text-lg leading-relaxed mb-6">
              Browse course curriculum, course outcomes (COs), evaluation matrices, textbook
              references, and mapped faculty mentors.
            </p>
          </div>

          {isHodOrAdmin && (
            <div className="mt-6 md:mt-0 md:absolute md:top-12 md:right-12 z-20">
              <Link
                href="/courses/manage"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white hover:bg-neutral-100 text-[#0F172A] font-semibold text-xs transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Manage Courses</span>
              </Link>
            </div>
          )}
        </div>

        {/* Filters — always immediate */}
        <CourseFilters
          search={search}
          onSearchChange={setSearch}
          semester={semester}
          onSemesterChange={setSemester}
          courseType={courseType}
          onCourseTypeChange={setCourseType}
          category={category}
          onCategoryChange={setCategory}
          onReset={handleResetFilters}
        />

        {/* Count row — only show when data is confirmed, never during loading */}
        <div className="flex items-center justify-between mb-6 px-1 h-6">
          {!isInitialLoad && !isError && (
            <span className="text-xs font-semibold text-[#667A93] flex items-center gap-2">
              Showing {courses.length} of {total} courses
              {isRefreshing && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse" />
              )}
            </span>
          )}
        </div>

        {/* ── Content: Skeleton → Data → Empty → Error ──────────────────── */}
        {isInitialLoad ? (
          // LOADING — structured skeletons matching course card dimensions
          <CoursesGridSkeleton count={6} />
        ) : isError ? (
          // ERROR state
          <div className="bg-white rounded-2xl border border-[#DCE5F1] p-12 text-center text-[#667A93]">
            <BookOpen className="w-12 h-12 mx-auto text-[#71849B] mb-3 opacity-50" />
            <h3 className="text-lg font-bold text-[#0F172A] mb-1">Couldn&apos;t load courses</h3>
            <p className="text-sm mb-4">
              There was a problem fetching the course catalog. Please try again.
            </p>
            <button
              onClick={handleResetFilters}
              className="text-xs text-[#2563EB] hover:underline font-medium"
            >
              Reset filters and retry
            </button>
          </div>
        ) : courses.length > 0 ? (
          // SUCCESS WITH DATA
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          // SUCCESS EMPTY — only after confirmed empty response
          <div className="bg-white rounded-2xl border border-[#DCE5F1] p-12 text-center text-[#667A93]">
            <BookOpen className="w-12 h-12 mx-auto text-[#71849B] mb-3 opacity-50" />
            <h3 className="text-lg font-bold text-[#0F172A] mb-1">No Courses Found</h3>
            <p className="text-sm">
              {debouncedSearch || semester !== 'all' || courseType !== 'all' || category !== 'all'
                ? 'Try broadening your search criteria or resetting filters.'
                : 'No courses have been added to the catalog yet.'}
            </p>
            {(debouncedSearch || semester !== 'all' || courseType !== 'all' || category !== 'all') && (
              <button
                onClick={handleResetFilters}
                className="mt-4 text-xs text-[#2563EB] hover:underline font-medium"
              >
                Reset filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
