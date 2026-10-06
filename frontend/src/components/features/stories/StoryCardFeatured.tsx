'use client';

import React from 'react';
import Link from 'next/link';
import { Eye, Sparkles, ArrowRight, Calendar, Building, GraduationCap, User } from 'lucide-react';

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
  featured?: boolean;
}

export const StoryCardFeatured: React.FC<{ story: Story }> = ({ story }) => {
  return (
    <div className="relative rounded-2xl bg-white border-2 border-[#FACC15] shadow-sm overflow-hidden flex flex-col lg:flex-row transition-all hover:shadow-md">
      {/* Featured Badge Top-Right */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-[#FAF3E2] text-[#0F172A] border border-[#FACC15] px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-[#EEBE1E] fill-[#EEBE1E]" />
        Featured Story
      </div>

      {/* Image / Graphic section */}
      <div className="lg:w-5/12 bg-gradient-to-br from-[#FAF3E2] via-[#F2F2F1] to-[#EAF0F3] relative min-h-[260px] flex items-center justify-center p-6 overflow-hidden">
        {story.featured_image_url ? (
          <img
            src={story.featured_image_url}
            alt={story.title}
            className="w-full h-full object-cover absolute inset-0"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-6 z-0">
            <div className="w-20 h-20 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-2xl font-bold text-[#0F172A] mb-3 border border-[#DCE5F1]">
              {story.person_name ? story.person_name.charAt(0) : 'S'}
            </div>
            <div className="font-semibold text-[#0F172A] text-base">{story.person_name}</div>
            <div className="text-xs text-[#526783] mt-0.5">
              {story.current_role} {story.current_company ? `@ ${story.current_company}` : ''}
            </div>
          </div>
        )}
      </div>

      {/* Content section */}
      <div className="lg:w-7/12 p-6 lg:p-8 flex flex-col justify-between">
        <div>
          {/* Metadata chips */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
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
              <span className="text-xs bg-[#F6F8FC] text-[#526783] px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Class of {story.batch_year}
              </span>
            )}

            {story.current_company && (
              <span className="text-xs bg-[#F6F8FC] text-[#526783] px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                <Building className="w-3 h-3" /> {story.current_company}
              </span>
            )}
          </div>

          <h2 className="text-2xl lg:text-3xl font-bold text-[#0F172A] leading-tight mb-2 hover:text-[#EEBE1E] transition-colors">
            <Link href={`/stories/${story.slug}`}>{story.title}</Link>
          </h2>

          {story.subtitle && (
            <p className="text-sm font-medium text-[#526783] mb-3">{story.subtitle}</p>
          )}

          <p className="text-sm text-[#667A93] leading-relaxed line-clamp-3 mb-4">
            {story.summary || 'Read this inspiring success journey from our department.'}
          </p>

          {/* Tags */}
          {story.tags && story.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {story.tags.slice(0, 4).map((tag, i) => (
                <span
                  key={i}
                  className="text-xs bg-[#F6F8FC] text-[#667A93] px-2 py-0.5 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer info & CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-[#DCE5F1] mt-2">
          <div className="flex items-center gap-2 text-xs text-[#667A93]">
            <Eye className="w-4 h-4" />
            <span>{story.views_count || 0} views</span>
            {story.published_at && (
              <>
                <span>•</span>
                <span>{new Date(story.published_at).toLocaleDateString()}</span>
              </>
            )}
          </div>

          <Link
            href={`/stories/${story.slug}`}
            className="inline-flex items-center gap-1.5 bg-[#0F172A] text-white hover:bg-[#FACC15] hover:text-[#0F172A] text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Read Story <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
