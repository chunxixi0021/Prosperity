import dotenv from 'dotenv'
import app from './app'
import { initDatabase } from './config/database'

// 加载环境变量
dotenv.config()

const PORT = process.env.PORT || 3001

async function startServer() {
  try {
    // 初始化数据库连接
    await initDatabase()
    console.log('✅ 数据库连接成功')

    // 启动服务器
    app.listen(PORT, () => {
      console.log(`🚀 服务器运行在 http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('❌ 启动失败:', error)
    process.exit(1)
  }
}

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('SIGTERM信号 received: 关闭服务器')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT信号 received: 关闭服务器')
  process.exit(0)
})

// 捕获未处理的Promise rejection
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未处理的Promise Rejection:', reason)
})

// 捕获未处理的异常
process.on('uncaughtException', (error) => {
  console.error('❌ 未捕获的异常:', error)
  process.exit(1)
})

startServer()

