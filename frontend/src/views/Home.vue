<template>
  <div class="home">
    <el-card class="welcome-card">
      <template #header>
        <div class="card-header">
          <span>欢迎使用智能穿搭建议系统</span>
        </div>
      </template>
      <div class="welcome-content">
        <el-icon :size="80" color="#409eff"><Sunny /></el-icon>
        <h2>根据天气，智能推荐穿搭</h2>
        <p>基于实时天气数据和AI技术，为您提供个性化的穿衣建议</p>
        <div class="feature-list">
          <el-card shadow="hover" class="feature-card">
            <el-icon :size="40" color="#67c23a"><Sunny /></el-icon>
            <h3>实时天气</h3>
            <p>查询当前天气情况</p>
          </el-card>
          <el-card shadow="hover" class="feature-card">
            <el-icon :size="40" color="#409eff"><ShoppingBag /></el-icon>
            <h3>AI建议</h3>
            <p>智能生成穿搭方案</p>
          </el-card>
          <el-card shadow="hover" class="feature-card">
            <el-icon :size="40" color="#e6a23c"><Clock /></el-icon>
            <h3>历史记录</h3>
            <p>保存搭配历史</p>
          </el-card>
        </div>
        <el-button type="primary" size="large" @click="$router.push('/weather')">
          开始使用
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Sunny, ShoppingBag, Clock } from '@element-plus/icons-vue'
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-card {
  text-align: center;
  padding: 40px;
}

.card-header {
  font-size: 24px;
  font-weight: bold;
}

.welcome-content {
  padding: 20px 0;
}

.welcome-content h2 {
  margin: 20px 0;
  color: #303133;
}

.welcome-content p {
  color: #606266;
  font-size: 16px;
  margin-bottom: 40px;
}

.feature-list {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin: 40px 0;
  flex-wrap: wrap;
}

.feature-card {
  width: 200px;
  text-align: center;
  padding: 20px;
}

.feature-card h3 {
  margin: 15px 0 10px;
  color: #303133;
}

.feature-card p {
  color: #909399;
  font-size: 14px;
  margin: 0;
}
</style>

