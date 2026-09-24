"use client";

import React, { useState } from "react";

export default function MyEventsPage() {
  const [activeTab, setActiveTab] = useState("Registrations");

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-[#1E1E1E] mb-6">My Events</h1>

      <div className="border-b border-[#D6D6D6] mb-8">
        <nav className="flex gap-8">
          {["Registrations", "Organized by Me"].map(tab => (
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

      <div className="text-center py-20 text-gray-500">
        Feature under development. Here you will see your {activeTab.toLowerCase()}.
      </div>
    </div>
  );
}
