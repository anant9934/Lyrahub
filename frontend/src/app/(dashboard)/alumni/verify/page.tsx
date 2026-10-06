"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function AlumniVerificationQueuePage() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/alumni?page_size=50", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      });
      if (res.ok) {
        const data = await res.json();
        // filter unverified
        const unverified = (data.items || []).filter((a: any) => !a.is_verified);
        setQueue(unverified);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/alumni/${id}/verify`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      });
      if (res.ok) {
        fetchQueue();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 bg-[#F6F8FC] min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/alumni" className="text-xs font-semibold text-[#526783] hover:text-[#0F172A]">
            ← Back to Directory
          </Link>
          <h1 className="text-2xl font-extrabold text-[#0F172A] mt-1">Alumni Verification Queue</h1>
          <p className="text-xs text-[#526783] mt-0.5">
            HOD / Admin review queue for self-registered alumni credentials.
          </p>
        </div>
        <button
          onClick={fetchQueue}
          className="px-3.5 py-1.5 text-xs font-semibold bg-white border border-[#DCE5F1] rounded-xl hover:bg-gray-100"
        >
          Refresh Queue
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-[#526783]">Loading verification queue...</div>
      ) : queue.length === 0 ? (
        <div className="p-12 text-center bg-white border border-[#DCE5F1] rounded-2xl shadow-sm">
          <p className="text-sm font-bold text-[#7A9A7E] mb-1">Queue is clear!</p>
          <p className="text-xs text-[#526783]">No pending alumni registrations awaiting departmental verification.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#DCE5F1] rounded-2xl overflow-hidden shadow-sm">
          <div className="divide-y divide-[#D6D6D6]">
            {queue.map((alumnus: any) => (
              <div key={alumnus.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#0F172A]">{alumnus.full_name}</h3>
                    <span className="text-[11px] font-mono text-[#526783] bg-[#F6F8FC] px-2 py-0.5 rounded">
                      {alumnus.reg_no || "No Reg No"}
                    </span>
                  </div>
                  <p className="text-xs text-[#526783] mt-0.5">
                    {alumnus.email} • Class of {alumnus.graduation_year} ({alumnus.program})
                  </p>
                  <p className="text-xs text-[#0F172A] font-medium mt-1">
                    Current: {alumnus.current_role || "—"} at {alumnus.current_company || "—"}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleVerify(alumnus.id)}
                    disabled={actionLoading === alumnus.id}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-[#7A9A7E] hover:bg-[#68856c] rounded-xl transition disabled:opacity-50"
                  >
                    {actionLoading === alumnus.id ? "Approving..." : "Approve & Verify"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
