import { defineStore } from 'pinia'
import { saveHistory, getHistory, type OutfitHistory } from '../api/history'

export const useHistoryStore = defineStore('history', {
  state: () => ({
    historyList: [] as OutfitHistory[],
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchHistory(params?: { userId?: number; startDate?: string; endDate?: string }) {
      this.loading = true
      this.error = null
      try {
        const response = await getHistory(params)
        if (response.success) {
          this.historyList = response.data
        } else {
          this.error = response.message
        }
      } catch (error: any) {
        this.error = error.message || '获取历史记录失败'
      } finally {
        this.loading = false
      }
    },

    async saveOutfitHistory(data: { userId?: number; outfitData: any; weatherInfo?: any }) {
      this.loading = true
      this.error = null
      try {
        const response = await saveHistory(data)
        if (response.success) {
          // 保存成功后刷新列表
          await this.fetchHistory()
        } else {
          this.error = response.message
        }
        return response
      } catch (error: any) {
        this.error = error.message || '保存历史记录失败'
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})

