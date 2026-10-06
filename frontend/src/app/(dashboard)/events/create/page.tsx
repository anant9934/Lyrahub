"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from "cookies-next";

export default function CreateEventPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_type: "workshop",
    mode: "offline",
    venue: "",
    capacity: 100
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/api/v1/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getCookie("token")}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const data = await res.json();
        alert("Event created as draft!");
        router.push(`/events/${data.slug}`);
      } else {
        alert("Failed to create event");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-[#0F172A] mb-8">Create New Event</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg border border-[#DCE5F1] space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Event Title</label>
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
            <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
            <select 
              className="w-full p-3 border rounded focus:ring-2 focus:ring-[#EE8E1E] outline-none bg-white"
              value={formData.event_type}
              onChange={e => setFormData({...formData, event_type: e.target.value})}
            >
              <option value="workshop">Workshop</option>
              <option value="hackathon">Hackathon</option>
              <option value="seminar">Seminar</option>
              <option value="conference">Conference</option>
              <option value="cultural">Cultural</option>
              <option value="sports">Sports</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Mode</label>
            <select 
              className="w-full p-3 border rounded focus:ring-2 focus:ring-[#EE8E1E] outline-none bg-white"
              value={formData.mode}
              onChange={e => setFormData({...formData, mode: e.target.value})}
            >
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>

        <button type="submit" className="w-full py-3 bg-[#0F172A] text-white font-bold rounded hover:bg-gray-800 transition">
          Create Draft Event
        </button>
      </form>
    </div>
  );
}
