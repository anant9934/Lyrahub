"use client";

import React from "react";

export function PrivacyBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    public: "bg-[#EEF3EE] text-[#7A9A7E]",
    alumni_only: "bg-[#EAF0F3] text-[#6B8FA3]",
    private: "bg-[#F5EAEA] text-[#B85C5C]",
  };

  const style = styles[level?.toLowerCase()] || "bg-gray-100 text-gray-700";

  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${style}`}>
      {level?.replace("_", " ") || "public"}
    </span>
  );
}
