'use client';

import React from 'react';
import { Crown, Star, Clock } from 'lucide-react';

interface Member {
  id: string;
  student_id: string;
  student_name?: string;
  student_reg_no?: string;
  student_email?: string;
  role: string;
  joined_at?: string;
  is_active?: boolean;
}

export const MemberGrid: React.FC<{ members: Member[] }> = ({ members }) => {
  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case 'lead':
        return (
          <span className="bg-[#FAF3E2] text-[#1E1E1E] border border-[#EEBE1E] px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
            <Crown className="w-3 h-3 text-[#EEBE1E] fill-current" /> Lead
          </span>
        );
      case 'core':
        return (
          <span className="bg-[#94B0B8]/20 text-[#4A6870] border border-[#94B0B8]/40 px-2 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1">
            <Star className="w-3 h-3 text-[#6B8FA3] fill-current" /> Core
          </span>
        );
      case 'pending':
        return (
          <span className="bg-[#FAF3E2] text-[#D9A441] border border-[#D9A441]/30 px-2 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" /> Fee Pending
          </span>
        );
      default:
        return (
          <span className="bg-[#F2F2F1] text-[#5C5C5C] px-2 py-0.5 rounded-full text-[11px] font-medium">
            Member
          </span>
        );
    }
  };

  if (!members || members.length === 0) {
    return (
      <div className="bg-white border border-[#D6D6D6] rounded-2xl p-8 text-center text-sm text-[#7A7A7A]">
        No active members listed yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {members.map((m) => (
        <div
          key={m.id}
          className="bg-white rounded-xl border border-[#D6D6D6] p-4 flex flex-col justify-between hover:shadow-sm transition-all"
        >
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#F2F2F1] border border-[#D6D6D6] flex items-center justify-center font-bold text-sm text-[#1E1E1E]">
              {m.student_name ? m.student_name.charAt(0) : 'S'}
            </div>
            {getRoleBadge(m.role)}
          </div>

          <div className="space-y-0.5">
            <div className="font-bold text-sm text-[#1E1E1E] truncate">
              {m.student_name || 'Student Member'}
            </div>
            {m.student_reg_no && (
              <div className="text-xs text-[#7A7A7A]">{m.student_reg_no}</div>
            )}
            {m.joined_at && (
              <div className="text-[11px] text-[#9A9A9A] pt-1">
                Joined {new Date(m.joined_at).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
