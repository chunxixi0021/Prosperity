import axios from 'axios'

interface WeatherData {
  temperature: number
  weatherType: string
  humidity: number
  windSpeed: number
  description: string
}

export async function getWeatherData(location: string): Promise<WeatherData> {
  const apiKey = process.env.WEATHER_API_KEY

  // 优先使用OpenWeatherMap API（如果配置了API Key）
  if (apiKey && apiKey !== 'your_weather_api_key_here') {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather`,
        {
          params: {
            q: location,
            appid: apiKey,
            units: 'metric',
            lang: 'zh_cn'
          },
          timeout: 10000
        }
      )

      const data = response.data
      return {
        temperature: data.main.temp,
        weatherType: data.weather[0].main,
        humidity: data.main.humidity,
        windSpeed: data.wind?.speed || 0,
        description: data.weather[0].description
      }
    } catch (error: any) {
      console.warn('OpenWeatherMap API调用失败，尝试使用备用方案:', error.message)
      // 如果OpenWeatherMap失败，继续使用备用方案
    }
  }

  // 备用方案：使用免费的wttr.in API（无需API Key）
  try {
    // wttr.in支持中文城市名称，返回JSON格式
    const response = await axios.get(
      `https://wttr.in/${encodeURIComponent(location)}`,
      {
        params: {
          format: 'j1', // JSON格式
          lang: 'zh' // 中文
        },
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      }
    )

    const data = response.data
    const current = data.current_condition?.[0]
    const weather = data.weather?.[0]

    if (!current) {
      throw new Error('天气数据格式错误')
    }

    // 转换wttr.in的数据格式
    return {
      temperature: parseFloat(current.temp_C) || 0,
      weatherType: current.weatherDesc?.[0]?.value || '未知',
      humidity: parseInt(current.humidity) || 0,
      windSpeed: parseFloat(current.windspeedKmph) / 3.6 || 0, // 转换为m/s
      description: current.weatherDesc?.[0]?.value || weather?.hourly?.[0]?.weatherDesc?.[0]?.value || '未知'
    }
  } catch (error: any) {
    console.error('获取天气数据失败:', error)
    throw new Error(`获取天气数据失败: ${error.message || '网络错误'}`)
  }
}

