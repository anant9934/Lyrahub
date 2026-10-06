'use client';

import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle, ArrowLeft } from 'lucide-react';

interface ApplicationStatusBadgeProps {
  status: string;
}

export const ApplicationStatusBadge: React.FC<ApplicationStatusBadgeProps> = ({ status }) => {
  const s = (status || '').toLowerCase();

  switch (s) {
    case 'selected':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EEF3EE] text-[#7A9A7E] border border-[#7A9A7E]/40">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Selected</span>
        </span>
      );
    case 'applied':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF3E2] text-[#D9A441] border border-[#D9A441]/40">
          <Clock className="w-3.5 h-3.5" />
          <span>Applied</span>
        </span>
      );
    case 'interested':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EAF0F3] text-[#6B8FA3] border border-[#6B8FA3]/40">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Interested</span>
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F5EAEA] text-[#B85C5C] border border-[#B85C5C]/40">
          <XCircle className="w-3.5 h-3.5" />
          <span>Not Selected</span>
        </span>
      );
    case 'withdrawn':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#F6F8FC] text-[#667A93] border border-[#DCE5F1]">
          <span>Withdrawn</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-[#F6F8FC] text-[#0F172A] capitalize">
          {status}
        </span>
      );
  }
};
