'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { GroupCard } from '@/components/features/groups/GroupCard';
import { GroupFilters } from '@/components/features/groups/GroupFilters';
import { WorkspaceHero } from '@/components/layout/WorkspaceHero';
import { Plus, Users, UserCheck } from 'lucide-react';

export default function GroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [filters, setFilters] = useState({
    group_type: '',
    category: '',
    is_official: false,
    search: ''
  });

  const isHODorAdmin = Boolean(
    user && ['admin', 'hod'].includes(user.role?.toLowerCase() || '')
  );

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.group_type) params.append('group_type', filters.group_type);
      if (filters.category) params.append('category', filters.category);
      if (filters.is_official) params.append('is_official', 'true');
      if (filters.search) params.append('search', filters.search);
      params.append('page', page.toString());
      params.append('page_size', '16');

      const res = await apiGet(`/groups?${params.toString()}`);
      setGroups(res.items || []);
      setTotalPages(res.pages || 1);
      setTotalCount(res.total || 0);
    } catch (err) {
      console.error('Failed to load groups', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [filters, page]);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <WorkspaceHero eyebrow="Student life & clubs" title={<>Find your <span className="text-[#0f8f85]">community.</span></>} description="Explore technical clubs, research groups, professional chapters, and student societies." tone="mint" icon={Users} actions={<>
          {user && (
            <Link
              href="/groups/me"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#b9ddd7] bg-white px-4 py-2.5 text-xs font-bold text-[#081a39] transition hover:bg-[#f4fffc]"
            >
              <UserCheck className="w-4 h-4 text-[#526783]" /> My Memberships
            </Link>
          )}

          {isHODorAdmin && (
            <Link
              href="/groups/create"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#081a39] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#1478ef]"
            >
              <Plus className="w-4 h-4" /> Create Group
            </Link>
          )}
      </>}/>

      {/* Filter Component */}
      <GroupFilters
        filters={filters}
        onChange={(newFilters) => {
          setFilters(newFilters);
          setPage(1);
        }}
        onReset={() => {
          setFilters({ group_type: '', category: '', is_official: false, search: '' });
          setPage(1);
        }}
      />

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#0F172A] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#667A93]">Loading groups and clubs...</p>
        </div>
      ) : totalCount === 0 ? (
        <div className="bg-white border border-[#DCE5F1] rounded-2xl p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 bg-[#F6F8FC] rounded-full flex items-center justify-center mx-auto text-[#667A93]">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#0F172A]">No groups found</h3>
          <p className="text-xs text-[#667A93] leading-relaxed">
            Try adjusting your search query or removing filters to explore other student clubs.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 border border-[#DCE5F1] rounded-md text-xs font-medium text-[#0F172A] disabled:opacity-40 hover:bg-[#F6F8FC]"
          >
            Previous
          </button>
          <span className="text-xs text-[#526783] px-2">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 border border-[#DCE5F1] rounded-md text-xs font-medium text-[#0F172A] disabled:opacity-40 hover:bg-[#F6F8FC]"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
