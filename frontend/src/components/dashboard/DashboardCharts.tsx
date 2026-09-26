"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"

interface PlacementDataPoint {
  year: string
  placed: number
  notPlaced: number
}

interface UserDistributionDataPoint {
  name: string
  value: number
  color: string
}

interface ActivityDataPoint {
  date: string
  count: number
}

export function PlacementChart({ data }: { data: PlacementDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
        <XAxis dataKey="year" tickLine={false} tick={{ fontSize: 11, fill: "#888888" }} />
        <YAxis tickLine={false} tick={{ fontSize: 11, fill: "#888888" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#FFFFFF",
            borderColor: "#E5E5E5",
            borderRadius: "8px",
            fontSize: "12px",
          }}
        />
        <Bar dataKey="placed" fill="#2563EB" radius={[4, 4, 0, 0]} />
        <Bar dataKey="notPlaced" fill="#93C5FD" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function UserDistributionChart({ data }: { data: UserDistributionDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
}

export function SystemActivityChart({ data }: { data: ActivityDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="activityGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
        <XAxis dataKey="date" tickLine={false} tick={{ fontSize: 11, fill: "#888888" }} />
        <YAxis tickLine={false} tick={{ fontSize: 11, fill: "#888888" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#FFFFFF",
            borderColor: "#E5E5E5",
            borderRadius: "8px",
            fontSize: "12px",
          }}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#2563EB"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#activityGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
