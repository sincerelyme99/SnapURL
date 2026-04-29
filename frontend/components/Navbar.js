"use client"

import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className={`navbar ${scrolled ? "scrolled" : ""}`}>

      {/* ✅ THIS replaces your h2 completely */}
      <Link href="/?focus=true" className="logo">
        SnapURL
      </Link>

      <div className="navlinks">
        <Link className={pathname === "/" ? "active" : ""} href="/">Home</Link>
        <Link className={pathname === "/dashboard" ? "active" : ""} href="/dashboard">Dashboard</Link>
        <Link className={pathname === "/analytics" ? "active" : ""} href="/analytics">Analytics</Link>
      </div>

    <button
  className="cta"
  onClick={() => router.push("/?focus=true")}
>
  Get Started
</button>

    </div>
  )
}