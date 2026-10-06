'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { GroupCard } from '@/components/features/groups/GroupCard';
import { ArrowLeft, Users, Plus, Shield } from 'lucide-react';

export default function MyGroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyGroups = async () => {
      setLoading(true);
      try {
        const data = await apiGet('/groups/me');
        setGroups(data || []);
      } catch (err) {
        console.error('Failed to load my groups', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMyGroups();
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCE5F1] pb-6">
        <div>
          <Link
            href="/groups"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#526783] hover:text-[#0F172A] mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to All Groups
          </Link>
          <h1 className="text-3xl font-bold text-[#0F172A]">My Memberships & Clubs</h1>
          <p className="text-sm text-[#526783] mt-1">
            Groups, clubs, and societies where you hold an active membership, core, or leadership role.
          </p>
        </div>

        <Link
          href="/groups"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F172A] text-white hover:bg-[#FACC15] hover:text-[#0F172A] rounded-lg text-xs font-semibold transition-colors shadow-sm self-start"
        >
          <Plus className="w-4 h-4" /> Explore More Clubs
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#0F172A] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#667A93]">Loading your groups...</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-white border border-[#DCE5F1] rounded-2xl p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 bg-[#F6F8FC] rounded-full flex items-center justify-center mx-auto text-[#667A93]">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#0F172A]">Not in any groups yet</h3>
          <p className="text-xs text-[#667A93] leading-relaxed">
            Join student technical clubs or interest groups to collaborate on projects and events.
          </p>
          <Link
            href="/groups"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F172A] text-white hover:bg-[#FACC15] hover:text-[#0F172A] rounded-lg text-xs font-semibold transition-colors"
          >
            Browse Clubs Directory
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}
