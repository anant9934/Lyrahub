'use client';

import React from 'react';
import { Clock, AlertTriangle, AlertCircle } from 'lucide-react';

interface DeadlineCountdownProps {
  deadline?: string | null;
}

export const DeadlineCountdown: React.FC<DeadlineCountdownProps> = ({ deadline }) => {
  if (!deadline) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-[#667A93]">
        <Clock className="w-3.5 h-3.5" />
        <span>Open / Rolling</span>
      </span>
    );
  }

  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diffMs = deadlineDate.getTime() - now.getTime();

  if (diffMs <= 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F5EAEA] text-[#B85C5C] border border-[#B85C5C]/30">
        <AlertCircle className="w-3 h-3" />
        <span>Deadline Passed</span>
      </span>
    );
  }

  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 3) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#F5EAEA] text-[#B85C5C] border border-[#B85C5C]/40 animate-pulse">
        <AlertTriangle className="w-3 h-3" />
        <span>{diffDays === 1 ? '1 day left!' : `${diffDays} days left!`}</span>
      </span>
    );
  }

  if (diffDays <= 7) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF3E2] text-[#D9A441] border border-[#D9A441]/40">
        <Clock className="w-3 h-3" />
        <span>{diffDays} days left</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs text-[#526783]">
      <Clock className="w-3.5 h-3.5 text-[#667A93]" />
      <span>{diffDays} days left</span>
    </span>
  );
};
