import { Router } from 'express'
import { getWeatherHandler } from '../controllers/weatherController'

const router = Router()

// 获取天气信息
router.get('/', getWeatherHandler)

export default router

