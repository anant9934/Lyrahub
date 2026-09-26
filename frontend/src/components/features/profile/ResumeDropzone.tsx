"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import api from "@/lib/api";

interface ResumeDropzoneProps {
  onSuccess?: () => void;
}

export function ResumeDropzone({ onSuccess }: ResumeDropzoneProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const computeSHA256 = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  };

  const validateMagicBytes = async (file: File): Promise<boolean> => {
    const slice = file.slice(0, 5);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const header = Array.from(bytes).map(b => String.fromCharCode(b)).join("");
    return header === "%PDF-";
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      // Validate magic bytes
      const isPdf = await validateMagicBytes(file);
      if (!isPdf) {
        throw new Error("Invalid file format. Only true PDF files are allowed.");
      }

      const contentHash = await computeSHA256(file);

      // 1. Presign
      const presignRes = await api.post("/students/me/resume/presign", {
        filename: file.name,
        content_type: file.type,
        size: file.size,
      });

      const { upload_url, file_id, key } = presignRes.data;

      // 2. Upload
      const formData = new FormData();
      formData.append("file", file);

      await api.post(upload_url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(pct);
          }
        },
      });

      // 3. Confirm
      await api.post("/students/me/resume/confirm", {
        file_id,
        key,
        content_hash: contentHash,
      });

      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || "An error occurred during upload.");
    } finally {
      setUploading(false);
    }
  }, [onSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  return (
    <div className="mt-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-10 text-center rounded-lg cursor-pointer transition-colors ${
          isDragActive ? "border-sage-500 bg-canvas-alt" : "border-[#D6D6D6] hover:border-[#94BD88]"
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-ink-500">Drop the PDF here ...</p>
        ) : (
          <p className="text-ink-500">Drag & drop your resume (PDF only, max 10MB), or click to select</p>
        )}
      </div>

      {uploading && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-ink-500 mb-1">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-canvas-alt rounded-full h-2">
            <div
              className="bg-[#94BD88] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200">
          {error}
        </div>
      )}
    </div>
  );
}
