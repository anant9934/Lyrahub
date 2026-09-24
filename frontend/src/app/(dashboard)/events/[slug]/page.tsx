"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getCookie } from "cookies-next";
import { format } from "date-fns";

export default function EventDetailPage() {
  const { slug } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");

  useEffect(() => {
    if (slug) {
      fetchEvent();
    }
  }, [slug]);

  const fetchEvent = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/events/${slug}`, {
        headers: { "Authorization": `Bearer ${getCookie("token")}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEvent(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/events/${event.id}/register`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${getCookie("token")}` }
      });
      if (res.ok) {
        alert("Registered successfully!");
        fetchEvent(); // Refresh count
      } else {
        const err = await res.json();
        alert(`Failed: ${err.detail}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) return <div className="p-8">Loading event details...</div>;
  if (!event) return <div className="p-8">Event not found</div>;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero */}
      <div 
        className="h-64 bg-gray-300 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${event.cover_image_url || 'https://via.placeholder.com/1200x400'})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="absolute bottom-0 p-8 text-white">
          <span className="uppercase text-xs font-bold bg-[#EE8E1E] px-2 py-1 rounded-full mb-2 inline-block">
            {event.event_type}
          </span>
          <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
          <p className="text-lg opacity-90">
            {event.start_datetime ? format(new Date(event.start_datetime), "MMM d, yyyy h:mm a") : "TBA"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#D6D6D6] px-8 bg-white">
        <nav className="flex gap-8">
          {["Overview", "Agenda", "Registrations", "Photos", "Feedback"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 font-semibold border-b-2 transition ${
                activeTab === tab ? "border-[#EE8E1E] text-[#EE8E1E]" : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-8 bg-[#F9F9F9] min-h-screen">
        {activeTab === "Overview" && (
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 bg-white p-6 rounded-lg border border-[#D6D6D6]">
              <h2 className="text-2xl font-bold mb-4 text-[#1E1E1E]">About the Event</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{event.description || "No description provided."}</p>
            </div>
            
            <div className="w-full md:w-1/3 bg-white p-6 rounded-lg border border-[#D6D6D6] space-y-4 h-fit">
              <div>
                <h3 className="text-sm text-gray-500 font-bold uppercase mb-1">Venue</h3>
                <p className="font-semibold">{event.mode === "online" ? "Online" : event.venue || "TBA"}</p>
              </div>
              <div>
                <h3 className="text-sm text-gray-500 font-bold uppercase mb-1">Capacity</h3>
                <p className="font-semibold">{event.registration_count} / {event.capacity || "Unlimited"}</p>
              </div>
              <div>
                <h3 className="text-sm text-gray-500 font-bold uppercase mb-1">Status</h3>
                <p className="font-semibold capitalize">{event.status}</p>
              </div>

              {event.status === "published" && (
                <button 
                  onClick={handleRegister}
                  className="w-full mt-4 py-3 bg-[#EE8E1E] text-white font-bold rounded hover:bg-[#d67b15] transition"
                >
                  Register Now
                </button>
              )}
            </div>
          </div>
        )}
        
        {activeTab !== "Overview" && (
          <div className="bg-white p-8 rounded-lg border border-[#D6D6D6]">
            <h2 className="text-xl font-bold text-gray-500 text-center py-10">
              {activeTab} content is not available yet.
            </h2>
          </div>
        )}
      </div>
    </div>
  );
}
