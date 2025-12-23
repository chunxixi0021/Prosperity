import { Request, Response, NextFunction } from 'express'
import { getWeatherData } from '../services/weatherService'
import { getPool } from '../config/database'

export async function getWeatherHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const location = (req.query.location as string) || '北京'

    // 获取天气数据
    const weatherData = await getWeatherData(location)

    // 保存到数据库
    const pool = getPool()
    const connection = await pool.getConnection()
    
    try {
      await connection.execute(
        `INSERT INTO weather_records 
         (date, location, temperature, weather_type, humidity, wind_speed, description)
         VALUES (CURDATE(), ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         temperature = VALUES(temperature),
         weather_type = VALUES(weather_type),
         humidity = VALUES(humidity),
         wind_speed = VALUES(wind_speed),
         description = VALUES(description)`,
        [
          location,
          weatherData.temperature,
          weatherData.weatherType,
          weatherData.humidity,
          weatherData.windSpeed,
          weatherData.description
        ]
      )
    } finally {
      connection.release()
    }

    res.json({
      code: 200,
      message: '获取天气信息成功',
      success: true,
      data: {
        location,
        ...weatherData,
        date: new Date().toISOString().split('T')[0]
      }
    })
  } catch (error) {
    next(error)
  }
}

