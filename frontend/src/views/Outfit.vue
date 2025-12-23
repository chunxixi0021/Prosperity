<template>
  <div class="outfit-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>智能穿搭建议</span>
        </div>
      </template>
      <div class="outfit-content">
        <el-form @submit.prevent="handleGenerate">
          <el-form-item label="城市">
            <el-input
              v-model="location"
              placeholder="请输入城市名称，如：北京"
              style="width: 300px"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              @click="handleGenerate"
              :loading="outfitStore.loading"
            >
              生成穿搭建议
            </el-button>
          </el-form-item>
        </el-form>

        <el-divider />

        <div v-if="outfitStore.loading" class="loading-container">
          <el-skeleton :rows="8" animated />
        </div>

        <el-alert
          v-if="outfitStore.error"
          :title="outfitStore.error"
          type="error"
          :closable="false"
          style="margin-bottom: 20px"
        />

        <div v-if="outfitStore.suggestion && !outfitStore.loading" class="suggestion-container">
          <!-- 效果图（如果有） -->
          <el-card v-if="outfitStore.imageConfig" shadow="hover" style="margin-bottom: 20px">
            <template #header>
              <div class="card-title">穿搭效果图</div>
            </template>
            <div class="image-section">
              <OutfitAvatar 
                ref="outfitAvatarRef"
                :image-config="outfitStore.imageConfig" 
              />
            </div>
          </el-card>
          
          <el-card shadow="hover">
            <div class="suggestion-text" v-html="formatSuggestion(outfitStore.suggestion)"></div>
          </el-card>
          <el-button
            type="success"
            size="large"
            style="margin-top: 20px"
            @click="handleSaveHistory"
            :loading="historyStore.loading"
          >
            保存效果图到历史记录
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useOutfitStore } from '../stores/outfit'
import { useHistoryStore } from '../stores/history'
import { useWeatherStore } from '../stores/weather'
import { ElMessage } from 'element-plus'
import OutfitAvatar from '../components/OutfitAvatar.vue'
import { svgToBase64 } from '../utils/imageUtils'

const location = ref('北京')
const outfitStore = useOutfitStore()
const historyStore = useHistoryStore()
const weatherStore = useWeatherStore()
const outfitAvatarRef = ref<InstanceType<typeof OutfitAvatar> | null>(null)

const handleGenerate = async () => {
  if (!location.value.trim()) {
    ElMessage.warning('请输入城市名称')
    return
  }
  // 先获取天气，再生成建议
  await weatherStore.fetchWeather(location.value)
  if (weatherStore.currentWeather) {
    await outfitStore.generateByWeather(location.value, 3) // 生成3个不同的方案
  }
}

const handleSaveHistory = async () => {
  // 检查是否有效果图
  if (!outfitStore.imageConfig) {
    ElMessage.warning('当前没有效果图可保存，请使用自定义穿搭功能生成效果图')
    return
  }
  
  try {
    // 获取效果图（SVG转换为base64）
    let outfitImageBase64: string | null = null
    try {
      if (outfitAvatarRef.value?.svgElement) {
        outfitImageBase64 = await svgToBase64(outfitAvatarRef.value.svgElement, {
          width: 300,
          height: 420,
          format: 'png',
          quality: 1
        })
      }
    } catch (error) {
      console.warn('获取效果图失败:', error)
      ElMessage.error('获取效果图失败，请重试')
      return
    }
    
    if (!outfitImageBase64) {
      ElMessage.warning('无法获取效果图')
      return
    }
    
    await historyStore.saveOutfitHistory({
      outfitData: {
        type: 'weather_outfit',
        imageBase64: outfitImageBase64, // 保存效果图
        imageConfig: outfitStore.imageConfig,
        location: location.value
        // 不再保存suggestion（AI建议）
      },
      weatherInfo: weatherStore.currentWeather
    })
    ElMessage.success('效果图已保存到历史记录')
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const formatSuggestion = (text: string) => {
  return text.replace(/\n/g, '<br>')
}
</script>

<style scoped>
.outfit-page {
  max-width: 1000px;
  margin: 0 auto;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
}

.outfit-content {
  padding: 20px 0;
}

.loading-container {
  padding: 20px;
}

.suggestion-container {
  text-align: center;
}

.suggestion-text {
  text-align: left;
  line-height: 1.8;
  color: #303133;
  font-size: 16px;
  white-space: pre-wrap;
  padding: 20px;
}

.card-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.image-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}
</style>

