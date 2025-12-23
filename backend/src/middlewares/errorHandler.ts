import { Request, Response, NextFunction } from 'express'

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('❌ 错误:', err)
  
  if (res.headersSent) {
    return
  }

  const statusCode = err.statusCode || 500
  const message = err.message || '服务器内部错误'

  res.status(statusCode).json({
    code: statusCode,
    message,
    success: false,
    data: null,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  })
}

export function notFoundHandler(
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  res.status(404).json({
    code: 404,
    message: '接口不存在',
    success: false,
    data: null
  })
}

