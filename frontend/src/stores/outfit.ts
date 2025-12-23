import { defineStore } from 'pinia'
import { generateOutfitByWeather, generateOutfitByClothes, type OutfitImageConfig, type OutfitScheme } from '../api/outfit'

export const useOutfitStore = defineStore('outfit', {
  state: () => ({
    suggestion: null as string | null,
    colorScheme: null as string | null,
    reasoning: null as string | null,
    scene: null as string | null,
    imageConfig: null as OutfitImageConfig | null,
    selectedColors: null as OutfitImageConfig | null, // 用户选择的颜色搭配
    schemes: [] as OutfitScheme[], // 多个搭配方案
    loading: false,
    error: null as string | null
  }),

  actions: {
    async generateByWeather(location: string, numSchemes: number = 3) {
      this.loading = true
      this.error = null
      try {
        const response = await generateOutfitByWeather(location, numSchemes)
        if (response.success) {
          // 设置效果图配置（如果存在）
          if (response.data.imageConfig) {
            this.imageConfig = response.data.imageConfig
            this.selectedColors = response.data.imageConfig
          }
          // 设置AI生成的内容
          this.suggestion = response.data.suggestion
          this.colorScheme = response.data.colorScheme || null
          this.reasoning = response.data.reasoning || null
          this.scene = response.data.scene || null
          // 对方案进行去重和多样化处理
          this.schemes = this.deduplicateSchemes(response.data.schemes || [])
        } else {
          this.error = response.message
        }
      } catch (error: any) {
        console.error('generateByWeather 错误:', error)
        // 尝试从错误响应中提取详细信息
        const errorMessage = error?.response?.data?.message || 
                            error?.response?.data?.error || 
                            error?.response?.data?.detail ||
                            error?.message || 
                            '生成穿搭建议失败，请检查后端服务'
        this.error = errorMessage
        console.error('错误信息:', errorMessage)
      } finally {
        this.loading = false
      }
    },

    async generateByClothes(
      clothes: Array<{ name: string; type: string; color: string }>,
      scene?: string,
      numSchemes: number = 3
    ) {
      this.loading = true
      this.error = null
      try {
        const response = await generateOutfitByClothes(clothes, scene, numSchemes)
        if (response.success) {
          // 立即设置效果图配置（这个很快，不需要等待）
          if (response.data.imageConfig) {
            this.imageConfig = response.data.imageConfig
            this.selectedColors = response.data.imageConfig
          }
          
          // 然后设置AI生成的内容
          this.suggestion = response.data.suggestion
          this.colorScheme = response.data.colorScheme || null
          this.reasoning = response.data.reasoning || null
          this.scene = response.data.scene || null
          // 对方案进行去重和多样化处理
          this.schemes = this.deduplicateSchemes(response.data.schemes || [])
        } else {
          this.error = response.message
        }
      } catch (error: any) {
        console.error('generateByClothes 错误:', error)
        // 尝试从错误响应中提取详细信息
        const errorMessage = error?.response?.data?.message || 
                            error?.response?.data?.error || 
                            error?.response?.data?.detail ||
                            error?.message || 
                            '生成穿搭建议失败，请检查后端服务'
        this.error = errorMessage
        console.error('错误信息:', errorMessage)
      } finally {
        this.loading = false
      }
    },

    /**
     * 去重和多样化处理方案
     * 确保每个方案都是不同的
     */
    deduplicateSchemes(schemes: OutfitScheme[]): OutfitScheme[] {
      if (!schemes || schemes.length === 0) {
        return []
      }

      const uniqueSchemes: OutfitScheme[] = []
      const seen = new Set<string>()

      for (const scheme of schemes) {
        // 生成方案的唯一标识（基于颜色和名称组合）
        const schemeKey = this.getSchemeKey(scheme)
        
        if (!seen.has(schemeKey)) {
          seen.add(schemeKey)
          uniqueSchemes.push(scheme)
        } else {
          console.warn('发现重复方案，已跳过:', schemeKey)
        }
      }

      // 如果去重后方案数量不足，尝试生成更多变化
      if (uniqueSchemes.length < 3 && schemes.length > 0) {
        console.log(`去重后只有 ${uniqueSchemes.length} 个不同方案，尝试生成更多变化`)
        // 可以在这里添加逻辑来生成更多变化的方案
        // 例如：基于现有方案生成变体
      }

      return uniqueSchemes
    },

    /**
     * 生成方案的唯一标识
     */
    getSchemeKey(scheme: OutfitScheme): string {
      const parts: string[] = []
      
      if (scheme.top) {
        parts.push(`top:${scheme.top.color}:${scheme.top.name}`)
      }
      if (scheme.bottom) {
        parts.push(`bottom:${scheme.bottom.color}:${scheme.bottom.name}`)
      }
      if (scheme.shoes) {
        parts.push(`shoes:${scheme.shoes.color}:${scheme.shoes.name}`)
      }
      if (scheme.outerwear) {
        parts.push(`outerwear:${scheme.outerwear.color}:${scheme.outerwear.name}`)
      }
      if (scheme.accessories) {
        parts.push(`accessories:${scheme.accessories.color}:${scheme.accessories.name}`)
      }
      
      return parts.join('|')
    },

    updateSelectedColors(colors: OutfitImageConfig) {
      this.selectedColors = colors
    },

    clearSuggestion() {
      this.suggestion = null
      this.colorScheme = null
      this.reasoning = null
      this.scene = null
      this.imageConfig = null
      this.selectedColors = null
      this.schemes = []
      this.error = null
    }
  }
})

