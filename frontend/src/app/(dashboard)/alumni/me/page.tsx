"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ExperienceTimeline } from "@/components/features/alumni/ExperienceTimeline";
import { PrivacyBadge } from "@/components/features/alumni/PrivacyBadge";

export default function MyAlumniProfilePage() {
  const [alumni, setAlumni] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    current_company: "",
    current_role: "",
    location: "",
    phone: "",
    bio: "",
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",
    open_to_mentorship: false,
    open_to_hiring: false,
    willing_to_visit: false,
    privacy_level: "public",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/alumni/me", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAlumni(data);
        setFormData({
          current_company: data.current_company || "",
          current_role: data.current_role || "",
          location: data.location || "",
          phone: data.phone || "",
          bio: data.bio || "",
          linkedin_url: data.linkedin_url || "",
          github_url: data.github_url || "",
          portfolio_url: data.portfolio_url || "",
          open_to_mentorship: !!data.open_to_mentorship,
          open_to_hiring: !!data.open_to_hiring,
          willing_to_visit: !!data.willing_to_visit,
          privacy_level: data.privacy_level || "public",
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("http://localhost:8000/api/v1/alumni/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const data = await res.json();
        setAlumni(data);
        setMessage("Profile updated successfully!");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleAddExperience = async (expData: any) => {
    const res = await fetch("http://localhost:8000/api/v1/alumni/me/experience", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
      body: JSON.stringify(expData),
    });
    if (res.ok) {
      fetchProfile();
    }
  };

  const handleDeleteExperience = async (expId: string) => {
    const res = await fetch(`http://localhost:8000/api/v1/alumni/me/experience/${expId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    });
    if (res.ok) {
      fetchProfile();
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-[#526783]">Loading your alumni profile...</div>;
  }

  if (!alumni) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-[#0F172A]">No Alumni Profile Found</h2>
        <p className="text-xs text-[#526783] mt-2 mb-4">You have not registered an alumni profile yet.</p>
        <Link
          href="/alumni/register"
          className="px-4 py-2 bg-[#0F172A] text-white text-xs font-semibold rounded-lg hover:bg-gray-800"
        >
          Register as Alumni
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 bg-[#F6F8FC] min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A]">Alumni Profile Editor</h1>
          <p className="text-xs text-[#526783] mt-0.5">
            Manage your career progression, mentoring preferences, and contact visibility.
          </p>
        </div>
        <Link
          href={`/alumni/${alumni.id}`}
          className="px-3.5 py-1.5 text-xs font-semibold bg-white border border-[#DCE5F1] rounded-xl hover:bg-gray-100 transition shadow-sm"
        >
          View Public Profile ↗
        </Link>
      </div>

      {message && (
        <div className="p-3 bg-[#EEF3EE] border border-[#7A9A7E] text-[#7A9A7E] text-xs rounded-xl font-bold">
          {message}
        </div>
      )}

      {/* Editor Form */}
      <form onSubmit={handleSave} className="bg-white border border-[#DCE5F1] rounded-2xl p-6 md:p-8 shadow-sm space-y-5">
        <div className="flex justify-between items-center border-b border-[#DCE5F1] pb-4">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A]">{alumni.full_name}</h3>
            <span className="text-xs text-[#526783]">
              {alumni.program} • Class of {alumni.graduation_year}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#526783]">Visibility:</span>
            <PrivacyBadge level={formData.privacy_level} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">Company</label>
            <input
              type="text"
              name="current_company"
              value={formData.current_company}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-sm bg-[#F6F8FC] border border-[#DCE5F1] rounded-xl focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">Role / Title</label>
            <input
              type="text"
              name="current_role"
              value={formData.current_role}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-sm bg-[#F6F8FC] border border-[#DCE5F1] rounded-xl focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-sm bg-[#F6F8FC] border border-[#DCE5F1] rounded-xl focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-sm bg-[#F6F8FC] border border-[#DCE5F1] rounded-xl focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={3}
            className="w-full px-3.5 py-2 text-sm bg-[#F6F8FC] border border-[#DCE5F1] rounded-xl focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="url"
            name="linkedin_url"
            value={formData.linkedin_url}
            onChange={handleChange}
            placeholder="LinkedIn URL"
            className="px-3.5 py-2 text-sm bg-[#F6F8FC] border border-[#DCE5F1] rounded-xl focus:outline-none"
          />
          <input
            type="url"
            name="github_url"
            value={formData.github_url}
            onChange={handleChange}
            placeholder="GitHub URL"
            className="px-3.5 py-2 text-sm bg-[#F6F8FC] border border-[#DCE5F1] rounded-xl focus:outline-none"
          />
          <input
            type="url"
            name="portfolio_url"
            value={formData.portfolio_url}
            onChange={handleChange}
            placeholder="Portfolio URL"
            className="px-3.5 py-2 text-sm bg-[#F6F8FC] border border-[#DCE5F1] rounded-xl focus:outline-none"
          />
        </div>

        <div className="pt-4 border-t border-[#DCE5F1] flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-xs font-semibold text-[#0F172A] cursor-pointer">
            <input
              type="checkbox"
              name="open_to_mentorship"
              checked={formData.open_to_mentorship}
              onChange={handleChange}
            />
            Open to Mentorship
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold text-[#0F172A] cursor-pointer">
            <input
              type="checkbox"
              name="open_to_hiring"
              checked={formData.open_to_hiring}
              onChange={handleChange}
            />
            Open to Hiring
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#0F172A]">Privacy:</span>
            <select
              name="privacy_level"
              value={formData.privacy_level}
              onChange={handleChange}
              className="px-2.5 py-1 text-xs bg-[#F6F8FC] border border-[#DCE5F1] rounded-lg focus:outline-none"
            >
              <option value="public">Public</option>
              <option value="alumni_only">Alumni Only</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-[#0F172A] text-white text-xs font-bold rounded-xl hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      {/* Experience Timeline */}
      <div className="bg-white border border-[#DCE5F1] rounded-2xl p-6 md:p-8 shadow-sm">
        <ExperienceTimeline
          experiences={alumni.experiences || []}
          isOwner={true}
          onAddExperience={handleAddExperience}
          onDeleteExperience={handleDeleteExperience}
        />
      </div>
    </div>
  );
}
