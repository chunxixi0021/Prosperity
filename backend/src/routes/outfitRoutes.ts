import { Router } from 'express'
import { generateOutfitHandler, generateOutfitByClothesHandler, generateOutfitImageHandler } from '../controllers/outfitController'

const router = Router()

// 根据天气生成穿搭建议
router.post('/generate', generateOutfitHandler)

// 根据用户提供的衣物生成穿搭建议
router.post('/generate-by-clothes', generateOutfitByClothesHandler)

// 生成效果图配置
router.post('/generate-image', generateOutfitImageHandler)

export default router

