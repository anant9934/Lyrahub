'use client';

import React from 'react';
import { Quote, Star, Sparkles, User, GraduationCap, Briefcase, BookOpen } from 'lucide-react';

interface Testimonial {
  id: string;
  author_name: string;
  author_type: string;
  author_role?: string;
  author_photo_url?: string;
  rating?: number;
  text: string;
  context?: string;
  is_featured?: boolean;
  is_published?: boolean;
  created_at?: string;
}

export const TestimonialCard: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => {
  const getContextLabel = (ctx?: string) => {
    switch (ctx) {
      case 'about_department':
        return 'Department Experience';
      case 'about_course':
        return 'Course & Curriculum';
      case 'about_faculty':
        return 'Faculty Mentorship';
      case 'about_placement':
        return 'Placements & Careers';
      default:
        return 'General';
    }
  };

  const getAuthorIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'student':
        return <User className="w-3.5 h-3.5 text-[#6B8FA3]" />;
      case 'alumni':
        return <GraduationCap className="w-3.5 h-3.5 text-[#EEBE1E]" />;
      case 'faculty':
        return <BookOpen className="w-3.5 h-3.5 text-[#7A9A7E]" />;
      case 'recruiter':
        return <Briefcase className="w-3.5 h-3.5 text-[#1E1E1E]" />;
      default:
        return <User className="w-3.5 h-3.5 text-[#7A7A7A]" />;
    }
  };

  return (
    <div
      className={`rounded-2xl bg-white p-6 border flex flex-col justify-between transition-all hover:shadow-md ${
        testimonial.is_featured
          ? 'border-[#EEBE1E] bg-gradient-to-b from-[#FAF3E2]/30 to-white shadow-sm'
          : 'border-[#D6D6D6]'
      }`}
    >
      <div>
        {/* Top bar with context & rating */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium bg-[#F2F2F1] text-[#5C5C5C] px-2.5 py-0.5 rounded-full capitalize">
              {getContextLabel(testimonial.context)}
            </span>
            {testimonial.is_featured && (
              <span className="text-[11px] bg-[#FAF3E2] text-[#1E1E1E] border border-[#EEBE1E] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#EEBE1E] fill-current" /> Featured
              </span>
            )}
          </div>

          {testimonial.rating && (
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < (testimonial.rating || 0)
                      ? 'text-[#EEBE1E] fill-[#EEBE1E]'
                      : 'text-[#D6D6D6]'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quote icon & text */}
        <div className="relative mb-6">
          <Quote className="w-8 h-8 text-[#94B0B8]/30 absolute -top-2 -left-1 -z-0 pointer-events-none" />
          <p className="text-sm text-[#1E1E1E] leading-relaxed relative z-10 italic">
            &ldquo;{testimonial.text}&rdquo;
          </p>
        </div>
      </div>

      {/* Author info */}
      <div className="flex items-center gap-3 pt-4 border-t border-[#D6D6D6]">
        {testimonial.author_photo_url ? (
          <img
            src={testimonial.author_photo_url}
            alt={testimonial.author_name}
            className="w-10 h-10 rounded-full object-cover border border-[#D6D6D6]"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#F2F2F1] border border-[#D6D6D6] flex items-center justify-center font-bold text-sm text-[#1E1E1E]">
            {testimonial.author_name ? testimonial.author_name.charAt(0) : 'U'}
          </div>
        )}

        <div>
          <div className="font-bold text-sm text-[#1E1E1E] flex items-center gap-1.5">
            {testimonial.author_name}
            <span title={testimonial.author_type}>{getAuthorIcon(testimonial.author_type)}</span>
          </div>
          <div className="text-xs text-[#5C5C5C]">{testimonial.author_role || testimonial.author_type}</div>
        </div>
      </div>
    </div>
  );
};
