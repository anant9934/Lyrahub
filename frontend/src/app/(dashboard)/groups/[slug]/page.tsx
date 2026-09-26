'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiGet, apiPost } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { GroupHero } from '@/components/features/groups/GroupHero';
import { MemberGrid } from '@/components/features/groups/MemberGrid';
import {
  ArrowLeft,
  Calendar,
  Users,
  Award,
  BookOpen,
  Mail,
  Phone,
  CheckCircle,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export default function GroupDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();

  const [group, setGroup] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'about' | 'members' | 'events' | 'achievements'>('about');
  const [error, setError] = useState<string | null>(null);

  const isHODorAdmin = Boolean(
    user && ['admin', 'hod'].includes(user.role?.toLowerCase() || '')
  );

  const fetchGroup = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet(`/groups/${slug}`);
      setGroup(data);
    } catch (err: any) {
      console.error('Failed to load group', err);
      setError('Group not found or inactive');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchGroup();
    }
  }, [slug]);

  const handleVerify = async () => {
    if (!group) return;
    try {
      const updated = await apiPost(`/groups/${group.id}/verify`, {});
      setGroup((prev: any) => ({ ...prev, is_official: true }));
    } catch (err) {
      console.error('Failed to verify group', err);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#1E1E1E] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-[#7A7A7A]">Loading group details...</p>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="bg-white border border-[#D6D6D6] rounded-2xl p-12 text-center max-w-md mx-auto my-12 space-y-4">
        <div className="w-12 h-12 bg-[#F5EAEA] text-[#B85C5C] rounded-full flex items-center justify-center mx-auto">
          <Users className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-[#1E1E1E]">Group Not Found</h2>
        <p className="text-sm text-[#7A7A7A]">{error}</p>
        <Link
          href="/groups"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E1E1E] bg-[#F2F2F1] hover:bg-[#D6D6D6] px-4 py-2 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Groups
        </Link>
      </div>
    );
  }

  const isCurrentUserMember = (group.members || []).some(
    (m: any) => m.student_email === user?.email || m.student_id === user?.id
  );
  const currentMember = (group.members || []).find(
    (m: any) => m.student_email === user?.email || m.student_id === user?.id
  );

  return (
    <div className="space-y-6">
      {/* Top back bar & admin actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/groups"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C5C5C] hover:text-[#1E1E1E] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Groups
        </Link>

        {isHODorAdmin && !group.is_official && (
          <button
            type="button"
            onClick={handleVerify}
            className="inline-flex items-center gap-1.5 bg-[#EEF3EE] hover:bg-[#7A9A7E] text-[#7A9A7E] hover:text-white border border-[#7A9A7E]/30 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Verify as Official Group
          </button>
        )}
      </div>

      {/* Hero Header */}
      <GroupHero
        group={group}
        isMember={isCurrentUserMember}
        memberRole={currentMember?.role}
        onStatusChange={fetchGroup}
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[#D6D6D6]">
        {[
          { id: 'about', label: 'About', icon: BookOpen },
          { id: 'members', label: `Members (${group.members?.length || 0})`, icon: Users },
          { id: 'events', label: `Events (${group.events?.length || 0})`, icon: Calendar },
          { id: 'achievements', label: 'Achievements', icon: Award }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[#1E1E1E] text-[#1E1E1E]'
                  : 'border-transparent text-[#7A7A7A] hover:text-[#1E1E1E]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === 'about' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-[#D6D6D6] p-6 sm:p-8 space-y-4">
                <h3 className="text-lg font-bold text-[#1E1E1E]">About the Group</h3>
                <p className="text-sm text-[#1E1E1E] leading-relaxed whitespace-pre-line">
                  {group.description || group.tagline || 'No extended description provided.'}
                </p>

                {group.tags && group.tags.length > 0 && (
                  <div className="pt-4 border-t border-[#D6D6D6] flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-semibold text-[#7A7A7A]">Focus Areas:</span>
                    {group.tags.map((tag: string, i: number) => (
                      <span key={i} className="text-xs bg-[#F2F2F1] text-[#1E1E1E] px-2 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar info */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-[#D6D6D6] p-6 space-y-4 text-xs">
                <h4 className="font-bold text-sm text-[#1E1E1E] border-b border-[#D6D6D6] pb-2">
                  Contact & Schedule
                </h4>

                {group.contact_email && (
                  <div className="flex items-center gap-2 text-[#5C5C5C]">
                    <Mail className="w-3.5 h-3.5 text-[#7A7A7A]" />
                    <a href={`mailto:${group.contact_email}`} className="hover:underline truncate">
                      {group.contact_email}
                    </a>
                  </div>
                )}

                {group.contact_phone && (
                  <div className="flex items-center gap-2 text-[#5C5C5C]">
                    <Phone className="w-3.5 h-3.5 text-[#7A7A7A]" />
                    <span>{group.contact_phone}</span>
                  </div>
                )}

                {group.meeting_venue && (
                  <div className="pt-2 border-t border-[#D6D6D6]">
                    <span className="text-[#7A7A7A] block mb-0.5">Meeting Venue</span>
                    <span className="font-semibold text-[#1E1E1E]">{group.meeting_venue}</span>
                  </div>
                )}

                {group.founded_on && (
                  <div>
                    <span className="text-[#7A7A7A] block mb-0.5">Founded On</span>
                    <span className="font-semibold text-[#1E1E1E]">
                      {new Date(group.founded_on).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-4">
            <MemberGrid members={group.members || []} />
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-4">
            {(!group.events || group.events.length === 0) ? (
              <div className="bg-white border border-[#D6D6D6] rounded-2xl p-10 text-center text-sm text-[#7A7A7A]">
                No upcoming events linked to this club yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.events.map((e: any) => (
                  <div
                    key={e.id}
                    className="bg-white border border-[#D6D6D6] rounded-xl p-5 flex items-center justify-between hover:shadow-sm transition-all"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-[#1E1E1E]">
                        <Link href={`/events/${e.event_slug}`} className="hover:text-[#EEBE1E]">
                          {e.event_title}
                        </Link>
                      </h4>
                      {e.start_datetime && (
                        <div className="text-xs text-[#7A7A7A] mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(e.start_datetime).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <Link
                      href={`/events/${e.event_slug}`}
                      className="p-1.5 text-[#5C5C5C] hover:text-[#1E1E1E] rounded hover:bg-[#F2F2F1]"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="bg-white border border-[#D6D6D6] rounded-2xl p-10 text-center text-sm text-[#7A7A7A]">
            Competitions won and awards received by this student group will appear here.
          </div>
        )}
      </div>
    </div>
  );
}
