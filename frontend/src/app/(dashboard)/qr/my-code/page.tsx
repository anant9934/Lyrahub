"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { QrCode, Download, RefreshCw, ShieldCheck, UserCheck, AlertCircle, ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function StudentQRCodePage() {
  const { user } = useAuth();
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQRCode() {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/qr/student/me", {
          responseType: "blob",
        });
        const objectUrl = URL.createObjectURL(res.data);
        setQrUrl(objectUrl);
      } catch (err: any) {
        console.error("Failed to load QR code:", err);
        setError(
          err.response?.data?.detail ||
          "Could not load your permanent QR code. Please ensure your student profile is set up."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchQRCode();

    return () => {
      if (qrUrl) {
        URL.revokeObjectURL(qrUrl);
      }
    };
  }, []);

  const handleDownload = () => {
    if (!qrUrl) return;
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = `student-qr-${user?.email || "code"}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Dashboard
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <QrCode className="w-7 h-7 text-[#0F766E]" />
            Permanent Student QR ID
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Your unique, cryptographically signed student QR identity valid for fast verification and check-ins.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
          <RefreshCw className="w-8 h-8 text-[#0F766E] animate-spin mb-3" />
          <p className="text-sm font-medium text-slate-600">Generating student QR code...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50/70 border border-red-200/70 rounded-2xl text-red-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-red-600" />
          <div>
            <h3 className="font-semibold text-sm">QR Code Unavailable</h3>
            <p className="text-xs text-red-700 mt-1">{error}</p>
            <Link
              href="/dashboard/profile"
              className="inline-block mt-3 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition"
            >
              Set Up Profile
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Main QR Card */}
          <div className="md:col-span-7 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col items-center text-center">
            <div className="w-full flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Active Token</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">90-Day Cryptographic Seal</span>
            </div>

            {/* QR Image Container */}
            <div className="p-5 bg-white border-2 border-dashed border-slate-200 rounded-2xl shadow-inner mb-6 transition-transform hover:scale-[1.02]">
              {qrUrl && (
                <img
                  src={qrUrl}
                  alt="Student QR Code"
                  className="w-64 h-64 object-contain rounded-lg"
                />
              )}
            </div>

            <div className="space-y-1 mb-6">
              <h2 className="text-lg font-bold text-slate-900">{(user as any)?.full_name || user?.email || "Department Student"}</h2>
              <p className="text-sm font-mono text-slate-500">{user?.email}</p>
            </div>


            <div className="w-full grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleDownload}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-xl text-sm font-medium transition shadow-sm"
              >
                <Download className="w-4 h-4" /> Download PNG
              </button>
              <Link
                href="/scan"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-sm font-medium transition"
              >
                <QrCode className="w-4 h-4" /> Open Scanner
              </Link>
            </div>
          </div>

          {/* Usage Information */}
          <div className="md:col-span-5 space-y-4">
            <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-6 space-y-4">
              <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0F766E]" /> Secure Verification
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                This barcode contains a tamper-evident JWT payload signed with the department&apos;s cryptographic security secret.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">
                    1
                  </div>
                  <div className="text-xs text-slate-600">
                    <strong className="text-slate-800">Event Check-In:</strong> Show this badge at symposiums, workshops, and AI/ML lab gates.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">
                    2
                  </div>
                  <div className="text-xs text-slate-600">
                    <strong className="text-slate-800">Fast Enrollment:</strong> Faculty and club leads scan this to register you instantly.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">
                    3
                  </div>
                  <div className="text-xs text-slate-600">
                    <strong className="text-slate-800">Offline Ready:</strong> Save the PNG to your phone gallery for offline inspection.
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl p-4 flex items-center gap-3">
              <UserCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-xs text-emerald-800">
                Linked to student registry. Updates to your profile reflect automatically on scanned lookups.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
