<template>
  <el-container>
    <el-header>
      <el-menu
        mode="horizontal"
        :default-active="activeIndex"
        router
        class="header-menu"
      >
        <el-menu-item index="/">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/weather">
          <el-icon><Sunny /></el-icon>
          <span>天气查询</span>
        </el-menu-item>
        <el-menu-item index="/outfit">
          <el-icon><ShoppingBag /></el-icon>
          <span>穿搭建议</span>
        </el-menu-item>
        <el-menu-item index="/custom-outfit">
          <el-icon><Brush /></el-icon>
          <span>自定义搭配</span>
        </el-menu-item>
        <el-menu-item index="/history">
          <el-icon><Clock /></el-icon>
          <span>历史记录</span>
        </el-menu-item>
      </el-menu>
    </el-header>
    <el-main>
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { HomeFilled, Sunny, ShoppingBag, Brush, Clock } from '@element-plus/icons-vue'

const route = useRoute()
const activeIndex = computed(() => route.path)
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.header-menu {
  border-bottom: 1px solid #e4e7ed;
}

.el-header {
  padding: 0;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.el-main {
  padding: 20px;
  min-height: calc(100vh - 60px);
  background-color: #f5f7fa;
}
</style>
