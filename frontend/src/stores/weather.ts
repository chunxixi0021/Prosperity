import { defineStore } from 'pinia'
import { getWeather, type WeatherData } from '../api/weather'

export const useWeatherStore = defineStore('weather', {
  state: () => ({
    currentWeather: null as WeatherData | null,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchWeather(location: string) {
      this.loading = true
      this.error = null
      try {
        const response = await getWeather(location)
        if (response.success) {
          this.currentWeather = response.data
        } else {
          this.error = response.message
        }
      } catch (error: any) {
        this.error = error.message || '获取天气信息失败'
      } finally {
        this.loading = false
      }
    }
  }
})

