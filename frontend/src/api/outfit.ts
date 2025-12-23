import api from './index'

export interface OutfitScheme {
  top: { color: string; name: string } | null
  bottom: { color: string; name: string } | null
  outerwear: { color: string; name: string } | null
  shoes: { color: string; name: string } | null
  accessories: { color: string; name: string } | null
  description: string
}

export interface OutfitSuggestion {
  suggestion: string
  colorScheme?: string
  reasoning?: string
  scene?: string | null
  weatherInfo?: {
    temperature: number
    weatherType: string
    humidity: number
    description: string
  }
  clothes?: Array<{
    name: string
    type: string
    color: string
  }>
  imageConfig?: OutfitImageConfig
  schemes?: OutfitScheme[] // 多个搭配方案
}

export interface OutfitResponse {
  code: number
  message: string
  success: boolean
  data: OutfitSuggestion
}

export function generateOutfitByWeather(
  location: string,
  numSchemes: number = 3
): Promise<OutfitResponse> {
  console.log('调用 generateOutfitByWeather，参数:', { location, numSchemes })
  try {
    return api.post('/outfit/generate', { location, num_schemes: numSchemes, variety: true })
  } catch (error: any) {
    console.error('generateOutfitByWeather 错误:', error)
    throw error
  }
}

export function generateOutfitByClothes(
  clothes: Array<{ name: string; type: string; color: string }>,
  scene?: string,
  numSchemes: number = 3
): Promise<OutfitResponse> {
  console.log('调用 generateOutfitByClothes，参数:', { clothes, scene, numSchemes })
  try {
    return api.post('/outfit/generate-by-clothes', { 
      clothes, 
      scene, 
      num_schemes: numSchemes,
      variety: true 
    })
  } catch (error: any) {
    console.error('generateOutfitByClothes 错误:', error)
    throw error
  }
}

export interface OutfitImageConfig {
  top: { color: string; type: string; name?: string } | null
  bottom: { color: string; type: string; name?: string } | null
  outerwear: { color: string; type: string; name?: string } | null
  shoes: { color: string; type: string; name?: string } | null
  accessories: { color: string; type: string; name?: string } | null
}

export interface OutfitImageResponse {
  code: number
  message: string
  success: boolean
  data: {
    imageConfig: OutfitImageConfig
    clothes: Array<{ name: string; type: string; color: string }>
  }
}

export function generateOutfitImage(
  clothes: Array<{ name: string; type: string; color: string }>
): Promise<OutfitImageResponse> {
  return api.post('/outfit/generate-image', { clothes })
}

