'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { GroupCard } from '@/components/features/groups/GroupCard';
import { GroupFilters } from '@/components/features/groups/GroupFilters';
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D6D6D6] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-[#EEF3EE] text-[#7A9A7E] border border-[#7A9A7E]/30 px-2.5 py-0.5 rounded-full font-semibold">
              Student Life & Clubs
            </span>
          </div>
          <h1 className="text-3xl font-bold text-[#1E1E1E]">Student Groups & Societies</h1>
          <p className="text-sm text-[#5C5C5C] mt-1">
            Explore technical clubs, research interest groups, professional chapters, and cultural teams.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {user && (
            <Link
              href="/groups/me"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-[#D6D6D6] rounded-lg text-xs font-semibold text-[#1E1E1E] hover:bg-[#F2F2F1] transition-colors"
            >
              <UserCheck className="w-4 h-4 text-[#5C5C5C]" /> My Memberships
            </Link>
          )}

          {isHODorAdmin && (
            <Link
              href="/groups/create"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E1E1E] text-white hover:bg-[#EEBE1E] hover:text-[#1E1E1E] rounded-lg text-xs font-semibold transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Create Group
            </Link>
          )}
        </div>
      </div>

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
          <div className="w-8 h-8 border-2 border-[#1E1E1E] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#7A7A7A]">Loading groups and clubs...</p>
        </div>
      ) : totalCount === 0 ? (
        <div className="bg-white border border-[#D6D6D6] rounded-2xl p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 bg-[#F2F2F1] rounded-full flex items-center justify-center mx-auto text-[#7A7A7A]">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#1E1E1E]">No groups found</h3>
          <p className="text-xs text-[#7A7A7A] leading-relaxed">
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
            className="px-3 py-1.5 border border-[#D6D6D6] rounded-md text-xs font-medium text-[#1E1E1E] disabled:opacity-40 hover:bg-[#F2F2F1]"
          >
            Previous
          </button>
          <span className="text-xs text-[#5C5C5C] px-2">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 border border-[#D6D6D6] rounded-md text-xs font-medium text-[#1E1E1E] disabled:opacity-40 hover:bg-[#F2F2F1]"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
