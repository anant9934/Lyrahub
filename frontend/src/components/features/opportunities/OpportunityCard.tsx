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
  Sparkles
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
      return 'bg-[#EEF3EE] text-[#7A9A7E] border border-[#7A9A7E]/40';
    case 'training':
      return 'bg-[#EAF0F3] text-[#6B8FA3] border border-[#6B8FA3]/40';
    case 'workshop':
      return 'bg-[#FAF3E2] text-[#B8860B] border border-[#EEBE1E]/50';
    case 'fellowship':
      return 'bg-[#1E1E1E] text-white';
    case 'scholarship':
      return 'bg-[#EEF3EE] text-[#7A9A7E] border border-[#7A9A7E]/50';
    default:
      return 'bg-[#F2F2F1] text-[#5C5C5C] border border-[#D6D6D6]';
  }
};

export const OpportunityCard: React.FC<{ opportunity: Opportunity }> = ({ opportunity }) => {
  const formattedStipend =
    opportunity.stipend_amount && opportunity.stipend_amount > 0
      ? `${opportunity.stipend_currency || 'INR'} ${opportunity.stipend_amount.toLocaleString()}/mo`
      : 'Unpaid / Experience';

  return (
    <div className="bg-white rounded-2xl border border-[#D6D6D6] hover:border-[#94B0B8] transition-all hover:shadow-md flex flex-col justify-between p-5 overflow-hidden">
      <div>
        {/* Header: Org + Verified */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F2F2F1] border border-[#E5E5E4] flex items-center justify-center font-bold text-xs text-[#1E1E1E]">
              {opportunity.organization.charAt(0)}
            </div>
            <div>
              <span className="text-xs font-bold text-[#1E1E1E] line-clamp-1">
                {opportunity.organization}
              </span>
              <span className="text-[11px] text-[#7A7A7A] capitalize block">
                {opportunity.mode || 'Remote'} {opportunity.location ? `• ${opportunity.location}` : ''}
              </span>
            </div>
          </div>

          {opportunity.is_verified && (
            <span
              title="Verified by HOD / Department"
              className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#EEF3EE] text-[#7A9A7E] border border-[#7A9A7E]/30"
            >
              <CheckCircle className="w-3 h-3" />
              <span>Verified</span>
            </span>
          )}
        </div>

        {/* Opportunity Title */}
        <h3 className="text-base md:text-lg font-bold text-[#1E1E1E] line-clamp-1 mb-2">
          {opportunity.title}
        </h3>

        {/* Badges: Type & Mode */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${getOpportunityTypeBadge(opportunity.opportunity_type)}`}>
            {opportunity.opportunity_type}
          </span>
          {opportunity.duration_weeks && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-[#F2F2F1] text-[#5C5C5C]">
              {opportunity.duration_weeks} Weeks
            </span>
          )}
        </div>

        {/* Metrics: Stipend & Deadline */}
        <div className="space-y-1.5 py-3 border-t border-[#F2F2F1] text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#7A7A7A] flex items-center gap-1">
              <Banknote className="w-3.5 h-3.5" />
              <span>Stipend:</span>
            </span>
            <span className="font-semibold text-[#1E1E1E]">{formattedStipend}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#7A7A7A] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Deadline:</span>
            </span>
            <DeadlineCountdown deadline={opportunity.application_deadline} />
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="pt-3 border-t border-[#F2F2F1] flex items-center justify-between">
        <span className="text-[11px] text-[#9A9A9A]">
          Posted by {opportunity.posted_by_name || 'Member'}
        </span>

        <Link
          href={`/opportunities/${opportunity.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E1E1E] hover:text-[#7A9A7E] transition-colors"
        >
          <span>View Listing</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
