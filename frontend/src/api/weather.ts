import api from './index'

export interface WeatherData {
  location: string
  temperature: number
  weatherType: string
  humidity: number
  windSpeed: number
  description: string
  date: string
}

export interface WeatherResponse {
  code: number
  message: string
  success: boolean
  data: WeatherData
}

export function getWeather(location: string): Promise<WeatherResponse> {
  return api.get('/weather', {
    params: { location }
  })
}

