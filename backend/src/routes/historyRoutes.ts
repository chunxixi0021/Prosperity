import { Router } from 'express'
import { saveOutfitHandler, getHistoryHandler, getHistoryByIdHandler } from '../controllers/historyController'

const router = Router()

// 保存搭配历史
router.post('/save', saveOutfitHandler)

// 获取历史记录列表
router.get('/', getHistoryHandler)

// 获取单个历史记录
router.get('/:id', getHistoryByIdHandler)

export default router

