import React from "react"
import Link from "next/link"
import Image from "next/image"
import { Calendar, Users, MapPin, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function EventCard({ event }: { event: any }) {
  // Format date display
  const dateDisplay = event.start_datetime
    ? new Date(event.start_datetime).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : event.date || "20 - 22 Sep 2026"

  const registeredCount = event.registration_count || event.registered_count || 120

  return (
    <div className="rounded-lg border border-[#E5E5E5] bg-white p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 hover:border-[#111111] transition-all group">
      {/* Thumbnail + Details */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-[#111111] text-white flex items-center justify-center font-bold text-lg overflow-hidden shrink-0 relative">
          {event.cover_image_url ? (
            <img
              src={event.cover_image_url}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-2 text-center">
              <Calendar className="w-6 h-6 text-[#93C5FD]" />
            </div>
          )}
        </div>

        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#777777] font-medium flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#888888]" />
              {dateDisplay}
            </span>
            <Badge variant="info" className="text-[10px] capitalize font-medium">
              {event.event_type || "Workshop"}
            </Badge>
          </div>

          <h3 className="text-sm sm:text-base font-semibold text-[#111111] truncate group-hover:text-[#2563EB] transition-colors">
            {event.title}
          </h3>

          <div className="flex items-center gap-3 text-[11px] text-[#777777]">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#888888]" />
              {event.location || "Academic Auditorium & Lab 3"}
            </span>
          </div>
        </div>
      </div>

      {/* Right side: Registration count & Action matching Panel 9 */}
      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E5E5E5]">
        <div className="text-left sm:text-right">
          <span className="text-xs font-semibold text-[#111111]">
            {registeredCount} Registered
          </span>
          <div className="text-[10px] text-[#16A34A] font-medium">
            Open for RSVP
          </div>
        </div>

        <Link
          href={`/events/${event.slug || event.id}`}
          className="px-4 py-2 rounded-lg bg-[#111111] text-white hover:bg-neutral-800 text-xs font-medium transition-colors shrink-0"
        >
          View Details
        </Link>
      </div>
    </div>
  )
}
