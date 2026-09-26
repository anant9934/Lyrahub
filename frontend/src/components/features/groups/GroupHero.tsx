'use client';

import React from 'react';
import { CheckCircle, Users } from 'lucide-react';
import { getCategoryBadge } from './GroupCard';
import { JoinButton } from './JoinButton';

interface GroupHeroProps {
  group: Record<string, any>;
  isMember: boolean;
  memberRole?: string;
  onStatusChange: () => void;
}

export const GroupHero: React.FC<GroupHeroProps> = ({
  group,
  isMember,
  memberRole,
  onStatusChange
}) => {
  return (
    <div className="bg-white rounded-3xl border border-[#D6D6D6] overflow-hidden shadow-sm">
      {/* Cover Banner */}
      <div className="h-44 sm:h-56 w-full bg-gradient-to-r from-[#94B0B8]/30 via-[#FAF3E2] to-[#EEBE1E]/20 relative">
        {group.cover_image_url && (
          <img
            src={group.cover_image_url}
            alt={group.name}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Main Details Section */}
      <div className="px-6 sm:px-10 pb-8 relative">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-16 sm:-mt-20 mb-6">
          {/* Logo & Identity */}
          <div className="flex items-end gap-5">
            <div className="w-24 sm:w-28 h-24 sm:h-28 rounded-2xl bg-white shadow-lg border-4 border-white overflow-hidden flex items-center justify-center font-bold text-3xl text-[#1E1E1E] bg-gradient-to-br from-white to-[#F2F2F1]">
              {group.logo_url ? (
                <img src={group.logo_url} alt={group.name} className="w-full h-full object-cover" />
              ) : (
                <span>{group.name.charAt(0)}</span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize ${getCategoryBadge(
                    group.category
                  )}`}
                >
                  {group.category}
                </span>

                {group.is_official && (
                  <span className="bg-[#EEF3EE] text-[#7A9A7E] border border-[#7A9A7E]/40 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 shadow-sm">
                    <CheckCircle className="w-3.5 h-3.5" /> Official Department Group
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1E1E]">{group.name}</h1>
            </div>
          </div>

          {/* Join / Action button */}
          <div className="self-start sm:self-end">
            <JoinButton
              groupId={group.id}
              isMember={isMember}
              memberRole={memberRole}
              membershipOpen={group.membership_open}
              membershipFee={group.membership_fee}
              onStatusChange={onStatusChange}
            />
          </div>
        </div>

        {/* Tagline */}
        {group.tagline && (
          <p className="text-base font-medium text-[#5C5C5C] mb-6 leading-relaxed">
            {group.tagline}
          </p>
        )}

        {/* Meta Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#F2F2F1] border border-[#D6D6D6] text-xs">
          <div className="space-y-0.5">
            <span className="text-[#7A7A7A] block">Faculty Advisor</span>
            <span className="font-bold text-[#1E1E1E] truncate block">
              {group.faculty_advisor_name || 'Department Faculty'}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[#7A7A7A] block">Student Lead</span>
            <span className="font-bold text-[#1E1E1E] truncate block">
              {group.student_lead_name || 'Appointed Lead'}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[#7A7A7A] block">Members</span>
            <span className="font-bold text-[#1E1E1E] flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#5C5C5C]" /> {group.member_count || 0} enrolled
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[#7A7A7A] block">Venue / Schedule</span>
            <span className="font-bold text-[#1E1E1E] truncate block">
              {group.meeting_schedule || 'Weekly Sessions'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
