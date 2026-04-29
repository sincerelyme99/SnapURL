"use client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import AnalyticsChart from "../../../components/AnalyticsChart"
export default function AnalyticsPage() {
  const { code } = useParams()
const router = useRouter()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch(`http://localhost:5001/analytics/${code}`)
        const result = await res.json()
        setData(result)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (code) fetchAnalytics()
  }, [code])

  return (
    <div style={{ padding: "40px", color: "white" }}>
      
      <h1 style={{ marginBottom: "10px" }}>
        Analytics for: {code}
      </h1>

      <p style={{ opacity: 0.7, marginBottom: "30px" }}>
        Click trends over time
      </p>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={{
          width: "100%",
          height: "400px",
          background: "#0f172a",
          padding: "20px",
          borderRadius: "12px"
        }}>
          <AnalyticsChart data={data} />
        </div>
      )}
    </div>
  )
}