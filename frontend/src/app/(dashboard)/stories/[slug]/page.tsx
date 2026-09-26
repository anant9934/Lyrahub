'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { apiGet, apiPost } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { StoryCard } from '@/components/features/stories/StoryCard';
import {
  ArrowLeft,
  Calendar,
  Building,
  User,
  GraduationCap,
  Eye,
  Share2,
  Check,
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function StoryDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [story, setStory] = useState<any | null>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isHODorAdmin = Boolean(
    user && ['admin', 'hod'].includes(user.role?.toLowerCase() || '')
  );

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiGet(`/stories/${slug}`);
        setStory(data);

        // Fetch related stories by same story_type
        if (data.story_type) {
          const relRes = await apiGet(`/stories?story_type=${data.story_type}&page_size=3`);
          const items = (relRes.items || []).filter((s: any) => s.id !== data.id);
          setRelated(items.slice(0, 3));
        }
      } catch (err: any) {
        console.error('Failed to load story detail', err);
        setError('Story not found or you do not have permission to view it.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchDetail();
    }
  }, [slug]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleFeature = async () => {
    if (!story) return;
    try {
      const updated = await apiPost(`/stories/${story.id}/feature`, {});
      setStory(updated);
    } catch (err) {
      console.error('Failed to toggle feature', err);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#1E1E1E] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-[#7A7A7A]">Loading story...</p>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="bg-white border border-[#D6D6D6] rounded-2xl p-12 text-center max-w-md mx-auto space-y-4 my-12">
        <div className="w-12 h-12 bg-[#F5EAEA] text-[#B85C5C] rounded-full flex items-center justify-center mx-auto">
          <BookOpen className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-[#1E1E1E]">Story Not Found</h2>
        <p className="text-sm text-[#7A7A7A]">{error}</p>
        <Link
          href="/stories"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E1E1E] bg-[#F2F2F1] hover:bg-[#D6D6D6] px-4 py-2 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Stories
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top back & actions bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/stories"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C5C5C] hover:text-[#1E1E1E] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Stories
        </Link>

        <div className="flex items-center gap-2">
          {isHODorAdmin && (
            <button
              type="button"
              onClick={handleToggleFeature}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-semibold transition-colors ${
                story.featured
                  ? 'bg-[#EEBE1E] text-[#1E1E1E] border-[#EEBE1E]'
                  : 'bg-white text-[#1E1E1E] border-[#D6D6D6] hover:bg-[#FAF3E2]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              {story.featured ? 'Featured' : 'Feature Story'}
            </button>
          )}

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs bg-white hover:bg-[#F2F2F1] text-[#1E1E1E] border border-[#D6D6D6] px-3 py-1.5 rounded-lg font-semibold transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#7A9A7E]" /> : <Share2 className="w-3.5 h-3.5 text-[#7A7A7A]" />}
            {copied ? 'Link Copied!' : 'Share'}
          </button>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white rounded-2xl border border-[#D6D6D6] overflow-hidden shadow-sm">
        {story.featured_image_url && (
          <div className="w-full h-72 md:h-96 bg-[#F2F2F1] relative overflow-hidden">
            <img
              src={story.featured_image_url}
              alt={story.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 md:p-10 space-y-6">
          {/* Metadata badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                story.story_type === 'student'
                  ? 'bg-[#EAF0F3] text-[#6B8FA3]'
                  : 'bg-[#EEF3EE] text-[#7A9A7E]'
              }`}
            >
              {story.story_type === 'student' ? <User className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
              {story.story_type === 'student' ? 'Student Spotlight' : 'Alumni Success'}
            </span>

            {story.batch_year && (
              <span className="text-xs bg-[#F2F2F1] text-[#5C5C5C] px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Class of {story.batch_year}
              </span>
            )}

            {story.views_count !== undefined && (
              <span className="text-xs bg-[#F2F2F1] text-[#7A7A7A] px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                <Eye className="w-3 h-3" /> {story.views_count} views
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-[#1E1E1E] leading-tight">
            {story.title}
          </h1>

          {story.subtitle && (
            <p className="text-lg text-[#5C5C5C] font-medium leading-relaxed">
              {story.subtitle}
            </p>
          )}

          {/* Author/Person Profile Box */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-[#F2F2F1] border border-[#D6D6D6]">
            <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center font-bold text-xl text-[#1E1E1E] border border-[#D6D6D6]">
              {story.person_name ? story.person_name.charAt(0) : 'S'}
            </div>
            <div>
              <div className="font-bold text-base text-[#1E1E1E]">{story.person_name}</div>
              <div className="text-xs text-[#5C5C5C]">
                {story.current_role} {story.current_company ? `at ${story.current_company}` : ''}
              </div>
              {story.program && <div className="text-[11px] text-[#7A7A7A] mt-0.5">{story.program}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Story Body */}
      <div className="bg-white rounded-2xl border border-[#D6D6D6] p-6 md:p-10 space-y-6">
        <div className="prose max-w-none text-[#1E1E1E] leading-relaxed whitespace-pre-wrap font-sans text-base">
          {story.full_story ? (
            <div className="space-y-4">
              {story.full_story.split('\n\n').map((paragraph: string, idx: number) => {
                if (paragraph.startsWith('### ')) {
                  return (
                    <h3 key={idx} className="text-xl font-bold text-[#1E1E1E] mt-6 mb-2">
                      {paragraph.replace('### ', '')}
                    </h3>
                  );
                }
                if (paragraph.startsWith('## ')) {
                  return (
                    <h2 key={idx} className="text-2xl font-bold text-[#1E1E1E] mt-8 mb-3">
                      {paragraph.replace('## ', '')}
                    </h2>
                  );
                }
                if (paragraph.startsWith('> ')) {
                  return (
                    <blockquote
                      key={idx}
                      className="border-l-4 border-[#EEBE1E] bg-[#FAF3E2]/50 p-4 rounded-r-lg italic text-[#1E1E1E] my-4"
                    >
                      {paragraph.replace('> ', '')}
                    </blockquote>
                  );
                }
                return <p key={idx}>{paragraph}</p>;
              })}
            </div>
          ) : (
            <p className="text-[#5C5C5C] italic">{story.summary}</p>
          )}
        </div>

        {/* Tags */}
        {story.tags && story.tags.length > 0 && (
          <div className="pt-6 border-t border-[#D6D6D6] flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#7A7A7A]">Tags:</span>
            {story.tags.map((tag: string, i: number) => (
              <span
                key={i}
                className="text-xs bg-[#F2F2F1] text-[#1E1E1E] px-2.5 py-1 rounded-md font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Related Stories */}
      {related.length > 0 && (
        <section className="space-y-4 pt-6">
          <h2 className="text-2xl font-bold text-[#1E1E1E]">More Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((relStory) => (
              <StoryCard key={relStory.id} story={relStory} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
