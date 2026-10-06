'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle,
  Banknote,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { DeadlineCountdown } from './DeadlineCountdown';

export interface Opportunity {
  id: string;
  slug: string;
  title: string;
  organization: string;
  opportunity_type: string;
  mode?: string;
  location?: string;
  stipend_amount?: number | null;
  stipend_currency?: string;
  duration_weeks?: number;
  application_deadline?: string;
  cover_image_url?: string;
  tags?: string[];
  is_verified?: boolean;
  posted_by_name?: string;
}

export const getOpportunityTypeBadge = (type?: string) => {
  switch ((type || '').toLowerCase()) {
    case 'internship':
      return 'bg-[#EDF5FF] text-[#1478ef] border border-[#1478ef]/20';
    case 'fellowship':
      return 'bg-[#071b3d] text-white border border-[#071b3d]';
    case 'competition':
      return 'bg-[#FFF8E8] text-[#D97706] border border-[#D97706]/20';
    case 'research':
      return 'bg-[#F3EEFF] text-[#7C3AED] border border-[#7C3AED]/20';
    case 'workshop':
      return 'bg-[#E6FAFA] text-[#0D9488] border border-[#0D9488]/20';
    default:
      return 'bg-[#F0F4FA] text-[#526783] border border-[#D4E0F0]';
  }
};

export const OpportunityCard: React.FC<{ opportunity: Opportunity }> = ({ opportunity }) => {
  const formattedStipend =
    opportunity.stipend_amount && opportunity.stipend_amount > 0
      ? `${opportunity.stipend_currency || 'INR'} ${opportunity.stipend_amount.toLocaleString()}/mo`
      : 'Academic Credit / Fellowship';

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-[24px] border border-[#D4E0F0] bg-white p-5 shadow-[0_2px_8px_rgba(9,25,54,0.05)] transition-all duration-200 hover:-translate-y-1 hover:border-[#A8C8FF] hover:shadow-[0_12px_28px_rgba(9,25,54,0.10)]">
      <div>
        {/* Header: Org + Verified */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EDF5FF] text-xs font-black text-[#1478ef] shadow-inner">
              {opportunity.organization.charAt(0)}
            </div>
            <div>
              <span className="block text-xs font-black text-[#091936] line-clamp-1">
                {opportunity.organization}
              </span>
              <span className="block text-[11px] text-[#9ab5d0] capitalize">
                {opportunity.mode || 'On-Campus'} {opportunity.location ? `· ${opportunity.location}` : ''}
              </span>
            </div>
          </div>

          {opportunity.is_verified && (
            <span
              title="Verified by AIMETRA Department"
              className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200"
            >
              <CheckCircle className="h-3 w-3" />
              Verified
            </span>
          )}
        </div>

        {/* Opportunity Title */}
        <h3 className="mb-2.5 text-base font-black leading-snug text-[#091936] group-hover:text-[#1478ef] transition-colors line-clamp-2">
          {opportunity.title}
        </h3>

        {/* Badges: Type & Mode */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${getOpportunityTypeBadge(opportunity.opportunity_type)}`}>
            {opportunity.opportunity_type}
          </span>
          {opportunity.duration_weeks && (
            <span className="rounded-full bg-[#F0F4FA] px-2.5 py-0.5 text-[11px] font-semibold text-[#526783]">
              {opportunity.duration_weeks} Weeks
            </span>
          )}
        </div>

        {/* Metrics: Stipend & Deadline */}
        <div className="space-y-1.5 rounded-xl bg-[#FAFBFD] p-3 text-xs border border-[#F0F4FA]">
          <div className="flex items-center justify-between">
            <span className="text-[#9ab5d0] flex items-center gap-1 text-[11px] font-medium">
              <Banknote className="w-3.5 h-3.5 text-[#1478ef]" />
              Grant/Stipend:
            </span>
            <span className="font-bold text-[#091936] text-[11px]">{formattedStipend}</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[#9ab5d0] flex items-center gap-1 text-[11px] font-medium">
              <Clock className="w-3.5 h-3.5 text-[#EA6E22]" />
              Deadline:
            </span>
            <DeadlineCountdown deadline={opportunity.application_deadline} />
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="mt-4 flex items-center justify-between border-t border-[#F0F4FA] pt-3">
        <span className="text-[11px] text-[#9ab5d0]">
          By {opportunity.posted_by_name || 'Faculty Member'}
        </span>

        <Link
          href={`/opportunities/${opportunity.slug}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#1478ef] px-4 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#0f64cc] group-hover:scale-105"
        >
          <span>Apply Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
