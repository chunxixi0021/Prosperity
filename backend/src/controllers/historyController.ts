import { Request, Response, NextFunction } from 'express'
import { getPool } from '../config/database'

export async function saveOutfitHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId, outfitData, weatherInfo } = req.body

    if (!outfitData) {
      res.status(400).json({
        code: 400,
        message: '请提供搭配数据',
        success: false,
        data: null
      })
      return
    }

    const pool = getPool()
    const connection = await pool.getConnection()

    try {
      const [result]: any = await connection.execute(
        `INSERT INTO outfit_history (user_id, date, outfit_data, weather_info)
         VALUES (?, CURDATE(), ?, ?)`,
        [
          userId || null,
          JSON.stringify(outfitData),
          weatherInfo ? JSON.stringify(weatherInfo) : null
        ]
      )

      res.json({
        code: 200,
        message: '保存搭配历史成功',
        success: true,
        data: {
          id: result.insertId
        }
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    next(error)
  }
}

export async function getHistoryHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId, startDate, endDate } = req.query
    const pool = getPool()
    const connection = await pool.getConnection()

    try {
      let query = 'SELECT * FROM outfit_history WHERE 1=1'
      const params: any[] = []

      if (userId) {
        query += ' AND user_id = ?'
        params.push(userId)
      }

      if (startDate) {
        query += ' AND date >= ?'
        params.push(startDate)
      }

      if (endDate) {
        query += ' AND date <= ?'
        params.push(endDate)
      }

      query += ' ORDER BY created_at DESC LIMIT 50'

      const [rows]: any = await connection.execute(query, params)

      const history = rows.map((row: any) => ({
        ...row,
        outfitData: typeof row.outfit_data === 'string' ? JSON.parse(row.outfit_data) : row.outfit_data,
        weatherInfo: row.weather_info ? (typeof row.weather_info === 'string' ? JSON.parse(row.weather_info) : row.weather_info) : null
      }))

      res.json({
        code: 200,
        message: '获取历史记录成功',
        success: true,
        data: history
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    next(error)
  }
}

export async function getHistoryByIdHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params
    const pool = getPool()
    const connection = await pool.getConnection()

    try {
      const [rows]: any = await connection.execute(
        'SELECT * FROM outfit_history WHERE id = ?',
        [id]
      )

      if (rows.length === 0) {
        res.status(404).json({
          code: 404,
          message: '历史记录不存在',
          success: false,
          data: null
        })
        return
      }

      const record = {
        ...rows[0],
        outfitData: typeof rows[0].outfit_data === 'string' ? JSON.parse(rows[0].outfit_data) : rows[0].outfit_data,
        weatherInfo: rows[0].weather_info ? (typeof rows[0].weather_info === 'string' ? JSON.parse(rows[0].weather_info) : rows[0].weather_info) : null
      }

      res.json({
        code: 200,
        message: '获取历史记录成功',
        success: true,
        data: record
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    next(error)
  }
}

