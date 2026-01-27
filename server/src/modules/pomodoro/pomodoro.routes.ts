import { Router } from 'express'
import * as controller from './pomodoro.controller'
import { authMiddleware } from '../../middlewares/auth.middleware'

const router = Router()

router.post('/session', authMiddleware, controller.create)
router.get('/sessions', authMiddleware, controller.getSessions) // <- aqui

export default router