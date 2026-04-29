"use client"

import { useEffect, useState } from "react"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from "chart.js"

import { Bar, Pie, Line } from "react-chartjs-2"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
)

export default function Analytics(){

  const [links,setLinks] = useState([])

useEffect(() => {
  async function loadLinks() {
    try {
      const res = await fetch("http://localhost:5001/links")

      const text = await res.text()
      console.log("RAW (analytics):", text)

      const data = JSON.parse(text)

      if (!Array.isArray(data)) {
        console.error("Invalid data:", data)
        setLinks([])
        return
      }

      setLinks(data)

    } catch (err) {
      console.error(err)
      setLinks([])
    }
  }

  loadLinks()
}, [])

  const labels = Array.isArray(links) &&links.map(l => l.short_code || l.shortcode)
  const clicks = Array.isArray(links) &&links.map(l => l.clicks || 0)
  const pieColors = [
  "#6366F1",
  "#06B6D4",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#14B8A6",
  "#F43F5E"
]

  const totalClicks = clicks.reduce((a,b)=>a+b,0)

  const activeCount = links.filter(l =>
    l.expires_at && new Date(l.expires_at) > new Date()
  ).length

  const expiredCount = links.length - activeCount

  // ✅ BAR → ACTIVE vs EXPIRED
const statusBarData = {
  labels: ["Active", "Expired"],
  datasets: [
    {
      label: "Links",
      data: [activeCount, expiredCount],
      backgroundColor: [
        "rgba(34,197,94,0.8)",   // green
        "rgba(239,68,68,0.8)"    // red
      ],
      borderRadius: 10
    }
  ]
}

  // ✅ PIE → PER LINK CLICKS
  const pieData = {
    labels,
    datasets: [
  {
    data: clicks,
    backgroundColor: pieColors.slice(0, labels.length),
    borderColor: "#020617",
    borderWidth: 2,
    hoverOffset: 8
  }
]
  }

  // ✅ LINE → TREND
  const lineData = {
    labels,
    datasets:[
      {
        label:"Click Trend",
        data:clicks,
        borderColor:"#06B6D4",
        backgroundColor:"rgba(6,182,212,0.2)",
        tension:0.4
      }
    ]
  }

  const options = {
    plugins:{
      legend:{ labels:{ color:"#cbd5f5" } }
    },
    scales:{
      x:{ ticks:{ color:"#94a3b8" } },
      y:{ ticks:{ color:"#94a3b8" } }
    }
  }

  return(

    <div className="analyticsPage">

      <h1 className="analyticsTitle">Analytics Dashboard</h1>

      {/* KPI CARDS */}
      <div className="kpiGrid">

        <div className="kpiCard">
          <h3>{links.length}</h3>
          <p>Total Links</p>
        </div>

        <div className="kpiCard">
          <h3>{totalClicks}</h3>
          <p>Total Clicks</p>
        </div>

        <div className="kpiCard">
          <h3 style={{color:"#22C55E"}}>{activeCount}</h3>
          <p>Active</p>
        </div>

        <div className="kpiCard">
          <h3 style={{color:"#EF4444"}}>{expiredCount}</h3>
          <p>Expired</p>
        </div>

      </div>

      {/* CHARTS */}
      <div className="chartsGrid">

        <div className="chartCard">
          <h3>Link Status Overview</h3>
          <Bar data={statusBarData} options={options}/>
        </div>

        <div className="chartCard">
          <h3>Clicks Distribution by Link</h3>
          <Pie data={pieData}/>
        </div>

        <div className="chartCard fullWidth">
          <h3>Click Trend</h3>
          <Line data={lineData} options={options}/>
        </div>

      </div>

    </div>
  )
}