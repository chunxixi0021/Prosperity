<template>
  <div class="weather-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>天气查询</span>
        </div>
      </template>
      <div class="weather-content">
        <el-form :inline="true" @submit.prevent="handleSearch">
          <el-form-item label="城市">
            <el-input
              v-model="location"
              placeholder="请输入城市名称，如：北京"
              style="width: 300px"
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch" :loading="weatherStore.loading">
              查询天气
            </el-button>
          </el-form-item>
        </el-form>

        <el-divider />

        <div v-if="weatherStore.loading" class="loading-container">
          <el-skeleton :rows="5" animated />
        </div>

        <el-alert
          v-if="weatherStore.error"
          :title="weatherStore.error"
          type="error"
          :closable="false"
          style="margin-bottom: 20px"
        />

        <div v-if="weatherStore.currentWeather && !weatherStore.loading" class="weather-info">
          <el-card shadow="hover">
            <div class="weather-header">
              <h2>{{ weatherStore.currentWeather.location }}</h2>
              <span class="date">{{ weatherStore.currentWeather.date }}</span>
            </div>
            <div class="weather-details">
              <div class="temperature">
                <span class="temp-value">{{ Math.round(weatherStore.currentWeather.temperature) }}</span>
                <span class="temp-unit">°C</span>
              </div>
              <div class="weather-meta">
                <div class="meta-item">
                  <el-icon><Sunny /></el-icon>
                  <span>{{ weatherStore.currentWeather.weatherType }}</span>
                </div>
                <div class="meta-item">
                  <el-icon><Drizzling /></el-icon>
                  <span>湿度: {{ weatherStore.currentWeather.humidity }}%</span>
                </div>
                <div class="meta-item">
                  <el-icon><Promotion /></el-icon>
                  <span>风速: {{ weatherStore.currentWeather.windSpeed }} m/s</span>
                </div>
              </div>
              <div class="description">
                <p>{{ weatherStore.currentWeather.description }}</p>
              </div>
            </div>
          </el-card>

          <el-button
            type="primary"
            size="large"
            style="margin-top: 20px"
            @click="handleGenerateOutfit"
            :loading="outfitStore.loading"
          >
            根据天气生成穿搭建议
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 穿搭建议展示 -->
    <el-card v-if="outfitStore.suggestion" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>穿搭建议</span>
        </div>
      </template>
      <div class="suggestion-content">
        <div class="suggestion-text" v-html="formatSuggestion(outfitStore.suggestion)"></div>
        <el-button
          type="success"
          style="margin-top: 20px"
          @click="handleSaveHistory"
          :loading="historyStore.loading"
        >
          保存到历史记录
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useWeatherStore } from '../stores/weather'
import { useOutfitStore } from '../stores/outfit'
import { useHistoryStore } from '../stores/history'
import { ElMessage } from 'element-plus'
import { Sunny, Drizzling, Promotion } from '@element-plus/icons-vue'

const location = ref('北京')
const weatherStore = useWeatherStore()
const outfitStore = useOutfitStore()
const historyStore = useHistoryStore()

const handleSearch = async () => {
  if (!location.value.trim()) {
    ElMessage.warning('请输入城市名称')
    return
  }
  await weatherStore.fetchWeather(location.value)
}

const handleGenerateOutfit = async () => {
  if (!weatherStore.currentWeather) {
    ElMessage.warning('请先查询天气')
    return
  }
  await outfitStore.generateByWeather(location.value, 3) // 生成3个不同的方案
}

const handleSaveHistory = async () => {
  if (!outfitStore.suggestion || !weatherStore.currentWeather) {
    ElMessage.warning('没有可保存的建议')
    return
  }
  try {
    await historyStore.saveOutfitHistory({
      outfitData: {
        suggestion: outfitStore.suggestion,
        location: location.value
      },
      weatherInfo: weatherStore.currentWeather
    })
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const formatSuggestion = (text: string) => {
  // 将换行符转换为HTML换行
  return text.replace(/\n/g, '<br>')
}
</script>

<style scoped>
.weather-page {
  max-width: 1000px;
  margin: 0 auto;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
}

.weather-content {
  padding: 20px 0;
}

.loading-container {
  padding: 20px;
}

.weather-info {
  text-align: center;
}

.weather-header {
  margin-bottom: 20px;
}

.weather-header h2 {
  font-size: 28px;
  color: #303133;
  margin-bottom: 10px;
}

.date {
  color: #909399;
  font-size: 14px;
}

.temperature {
  margin: 30px 0;
}

.temp-value {
  font-size: 72px;
  font-weight: bold;
  color: #409eff;
}

.temp-unit {
  font-size: 36px;
  color: #409eff;
  margin-left: 5px;
}

.weather-meta {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin: 30px 0;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
}

.description {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.description p {
  color: #606266;
  font-size: 16px;
  line-height: 1.6;
}

.suggestion-content {
  padding: 20px 0;
}

.suggestion-text {
  text-align: left;
  line-height: 1.8;
  color: #303133;
  font-size: 16px;
  white-space: pre-wrap;
}
</style>

