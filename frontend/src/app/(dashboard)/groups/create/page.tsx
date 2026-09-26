'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiPost } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { ArrowLeft, Plus, Send, AlertCircle, Shield } from 'lucide-react';

export default function CreateGroupPage() {
  const router = useRouter();
  const { user } = useAuth();

  const isHODorAdmin = Boolean(
    user && ['admin', 'hod'].includes(user.role?.toLowerCase() || '')
  );

  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    group_type: 'club',
    category: 'technical',
    cover_image_url: '',
    logo_url: '',
    contact_email: '',
    contact_phone: '',
    meeting_schedule: '',
    meeting_venue: '',
    membership_open: true,
    membership_fee: 0,
    tags: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Group name is required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        tagline: formData.tagline.trim() || undefined,
        description: formData.description.trim() || undefined,
        group_type: formData.group_type,
        category: formData.category,
        cover_image_url: formData.cover_image_url.trim() || undefined,
        logo_url: formData.logo_url.trim() || undefined,
        contact_email: formData.contact_email.trim() || undefined,
        contact_phone: formData.contact_phone.trim() || undefined,
        meeting_schedule: formData.meeting_schedule.trim() || undefined,
        meeting_venue: formData.meeting_venue.trim() || undefined,
        membership_open: formData.membership_open,
        membership_fee: Number(formData.membership_fee) || 0,
        tags: formData.tags
          ? formData.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
          : []
      };

      const res = await apiPost('/groups', payload);
      router.push(`/groups/${res.slug}`);
    } catch (err: any) {
      console.error('Failed to create group', err);
      setError(err.response?.data?.detail || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  if (!isHODorAdmin) {
    return (
      <div className="bg-white border border-[#D6D6D6] rounded-2xl p-12 text-center max-w-md mx-auto my-12 space-y-4">
        <div className="w-12 h-12 bg-[#F5EAEA] text-[#B85C5C] rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-[#1E1E1E]">Access Restricted</h2>
        <p className="text-xs text-[#7A7A7A]">Only HOD or Admin can charter new student groups or societies.</p>
        <Link
          href="/groups"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E1E1E] bg-[#F2F2F1] hover:bg-[#D6D6D6] px-4 py-2 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Groups
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href="/groups"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C5C5C] hover:text-[#1E1E1E] mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Groups
        </Link>
        <h1 className="text-2xl font-bold text-[#1E1E1E]">Charter New Group or Club</h1>
        <p className="text-xs text-[#5C5C5C] mt-0.5">
          Establish an official student organization, interest group, or chapter within the department.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-[#D6D6D6] rounded-2xl p-6 sm:p-8 space-y-6">
        {error && (
          <div className="p-3.5 bg-[#F5EAEA] border border-[#B85C5C]/30 text-[#B85C5C] rounded-lg text-xs font-medium">
            {error}
          </div>
        )}

        {/* Group Name & Tagline */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1E1E1E] mb-1">Group Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. AI & Robotics Club, Quantum ML Chapter"
              className="w-full px-3.5 py-2.5 border border-[#D6D6D6] rounded-lg text-sm bg-white focus:outline-none focus:border-[#94B0B8]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1E1E1E] mb-1">Tagline / Motto</label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              placeholder="e.g. Building autonomous robotic systems and competing in national hackathons"
              className="w-full px-3.5 py-2 border border-[#D6D6D6] rounded-lg text-sm bg-white focus:outline-none focus:border-[#94B0B8]"
            />
          </div>
        </div>

        {/* Category & Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1E1E1E] mb-1">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-[#D6D6D6] rounded-lg text-xs bg-white focus:outline-none focus:border-[#94B0B8]"
            >
              <option value="technical">Technical</option>
              <option value="cultural">Cultural</option>
              <option value="sports">Sports</option>
              <option value="social">Social</option>
              <option value="professional">Professional</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1E1E1E] mb-1">Group Type *</label>
            <select
              value={formData.group_type}
              onChange={(e) => setFormData({ ...formData, group_type: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-[#D6D6D6] rounded-lg text-xs bg-white focus:outline-none focus:border-[#94B0B8]"
            >
              <option value="club">Club</option>
              <option value="society">Society</option>
              <option value="interest_group">Interest Group</option>
              <option value="chapter">Student Chapter (ACM, IEEE, etc.)</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-[#1E1E1E] mb-1">About & Objectives</label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the club's mission, regular workshops, hands-on projects, and who should join..."
            className="w-full p-3.5 border border-[#D6D6D6] rounded-xl text-sm bg-white focus:outline-none focus:border-[#94B0B8] leading-relaxed"
          />
        </div>

        {/* Images URLs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1E1E1E] mb-1">Logo URL</label>
            <input
              type="text"
              value={formData.logo_url}
              onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
              placeholder="https://example.com/logo.png"
              className="w-full px-3 py-2 border border-[#D6D6D6] rounded-lg text-xs bg-white focus:outline-none focus:border-[#94B0B8]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1E1E1E] mb-1">Cover Image URL</label>
            <input
              type="text"
              value={formData.cover_image_url}
              onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
              placeholder="https://example.com/cover.jpg"
              className="w-full px-3 py-2 border border-[#D6D6D6] rounded-lg text-xs bg-white focus:outline-none focus:border-[#94B0B8]"
            />
          </div>
        </div>

        {/* Schedule & Venue */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1E1E1E] mb-1">Meeting Schedule</label>
            <input
              type="text"
              value={formData.meeting_schedule}
              onChange={(e) => setFormData({ ...formData, meeting_schedule: e.target.value })}
              placeholder="e.g. Every Wednesday 4:30 PM"
              className="w-full px-3 py-2 border border-[#D6D6D6] rounded-lg text-xs bg-white focus:outline-none focus:border-[#94B0B8]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1E1E1E] mb-1">Meeting Venue</label>
            <input
              type="text"
              value={formData.meeting_venue}
              onChange={(e) => setFormData({ ...formData, meeting_venue: e.target.value })}
              placeholder="e.g. AI Innovation Lab, Room 402"
              className="w-full px-3 py-2 border border-[#D6D6D6] rounded-lg text-xs bg-white focus:outline-none focus:border-[#94B0B8]"
            />
          </div>
        </div>

        {/* Contact info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1E1E1E] mb-1">Contact Email</label>
            <input
              type="email"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              placeholder="robotics@aiml.hub"
              className="w-full px-3 py-2 border border-[#D6D6D6] rounded-lg text-xs bg-white focus:outline-none focus:border-[#94B0B8]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1E1E1E] mb-1">Contact Phone</label>
            <input
              type="text"
              value={formData.contact_phone}
              onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              placeholder="+91 9876543210"
              className="w-full px-3 py-2 border border-[#D6D6D6] rounded-lg text-xs bg-white focus:outline-none focus:border-[#94B0B8]"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-semibold text-[#1E1E1E] mb-1">Tags (comma-separated)</label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="e.g. robotics, ros, automation, hardware"
            className="w-full px-3 py-2 border border-[#D6D6D6] rounded-lg text-xs bg-white focus:outline-none focus:border-[#94B0B8]"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#1E1E1E] text-white hover:bg-[#EEBE1E] hover:text-[#1E1E1E] py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" /> Charter Group
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
