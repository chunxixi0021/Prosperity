import { Router } from 'express'
import weatherRoutes from './weatherRoutes'
import outfitRoutes from './outfitRoutes'
import historyRoutes from './historyRoutes'

const router = Router()

router.use('/weather', weatherRoutes)
router.use('/outfit', outfitRoutes)
router.use('/history', historyRoutes)

export default router

