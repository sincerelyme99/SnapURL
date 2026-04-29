"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts"

export default function AnalyticsChart({ data }) {

  // guard 1: invalid data
  if (!Array.isArray(data)) {
    return <div style={{ color: "gray" }}>No data</div>
  }

  // guard 2: empty data
  if (data.length === 0) {
    return <p style={{ opacity: 0.6 }}>No analytics yet</p>
  }

  return (
    <div style={{ width: "100%", height: "200px", minHeight: "200px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="day"
            tickFormatter={(value) => {
              const d = new Date(value)
              return `${d.getDate()}/${d.getMonth() + 1}`
            }}
          />

          <YAxis />

          <Tooltip
            labelFormatter={(value) => {
              const d = new Date(value)
              return d.toDateString()
            }}
          />

          <Line
            type="monotone"
            dataKey="clicks"
            stroke="#6366f1"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}