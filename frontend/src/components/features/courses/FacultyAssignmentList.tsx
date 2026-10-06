'use client';

import React from 'react';
import { UserCheck, Mail, Calendar, Layers } from 'lucide-react';

interface FacultyMember {
  id: string;
  course_id: string;
  faculty_id: string;
  faculty_name: string;
  faculty_email: string;
  academic_year: string;
  section?: string;
  role: string;
}

interface FacultyAssignmentListProps {
  facultyList: FacultyMember[];
}

export const FacultyAssignmentList: React.FC<FacultyAssignmentListProps> = ({ facultyList }) => {
  if (facultyList.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#DCE5F1] p-10 text-center text-[#667A93]">
        <UserCheck className="w-10 h-10 mx-auto text-[#71849B] mb-2 opacity-50" />
        <p className="text-sm">No faculty assigned for the current academic session yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {facultyList.map(member => (
        <div
          key={member.id}
          className="bg-white rounded-2xl border border-[#DCE5F1] p-5 hover:border-[#94B0B8] transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize bg-[#FAF3E2] text-[#B8860B] border border-[#FACC15]/30">
                {member.role || 'Primary'}
              </span>
              <span className="text-xs text-[#667A93] font-mono">
                {member.academic_year}
              </span>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#0F172A] text-white flex items-center justify-center font-bold text-sm">
                {member.faculty_name.charAt(0)}
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#0F172A] leading-snug">{member.faculty_name}</h4>
                <p className="text-xs text-[#667A93] flex items-center gap-1 mt-0.5">
                  <Mail className="w-3 h-3" />
                  <span>{member.faculty_email}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#F6F8FC] text-xs text-[#526783] flex items-center justify-between">
            <span>Section: <strong className="text-[#0F172A]">{member.section || 'All'}</strong></span>
            <span className="text-[#7A9A7E] font-medium">Assigned Faculty</span>
          </div>
        </div>
      ))}
    </div>
  );
};
