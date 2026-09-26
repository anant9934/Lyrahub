'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { StoryCardFeatured } from '@/components/features/stories/StoryCardFeatured';
import { StoryCard } from '@/components/features/stories/StoryCard';
import { StoryFilters } from '@/components/features/stories/StoryFilters';
import { Plus, BookOpen, Sparkles, FolderOpen } from 'lucide-react';

export default function StoriesPage() {
  const { user } = useAuth();
  const [stories, setStories] = useState<any[]>([]);
  const [featuredStory, setFeaturedStory] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [filters, setFilters] = useState({
    story_type: '',
    batch_year: '',
    tag: '',
    search: ''
  });

  const isFacultyOrAdmin = Boolean(
    user && ['faculty', 'hod', 'admin'].includes(user.role?.toLowerCase() || '')
  );

  const fetchStories = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.story_type) params.append('story_type', filters.story_type);
      if (filters.batch_year) params.append('batch_year', filters.batch_year);
      if (filters.tag) params.append('tag', filters.tag);
      if (filters.search) params.append('search', filters.search);
      params.append('page', page.toString());
      params.append('page_size', '12');

      const res = await apiGet(`/stories?${params.toString()}`);
      const items = res.items || [];
      setTotalPages(res.pages || 1);
      setTotalCount(res.total || 0);

      // Separate featured story on page 1 if not filtering
      if (page === 1 && !filters.search && !filters.story_type && !filters.batch_year) {
        const feat = items.find((s: any) => s.featured);
        if (feat) {
          setFeaturedStory(feat);
          setStories(items.filter((s: any) => s.id !== feat.id));
        } else {
          setFeaturedStory(items[0] || null);
          setStories(items.slice(1));
        }
      } else {
        setFeaturedStory(null);
        setStories(items);
      }
    } catch (err) {
      console.error('Failed to fetch stories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [filters, page]);

  return (
    <div className="space-y-8">
      {/* Header banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D6D6D6] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-[#FAF3E2] text-[#1E1E1E] border border-[#EEBE1E] px-2.5 py-0.5 rounded-full font-semibold">
              Inspiring Journeys
            </span>
          </div>
          <h1 className="text-3xl font-bold text-[#1E1E1E]">Success Stories</h1>
          <p className="text-sm text-[#5C5C5C] mt-1">
            Discover milestone achievements and career trajectories of AI/ML department students and alumni.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isFacultyOrAdmin && (
            <Link
              href="/stories/me"
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#D6D6D6] rounded-lg text-xs font-semibold text-[#1E1E1E] hover:bg-[#F2F2F1] transition-colors"
            >
              <FolderOpen className="w-4 h-4 text-[#5C5C5C]" /> My Stories
            </Link>
          )}

          {isFacultyOrAdmin && (
            <Link
              href="/stories/create"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E1E1E] text-white hover:bg-[#EEBE1E] hover:text-[#1E1E1E] rounded-lg text-xs font-semibold transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Write Story
            </Link>
          )}
        </div>
      </div>

      {/* Filter component */}
      <StoryFilters
        filters={filters}
        onChange={(newFilters) => {
          setFilters(newFilters);
          setPage(1);
        }}
        onReset={() => {
          setFilters({ story_type: '', batch_year: '', tag: '', search: '' });
          setPage(1);
        }}
      />

      {/* Content area */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#1E1E1E] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#7A7A7A]">Loading stories...</p>
        </div>
      ) : totalCount === 0 ? (
        <div className="bg-white border border-[#D6D6D6] rounded-2xl p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 bg-[#F2F2F1] rounded-full flex items-center justify-center mx-auto text-[#7A7A7A]">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#1E1E1E]">No stories found</h3>
          <p className="text-xs text-[#7A7A7A] leading-relaxed">
            There are no published stories matching your current filter criteria. Check back soon or clear filters.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Featured Hero Story */}
          {featuredStory && (
            <section>
              <StoryCardFeatured story={featuredStory} />
            </section>
          )}

          {/* Magazine Grid */}
          {stories.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-[#1E1E1E]">All Stories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stories.map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
            </section>
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
      )}
    </div>
  );
}
