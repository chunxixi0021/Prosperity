import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import routes from './routes'
import { errorHandler, notFoundHandler } from './middlewares/errorHandler'

const app = express()

// 安全中间件
app.use(helmet())

// CORS配置
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}))

// 解析JSON
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

// 健康检查
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API路由
app.use('/api', routes)

// 404处理
app.use(notFoundHandler)

// 错误处理（必须在最后）
app.use(errorHandler)

export default app

