'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit,
  Upload,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function ManageCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvContent, setCsvContent] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    short_name: '',
    description: '',
    credits: 4.0,
    semester: 1,
    year: 1,
    course_type: 'core',
    category: 'theory',
    prerequisites: '',
    syllabus: '',
  });

  const isAuthorized = user && (user.role === 'hod' || user.role === 'admin');

  const loadCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/courses?page_size=100');
      setCourses(res.data?.items || []);
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/courses', formData);
      setShowCreateModal(false);
      setFormData({
        code: '',
        name: '',
        short_name: '',
        description: '',
        credits: 4.0,
        semester: 1,
        year: 1,
        course_type: 'core',
        category: 'theory',
        prerequisites: '',
        syllabus: '',
      });
      await loadCourses();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create course');
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await api.delete(`/courses/${id}`);
      await loadCourses();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete course');
    }
  };

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvContent.trim()) return;

    // Parse simple CSV: code,name,credits,semester,type,category
    const lines = csvContent.trim().split('\n');
    let imported = 0;
    let failed = 0;

    for (const line of lines) {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length >= 2) {
        // Skip header
        if (parts[0].toLowerCase() === 'code') continue;

        try {
          await api.post('/courses', {
            code: parts[0].toUpperCase(),
            name: parts[1],
            credits: parts[2] ? parseFloat(parts[2]) : 4.0,
            semester: parts[3] ? parseInt(parts[3]) : 1,
            course_type: parts[4] || 'core',
            category: parts[5] || 'theory',
          });
          imported++;
        } catch {
          failed++;
        }
      }
    }

    setImportStatus(`Imported ${imported} courses successfully. ${failed > 0 ? `${failed} skipped/failed.` : ''}`);
    setShowImportModal(false);
    setCsvContent('');
    await loadCourses();
  };

  if (!isAuthorized && !loading) {
    return (
      <div className="min-h-screen bg-[#F6F8FC] p-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-[#DCE5F1] p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-[#B85C5C] mx-auto mb-3" />
          <h2 className="text-xl font-bold text-[#0F172A] mb-2">Access Restricted</h2>
          <p className="text-sm text-[#526783] mb-6">Only HOD or Administrators can manage course catalogs and syllabus definitions.</p>
          <Link href="/courses" className="px-4 py-2 rounded-xl bg-[#0F172A] text-white text-sm font-semibold">
            View Public Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8FC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <Link
              href="/courses"
              className="inline-flex items-center gap-1.5 text-xs text-[#667A93] hover:text-[#0F172A] transition-colors mb-2 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Public Catalog</span>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A]">Courses & Syllabus Management</h1>
            <p className="text-xs md:text-sm text-[#667A93]">Configure official department courses, credits, and syllabus modules</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#DCE5F1] bg-white hover:bg-[#F6F8FC] text-[#0F172A] text-sm font-semibold transition-all shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#7A9A7E]" />
              <span>Bulk CSV Import</span>
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-black text-white text-sm font-semibold transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Course</span>
            </button>
          </div>
        </div>

        {importStatus && (
          <div className="mb-6 p-4 rounded-xl bg-[#EEF3EE] border border-[#7A9A7E]/40 text-xs text-[#7A9A7E] font-semibold flex items-center justify-between">
            <span>{importStatus}</span>
            <button onClick={() => setImportStatus(null)} className="text-[#0F172A]">Dismiss</button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#DCE5F1] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#EAEAE8]/60 text-[#34465E] font-semibold text-xs border-b border-[#E5E5E4]">
                  <th className="py-3 px-6">Code</th>
                  <th className="py-3 px-6">Name</th>
                  <th className="py-3 px-6">Type</th>
                  <th className="py-3 px-6">Category</th>
                  <th className="py-3 px-6 text-center">Semester</th>
                  <th className="py-3 px-6 text-center">Credits</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E4]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-xs text-[#667A93]">Loading courses...</td>
                  </tr>
                ) : courses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-xs text-[#667A93]">No courses found. Add a course or import via CSV.</td>
                  </tr>
                ) : (
                  courses.map(c => (
                    <tr key={c.id} className="hover:bg-[#F6F8FC]/50 transition-colors">
                      <td className="py-3.5 px-6 font-mono font-bold text-xs text-[#0F172A]">
                        {c.code}
                      </td>
                      <td className="py-3.5 px-6 font-medium text-[#0F172A]">
                        <Link href={`/courses/${c.slug}`} className="hover:underline">
                          {c.name}
                        </Link>
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase bg-[#F6F8FC] text-[#0F172A]">
                          {c.course_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-xs text-[#526783] capitalize">
                        {c.category}
                      </td>
                      <td className="py-3.5 px-6 text-center text-xs font-semibold text-[#0F172A]">
                        {c.semester ? `Sem ${c.semester}` : '-'}
                      </td>
                      <td className="py-3.5 px-6 text-center font-bold text-[#0F172A]">
                        {c.credits}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => handleDeleteCourse(c.id)}
                          className="p-1.5 text-[#B85C5C] hover:bg-[#F5EAEA] rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl border border-[#DCE5F1] p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold text-[#0F172A] mb-4">Add Department Course</h3>
              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#0F172A] block mb-1">Code *</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full text-xs p-2.5 rounded-xl border border-[#DCE5F1] font-mono"
                      placeholder="CS301"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#0F172A] block mb-1">Short Name</label>
                    <input
                      type="text"
                      value={formData.short_name}
                      onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-[#DCE5F1]"
                      placeholder="DL"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#0F172A] block mb-1">Course Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#DCE5F1]"
                    placeholder="e.g. Deep Learning"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#0F172A] block mb-1">Credits</label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.credits}
                      onChange={(e) => setFormData({ ...formData, credits: parseFloat(e.target.value) })}
                      className="w-full text-xs p-2.5 rounded-xl border border-[#DCE5F1]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#0F172A] block mb-1">Semester</label>
                    <input
                      type="number"
                      min="1"
                      max="8"
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                      className="w-full text-xs p-2.5 rounded-xl border border-[#DCE5F1]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#0F172A] block mb-1">Year</label>
                    <input
                      type="number"
                      min="1"
                      max="4"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      className="w-full text-xs p-2.5 rounded-xl border border-[#DCE5F1]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#0F172A] block mb-1">Course Type</label>
                    <select
                      value={formData.course_type}
                      onChange={(e) => setFormData({ ...formData, course_type: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-[#DCE5F1]"
                    >
                      <option value="core">Core</option>
                      <option value="elective">Elective</option>
                      <option value="lab">Lab</option>
                      <option value="project">Project</option>
                      <option value="seminar">Seminar</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#0F172A] block mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-[#DCE5F1]"
                    >
                      <option value="theory">Theory</option>
                      <option value="practical">Practical</option>
                      <option value="humanities">Humanities</option>
                      <option value="minor">Engineering Minor</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#0F172A] block mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#DCE5F1] h-16"
                    placeholder="Short course description..."
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#0F172A] block mb-1">Prerequisites</label>
                  <input
                    type="text"
                    value={formData.prerequisites}
                    onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#DCE5F1]"
                    placeholder="e.g. CS201 Data Structures, Linear Algebra"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#0F172A] block mb-1">Syllabus Markdown</label>
                  <textarea
                    value={formData.syllabus}
                    onChange={(e) => setFormData({ ...formData, syllabus: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#DCE5F1] font-mono h-24"
                    placeholder="# Module 1: Introduction&#10;# Module 2: Convolutional Networks"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#DCE5F1] hover:bg-[#F6F8FC]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#0F172A] text-white text-xs font-semibold hover:bg-black"
                  >
                    Create Course
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CSV Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl border border-[#DCE5F1] p-6 w-full max-w-lg shadow-xl">
              <h3 className="text-lg font-bold text-[#0F172A] mb-2">Bulk Import Courses (CSV)</h3>
              <p className="text-xs text-[#667A93] mb-4">
                Paste CSV data. Format: <code>code, name, credits, semester, type, category</code>
              </p>
              <form onSubmit={handleBulkImport} className="space-y-4">
                <textarea
                  value={csvContent}
                  onChange={(e) => setCsvContent(e.target.value)}
                  placeholder="CS101, Introduction to Programming, 4.0, 1, core, theory&#10;CS201, Data Structures, 4.0, 3, core, theory"
                  className="w-full text-xs p-3 rounded-xl border border-[#DCE5F1] font-mono h-40"
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowImportModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#DCE5F1] hover:bg-[#F6F8FC]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#0F172A] text-white text-xs font-semibold hover:bg-black"
                  >
                    Import Courses
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
