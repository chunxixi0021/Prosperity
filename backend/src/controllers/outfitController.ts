import { Request, Response, NextFunction } from 'express'
import { generateOutfitSuggestion, generateOutfitByClothes, generateOutfitImageConfig } from '../services/aiService'
import { getWeatherData } from '../services/weatherService'

export async function generateOutfitHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { location } = req.body

    if (!location) {
      res.status(400).json({
        code: 400,
        message: '请提供位置信息',
        success: false,
        data: null
      })
      return
    }

    // 获取天气信息
    const weatherData = await getWeatherData(location)
    const weatherInfo = {
      temperature: weatherData.temperature,
      weatherType: weatherData.weatherType,
      humidity: weatherData.humidity,
      description: weatherData.description
    }

    // 生成穿搭建议
    const suggestion = await generateOutfitSuggestion(weatherInfo)

    res.json({
      code: 200,
      message: '生成穿搭建议成功',
      success: true,
      data: {
        suggestion,
        weatherInfo
      }
    })
  } catch (error) {
    next(error)
  }
}

export async function generateOutfitByClothesHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { clothes, scene } = req.body

    if (!clothes || !Array.isArray(clothes) || clothes.length === 0) {
      res.status(400).json({
        code: 400,
        message: '请提供衣物信息',
        success: false,
        data: null
      })
      return
    }

    // 立即生成效果图配置（同步，很快）
    const imageConfig = generateOutfitImageConfig(clothes)
    
    // 并行生成穿搭建议（异步，较慢）
    const aiResult = await generateOutfitByClothes(clothes, scene)

    res.json({
      code: 200,
      message: '生成穿搭建议成功',
      success: true,
      data: {
        suggestion: aiResult.suggestion,
        colorScheme: aiResult.colorScheme,
        reasoning: aiResult.reasoning,
        scene: scene || null,
        clothes,
        schemes: aiResult.schemes, // 多个搭配方案
        imageConfig: generateOutfitImageConfig(clothes) // 用户提供的衣物效果图配置
      }
    })
  } catch (error) {
    next(error)
  }
}

// 生成效果图配置接口
export async function generateOutfitImageHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { clothes } = req.body

    if (!clothes || !Array.isArray(clothes) || clothes.length === 0) {
      res.status(400).json({
        code: 400,
        message: '请提供衣物信息',
        success: false,
        data: null
      })
      return
    }

    // 生成效果图配置
    const imageConfig = generateOutfitImageConfig(clothes)

    res.json({
      code: 200,
      message: '生成效果图配置成功',
      success: true,
      data: {
        imageConfig,
        clothes
      }
    })
  } catch (error) {
    next(error)
  }
}

