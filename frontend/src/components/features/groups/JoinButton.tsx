'use client';

import React, { useState } from 'react';
import { apiPost, apiDelete } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { UserPlus, UserMinus, AlertCircle } from 'lucide-react';

interface JoinButtonProps {
  groupId: string;
  isMember?: boolean;
  memberRole?: string;
  membershipOpen?: boolean;
  membershipFee?: number;
  onStatusChange: () => void;
}

export const JoinButton: React.FC<JoinButtonProps> = ({
  groupId,
  isMember,
  memberRole = 'member',
  membershipOpen = true,
  membershipFee = 0,
  onStatusChange
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isStudent = user?.role?.toLowerCase() === 'student' || !['admin', 'hod', 'faculty'].includes(user?.role?.toLowerCase() || '');

  const handleJoin = async () => {
    setError(null);
    setLoading(true);
    try {
      await apiPost(`/groups/${groupId}/join`, {});
      onStatusChange();
    } catch (err: unknown) {
      console.error('Failed to join group', err);
      const message = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to join group';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!confirm('Are you sure you want to leave this group?')) return;
    setError(null);
    setLoading(true);
    try {
      await apiDelete(`/groups/${groupId}/join`);
      onStatusChange();
    } catch (err: unknown) {
      console.error('Failed to leave group', err);
      const message = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to leave group';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <a
        href="/login"
        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E1E1E] text-white hover:bg-[#EEBE1E] hover:text-[#1E1E1E] rounded-lg text-xs font-semibold transition-colors"
      >
        Sign in to Join
      </a>
    );
  }

  if (!isStudent) {
    return null;
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      {error && (
        <span className="text-[11px] text-[#B85C5C] flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </span>
      )}

      {isMember ? (
        <button
          type="button"
          disabled={loading}
          onClick={handleLeave}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#D6D6D6] hover:border-[#B85C5C] hover:bg-[#F5EAEA] text-[#5C5C5C] hover:text-[#B85C5C] rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
        >
          <UserMinus className="w-3.5 h-3.5" />
          {loading ? 'Processing...' : 'Leave Group'}
        </button>
      ) : (
        <button
          type="button"
          disabled={loading || !membershipOpen}
          onClick={handleJoin}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E1E1E] text-white hover:bg-[#EEBE1E] hover:text-[#1E1E1E] rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 shadow-sm"
        >
          <UserPlus className="w-3.5 h-3.5" />
          {loading
            ? 'Joining...'
            : membershipOpen
            ? membershipFee > 0
              ? `Join (Fee: ₹${membershipFee})`
              : 'Join Group'
            : 'Membership Closed'}
        </button>
      )}
    </div>
  );
};
