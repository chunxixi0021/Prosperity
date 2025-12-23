<template>
  <div class="history-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>历史记录</span>
        </div>
      </template>
      <div class="history-content">
        <el-form :inline="true" @submit.prevent="handleSearch">
          <el-form-item label="开始日期">
            <el-date-picker
              v-model="searchParams.startDate"
              type="date"
              placeholder="选择开始日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item label="结束日期">
            <el-date-picker
              v-model="searchParams.endDate"
              type="date"
              placeholder="选择结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch" :loading="historyStore.loading">
              查询
            </el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>

        <el-divider />

        <div v-if="historyStore.loading" class="loading-container">
          <el-skeleton :rows="5" animated />
        </div>

        <el-alert
          v-if="historyStore.error"
          :title="historyStore.error"
          type="error"
          :closable="false"
          style="margin-bottom: 20px"
        />

        <el-empty
          v-if="!historyStore.loading && historyStore.historyList.length === 0"
          description="暂无历史记录"
        />

        <div v-if="!historyStore.loading && historyStore.historyList.length > 0" class="history-list">
          <el-card
            v-for="item in historyStore.historyList"
            :key="item.id"
            shadow="hover"
            class="history-item"
            style="margin-bottom: 20px"
          >
            <div class="history-header">
              <span class="date">{{ item.date }}</span>
              <span class="time">{{ formatTime(item.created_at) }}</span>
            </div>
            <div v-if="item.weatherInfo" class="weather-info">
              <el-tag type="info" size="small">
                {{ item.weatherInfo.location || '未知位置' }}
              </el-tag>
              <el-tag type="warning" size="small" style="margin-left: 10px">
                {{ Math.round(item.weatherInfo.temperature) }}°C
              </el-tag>
              <el-tag size="small" style="margin-left: 10px">
                {{ item.weatherInfo.weatherType }}
              </el-tag>
            </div>
            <!-- 显示效果图（优先显示保存的base64图片，否则使用imageConfig重新渲染） -->
            <div v-if="item.outfitData.imageBase64 || item.outfitData.imageConfig || item.outfitData.selectedColors" class="outfit-image-section">
              <!-- 如果有保存的base64图片，直接显示 -->
              <img 
                v-if="item.outfitData.imageBase64" 
                :src="item.outfitData.imageBase64" 
                alt="穿搭效果图"
                style="max-width: 100%; height: auto; border-radius: 8px;"
              />
              <!-- 否则使用imageConfig或selectedColors重新渲染SVG -->
              <OutfitAvatar 
                v-else-if="item.outfitData.imageConfig || item.outfitData.selectedColors" 
                :image-config="item.outfitData.imageConfig || item.outfitData.selectedColors" 
              />
            </div>
            
            <!-- 显示穿搭建议（仅当没有效果图时显示，或者作为补充信息） -->
            <div v-if="item.outfitData.suggestion && !item.outfitData.imageBase64 && !item.outfitData.imageConfig" class="suggestion-content">
              <div
                class="suggestion-text"
                v-html="formatSuggestion(item.outfitData.suggestion)"
              ></div>
            </div>
            
            <!-- 显示衣物列表 -->
            <div v-if="item.outfitData.clothes" class="clothes-list">
              <el-tag
                v-for="(clothes, index) in item.outfitData.clothes"
                :key="index"
                style="margin-right: 10px; margin-top: 10px"
              >
                {{ clothes.name }} ({{ clothes.type }}, {{ clothes.color }})
              </el-tag>
            </div>
          </el-card>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useHistoryStore } from '../stores/history'
import dayjs from 'dayjs'
import OutfitAvatar from '../components/OutfitAvatar.vue'

const historyStore = useHistoryStore()

const searchParams = ref<{
  startDate?: string
  endDate?: string
}>({})

const handleSearch = async () => {
  await historyStore.fetchHistory(searchParams.value)
}

const handleReset = () => {
  searchParams.value = {}
  handleSearch()
}

const formatTime = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

const formatSuggestion = (text: string) => {
  if (typeof text === 'string') {
    return text.replace(/\n/g, '<br>')
  }
  return text
}

onMounted(() => {
  handleSearch()
})
</script>

<style scoped>
.history-page {
  max-width: 1000px;
  margin: 0 auto;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
}

.history-content {
  padding: 20px 0;
}

.loading-container {
  padding: 20px;
}

.history-item {
  text-align: left;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.date {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.time {
  color: #909399;
  font-size: 14px;
}

.weather-info {
  margin-bottom: 15px;
}

.suggestion-content {
  margin-top: 15px;
}

.suggestion-text {
  line-height: 1.8;
  color: #606266;
  font-size: 15px;
  white-space: pre-wrap;
}

.clothes-list {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
}

.outfit-image-section {
  margin: 20px 0;
  display: flex;
  justify-content: center;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}
</style>

