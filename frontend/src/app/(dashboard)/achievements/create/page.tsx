"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from "cookies-next";

export default function CreateAchievementPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "academic",
    level: "college",
    issuer: "",
    achieved_on: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/api/v1/achievements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getCookie("token")}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert("Achievement submitted successfully!");
        router.push("/achievements/me");
      } else {
        alert("Failed to submit achievement");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-[#1E1E1E] mb-8">Add Achievement</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg border border-[#D6D6D6] space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
          <input 
            required 
            type="text"
            className="w-full p-3 border rounded focus:ring-2 focus:ring-[#EE8E1E] outline-none"
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
          <textarea 
            rows={4}
            className="w-full p-3 border rounded focus:ring-2 focus:ring-[#EE8E1E] outline-none"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
            <select 
              className="w-full p-3 border rounded focus:ring-2 focus:ring-[#EE8E1E] outline-none bg-white"
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
            >
              <option value="academic">Academic</option>
              <option value="research">Research</option>
              <option value="competition">Competition</option>
              <option value="sports">Sports</option>
              <option value="cultural">Cultural</option>
              <option value="entrepreneurship">Entrepreneurship</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Level</label>
            <select 
              className="w-full p-3 border rounded focus:ring-2 focus:ring-[#EE8E1E] outline-none bg-white"
              value={formData.level}
              onChange={e => setFormData({...formData, level: e.target.value})}
            >
              <option value="college">College</option>
              <option value="university">University</option>
              <option value="state">State</option>
              <option value="national">National</option>
              <option value="international">International</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Issuer / Organizer</label>
            <input 
              type="text"
              className="w-full p-3 border rounded focus:ring-2 focus:ring-[#EE8E1E] outline-none"
              value={formData.issuer}
              onChange={e => setFormData({...formData, issuer: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
            <input 
              type="date"
              className="w-full p-3 border rounded focus:ring-2 focus:ring-[#EE8E1E] outline-none"
              value={formData.achieved_on}
              onChange={e => setFormData({...formData, achieved_on: e.target.value})}
            />
          </div>
        </div>

        <button type="submit" className="w-full py-3 bg-[#1E1E1E] text-white font-bold rounded hover:bg-gray-800 transition">
          Submit Achievement
        </button>
      </form>
    </div>
  );
}
