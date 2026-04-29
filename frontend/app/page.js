"use client"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import AnalyticsChart from "../components/AnalyticsChart"
import { useState, useEffect, useRef, useLayoutEffect } from "react"
import { QRCodeCanvas } from "qrcode.react"
import { useRouter } from "next/navigation"
function HomeContent() {
   const router = useRouter()
  const [url, setUrl] = useState("")
  const [shortcode, setShortcode] = useState("")
  const [expiration, setExpiration] = useState("")
  const [shortUrl, setShortUrl] = useState("")
  const [links, setLinks] = useState([])
  const [toast, setToast] = useState("")
  const [loading, setLoading] = useState(false)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const qrRef = useRef(null)
  const urlInputRef = useRef(null)
  const [analyticsData, setAnalyticsData] = useState({})
  const searchParams = useSearchParams()
  const [filter, setFilter] = useState("all")

  const filteredLinks = links.filter(link => {
    const isExpired =
      link.expires_at &&
      new Date(link.expires_at).getTime() < Date.now()

    if (filter === "active") return !isExpired
    if (filter === "expired") return isExpired
    return true
  })

  const handleCopy = (url) => {
    navigator.clipboard.writeText(url)
    alert("Copied!")
  }

  const handleOpen = (url) => {
    window.open(url, "_blank")
  }

  const handleDelete = async (shortCode) => {
    try {
      await fetch(`http://localhost:5001/${shortCode}`, {
        method: "DELETE",
      })

      setLinks((prev) =>
        prev.filter(
          (l) => (l.short_code || l.shortcode) !== shortCode
        )
      )
    } catch (err) {
      console.error("Delete failed:", err)
    }
  }



  useEffect(() => {

    if (searchParams.get("focus") === "true") {

      setTimeout(() => {

        document.getElementById("urlInput")?.focus()

      }, 100)

    }

  }, [searchParams])

  useEffect(() => {
    window.focusUrlInput = () => {
      if (urlInputRef.current) {
        urlInputRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center"
        })

        setTimeout(() => {
          urlInputRef.current.focus()
        }, 300)
      }
    }
  }, [])

  async function fetchLinks() {
    try {
      const res = await fetch("http://localhost:5001/links")

      console.log("STATUS:", res.status)
      console.log("CONTENT-TYPE:", res.headers.get("content-type"))

      if (!res.ok) {
        console.error("Request failed")
        setLinks([])
        return
      }

      const contentType = res.headers.get("content-type")

      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text()
        console.error("NOT JSON RESPONSE:", text)
        setLinks([])
        return
      }

      const data = await res.json()

      if (!Array.isArray(data)) {
        console.error("Invalid data:", data)
        setLinks([])
        return
      }

      setLinks(data)

    } catch (err) {
      console.error("FETCH ERROR:", err)
      setLinks([])
    }
  }

  useEffect(() => {
    fetchLinks()

    const interval = setInterval(() => {
      fetchLinks()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  async function fetchAnalytics(code) {
    try {
      const res = await fetch(`http://localhost:5001/analytics/${code}`)
      const data = await res.json()
      return data
    } catch (err) {
      console.error(err)
      return []
    }
  }

  async function createLink(){

    if(!url){
      setToast("Enter a URL")
      setTimeout(()=>setToast(""),2000)
      return
    }

    setLoading(true)

    try{
      const res = await fetch("http://localhost:5001/shorten",{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({
          url,
          shortcode: shortcode || undefined,
          expires_in: expiration ? Number(expiration) : undefined
        })
      })

      const data = await res.json()

    if (!res.ok) {
  const msg = (data.error || "").toLowerCase()

  if (msg.includes("exists") || msg.includes("duplicate")) {
    setToast("Custom code already exists. Try a different one")
  } else {
    setToast(data.error || "Failed to create link")
  }

  setLoading(false)
  return
}
      const finalUrl =
        data.short_url ||
        `http://localhost:5001/${data.short_code || data.shortcode}`

      setShortUrl(finalUrl)
      setToast("Short link created 🚀")

      fetchLinks()

    }catch(err){
      console.error(err)
      setToast("Server error")
    }

    setLoading(false)
    setTimeout(()=>setToast(""),2000)
  }

  function copyLink(text){
    navigator.clipboard.writeText(text)
    setToast("Copied 🚀")
    setTimeout(()=>setToast(""),2000)
  }

  function downloadQR(){
    const canvas = qrRef.current.querySelector("canvas")
    const image = canvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.href = image
    link.download = "snapurl-qr.png"
    link.click()
  }


useLayoutEffect(() => {

  const focus = searchParams.get("focus")

  if (focus === "true") {

    requestAnimationFrame(() => {

      if (urlInputRef.current) {

        urlInputRef.current.scrollIntoView({

          behavior: "smooth",

          block: "center"

        })

        urlInputRef.current.focus()

      }

    })

  }

}, [searchParams.get("focus")])

  async function deleteLink(link){

    const code = link.short_code || link.shortcode

    if(!code){
      setToast("Invalid link structure")
      return
    }

    if(!confirm("Delete this link?")) return

    try{
      const res = await fetch(`http://localhost:5001/links/${code}`,{
        method:"DELETE"
      })

      const data = await res.json()

      if(!res.ok){
        setToast(data.error || "Delete failed")
        return
      }

      setLinks(prev =>
        prev.filter(l =>
          (l.short_code || l.shortcode) !== code
        )
      )

      setToast("Deleted 🗑️")

    }catch(err){
      console.error(err)
      setToast("Server error")
    }

    setTimeout(()=>setToast(""),2000)
  }

  return(
    <div
      className="page"
      style={{
        background: `radial-gradient(circle at ${mouse.x}px ${mouse.y}px, rgba(99,102,241,0.12), transparent 40%), #020617`
      }}
    >

      <div className="hero">
        <div className="heroLeft">
          <span className="badge fadeUp">Link Intelligence Platform</span>

          <h1 className="fadeUp delay1">
            Build stronger <br/> digital connections
          </h1>

          <p className="fadeUp delay2">
            SnapURL helps you create powerful short links,
            track engagement, and understand your audience.
          </p>

          <div className="features fadeUp delay3">
            <div><h4>Fast</h4><p>Instant link generation</p></div>
            <div><h4>Analytics</h4><p>Track every click</p></div>
            <div><h4>Secure</h4><p>Safe & rate limited</p></div>
          </div>

         <div className="ctaRow fadeUp delay3">

<button
  className="primaryBtn"
  onClick={() => router.push("/?focus=true")}
>
  Get Started
</button>

  <button
    className="secondaryBtn"
    onClick={() => {
      setUrl("https://youtube.com/watch?v=dQw4w9WgXcQ")
      setShortcode("demo")
      setExpiration("3600")

      if (urlInputRef.current) {
        urlInputRef.current.focus()
      }
    }}
  >
    View Demo
  </button>

</div>
        </div>

        <div className="heroCard">
          <h3>Create a short link</h3>

          <input
            ref={urlInputRef}
            id="urlInput"
            placeholder="Paste long URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <input
            placeholder="Custom shortcode"
            value={shortcode}
            onChange={(e)=>setShortcode(e.target.value)}
          />

          <input
            placeholder="Expiration in seconds"
            value={expiration}
            onChange={(e)=>setExpiration(e.target.value)}
          />

          <button onClick={createLink} disabled={loading}>
            {loading ? "Creating..." : "Shorten URL"}
          </button>

          {shortUrl && (
            <div className="resultBox fadeUp">
              <input value={shortUrl} readOnly/>
              <button onClick={()=>copyLink(shortUrl)}>Copy</button>

              <div ref={qrRef}>
                <QRCodeCanvas value={shortUrl} size={100}/>
              </div>

              <button onClick={downloadQR}>Download QR</button>
            </div>
          )}
        </div>
      </div>

      <div className="linksSection">
        <div className="linksHeader">
          <h2>Recent Links</h2>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filterDropdown"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        <div className="linksTable">
          <div className="tableHeader">
            <span>Short Link</span>
            <span>Status</span>
            <span>Clicks</span>
            <span>Action</span>
          </div>

          {Array.isArray(links) && filteredLinks.map((link, index) => {
            const short = `http://localhost:5001/${link.short_code || link.shortcode}`

            const isExpired =
              link.expires_at &&
              new Date(link.expires_at).getTime() < Date.now()

            return (
              <div
                className="tableRow"
                key={link.short_code || link.shortcode || index}
              >

                <a href={short} target="_blank" rel="noreferrer">
                  {short}
                </a>

                <span className={isExpired ? "badgeExpired" : "badgeActive"}>
                  {isExpired ? "Expired" : "Active"}
                </span>

                <span>{link.clicks || 0}</span>

                <div>
                  <button onClick={() => handleCopy(short)}>Copy</button>
                  <button onClick={() => handleOpen(short)}>Open</button>
                  <button onClick={() => deleteLink(link)}>Delete</button>
                </div>

              </div>
            )
          })}
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
  export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  )
}
}