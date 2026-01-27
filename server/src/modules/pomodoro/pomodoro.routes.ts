import { Router } from "express"
import { authMiddleware } from "../../middlewares/auth.middleware"
import * as controller from "./pomodoro.controller"

export const pomodoroRoutes = Router()

pomodoroRoutes.post("/session", authMiddleware, controller.create)