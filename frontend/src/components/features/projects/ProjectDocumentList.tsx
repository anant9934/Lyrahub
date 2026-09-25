"use client";

import React, { useState } from "react";

interface Doc {
  id: string;
  doc_type: string;
  file_url: string;
  uploaded_at?: string;
}

interface ProjectDocumentListProps {
  documents: Doc[];
  projectId: string;
  canManage: boolean;
  onDocumentUploaded?: () => void;
}

export function ProjectDocumentList({
  documents,
  projectId,
  canManage,
  onDocumentUploaded,
}: ProjectDocumentListProps) {
  const [docType, setDocType] = useState("report");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("doc_type", docType);
    formData.append("file", file);

    try {
      const res = await fetch(`http://localhost:8000/api/v1/projects/${projectId}/documents`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to upload document");
      }

      setFile(null);
      if (onDocumentUploaded) onDocumentUploaded();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {documents.length === 0 ? (
          <div className="p-6 text-center text-sm text-[#5C5C5C] bg-[#F2F2F1] rounded-xl border border-[#D6D6D6]">
            No documents uploaded for this project yet.
          </div>
        ) : (
          documents.map((d) => (
            <div
              key={d.id}
              className="p-4 bg-white border border-[#D6D6D6] rounded-xl flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#EAF0F3] text-[#6B8FA3] flex items-center justify-center font-bold text-xs uppercase">
                  {d.doc_type?.slice(0, 3) || "DOC"}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#1E1E1E] capitalize">
                    {d.doc_type}
                  </div>
                  <div className="text-xs text-[#5C5C5C]">
                    {d.uploaded_at ? new Date(d.uploaded_at).toLocaleDateString() : ""}
                  </div>
                </div>
              </div>
              <a
                href={d.file_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold px-3 py-1.5 bg-[#F2F2F1] border border-[#D6D6D6] rounded-lg hover:bg-gray-200 transition"
              >
                Download / View
              </a>
            </div>
          ))
        )}
      </div>

      {canManage && (
        <form onSubmit={handleUpload} className="p-5 bg-[#F2F2F1] border border-[#D6D6D6] rounded-xl space-y-3">
          <h4 className="text-sm font-bold text-[#1E1E1E]">Upload Project Document</h4>
          {error && <div className="text-xs text-[#B85C5C]">{error}</div>}
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="px-3 py-2 text-sm bg-white border border-[#D6D6D6] rounded-lg focus:outline-none"
            >
              <option value="report">Project Report</option>
              <option value="presentation">Presentation</option>
              <option value="poster">Poster</option>
              <option value="paper">Research Paper</option>
            </select>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="flex-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#1E1E1E] file:text-white hover:file:bg-gray-800"
              required
            />
            <button
              type="submit"
              disabled={uploading || !file}
              className="px-4 py-2 bg-[#1E1E1E] text-white text-sm font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
