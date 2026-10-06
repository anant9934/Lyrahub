"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Camera, 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ArrowLeft, 
  Sparkles, 
  Upload, 
  Keyboard 
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { WorkspaceHero } from "@/components/layout/WorkspaceHero";

export default function QRScannerPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"camera" | "manual">("camera");
  const [manualCode, setManualCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scannerRef = useRef<any>(null);

  const processScannedData = async (rawText: string) => {
    setStatusMessage(null);
    setIsSubmitting(true);
    let parsed: any = null;

    try {
      parsed = JSON.parse(rawText);
    } catch {
      // Not JSON, check if it's a URL or plain session ID
      if (rawText.includes("http")) {
        setStatusMessage({
          type: "info",
          text: `External link detected: ${rawText}`
        });
        setScanResult({ type: "url", url: rawText });
        setIsSubmitting(false);
        return;
      }
      parsed = { raw: rawText };
    }

    setScanResult(parsed);

    // If attendance session
    if (parsed.type === "attendance" || parsed.session_id) {
      const sessionId = parsed.session_id || parsed.id;
      try {
        const res = await api.post("/qr/attendance/mark", {
          session_id: sessionId,
          scanned_at: new Date().toISOString()
        });
        setStatusMessage({
          type: "success",
          text: `Attendance marked successfully! (Session: ${sessionId})`
        });
      } catch (err: any) {
        console.error("Attendance submission error:", err);
        const detail = err.response?.data?.detail || "Failed to mark attendance";
        setStatusMessage({
          type: "error",
          text: detail
        });
      }
    } else if (parsed.type === "event_register" || parsed.event_id) {
      setStatusMessage({
        type: "success",
        text: `Event QR verified for Event ID: ${parsed.event_id}`
      });
    } else if (parsed.type === "student_signup") {
      setStatusMessage({
        type: "success",
        text: `Verified student credential for Reg No: ${parsed.reg_no || parsed.student_id}`
      });
    } else {
      setStatusMessage({
        type: "info",
        text: `Scanned barcode: ${typeof parsed === "object" ? JSON.stringify(parsed) : parsed}`
      });
    }

    setIsSubmitting(false);
  };

  useEffect(() => {
    let html5QrCode: any = null;

    if (activeTab === "camera") {
      // Dynamic import html5-qrcode
      import("html5-qrcode").then((module) => {
        const Html5Qrcode = module.Html5Qrcode;
        html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;

        Html5Qrcode.getCameras()
          .then((cameras) => {
            if (cameras && cameras.length) {
              const cameraId = cameras[cameras.length - 1].id; // Back camera on mobile
              html5QrCode
                .start(
                  cameraId,
                  {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                  },
                  (decodedText: string) => {
                    html5QrCode.stop().catch(() => {});
                    setScanning(false);
                    processScannedData(decodedText);
                  },
                  () => {}
                )
                .then(() => setScanning(true))
                .catch((err: any) => {
                  console.warn("Unable to start camera:", err);
                  setActiveTab("manual");
                });
            } else {
              setActiveTab("manual");
            }
          })
          .catch(() => {
            setActiveTab("manual");
          });
      }).catch((e) => {
        console.error("Error loading html5-qrcode:", e);
        setActiveTab("manual");
      });
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [activeTab]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    processScannedData(manualCode.trim());
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Dashboard
        </Link>
      </div>

      <WorkspaceHero eyebrow="Campus tools" title={<>Scan. Check in. <span className="text-[#1478ef]">Keep moving.</span></>} description="Use your camera or enter a code to scan attendance screens, event passes, and student badges." tone="blue" icon={QrCode} />

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl">
        <button
          onClick={() => setActiveTab("camera")}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === "camera"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Camera className="w-4 h-4" /> Camera Scan
        </button>
        <button
          onClick={() => setActiveTab("manual")}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === "manual"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Keyboard className="w-4 h-4" /> Manual Code / JSON
        </button>
      </div>

      {/* Scanner Box */}
      <div className="rounded-[26px] border border-[#dce5f1] bg-white p-6 shadow-[0_14px_38px_rgba(8,26,57,0.07)]">
        {activeTab === "camera" ? (
          <div className="space-y-4">
            <div
              id="reader"
              className="w-full min-h-[300px] overflow-hidden rounded-2xl bg-black border border-slate-200"
            />
            <p className="text-xs text-center text-slate-400">
              Point your camera steadily at the classroom or event barcode.
            </p>
          </div>
        ) : (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Paste QR Payload or Session ID
              </label>
              <textarea
                rows={4}
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder='e.g. {"type": "attendance", "session_id": "..."}'
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !manualCode.trim()}
              className="w-full py-2.5 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-xl text-xs font-semibold transition disabled:opacity-50"
            >
              {isSubmitting ? "Processing..." : "Submit Code"}
            </button>
          </form>
        )}
      </div>

      {/* Status Feedback */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border text-sm flex items-start gap-3 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
              : statusMessage.type === "error"
              ? "bg-red-50 text-red-900 border-red-200"
              : "bg-slate-50 text-slate-900 border-slate-200"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="font-semibold text-xs">{statusMessage.text}</p>
            {scanResult && (
              <pre className="mt-2 p-2 bg-black/5 rounded-lg text-[11px] overflow-x-auto font-mono">
                {JSON.stringify(scanResult, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
