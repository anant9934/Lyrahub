'use client';

import React from 'react';
import { Target, Sparkles, CheckCircle2 } from 'lucide-react';

interface OutcomesListProps {
  programOutcomes?: string[];
  programSpecificOutcomes?: string[];
}

export const OutcomesList: React.FC<OutcomesListProps> = ({
  programOutcomes = [],
  programSpecificOutcomes = []
}) => {
  return (
    <div className="space-y-10">
      {/* Program Specific Outcomes (PSOs) */}
      {programSpecificOutcomes.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#DCE5F1] p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#FAF3E2] text-[#B8860B] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#0F172A]">Program Specific Outcomes (PSOs)</h3>
              <p className="text-xs text-[#667A93]">Domain specific competencies in Artificial Intelligence and Machine Learning</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {programSpecificOutcomes.map((pso, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#FAF3E2]/40 border border-[#FACC15]/30 flex gap-3.5 items-start"
              >
                <span className="shrink-0 px-2 py-0.5 rounded-md bg-[#FACC15] text-[#0F172A] font-bold text-xs">
                  PSO {idx + 1}
                </span>
                <p className="text-sm text-[#34465E] leading-relaxed">
                  {pso}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Program Outcomes (POs) */}
      <div className="bg-white rounded-2xl border border-[#DCE5F1] p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#EEF3EE] text-[#7A9A7E] flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#0F172A]">Program Outcomes (Graduate Attributes)</h3>
            <p className="text-xs text-[#667A93]">National Board of Accreditation (NBA) aligned outcome metrics</p>
          </div>
        </div>

        {programOutcomes.length === 0 ? (
          <p className="text-sm text-[#667A93] italic">Graduate attributes and outcomes documentation being mapped.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {programOutcomes.map((po, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#F6F8FC]/50 border border-[#E5E5E4] hover:border-[#94B0B8] transition-all flex gap-3.5 items-start"
              >
                <div className="shrink-0 w-8 h-8 rounded-lg bg-[#0F172A] text-white flex items-center justify-center font-bold text-xs">
                  PO{idx + 1}
                </div>
                <p className="text-sm text-[#34465E] leading-relaxed">
                  {po}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
