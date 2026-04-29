"use client"

import { useEffect, useState } from "react"

export default function Dashboard() {
  const [links, setLinks] = useState([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    const loadLinks = async () => {
      try {
        const res = await fetch("http://localhost:5001/links")
        const data = await res.json()

        if (Array.isArray(data)) {
          setLinks(data)
        } else {
          setLinks([])
        }
      } catch (err) {
        console.error("FETCH FAILED:", err)
        setLinks([])
      }
    }

    loadLinks()
  }, [])

  const filteredLinks = links.filter((link) => {
    const text = search.toLowerCase()

    return (
      link.url?.toLowerCase().includes(text) ||
      link.short_code?.toLowerCase().includes(text)
    )
  })

  return (
    <div className="dashboardPage">

      <h1 className="dashboardTitle">Dashboard</h1>

      <div className="tableWrapper">

        {/* HEADER */}
        <div className="tableHeader">
          <span>Short Link</span>
          <span>Status</span>
          <span>Original</span>
          <span>Clicks</span>
          <span>Expires</span>
        </div>

        {/* ROWS */}
        {filteredLinks.map((link, index) => {
          const code = link.short_code || link.shortcode || index
          const short = `http://localhost:5001/${code}`

          const isExpired =
            link.expires_at &&
            new Date(link.expires_at).getTime() < Date.now()

          return (
            <div className="tableRow" key={code}>

              {/* 1. SHORT LINK */}
              <a href={short} target="_blank" rel="noreferrer">
                {short}
              </a>

              {/* 2. STATUS */}
              <span className={isExpired ? "badgeExpired" : "badgeActive"}>
                {isExpired ? "Expired" : "Active"}
              </span>

              {/* 3. ORIGINAL */}
              <span className="truncate">
                {link.url}
              </span>

              {/* 4. CLICKS */}
              <span>
                {link.clicks || 0}
              </span>

              {/* 5. EXPIRES (LAST — CORRECT) */}
              <span>
                {link.expires_at
                  ? new Date(link.expires_at).toLocaleString()
                  : "Never"}
              </span>

            </div>
          )
        })}

      </div>

    </div>
  )
}