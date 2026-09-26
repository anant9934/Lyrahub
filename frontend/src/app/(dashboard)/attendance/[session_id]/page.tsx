"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  QrCode, 
  Clock, 
  Users, 
  CheckCircle2, 
  RefreshCw, 
  AlertCircle, 
  Calendar,
  Layers,
  ArrowLeft,
  ExternalLink
} from "lucide-react";
import api from "@/lib/api";

interface RecordItem {
  id: string;
  student_id: string;
  student_email: string;
  student_reg_no: string;
  marked_at: string;
  ip_address?: string;
}

interface SessionData {
  session_id: string;
  course_id: string | null;
  section: string | null;
  is_active: boolean;
  expires_at: string | null;
  total_marked: number;
  records: RecordItem[];
}

export default function LiveAttendanceSessionPage() {
  const params = useParams();
  const sessionId = params?.session_id as string;
  const router = useRouter();

  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isExpired, setIsExpired] = useState(false);

  // QR code image URL constructed using qr payload
  // We can render the QR data locally with an image or standard SVG/Canvas
  const qrPayloadText = JSON.stringify({
    type: "attendance",
    session_id: sessionId,
  });

  const fetchRecords = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await api.get(`/qr/attendance/session/${sessionId}/records`);
      setSession(res.data);
      setError(null);
    } catch (err: any) {
      console.error("Failed to load attendance session:", err);
      setError(
        err.response?.data?.detail || "Could not retrieve attendance session records"
      );
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    if (!sessionId) return;
    fetchRecords(true);

    // Refresh every 5 seconds
    const interval = setInterval(() => {
      fetchRecords(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [sessionId]);

  // Expiry timer
  useEffect(() => {
    if (!session?.expires_at) return;

    const updateTimer = () => {
      const expiry = new Date(session.expires_at!).getTime();
      const now = new Date().getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft("Expired");
        setIsExpired(true);
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${mins}:${secs < 10 ? "0" : ""}${secs}`);
        setIsExpired(false);
      }
    };

    updateTimer();
    const timerId = setInterval(updateTimer, 1000);
    return () => clearInterval(timerId);
  }, [session?.expires_at]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/attendance"
          className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> All Attendance Sessions
        </Link>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs text-slate-500 font-medium">Auto-refreshing every 5s</span>
        </div>
      </div>

      <div className="border-b border-slate-100 pb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <QrCode className="w-7 h-7 text-[#0F766E]" />
            Live Classroom Attendance
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Section: <strong className="text-slate-700">{session?.section || "A"}</strong> | Session ID: <code className="text-xs font-mono text-slate-600">{sessionId}</code>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-2xl border text-sm font-semibold flex items-center gap-2 ${
            isExpired 
              ? "bg-red-50 text-red-700 border-red-200" 
              : "bg-emerald-50 text-emerald-800 border-emerald-200"
          }`}>
            <Clock className="w-4 h-4" />
            <span>Time Left: {timeLeft || "15:00"}</span>
          </div>
        </div>
      </div>

      {error ? (
        <div className="p-6 bg-red-50/70 border border-red-200/70 rounded-2xl text-red-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-red-600" />
          <div>
            <h3 className="font-semibold text-sm">Session Load Failed</h3>
            <p className="text-xs text-red-700 mt-1">{error}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Side: Live QR Display */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center space-y-4">
            <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Project in Classroom</span>
              <span className="text-xs text-slate-400 font-mono">Scan via App or /scan</span>
            </div>

            <div className="p-6 bg-white border-2 border-slate-200 rounded-2xl shadow-inner flex flex-col items-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(
                  JSON.stringify({
                    type: "attendance",
                    session_id: sessionId,
                  })
                )}`}
                alt="Attendance QR Code"
                className="w-64 h-64 object-contain rounded-lg"
              />
            </div>

            <p className="text-xs text-slate-500 max-w-xs">
              Students open <code className="font-mono text-[#0F766E]">/scan</code> on their mobile browsers to register attendance directly.
            </p>

            <div className="w-full pt-2">
              <Link
                href="/scan"
                target="_blank"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-medium transition"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Test Scanner in New Tab
              </Link>
            </div>
          </div>

          {/* Right Side: Live Attendance Roll */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center text-[#0F766E]">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Students Present</h3>
                  <p className="text-xs text-slate-500">Real-time attendance ledger</p>
                </div>
              </div>
              <div className="px-3.5 py-1.5 bg-[#0F766E] text-white rounded-xl text-sm font-bold shadow-sm">
                {session?.total_marked || 0} Marked
              </div>
            </div>

            {loading && !session ? (
              <div className="flex items-center justify-center py-16">
                <RefreshCw className="w-6 h-6 text-[#0F766E] animate-spin" />
              </div>
            ) : session?.records && session.records.length > 0 ? (
              <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Reg No</th>
                      <th className="py-2.5 px-3">Email</th>
                      <th className="py-2.5 px-3">Marked At</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {session.records.map((rec, idx) => (
                      <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{rec.student_reg_no}</td>
                        <td className="py-2.5 px-3 text-slate-600">{rec.student_email}</td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {new Date(rec.marked_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Present
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">Awaiting student scans</p>
                <p className="text-xs text-slate-400 mt-1">Students will appear here immediately upon scanning the QR code.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
