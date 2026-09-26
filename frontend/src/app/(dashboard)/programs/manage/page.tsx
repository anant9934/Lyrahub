'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Plus,
  Trash2,
  Edit,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Layers,
  ArrowLeft
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function ManageProgramsPage() {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState<any | null>(null);

  // New program modal/form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    short_name: '',
    code: '',
    degree: 'B.Tech',
    level: 'undergraduate',
    duration_years: 4.0,
    total_credits: 160,
    description: '',
  });

  // Course mapping state
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [mappingSemester, setMappingSemester] = useState(1);
  const [isMandatory, setIsMandatory] = useState(true);
  const [mappingMsg, setMappingMsg] = useState<string | null>(null);

  const isAuthorized = user && (user.role === 'hod' || user.role === 'admin');

  const loadData = async () => {
    try {
      setLoading(true);
      const [progRes, courseRes] = await Promise.all([
        api.get('/programs'),
        api.get('/courses?page_size=100')
      ]);
      setPrograms(progRes.data || []);
      setCourses(courseRes.data?.items || []);
      if (progRes.data && progRes.data.length > 0 && !selectedProgram) {
        // Load details of the first program
        const detailRes = await api.get(`/programs/${progRes.data[0].slug}`);
        setSelectedProgram(detailRes.data);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectProgram = async (slug: string) => {
    try {
      const res = await api.get(`/programs/${slug}`);
      setSelectedProgram(res.data);
      setMappingMsg(null);
    } catch (err) {
      console.error('Failed to load program detail:', err);
    }
  };

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/programs', formData);
      setShowCreateModal(false);
      setFormData({
        name: '',
        short_name: '',
        code: '',
        degree: 'B.Tech',
        level: 'undergraduate',
        duration_years: 4.0,
        total_credits: 160,
        description: '',
      });
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create program');
    }
  };

  const handleDeleteProgram = async (id: string) => {
    if (!confirm('Are you sure you want to delete this program?')) return;
    try {
      await api.delete(`/programs/${id}`);
      setSelectedProgram(null);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete program');
    }
  };

  const handleAddCourseMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgram || !selectedCourseId) return;

    try {
      await api.post(`/programs/${selectedProgram.id}/courses`, {
        course_id: selectedCourseId,
        semester: Number(mappingSemester),
        is_mandatory: isMandatory
      });
      setMappingMsg('Course mapped successfully!');
      // Refresh current program
      const res = await api.get(`/programs/${selectedProgram.slug}`);
      setSelectedProgram(res.data);
    } catch (err: any) {
      setMappingMsg(`Error: ${err.response?.data?.detail || 'Failed to map course'}`);
    }
  };

  const handleRemoveCourseMapping = async (courseId: string) => {
    if (!selectedProgram) return;
    try {
      await api.delete(`/programs/${selectedProgram.id}/courses/${courseId}`);
      const res = await api.get(`/programs/${selectedProgram.slug}`);
      setSelectedProgram(res.data);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to remove course');
    }
  };

  if (!isAuthorized && !loading) {
    return (
      <div className="min-h-screen bg-[#F2F2F1] p-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-[#D6D6D6] p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-[#B85C5C] mx-auto mb-3" />
          <h2 className="text-xl font-bold text-[#1E1E1E] mb-2">Access Restricted</h2>
          <p className="text-sm text-[#5C5C5C] mb-6">Only HOD or Administrators can manage degree programs and curriculum mappings.</p>
          <Link href="/programs" className="px-4 py-2 rounded-xl bg-[#1E1E1E] text-white text-sm font-semibold">
            View Public Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F1] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <Link
              href="/programs"
              className="inline-flex items-center gap-1.5 text-xs text-[#7A7A7A] hover:text-[#1E1E1E] transition-colors mb-2 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Public Catalog</span>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1E1E1E]">Programs & Curriculum Management</h1>
            <p className="text-xs md:text-sm text-[#7A7A7A]">Configure degree offerings, semester mappings, and course requirements</p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E1E1E] hover:bg-black text-white text-sm font-semibold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Degree Program</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Programs List (Sidebar) */}
          <div className="bg-white rounded-2xl border border-[#D6D6D6] p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#7A7A7A] mb-4">Academic Programs</h2>
            <div className="space-y-2">
              {programs.map(prog => (
                <div
                  key={prog.id}
                  onClick={() => handleSelectProgram(prog.slug)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedProgram?.id === prog.id
                      ? 'border-[#1E1E1E] bg-[#F2F2F1]'
                      : 'border-[#E5E5E4] hover:bg-[#F2F2F1]/50'
                  }`}
                >
                  <div>
                    <span className="font-mono text-xs font-bold text-[#1E1E1E]">{prog.code}</span>
                    <h4 className="text-sm font-semibold text-[#1E1E1E] line-clamp-1">{prog.name}</h4>
                    <p className="text-xs text-[#7A7A7A]">{prog.degree} &bull; {prog.duration_years} Years</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProgram(prog.id);
                    }}
                    className="p-1.5 text-[#B85C5C] hover:bg-[#F5EAEA] rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Program Curriculum Editor */}
          <div className="lg:col-span-2 space-y-6">
            {selectedProgram ? (
              <>
                {/* Details header */}
                <div className="bg-white rounded-2xl border border-[#D6D6D6] p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#F2F2F1]">
                    <div>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#1E1E1E] text-white">
                        {selectedProgram.code}
                      </span>
                      <h2 className="text-xl font-bold text-[#1E1E1E] mt-1">{selectedProgram.name}</h2>
                      <p className="text-xs text-[#7A7A7A]">{selectedProgram.degree} &bull; {selectedProgram.level}</p>
                    </div>

                    <Link
                      href={`/programs/${selectedProgram.slug}`}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#D6D6D6] hover:bg-[#F2F2F1] text-[#1E1E1E]"
                    >
                      View Public Page
                    </Link>
                  </div>

                  {/* Add course mapping form */}
                  <form onSubmit={handleAddCourseMapping} className="mt-6 pt-4 border-t border-[#F2F2F1]">
                    <h3 className="text-sm font-bold text-[#1E1E1E] mb-3">Map Course to Semester</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="md:col-span-2">
                        <select
                          value={selectedCourseId}
                          onChange={(e) => setSelectedCourseId(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-[#D6D6D6] bg-white text-[#1E1E1E]"
                          required
                        >
                          <option value="">Select a Course to map...</option>
                          {courses.map(c => (
                            <option key={c.id} value={c.id}>
                              {c.code} - {c.name} ({c.credits} cr)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <select
                          value={mappingSemester}
                          onChange={(e) => setMappingSemester(Number(e.target.value))}
                          className="w-full text-xs p-2.5 rounded-xl border border-[#D6D6D6] bg-white text-[#1E1E1E]"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                            <option key={s} value={s}>Semester {s}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <button
                          type="submit"
                          className="w-full px-4 py-2.5 rounded-xl bg-[#1E1E1E] text-white text-xs font-semibold hover:bg-black transition-all"
                        >
                          Add Mapping
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <input
                        type="checkbox"
                        id="mandatory"
                        checked={isMandatory}
                        onChange={(e) => setIsMandatory(e.target.checked)}
                        className="rounded border-[#D6D6D6]"
                      />
                      <label htmlFor="mandatory" className="text-xs text-[#5C5C5C]">
                        Mandatory Course
                      </label>
                    </div>

                    {mappingMsg && (
                      <p className={`text-xs mt-2 font-medium ${mappingMsg.startsWith('Error') ? 'text-[#B85C5C]' : 'text-[#7A9A7E]'}`}>
                        {mappingMsg}
                      </p>
                    )}
                  </form>
                </div>

                {/* Mapped courses list */}
                <div className="bg-white rounded-2xl border border-[#D6D6D6] p-6">
                  <h3 className="text-base font-bold text-[#1E1E1E] mb-4">Current Mapped Curriculum</h3>
                  {selectedProgram.courses_by_semester && Object.keys(selectedProgram.courses_by_semester).length > 0 ? (
                    <div className="space-y-4">
                      {Object.keys(selectedProgram.courses_by_semester)
                        .map(Number)
                        .sort((a, b) => a - b)
                        .map(sem => (
                          <div key={sem} className="border border-[#E5E5E4] rounded-xl overflow-hidden">
                            <div className="bg-[#F2F2F1] px-4 py-2 text-xs font-bold text-[#1E1E1E]">
                              Semester {sem}
                            </div>
                            <div className="divide-y divide-[#E5E5E4]">
                              {(selectedProgram.courses_by_semester[sem] || []).map((c: any) => (
                                <div key={c.id} className="p-3 px-4 flex items-center justify-between text-xs">
                                  <div>
                                    <span className="font-mono font-bold mr-2">{c.code}</span>
                                    <span className="font-medium text-[#1E1E1E]">{c.name}</span>
                                    <span className="ml-2 text-[#7A7A7A]">({c.credits} cr)</span>
                                  </div>
                                  <button
                                    onClick={() => handleRemoveCourseMapping(c.course_id)}
                                    className="text-[#B85C5C] hover:bg-[#F5EAEA] p-1.5 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#7A7A7A]">No courses mapped yet.</p>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl border border-[#D6D6D6] p-12 text-center text-[#7A7A7A]">
                <Layers className="w-10 h-10 mx-auto text-[#9A9A9A] mb-2 opacity-50" />
                <p className="text-sm">Select a program to view and edit its semester course mappings.</p>
              </div>
            )}
          </div>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl border border-[#D6D6D6] p-6 w-full max-w-lg shadow-xl">
              <h3 className="text-lg font-bold text-[#1E1E1E] mb-4">Add Degree Program</h3>
              <form onSubmit={handleCreateProgram} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#1E1E1E] block mb-1">Program Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#D6D6D6]"
                    placeholder="e.g. B.Tech Computer Science (AI & ML)"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#1E1E1E] block mb-1">Code *</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full text-xs p-2.5 rounded-xl border border-[#D6D6D6] font-mono"
                      placeholder="BTCS-AIML"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#1E1E1E] block mb-1">Short Name</label>
                    <input
                      type="text"
                      value={formData.short_name}
                      onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-[#D6D6D6]"
                      placeholder="B.Tech AI&ML"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#1E1E1E] block mb-1">Degree</label>
                    <select
                      value={formData.degree}
                      onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-[#D6D6D6]"
                    >
                      <option value="B.Tech">B.Tech</option>
                      <option value="M.Tech">M.Tech</option>
                      <option value="Minor">Minor</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#1E1E1E] block mb-1">Level</label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-[#D6D6D6]"
                    >
                      <option value="undergraduate">Undergraduate</option>
                      <option value="postgraduate">Postgraduate</option>
                      <option value="minor">Minor</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#1E1E1E] block mb-1">Duration (Years)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.duration_years}
                      onChange={(e) => setFormData({ ...formData, duration_years: parseFloat(e.target.value) })}
                      className="w-full text-xs p-2.5 rounded-xl border border-[#D6D6D6]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#1E1E1E] block mb-1">Total Credits</label>
                    <input
                      type="number"
                      value={formData.total_credits}
                      onChange={(e) => setFormData({ ...formData, total_credits: parseInt(e.target.value) })}
                      className="w-full text-xs p-2.5 rounded-xl border border-[#D6D6D6]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#1E1E1E] block mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#D6D6D6] h-20"
                    placeholder="Program curriculum overview and outcomes..."
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#D6D6D6] hover:bg-[#F2F2F1]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#1E1E1E] text-white text-xs font-semibold hover:bg-black"
                  >
                    Create Program
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
