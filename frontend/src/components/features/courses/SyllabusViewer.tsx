'use client';

import React from 'react';
import { BookOpen, CheckCircle, Award, FileText, CheckCircle2 } from 'lucide-react';

interface SyllabusViewerProps {
  syllabus?: string;
  learningOutcomes?: string[];
  evaluationScheme?: Record<string, number>;
  references?: Array<{ title: string; author?: string; edition?: string }>;
  prerequisites?: string;
  edurevBenefits?: string[];
}

export const SyllabusViewer: React.FC<SyllabusViewerProps> = ({
  syllabus,
  learningOutcomes = [],
  evaluationScheme = {},
  references = [],
  prerequisites,
  edurevBenefits = [],
}) => {
  return (
    <div className="space-y-8">
      {/* Prerequisites & Benefits Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[#DCE5F1] p-6">
          <h4 className="text-sm font-bold uppercase tracking-wider text-[#667A93] mb-3">
            Prerequisites & Background
          </h4>
          <p className="text-sm text-[#34465E] leading-relaxed">
            {prerequisites || 'Basic familiarity with Python programming and Linear Algebra.'}
          </p>
        </div>

        {edurevBenefits.length > 0 && (
          <div className="bg-[#FAF3E2]/60 rounded-2xl border border-[#FACC15]/40 p-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#B8860B] mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#EEBE1E]" />
              <span>EduRev & RPL Benefits</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {edurevBenefits.map((b, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-lg bg-white border border-[#FACC15]/50 text-xs font-semibold text-[#0F172A]"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Syllabus Content */}
      <div className="bg-white rounded-2xl border border-[#DCE5F1] p-6 md:p-8">
        <h3 className="text-xl font-bold text-[#0F172A] mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#6B8FA3]" />
          <span>Course Syllabus & Modules</span>
        </h3>
        {syllabus ? (
          <div className="prose prose-sm max-w-none text-[#34465E] leading-relaxed whitespace-pre-line font-sans">
            {syllabus}
          </div>
        ) : (
          <div className="space-y-4 text-sm text-[#526783]">
            <p>Detailed lecture plan and syllabus topics:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-[#F6F8FC] rounded-xl">
                <span className="font-bold text-[#0F172A] block mb-1">Module 1: Foundations</span>
                <span className="text-xs text-[#526783]">Core mathematical principles, objective functions, optimization methods.</span>
              </div>
              <div className="p-3 bg-[#F6F8FC] rounded-xl">
                <span className="font-bold text-[#0F172A] block mb-1">Module 2: Architectural Patterns</span>
                <span className="text-xs text-[#526783]">Neural representations, gradient dynamics, attention modules.</span>
              </div>
              <div className="p-3 bg-[#F6F8FC] rounded-xl">
                <span className="font-bold text-[#0F172A] block mb-1">Module 3: Hands-on Laboratory</span>
                <span className="text-xs text-[#526783]">Implementation on GPUs using PyTorch, tensorboard telemetry.</span>
              </div>
              <div className="p-3 bg-[#F6F8FC] rounded-xl">
                <span className="font-bold text-[#0F172A] block mb-1">Module 4: Deployment & Assessment</span>
                <span className="text-xs text-[#526783]">Inference latency, quantization, capstone evaluation.</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Course Learning Outcomes (COs) */}
      {learningOutcomes.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#DCE5F1] p-6 md:p-8">
          <h3 className="text-xl font-bold text-[#0F172A] mb-4">Course Outcomes (COs)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {learningOutcomes.map((co, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#F6F8FC]/50 border border-[#E5E5E4] flex items-start gap-3"
              >
                <span className="px-2 py-0.5 rounded-md bg-[#0F172A] text-white text-xs font-bold font-mono">
                  CO{idx + 1}
                </span>
                <p className="text-xs md:text-sm text-[#34465E] leading-relaxed">
                  {co}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evaluation Scheme & Textbooks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Evaluation Scheme */}
        <div className="bg-white rounded-2xl border border-[#DCE5F1] p-6">
          <h3 className="text-base font-bold text-[#0F172A] mb-4">Evaluation & Grading Scheme</h3>
          {Object.keys(evaluationScheme).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(evaluationScheme).map(([component, weight]) => (
                <div key={component} className="flex items-center justify-between text-sm py-2 border-b border-[#F6F8FC]">
                  <span className="capitalize text-[#526783] font-medium">{component.replace('_', ' ')}</span>
                  <span className="font-bold text-[#0F172A] px-2 py-0.5 rounded bg-[#F6F8FC]">{weight}%</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2 text-xs text-[#526783]">
              <div className="flex justify-between py-1 border-b border-[#F6F8FC]">
                <span>Continuous Assessment / Quizzes</span>
                <span className="font-bold text-[#0F172A]">20%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F6F8FC]">
                <span>Mid-Semester Examination</span>
                <span className="font-bold text-[#0F172A]">30%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F6F8FC]">
                <span>End-Semester Comprehensive Examination</span>
                <span className="font-bold text-[#0F172A]">50%</span>
              </div>
            </div>
          )}
        </div>

        {/* References */}
        <div className="bg-white rounded-2xl border border-[#DCE5F1] p-6">
          <h3 className="text-base font-bold text-[#0F172A] mb-4">Textbooks & References</h3>
          {references.length > 0 ? (
            <div className="space-y-3">
              {references.map((ref, idx) => (
                <div key={idx} className="text-xs p-3 rounded-xl bg-[#F6F8FC]/50 border border-[#E5E5E4]">
                  <div className="font-semibold text-[#0F172A]">{ref.title}</div>
                  {ref.author && <div className="text-[#667A93] mt-0.5">Author: {ref.author}</div>}
                  {ref.edition && <div className="text-[#71849B] mt-0.5">{ref.edition}</div>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#667A93] italic">Textbook listings available in department library portal.</p>
          )}
        </div>
      </div>
    </div>
  );
};
