'use client';

import React, { useState } from 'react';
import { ApplicationStatusBadge } from './ApplicationStatusBadge';
import { Mail, Calendar, UserCheck, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';

export interface Applicant {
  id: string;
  opportunity_id: string;
  student_id: string;
  student_name?: string;
  student_reg_no?: string;
  student_email?: string;
  status: string;
  notes?: string;
  applied_at?: string;
  updated_at?: string;
}

interface ApplicantTableProps {
  opportunityId: string;
  applicants: Applicant[];
  onStatusUpdated?: () => void;
  canManageStatus?: boolean;
}

export const ApplicantTable: React.FC<ApplicantTableProps> = ({
  opportunityId,
  applicants,
  onStatusUpdated,
  canManageStatus = true
}) => {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (studentId: string, newStatus: string) => {
    try {
      setUpdatingId(studentId);
      await api.patch(`/opportunities/${opportunityId}/applications/${studentId}`, {
        status: newStatus
      });
      if (onStatusUpdated) onStatusUpdated();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update application status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (applicants.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#DCE5F1] p-12 text-center text-[#667A93]">
        <UserCheck className="w-12 h-12 mx-auto text-[#71849B] mb-3 opacity-50" />
        <h4 className="text-base font-bold text-[#0F172A] mb-1">No Applications Yet</h4>
        <p className="text-sm">Student interest and applications will appear here in real-time.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#DCE5F1] overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#EAEAE8]/60 text-[#34465E] font-semibold text-xs border-b border-[#E5E5E4]">
              <th className="py-3 px-6">Student</th>
              <th className="py-3 px-6">Reg No</th>
              <th className="py-3 px-6">Status</th>
              <th className="py-3 px-6">Applied Date</th>
              {canManageStatus && <th className="py-3 px-6 text-right">Update Status</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E4]">
            {applicants.map(app => (
              <tr key={app.id} className="hover:bg-[#F6F8FC]/50 transition-colors">
                <td className="py-3.5 px-6">
                  <div className="font-semibold text-[#0F172A]">{app.student_name || 'Student'}</div>
                  <div className="text-xs text-[#667A93] flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3" />
                    <span>{app.student_email}</span>
                  </div>
                </td>
                <td className="py-3.5 px-6 font-mono text-xs font-bold text-[#0F172A]">
                  {app.student_reg_no || '-'}
                </td>
                <td className="py-3.5 px-6">
                  <ApplicationStatusBadge status={app.status} />
                </td>
                <td className="py-3.5 px-6 text-xs text-[#667A93]">
                  {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : '-'}
                </td>
                {canManageStatus && (
                  <td className="py-3.5 px-6 text-right">
                    <select
                      value={app.status}
                      disabled={updatingId === app.student_id}
                      onChange={(e) => handleStatusChange(app.student_id, e.target.value)}
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[#DCE5F1] bg-white text-[#0F172A] focus:outline-none focus:border-[#0F172A]"
                    >
                      <option value="interested">Interested</option>
                      <option value="applied">Applied</option>
                      <option value="selected">Selected</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
