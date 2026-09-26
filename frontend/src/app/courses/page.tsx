'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Layers, PlusCircle, Sparkles } from 'lucide-react';
import api from '@/lib/api';
import { CourseCard, Course } from '@/components/features/courses/CourseCard';
import { CourseFilters } from '@/components/features/courses/CourseFilters';
import { useAuth } from '@/lib/auth-context';

export default function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [semester, setSemester] = useState('all');
  const [courseType, setCourseType] = useState('all');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);

  const isHodOrAdmin = user && (user.role === 'hod' || user.role === 'admin');

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        page_size: 30,
      };
      if (search) params.search = search;
      if (semester !== 'all') params.semester = parseInt(semester);
      if (courseType !== 'all') params.course_type = courseType;
      if (category !== 'all') params.category = category;

      const res = await api.get('/courses', { params });
      setCourses(res.data?.items || []);
      setTotal(res.data?.total || 0);
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [search, semester, courseType, category, page]);

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
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-[#111111] text-white p-8 md:p-12 mb-8 shadow-subtle">
          <div className="max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Department Syllabus Catalog</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              AI/ML Courses & Syllabi
            </h1>
            <p className="text-[#D6D6D6] text-base md:text-lg leading-relaxed mb-6">
              Browse course curriculum, course outcomes (COs), evaluation matrices, textbook references, and mapped faculty mentors.
            </p>
          </div>

          {isHodOrAdmin && (
            <div className="mt-6 md:mt-0 md:absolute md:top-12 md:right-12 z-20">
              <Link
                href="/courses/manage"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white hover:bg-neutral-100 text-[#111111] font-semibold text-xs transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Manage Courses</span>
              </Link>
            </div>
          )}
        </div>

        {/* Filter component */}
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

        {/* Total counts badge */}
        <div className="flex items-center justify-between mb-6 px-1">
          <span className="text-xs font-semibold text-[#7A7A7A]">
            Showing {courses.length} of {total} courses
          </span>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-white rounded-2xl border border-[#D6D6D6] animate-pulse p-6" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#D6D6D6] p-12 text-center text-[#7A7A7A]">
            <BookOpen className="w-12 h-12 mx-auto text-[#9A9A9A] mb-3 opacity-50" />
            <h3 className="text-lg font-bold text-[#1E1E1E] mb-1">No Courses Found</h3>
            <p className="text-sm">Try broadening your search criteria or resetting filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
