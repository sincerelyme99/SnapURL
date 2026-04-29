import OpenAI from "openai"
import dotenv from "dotenv"
dotenv.config()
import express from "express"
import cors from "cors"
import pkg from "pg"
//import Redis from "ioredis"
import rateLimit from "express-rate-limit"
const { Pool } = pkg
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})
const app = express()
app.use(cors())
app.use(express.json())

/* ---------------- DATABASE ---------------- */

const pool = new Pool({
  user: "pranaydeb99",
  host: "localhost",
  database: "tinyurl",
  port: 5432
})

/* ---------------- REDIS ---------------- */

//const redis = new Redis({
  //host: "127.0.0.1",
  //port: 6379
//})

/* ---------------- RATE LIMIT ---------------- */

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: "Too many requests, slow down."
    })
  }
})
app.use(limiter)

/* ---------------- OPENAI ---------------- */
app.post("/ai/insights", async (req, res) => {
  try {
    const { links } = req.body

    if (!links || links.length === 0) {
      return res.status(400).json({ error: "No links provided" })
    }

    const summary = links
      .map(l => `Link ${l.short_code} has ${l.clicks} clicks`)
      .join(", ")

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an analytics assistant. Give short, useful insights."
        },
        {
          role: "user",
          content: `Analyze this data: ${summary}`
        }
      ]
    })

    const insight = response.choices[0].message.content

    res.json({ insight })

  } catch (err) {
  if (err.code === "23505") { // PostgreSQL duplicate key
    return res.status(400).json({
      error: "Shortcode already exists"
    })
  }

  console.error(err)
  return res.status(500).json({
    error: "Internal server error"
  })
}
})

/* ---------------- CREATE SHORT LINK ---------------- */

app.post("/shorten", async (req, res) => {
  try {
    const { url, shortcode, expires_in } = req.body

    const expiresAt = expires_in
      ? new Date(Date.now() + expires_in * 1000)
      : null

    const result = await pool.query(
      `INSERT INTO links (url, short_code, expires_at)
       VALUES ($1,$2,$3)
       RETURNING *`,
      [url, shortcode, expiresAt]
    )

    const row = result.rows[0]

    res.json({
      id: row.id,
      url: row.url,
      shortcode: row.short_code,
      clicks: row.clicks,
      expires_at: row.expires_at
    })

  } catch (err) {

    // ✅ THIS is the real fix
    if (err.code === "23505") {
      return res.status(400).json({
        error: "Shortcode already exists"
      })
    }

    console.error(err)
    res.status(500).json({ error: "Failed to create link" })
  }
})

/* ---------------- GET ALL LINKS ---------------- */

app.get("/links", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM links ORDER BY id DESC"
    )

    res.json(
      result.rows.map(row => ({
        id: row.id,
        url: row.url,
        shortcode: row.short_code,
        clicks: row.clicks,
        expires_at: row.expires_at
      }))
    )

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to fetch links" })
  }
})

/* ---------------- ANALYTICS ---------------- */

app.get("/analytics/:shortcode", async (req, res) => {
  try {
    const { shortcode } = req.params

    const result = await pool.query(
      `
      SELECT DATE(clicked_at) as day, COUNT(*) as clicks
      FROM clicks
      WHERE short_code = $1
      GROUP BY day
      ORDER BY day
      `,
      [shortcode]
    )

    res.json(result.rows)

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Analytics failed" })
  }
})

/* ---------------- REDIRECT ---------------- */

app.get("/:code", async (req, res) => {
  const { code } = req.params

  try {
    const result = await pool.query(
      "SELECT * FROM links WHERE short_code = $1",
      [code]
    )

    if (result.rows.length === 0) {
return res.status(404).json({ error: "Link not found" })    }

    const link = result.rows[0]

    // 🚨 CRITICAL FIX: CHECK EXPIRY
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return res.status(410).json({ error: "This link has expired" })
    }

    // increment clicks
    await pool.query(
      "UPDATE links SET clicks = clicks + 1 WHERE short_code = $1",
      [code]
    )

    res.redirect(link.url)

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server error" })
  }
})

/* ---------------- START SERVER ---------------- */

app.listen(5001, () => {
  console.log("Server running on 5001")
})
app.delete("/links/:code", async (req, res) => {
  const { code } = req.params

  console.log("DELETE HIT:", code)

  try {
    const result = await pool.query(
      "DELETE FROM links WHERE short_code = $1 RETURNING *",
      [code]
    )

    console.log("DB result:", result.rowCount)

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Link not found" })
    }

    res.json({ message: "Deleted successfully" })
  } catch (err) {
  console.error("DELETE ERROR FULL:", err)
  res.status(500).json({ error: "Server error" })
}
})