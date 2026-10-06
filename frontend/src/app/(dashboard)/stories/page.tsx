'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { StoryCardFeatured } from '@/components/features/stories/StoryCardFeatured';
import { StoryCard } from '@/components/features/stories/StoryCard';
import { StoryFilters } from '@/components/features/stories/StoryFilters';
import { WorkspaceHero } from '@/components/layout/WorkspaceHero';
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
      <WorkspaceHero eyebrow="Inspiring journeys" title={<>Real people. <span className="text-[#b97800]">Real stories.</span></>} description="Discover the achievements, projects, and paths of AIMETRA students and alumni." tone="yellow" icon={BookOpen} actions={<>
          {isFacultyOrAdmin && (
            <Link
              href="/stories/me"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#eed999] bg-white px-4 py-2.5 text-xs font-bold text-[#081a39] transition hover:bg-[#fffdf4]"
            >
              <FolderOpen className="w-4 h-4 text-[#526783]" /> My Stories
            </Link>
          )}

          {isFacultyOrAdmin && (
            <Link
              href="/stories/create"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#081a39] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#1478ef]"
            >
              <Plus className="w-4 h-4" /> Write Story
            </Link>
          )}
      </>}/>

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
          <div className="w-8 h-8 border-2 border-[#0F172A] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#667A93]">Loading stories...</p>
        </div>
      ) : totalCount === 0 ? (
        <div className="bg-white border border-[#DCE5F1] rounded-2xl p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 bg-[#F6F8FC] rounded-full flex items-center justify-center mx-auto text-[#667A93]">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#0F172A]">No stories found</h3>
          <p className="text-xs text-[#667A93] leading-relaxed">
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
              <h2 className="text-xl font-bold text-[#0F172A]">All Stories</h2>
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
                className="px-3 py-1.5 border border-[#DCE5F1] rounded-md text-xs font-medium text-[#0F172A] disabled:opacity-40 hover:bg-[#F6F8FC]"
              >
                Previous
              </button>
              <span className="text-xs text-[#526783] px-2">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 border border-[#DCE5F1] rounded-md text-xs font-medium text-[#0F172A] disabled:opacity-40 hover:bg-[#F6F8FC]"
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
