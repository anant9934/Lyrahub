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
    <div className="mx-auto max-w-6xl space-y-5">
      {/* Hero */}
      <div 
        className="relative min-h-[320px] overflow-hidden rounded-[28px] bg-[#071b3d] bg-cover bg-center shadow-[0_18px_45px_rgba(7,27,61,0.15)]"
        style={{ backgroundImage: `url(${event.cover_image_url || '/images/hero-campus.webp'})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#071b3d]/95 via-[#071b3d]/80 to-[#071b3d]/20" />
        <div className="absolute bottom-0 max-w-3xl p-7 text-white sm:p-10">
          <span className="mb-4 inline-block rounded-full bg-[#ffcf36] px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-[#071b3d]">
            {event.event_type}
          </span>
          <h1 className="mb-3 text-3xl font-black leading-[1.04] tracking-[-0.055em] text-white sm:text-5xl">{event.title}</h1>
          <p className="text-sm font-semibold text-[#c5dcfa]">
            {event.start_datetime ? format(new Date(event.start_datetime), "MMM d, yyyy h:mm a") : "TBA"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto rounded-2xl border border-[#DCE5F1] bg-white px-4 sm:px-8">
        <nav className="flex min-w-max gap-6">
          {["Overview", "Agenda", "Registrations", "Photos", "Feedback"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 font-semibold border-b-2 transition ${
                activeTab === tab ? "border-[#1478ef] text-[#1478ef]" : "border-transparent text-[#667A93] hover:text-[#081a39]"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="min-h-[420px] rounded-[24px] bg-[#f6f8fc] p-4 sm:p-8">
        {activeTab === "Overview" && (
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 rounded-2xl border border-[#DCE5F1] bg-white p-6">
              <h2 className="text-2xl font-bold mb-4 text-[#0F172A]">About the Event</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{event.description || "No description provided."}</p>
            </div>
            
            <div className="h-fit w-full space-y-4 rounded-2xl border border-[#DCE5F1] bg-white p-6 md:w-1/3">
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
                  className="mt-4 w-full rounded-full bg-[#1478ef] py-3 font-bold text-white transition hover:bg-[#075fc9]"
                >
                  Register Now
                </button>
              )}
            </div>
          </div>
        )}
        
        {activeTab !== "Overview" && (
          <div className="rounded-2xl border border-[#DCE5F1] bg-white p-8">
            <h2 className="text-xl font-bold text-gray-500 text-center py-10">
              {activeTab} content is not available yet.
            </h2>
          </div>
        )}
      </div>
    </div>
  );
}
