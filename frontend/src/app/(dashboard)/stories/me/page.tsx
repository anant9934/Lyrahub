'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import {
  Plus,
  BookOpen,
  ArrowLeft,
  Sparkles,
  Eye,
  Send,
  Trash2,
  Edit2,
  ExternalLink
} from 'lucide-react';

export default function MyStoriesPage() {
  const { user } = useAuth();
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'draft' | 'published' | 'featured'>('all');

  const fetchMyStories = async () => {
    setLoading(true);
    try {
      // Get all stories including unpublished for faculty/admin
      const res = await apiGet('/stories?page_size=100');
      const all = res.items || [];
      // Filter stories created by current user if creator id matches or if HOD/admin shows all
      const myItems = all.filter((s: any) => s.created_by === user?.id || !s.created_by || ['admin', 'hod'].includes(user?.role?.toLowerCase() || ''));
      setStories(myItems);
    } catch (err) {
      console.error('Failed to load my stories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyStories();
    }
  }, [user]);

  const handlePublish = async (id: string) => {
    try {
      await apiPost(`/stories/${id}/publish`, {});
      fetchMyStories();
    } catch (err) {
      console.error('Failed to publish story', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this story?')) return;
    try {
      await apiDelete(`/stories/${id}`);
      fetchMyStories();
    } catch (err) {
      console.error('Failed to delete story', err);
    }
  };

  const filteredStories = stories.filter((s) => {
    if (activeTab === 'draft') return !s.is_published;
    if (activeTab === 'published') return s.is_published;
    if (activeTab === 'featured') return s.featured;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DCE5F1] pb-6">
        <div>
          <Link
            href="/stories"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#526783] hover:text-[#0F172A] mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Public Stories
          </Link>
          <h1 className="text-3xl font-bold text-[#0F172A]">My Success Stories</h1>
          <p className="text-sm text-[#526783] mt-1">
            Manage your drafts, published narratives, and featured highlights.
          </p>
        </div>

        <Link
          href="/stories/create"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F172A] text-white hover:bg-[#FACC15] hover:text-[#0F172A] rounded-lg text-xs font-semibold transition-colors shadow-sm self-start"
        >
          <Plus className="w-4 h-4" /> Write New Story
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[#DCE5F1]">
        {(['all', 'draft', 'published', 'featured'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-semibold capitalize border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-[#0F172A] text-[#0F172A]'
                : 'border-transparent text-[#667A93] hover:text-[#0F172A]'
            }`}
          >
            {tab} (
            {stories.filter((s) => {
              if (tab === 'draft') return !s.is_published;
              if (tab === 'published') return s.is_published;
              if (tab === 'featured') return s.featured;
              return true;
            }).length}
            )
          </button>
        ))}
      </div>

      {/* Content Table / Cards */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#0F172A] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#667A93]">Loading stories...</p>
        </div>
      ) : filteredStories.length === 0 ? (
        <div className="bg-white border border-[#DCE5F1] rounded-2xl p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 bg-[#F6F8FC] rounded-full flex items-center justify-center mx-auto text-[#667A93]">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#0F172A]">No {activeTab} stories</h3>
          <p className="text-xs text-[#667A93]">You do not have any stories in this tab.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#DCE5F1] rounded-2xl overflow-hidden divide-y divide-[#D6D6D6]">
          {filteredStories.map((story) => (
            <div
              key={story.id}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#F6F8FC]/50 transition-colors"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                      story.is_published
                        ? 'bg-[#EEF3EE] text-[#7A9A7E]'
                        : 'bg-[#FAF3E2] text-[#D9A441]'
                    }`}
                  >
                    {story.is_published ? 'Published' : 'Draft'}
                  </span>

                  {story.featured && (
                    <span className="text-[11px] bg-[#FAF3E2] text-[#0F172A] border border-[#FACC15] px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#EEBE1E] fill-current" /> Featured
                    </span>
                  )}

                  <span className="text-[11px] text-[#667A93] uppercase tracking-wide">
                    {story.story_type}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#0F172A]">
                  <Link href={`/stories/${story.slug}`} className="hover:text-[#EEBE1E]">
                    {story.title}
                  </Link>
                </h3>

                <div className="text-xs text-[#526783] flex items-center gap-3">
                  <span>Person: <strong>{story.person_name}</strong></span>
                  <span>Views: {story.views_count || 0}</span>
                  {story.published_at && (
                    <span>Published: {new Date(story.published_at).toLocaleDateString()}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end md:self-center">
                {!story.is_published && (
                  <button
                    type="button"
                    onClick={() => handlePublish(story.id)}
                    className="inline-flex items-center gap-1 text-xs bg-[#7A9A7E] hover:bg-[#68856c] text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" /> Publish
                  </button>
                )}

                <Link
                  href={`/stories/${story.slug}`}
                  className="p-1.5 text-[#526783] hover:text-[#0F172A] rounded hover:bg-[#F6F8FC]"
                  title="View story"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>

                <button
                  type="button"
                  onClick={() => handleDelete(story.id)}
                  className="p-1.5 text-[#B85C5C] hover:text-red-700 rounded hover:bg-[#F5EAEA]"
                  title="Delete story"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
