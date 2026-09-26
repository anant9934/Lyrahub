'use client';

import React from 'react';
import Link from 'next/link';
import { Eye, ArrowRight, Calendar, Building, GraduationCap, User } from 'lucide-react';

interface Story {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  story_type: 'student' | 'alumni';
  person_name?: string;
  person_photo_url?: string;
  current_role?: string;
  current_company?: string;
  batch_year?: number;
  program?: string;
  summary?: string;
  featured_image_url?: string;
  tags?: string[];
  views_count?: number;
  published_at?: string;
  is_published?: boolean;
}

export const StoryCard: React.FC<{ story: Story }> = ({ story }) => {
  return (
    <div className="bg-white rounded-xl border border-[#D6D6D6] hover:border-[#94B0B8] transition-all hover:shadow-md flex flex-col justify-between overflow-hidden">
      {/* Cover / Header */}
      <div>
        {story.featured_image_url ? (
          <div className="h-44 w-full bg-[#F2F2F1] overflow-hidden relative">
            <img
              src={story.featured_image_url}
              alt={story.title}
              className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
            />
          </div>
        ) : (
          <div className="h-32 w-full bg-gradient-to-r from-[#F2F2F1] to-[#EAF0F3] p-4 flex items-center gap-3 border-b border-[#D6D6D6]">
            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center font-bold text-[#1E1E1E] text-base border border-[#D6D6D6]">
              {story.person_name ? story.person_name.charAt(0) : 'S'}
            </div>
            <div>
              <div className="font-semibold text-sm text-[#1E1E1E]">{story.person_name || 'Spotlight'}</div>
              <div className="text-xs text-[#7A7A7A]">{story.current_role} {story.current_company ? `@ ${story.current_company}` : ''}</div>
            </div>
          </div>
        )}

        <div className="p-5">
          {/* Metadata badges */}
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                story.story_type === 'student'
                  ? 'bg-[#EAF0F3] text-[#6B8FA3]'
                  : 'bg-[#EEF3EE] text-[#7A9A7E]'
              }`}
            >
              {story.story_type === 'student' ? <User className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
              {story.story_type === 'student' ? 'Student' : 'Alumni'}
            </span>

            {story.batch_year && (
              <span className="text-[11px] bg-[#F2F2F1] text-[#5C5C5C] px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3" /> '{story.batch_year}
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-[#1E1E1E] leading-snug mb-1.5 hover:text-[#EEBE1E] transition-colors line-clamp-2">
            <Link href={`/stories/${story.slug}`}>{story.title}</Link>
          </h3>

          <p className="text-xs text-[#7A7A7A] line-clamp-3 leading-relaxed mb-3">
            {story.summary || story.subtitle || 'Read more about this success journey.'}
          </p>

          {/* Tags */}
          {story.tags && story.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {story.tags.slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className="text-[11px] bg-[#F2F2F1] text-[#7A7A7A] px-1.5 py-0.5 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-[#F2F2F1]/50 border-t border-[#D6D6D6] flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-[#7A7A7A]">
          <Eye className="w-3.5 h-3.5" />
          <span>{story.views_count || 0}</span>
        </div>

        <Link
          href={`/stories/${story.slug}`}
          className="inline-flex items-center gap-1 text-[#1E1E1E] font-semibold hover:text-[#EEBE1E] transition-colors"
        >
          Read <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
