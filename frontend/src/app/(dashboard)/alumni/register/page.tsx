"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AlumniRegistrationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    reg_no: "",
    phone: "",
    graduation_year: "2024",
    program: "B.Tech CSE (AI & ML)",
    degree: "B.Tech",
    current_company: "",
    current_role: "",
    location: "",
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",
    bio: "",
    open_to_mentorship: false,
    open_to_hiring: false,
    willing_to_visit: false,
    privacy_level: "public",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...formData,
        graduation_year: parseInt(formData.graduation_year) || 2024,
      };

      const res = await fetch("http://localhost:8000/api/v1/alumni/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Registration failed");
      }

      // Auto-login
      const loginRes = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          username: formData.email,
          password: formData.password,
        }),
      });

      if (loginRes.ok) {
        const loginData = await loginRes.json();
        localStorage.setItem("token", loginData.access_token);
        localStorage.setItem("userRole", "alumni");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/alumni/me");
      }, 1500);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6 bg-[#F2F2F1] min-h-screen">
      <Link href="/alumni" className="text-xs font-semibold text-[#5C5C5C] hover:text-[#1E1E1E]">
        ← Back to Alumni Directory
      </Link>

      <div className="bg-white border border-[#D6D6D6] rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-extrabold text-[#1E1E1E]">Register as Department Alumni</h1>
        <p className="text-xs text-[#5C5C5C] mt-1 mb-6">
          Join our global network of AI/ML department alumni. If you provide your college Reg No, academic details will be verified automatically.
        </p>

        {error && (
          <div className="p-3 mb-6 bg-[#F5EAEA] border border-[#B85C5C] text-[#B85C5C] text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 mb-6 bg-[#EEF3EE] border border-[#7A9A7E] text-[#7A9A7E] text-sm rounded-xl font-bold">
            Registration successful! Signing you in...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Account credentials */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E1E1E] mb-3">1. Account Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1E1E1E] mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  className="w-full px-3.5 py-2 text-sm bg-[#F2F2F1] border border-[#D6D6D6] rounded-xl focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1E1E1E] mb-1">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 text-sm bg-[#F2F2F1] border border-[#D6D6D6] rounded-xl focus:outline-none"
                  required
                  minLength={6}
                />
              </div>
            </div>
          </div>

          {/* Academic identity */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E1E1E] mb-3">2. Academic Record</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1E1E1E] mb-1">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="e.g. Ananya Sharma"
                  className="w-full px-3.5 py-2 text-sm bg-[#F2F2F1] border border-[#D6D6D6] rounded-xl focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1E1E1E] mb-1">Original Reg No</label>
                <input
                  type="text"
                  name="reg_no"
                  value={formData.reg_no}
                  onChange={handleChange}
                  placeholder="e.g. RA2211003010001"
                  className="w-full px-3.5 py-2 text-sm bg-[#F2F2F1] border border-[#D6D6D6] rounded-xl focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1E1E1E] mb-1">Graduation Year *</label>
                <input
                  type="number"
                  name="graduation_year"
                  value={formData.graduation_year}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm bg-[#F2F2F1] border border-[#D6D6D6] rounded-xl focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1E1E1E] mb-1">Program</label>
                <input
                  type="text"
                  name="program"
                  value={formData.program}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm bg-[#F2F2F1] border border-[#D6D6D6] rounded-xl focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Professional Current */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E1E1E] mb-3">3. Current Role</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1E1E1E] mb-1">Current Company</label>
                <input
                  type="text"
                  name="current_company"
                  value={formData.current_company}
                  onChange={handleChange}
                  placeholder="e.g. Microsoft Research"
                  className="w-full px-3.5 py-2 text-sm bg-[#F2F2F1] border border-[#D6D6D6] rounded-xl focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1E1E1E] mb-1">Current Role / Title</label>
                <input
                  type="text"
                  name="current_role"
                  value={formData.current_role}
                  onChange={handleChange}
                  placeholder="e.g. Machine Learning Scientist"
                  className="w-full px-3.5 py-2 text-sm bg-[#F2F2F1] border border-[#D6D6D6] rounded-xl focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1E1E1E] mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Bengaluru, India"
                  className="w-full px-3.5 py-2 text-sm bg-[#F2F2F1] border border-[#D6D6D6] rounded-xl focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1E1E1E] mb-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  className="w-full px-3.5 py-2 text-sm bg-[#F2F2F1] border border-[#D6D6D6] rounded-xl focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Social Links & Bio */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E1E1E] mb-3">4. Links & Bio</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <input
                type="url"
                name="linkedin_url"
                value={formData.linkedin_url}
                onChange={handleChange}
                placeholder="LinkedIn Profile URL"
                className="px-3.5 py-2 text-sm bg-[#F2F2F1] border border-[#D6D6D6] rounded-xl focus:outline-none"
              />
              <input
                type="url"
                name="github_url"
                value={formData.github_url}
                onChange={handleChange}
                placeholder="GitHub Profile URL"
                className="px-3.5 py-2 text-sm bg-[#F2F2F1] border border-[#D6D6D6] rounded-xl focus:outline-none"
              />
              <input
                type="url"
                name="portfolio_url"
                value={formData.portfolio_url}
                onChange={handleChange}
                placeholder="Portfolio URL"
                className="px-3.5 py-2 text-sm bg-[#F2F2F1] border border-[#D6D6D6] rounded-xl focus:outline-none"
              />
            </div>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              placeholder="Short bio about your career path since graduation..."
              className="w-full px-3.5 py-2 text-sm bg-[#F2F2F1] border border-[#D6D6D6] rounded-xl focus:outline-none"
            />
          </div>

          {/* Preferences */}
          <div className="pt-2 border-t border-[#D6D6D6] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E1E1E]">5. Engagement & Privacy</h3>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-xs font-semibold text-[#1E1E1E] cursor-pointer">
                <input
                  type="checkbox"
                  name="open_to_mentorship"
                  checked={formData.open_to_mentorship}
                  onChange={handleChange}
                />
                Open to Mentoring Students
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-[#1E1E1E] cursor-pointer">
                <input
                  type="checkbox"
                  name="open_to_hiring"
                  checked={formData.open_to_hiring}
                  onChange={handleChange}
                />
                Currently Hiring for my Team
              </label>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1E1E1E] mb-1">Directory Privacy Level</label>
              <select
                name="privacy_level"
                value={formData.privacy_level}
                onChange={handleChange}
                className="px-3 py-2 text-xs bg-[#F2F2F1] border border-[#D6D6D6] rounded-xl focus:outline-none"
              >
                <option value="public">Public (Visible to all students & visitors)</option>
                <option value="alumni_only">Alumni Only (Visible to fellow alumni & admin)</option>
                <option value="private">Private (Admin only)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-[#D6D6D6] flex justify-end">
            <button
              type="submit"
              disabled={loading || success}
              className="px-6 py-2.5 bg-[#1E1E1E] text-white text-xs font-bold rounded-xl hover:bg-gray-800 disabled:opacity-50 shadow-sm"
            >
              {loading ? "Registering..." : "Submit Registration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
