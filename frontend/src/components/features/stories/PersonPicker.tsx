'use client';

import React, { useState, useEffect } from 'react';
import { apiGet } from '@/lib/api';
import { Search, User, GraduationCap, Check } from 'lucide-react';

interface Person {
  id: string;
  name: string;
  role?: string;
  company?: string;
  batch_year?: number;
  program?: string;
  photo_url?: string;
  type: 'student' | 'alumni';
}

interface PersonPickerProps {
  storyType: 'student' | 'alumni';
  selectedPersonId?: string;
  onSelect: (person: Person) => void;
}

export const PersonPicker: React.FC<PersonPickerProps> = ({
  storyType,
  selectedPersonId,
  onSelect
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  useEffect(() => {
    const fetchPersons = async () => {
      setLoading(true);
      try {
        if (storyType === 'student') {
          const res = await apiGet(`/students?search=${encodeURIComponent(query)}&page_size=10`);
          interface RawStudent {
            id: string;
            reg_no?: string;
            batch?: number;
            user?: { email?: string; avatar_url?: string };
          }
          const rawItems = (res.items || res || []) as RawStudent[];
          const items = rawItems.map((s) => ({
            id: s.id,
            name: s.user?.email ? s.user.email.split('@')[0].replace('.', ' ').toUpperCase() : s.reg_no || 'Student',
            role: `Student (${s.reg_no || ''})`,
            batch_year: s.batch,
            program: 'B.Tech CSE (AI & ML)',
            photo_url: s.user?.avatar_url,
            type: 'student' as const
          }));
          setResults(items);
        } else {
          const res = await apiGet(`/alumni/directory?search=${encodeURIComponent(query)}&page_size=10`);
          interface RawAlumni {
            id: string;
            full_name: string;
            current_role?: string;
            current_company?: string;
            graduation_year?: number;
            program?: string;
            portfolio_url?: string;
          }
          const rawItems = (res.items || []) as RawAlumni[];
          const items = rawItems.map((a) => ({
            id: a.id,
            name: a.full_name,
            role: a.current_role || 'Alumni',
            company: a.current_company,
            batch_year: a.graduation_year,
            program: a.program,
            photo_url: a.portfolio_url,
            type: 'alumni' as const
          }));
          setResults(items);
        }
      } catch (err) {
        console.error('Failed to load persons for picker', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchPersons, 300);
    return () => clearTimeout(timer);
  }, [query, storyType]);

  const handleSelect = (person: Person) => {
    setSelectedPerson(person);
    onSelect(person);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label className="text-sm font-semibold text-[#1E1E1E]">
          Select {storyType === 'student' ? 'Student' : 'Alumni'} *
        </label>
        {selectedPerson && (
          <span className="text-xs bg-[#EEF3EE] text-[#7A9A7E] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
            <Check className="w-3 h-3" /> Selected: {selectedPerson.name}
          </span>
        )}
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-[#7A7A7A] absolute left-3 top-3" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${storyType} by name, reg no, or role...`}
          className="w-full pl-9 pr-4 py-2 border border-[#D6D6D6] rounded-lg text-sm bg-white focus:outline-none focus:border-[#94B0B8]"
        />
      </div>

      <div className="max-h-48 overflow-y-auto border border-[#D6D6D6] rounded-lg bg-white divide-y divide-[#D6D6D6]">
        {loading ? (
          <div className="p-3 text-center text-sm text-[#7A7A7A]">Loading {storyType}s...</div>
        ) : results.length === 0 ? (
          <div className="p-3 text-center text-sm text-[#7A7A7A]">No {storyType}s found</div>
        ) : (
          results.map((p) => {
            const isSelected = selectedPersonId === p.id || selectedPerson?.id === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelect(p)}
                className={`w-full text-left p-2.5 flex items-center justify-between hover:bg-[#F2F2F1] transition-colors ${
                  isSelected ? 'bg-[#FAF3E2]' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#94B0B8]/20 flex items-center justify-center text-[#1E1E1E] font-medium text-xs">
                    {p.type === 'student' ? <User className="w-4 h-4 text-[#6B8FA3]" /> : <GraduationCap className="w-4 h-4 text-[#EEBE1E]" />}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#1E1E1E]">{p.name}</div>
                    <div className="text-xs text-[#7A7A7A]">
                      {p.role} {p.company ? `at ${p.company}` : ''} {p.batch_year ? `• Batch ${p.batch_year}` : ''}
                    </div>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-[#EEBE1E]" />}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
