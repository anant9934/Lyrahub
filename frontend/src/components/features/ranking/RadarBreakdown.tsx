import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export function RadarBreakdown({ breakdown }: { breakdown: any }) {
  if (!breakdown) return <div className="text-gray-500">No breakdown available.</div>;

  const data = [
    { subject: 'Test Score', A: breakdown.test_score || 0, fullMark: 1 },
    { subject: 'CGPA', A: breakdown.cgpa || 0, fullMark: 1 },
    { subject: 'Certs', A: breakdown.certifications || 0, fullMark: 1 },
    { subject: 'Projects', A: breakdown.projects || 0, fullMark: 1 },
    { subject: 'Code', A: breakdown.coding_stats || 0, fullMark: 1 },
    { subject: 'Resume', A: breakdown.resume_quality || 0, fullMark: 1 },
    { subject: 'Interns', A: breakdown.internships || 0, fullMark: 1 },
    { subject: 'Revenue', A: breakdown.revenue || 0, fullMark: 1 },
  ];

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#1E1E1E', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 1]} tick={false} />
          <Radar
            name="Score"
            dataKey="A"
            stroke="#EE8E1E"
            fill="#EE8E1E"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
