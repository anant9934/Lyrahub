'use client';

import React from 'react';
import Link from 'next/link';
import { Users, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface Group {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  group_type: string;
  category: string;
  logo_url?: string;
  cover_image_url?: string;
  is_official?: boolean;
  member_count?: number;
  meeting_schedule?: string;
}

export const getCategoryBadge = (category: string) => {
  switch (category.toLowerCase()) {
    case 'technical':
      return 'bg-[#94B0B8]/20 text-[#4A6870] border border-[#94B0B8]/50';
    case 'cultural':
      return 'bg-[#FAF3E2] text-[#B8860B] border border-[#EEBE1E]/50';
    case 'sports':
      return 'bg-[#EEF3EE] text-[#7A9A7E] border border-[#7A9A7E]/40';
    case 'social':
      return 'bg-[#EAF0F3] text-[#6B8FA3] border border-[#6B8FA3]/40';
    case 'professional':
      return 'bg-[#F2F2F1] text-[#1E1E1E] border border-[#D6D6D6]';
    default:
      return 'bg-[#F2F2F1] text-[#5C5C5C] border border-[#D6D6D6]';
  }
};

export const GroupCard: React.FC<{ group: Group }> = ({ group }) => {
  return (
    <div className="bg-white rounded-2xl border border-[#D6D6D6] hover:border-[#94B0B8] transition-all hover:shadow-md flex flex-col justify-between overflow-hidden">
      <div>
        {/* Cover / Header Banner */}
        <div className="h-28 w-full bg-gradient-to-r from-[#94B0B8]/20 via-[#F2F2F1] to-[#FAF3E2] relative p-4 flex items-end">
          {group.cover_image_url && (
            <img
              src={group.cover_image_url}
              alt={group.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Logo overlapping banner */}
          <div className="relative z-10 -mb-8 flex items-center justify-between w-full">
            <div className="w-16 h-16 rounded-xl bg-white shadow-md border-2 border-white overflow-hidden flex items-center justify-center font-bold text-xl text-[#1E1E1E]">
              {group.logo_url ? (
                <img src={group.logo_url} alt={group.name} className="w-full h-full object-cover" />
              ) : (
                <span>{group.name.charAt(0)}</span>
              )}
            </div>

            {/* Official Badge: sage with checkmark */}
            {group.is_official && (
              <span className="bg-[#EEF3EE] text-[#7A9A7E] border border-[#7A9A7E]/40 px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1 shadow-sm">
                <CheckCircle className="w-3.5 h-3.5" /> Official
              </span>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="pt-10 p-5 space-y-2.5">
          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold capitalize ${getCategoryBadge(
                group.category
              )}`}
            >
              {group.category}
            </span>
            <span className="text-[11px] text-[#7A7A7A] uppercase tracking-wide font-medium">
              {group.group_type.replace('_', ' ')}
            </span>
          </div>

          <h3 className="text-lg font-bold text-[#1E1E1E] leading-snug hover:text-[#EEBE1E] transition-colors">
            <Link href={`/groups/${group.slug}`}>{group.name}</Link>
          </h3>

          <p className="text-xs text-[#5C5C5C] line-clamp-2 leading-relaxed">
            {group.tagline || 'Student technical and community group within the AI/ML department.'}
          </p>
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-5 pt-3 border-t border-[#D6D6D6] bg-[#F2F2F1]/30 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-[#5C5C5C] font-medium">
          <Users className="w-3.5 h-3.5 text-[#7A7A7A]" />
          <span>{group.member_count || 0} members</span>
        </div>

        <Link
          href={`/groups/${group.slug}`}
          className="inline-flex items-center gap-1 text-[#1E1E1E] font-semibold hover:text-[#EEBE1E] transition-colors"
        >
          View Hub <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
