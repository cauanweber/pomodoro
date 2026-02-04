import express from "express"
import cors from "cors"

import { authRoutes } from "./modules/auth/auth.routes"
import pomodoroRoutes from "./modules/pomodoro/pomodoro.routes"

export const app = express()

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : null

app.use(
  cors({
    origin: corsOrigins && corsOrigins.length > 0 ? corsOrigins : true,
  })
)
app.use(express.json())

app.use("/auth", authRoutes)
app.use("/pomodoro", pomodoroRoutes)
app.get("/health", (req, res) => {
  return res.json({ status: "ok" })
})

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (res.headersSent) {
      return next(err)
    }

    const message = err.message || "Internal server error"

    if (message === "User already exists") {
      return res.status(409).json({ message })
    }

    if (message === "Invalid credentials") {
      return res.status(401).json({ message })
    }

    return res.status(500).json({ message })
  }
)
