const redis = require("./redis")

async function rateLimit(req, res, next) {
  try {

    const ip = req.ip
    const key = `rate:${ip}`

    const requests = await redis.incr(key)

    if (requests === 1) {
      await redis.expire(key, 60)
    }

    if (requests > 100) {
      return res.status(429).json({
        error: "Too many requests. Try again later."
      })
    }

    next()

  } catch (err) {
    console.error("Rate limiter error:", err)

    // if redis fails we don't block requests
    next()
  }
}

module.exports = rateLimit