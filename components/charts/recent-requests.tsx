"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const data = [
  {
    name: "Mon",
    total: Math.floor(Math.random() * 12) + 1,
  },
  {
    name: "Tue",
    total: Math.floor(Math.random() * 12) + 1,
  },
  {
    name: "Wed",
    total: Math.floor(Math.random() * 12) + 1,
  },
  {
    name: "Thu",
    total: Math.floor(Math.random() * 12) + 1,
  },
  {
    name: "Fri",
    total: Math.floor(Math.random() * 12) + 1,
  },
  {
    name: "Sat",
    total: Math.floor(Math.random() * 12) + 1,
  },
  {
    name: "Sun",
    total: Math.floor(Math.random() * 12) + 1,
  },
]

export function RecentRequests() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Bar
          dataKey="total"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}