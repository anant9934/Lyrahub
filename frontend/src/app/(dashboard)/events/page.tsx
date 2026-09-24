"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getCookie } from "cookies-next";
import { EventCard } from "@/components/features/events/EventCard";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState("student");

  useEffect(() => {
    // Basic role check from a decoded token or separate /me endpoint
    // For now we assume role is in localStorage or fetch it
    const storedRole = localStorage.getItem("userRole") || "student";
    setRole(storedRole);
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/events", {
        headers: { "Authorization": `Bearer ${getCookie("token")}` }
      });
      const data = await res.json();
      setEvents(data.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#1E1E1E]">Events</h1>
        <div className="flex gap-4">
          <Link href="/events/me" className="px-4 py-2 text-[#1E1E1E] bg-[#D6D6D6] rounded hover:bg-gray-300 transition">
            My Events
          </Link>
          {["faculty", "hod", "admin"].includes(role) && (
            <Link href="/events/create" className="px-4 py-2 text-white bg-[#EE8E1E] rounded hover:bg-[#d67b15] transition">
              Create Event
            </Link>
          )}
        </div>
      </div>

      {/* Basic Filters (Implementation skipped for brevity, matching ui-unidale) */}
      <div className="mb-6 p-4 bg-white border border-[#D6D6D6] rounded flex gap-4">
        <input type="text" placeholder="Search events..." className="p-2 border rounded w-full" />
        <select className="p-2 border rounded bg-white">
          <option value="">All Types</option>
          <option value="workshop">Workshop</option>
          <option value="hackathon">Hackathon</option>
          <option value="seminar">Seminar</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No events yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.map((event: any) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
