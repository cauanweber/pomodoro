import express from "express"
import cors from "cors"

import { authRoutes } from "./modules/auth/auth.routes"
import pomodoroRoutes from "./modules/pomodoro/pomodoro.routes"

export const app = express()

app.use(cors())
app.use(express.json())

app.use("/auth", authRoutes)
app.use("/pomodoro", pomodoroRoutes)