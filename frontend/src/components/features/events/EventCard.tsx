import React from "react";
import Link from "next/link";
import { format } from "date-fns";

export function EventCard({ event }) {
  const badgeColors: Record<string, string> = {
    workshop: "bg-[#94BD88] text-white", // sage
    hackathon: "bg-[#EE8E1E] text-white", // amber
    seminar: "bg-[#7195BB] text-white", // info
    conference: "bg-[#1E1E1E] text-white", // ink
    cultural: "bg-[#E3664C] text-white", // warning
    sports: "bg-[#94BD88] text-white", // success
  };
  
  const color = badgeColors[event.event_type] || "bg-gray-200 text-gray-800";

  return (
    <div className="bg-white border border-[#D6D6D6] rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div 
        className="h-40 bg-gray-200 bg-cover bg-center"
        style={{ backgroundImage: `url(${event.cover_image_url || 'https://via.placeholder.com/400x200?text=Event'})` }}
      />
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${color}`}>
            {event.event_type}
          </span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {event.mode}
          </span>
        </div>
        <h3 className="text-xl font-bold text-[#1E1E1E] mb-1 truncate">{event.title}</h3>
        <p className="text-sm text-gray-600 mb-4">
          {event.start_datetime ? format(new Date(event.start_datetime), "MMM d, yyyy h:mm a") : "TBA"}
        </p>
        <Link 
          href={`/events/${event.slug}`}
          className="block text-center px-4 py-2 bg-[#1E1E1E] text-white rounded hover:bg-gray-800 transition"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
