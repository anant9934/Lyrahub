'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiPost } from '@/lib/api';
import { PersonPicker } from '@/components/features/stories/PersonPicker';
import { MarkdownEditor } from '@/components/features/stories/MarkdownEditor';
import { ArrowLeft, Save, Send, Image as ImageIcon } from 'lucide-react';

export default function CreateStoryPage() {
  const router = useRouter();

  const [storyType, setStoryType] = useState<'student' | 'alumni'>('student');
  const [selectedPerson, setSelectedPerson] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    current_role: '',
    current_company: '',
    batch_year: '',
    program: 'B.Tech CSE (AI & ML)',
    summary: '',
    full_story: '',
    featured_image_url: '',
    video_url: '',
    tags: ''
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePersonSelect = (person: any) => {
    setSelectedPerson(person);
    setFormData((prev) => ({
      ...prev,
      current_role: person.role || prev.current_role,
      current_company: person.company || prev.current_company,
      batch_year: person.batch_year ? person.batch_year.toString() : prev.batch_year,
      program: person.program || prev.program
    }));
  };

  const handleSubmit = async (publish: boolean) => {
    setError(null);
    if (!formData.title.trim()) {
      setError('Story title is required');
      return;
    }
    if (!selectedPerson) {
      setError(`Please select a ${storyType} for this story`);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim() || undefined,
        story_type: storyType,
        person_id: selectedPerson.id,
        person_name: selectedPerson.name,
        current_role: formData.current_role.trim() || undefined,
        current_company: formData.current_company.trim() || undefined,
        batch_year: formData.batch_year ? parseInt(formData.batch_year, 10) : undefined,
        program: formData.program.trim() || undefined,
        summary: formData.summary.trim() || undefined,
        full_story: formData.full_story || undefined,
        featured_image_url: formData.featured_image_url.trim() || undefined,
        video_url: formData.video_url.trim() || undefined,
        tags: formData.tags
          ? formData.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
          : []
      };

      const created = await apiPost('/stories', payload);

      if (publish && created.id) {
        await apiPost(`/stories/${created.id}/publish`, {});
      }

      router.push(`/stories/${created.slug}`);
    } catch (err: any) {
      console.error('Failed to create story', err);
      setError(err.response?.data?.detail || 'Failed to save story. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-[#DCE5F1] pb-4">
        <Link
          href="/stories"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#526783] hover:text-[#0F172A]"
        >
          <ArrowLeft className="w-4 h-4" /> Cancel
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSubmit(false)}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#DCE5F1] rounded-lg text-xs font-semibold text-[#0F172A] bg-white hover:bg-[#F6F8FC] disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" /> Save Draft
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSubmit(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F172A] text-white hover:bg-[#FACC15] hover:text-[#0F172A] rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors shadow-sm"
          >
            <Send className="w-3.5 h-3.5" /> Publish Story
          </button>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Write Success Story</h1>
        <p className="text-xs text-[#526783] mt-0.5">
          Highlight remarkable student achievements, research breakthroughs, or alumni career milestones.
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-[#F5EAEA] border border-[#B85C5C]/30 text-[#B85C5C] rounded-lg text-xs font-medium">
          {error}
        </div>
      )}

      {/* Main Form */}
      <div className="bg-white border border-[#DCE5F1] rounded-2xl p-6 md:p-8 space-y-6">
        {/* Story Type Selector */}
        <div>
          <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wide mb-2">
            Story Focus *
          </label>
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            <button
              type="button"
              onClick={() => {
                setStoryType('student');
                setSelectedPerson(null);
              }}
              className={`p-3 rounded-xl border text-center font-semibold text-xs transition-colors ${
                storyType === 'student'
                  ? 'bg-[#0F172A] text-white border-[#0F172A]'
                  : 'bg-white text-[#526783] border-[#DCE5F1] hover:bg-[#F6F8FC]'
              }`}
            >
              Current Student
            </button>
            <button
              type="button"
              onClick={() => {
                setStoryType('alumni');
                setSelectedPerson(null);
              }}
              className={`p-3 rounded-xl border text-center font-semibold text-xs transition-colors ${
                storyType === 'alumni'
                  ? 'bg-[#0F172A] text-white border-[#0F172A]'
                  : 'bg-white text-[#526783] border-[#DCE5F1] hover:bg-[#F6F8FC]'
              }`}
            >
              Alumni
            </button>
          </div>
        </div>

        {/* Person Picker */}
        <PersonPicker
          storyType={storyType}
          selectedPersonId={selectedPerson?.id}
          onSelect={handlePersonSelect}
        />

        {/* Title & Subtitle */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">Story Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. From Department Hackathons to Staff AI Engineer at DeepMind"
              className="w-full px-3.5 py-2.5 border border-[#DCE5F1] rounded-lg text-sm bg-white focus:outline-none focus:border-[#94B0B8]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">Subtitle / Key Takeaway</label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="e.g. How Ananya led the robotics club and published 3 IEEE papers as an undergrad"
              className="w-full px-3.5 py-2 border border-[#DCE5F1] rounded-lg text-sm bg-white focus:outline-none focus:border-[#94B0B8]"
            />
          </div>
        </div>

        {/* Person metadata fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">Current Role</label>
            <input
              type="text"
              value={formData.current_role}
              onChange={(e) => setFormData({ ...formData, current_role: e.target.value })}
              placeholder="e.g. Machine Learning Researcher"
              className="w-full px-3 py-2 border border-[#DCE5F1] rounded-lg text-xs bg-white focus:outline-none focus:border-[#94B0B8]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">Current Company / Institution</label>
            <input
              type="text"
              value={formData.current_company}
              onChange={(e) => setFormData({ ...formData, current_company: e.target.value })}
              placeholder="e.g. Google DeepMind"
              className="w-full px-3 py-2 border border-[#DCE5F1] rounded-lg text-xs bg-white focus:outline-none focus:border-[#94B0B8]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">Batch / Graduation Year</label>
            <input
              type="number"
              value={formData.batch_year}
              onChange={(e) => setFormData({ ...formData, batch_year: e.target.value })}
              placeholder="e.g. 2024"
              className="w-full px-3 py-2 border border-[#DCE5F1] rounded-lg text-xs bg-white focus:outline-none focus:border-[#94B0B8]"
            />
          </div>
        </div>

        {/* Summary Teaser */}
        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1">
            Short Summary Teaser (approx 200 chars)
          </label>
          <textarea
            rows={2}
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            placeholder="A compelling 2-sentence hook displayed on cards and search results..."
            className="w-full p-3 border border-[#DCE5F1] rounded-lg text-xs bg-white focus:outline-none focus:border-[#94B0B8]"
          />
        </div>

        {/* Markdown Rich Editor */}
        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1">
            Full Story Content (Markdown) *
          </label>
          <MarkdownEditor
            value={formData.full_story}
            onChange={(val) => setFormData({ ...formData, full_story: val })}
          />
        </div>

        {/* Media & Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">Featured Cover Image URL</label>
            <div className="relative">
              <ImageIcon className="w-4 h-4 text-[#667A93] absolute left-3 top-2.5" />
              <input
                type="text"
                value={formData.featured_image_url}
                onChange={(e) => setFormData({ ...formData, featured_image_url: e.target.value })}
                placeholder="https://example.com/cover.jpg"
                className="w-full pl-9 pr-3 py-2 border border-[#DCE5F1] rounded-lg text-xs bg-white focus:outline-none focus:border-[#94B0B8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g. nlp, google, researcher, placements"
              className="w-full px-3 py-2 border border-[#DCE5F1] rounded-lg text-xs bg-white focus:outline-none focus:border-[#94B0B8]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
