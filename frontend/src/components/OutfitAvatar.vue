<template>
  <div class="outfit-avatar-container">
    <div class="avatar-wrapper">
      <svg ref="svgRef" width="300" height="420" viewBox="0 0 300 420" class="outfit-avatar">
        <defs>
          <!-- 渐变定义 -->
          <linearGradient id="skinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#FFE4C4;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#FFDBAC;stop-opacity:1" />
          </linearGradient>
          <!-- 动态渐变定义，使用颜色值作为ID的一部分，确保颜色变化时更新 -->
          <linearGradient :id="`topGradient-${imageConfig.top?.color || 'default'}`" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" :style="`stop-color:${imageConfig.top?.color || '#CCCCCC'};stop-opacity:1`" />
            <stop offset="100%" :style="`stop-color:${imageConfig.top ? adjustBrightness(imageConfig.top.color, -20) : '#AAAAAA'};stop-opacity:1`" />
          </linearGradient>
          <linearGradient :id="`bottomGradient-${imageConfig.bottom?.color || 'default'}`" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" :style="`stop-color:${imageConfig.bottom?.color || '#CCCCCC'};stop-opacity:1`" />
            <stop offset="100%" :style="`stop-color:${imageConfig.bottom ? adjustBrightness(imageConfig.bottom.color, -20) : '#AAAAAA'};stop-opacity:1`" />
          </linearGradient>
          <linearGradient :id="`outerwearGradient-${imageConfig.outerwear?.color || 'default'}`" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" :style="`stop-color:${imageConfig.outerwear?.color || '#CCCCCC'};stop-opacity:0.9`" />
            <stop offset="100%" :style="`stop-color:${imageConfig.outerwear ? adjustBrightness(imageConfig.outerwear.color, -20) : '#AAAAAA'};stop-opacity:0.9`" />
          </linearGradient>
          <linearGradient :id="`shoesGradient-${imageConfig.shoes?.color || 'default'}`" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" :style="`stop-color:${imageConfig.shoes?.color || '#333333'};stop-opacity:1`" />
            <stop offset="100%" :style="`stop-color:${imageConfig.shoes ? adjustBrightness(imageConfig.shoes.color, -30) : '#000000'};stop-opacity:1`" />
          </linearGradient>
          <!-- 阴影滤镜 -->
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
            <feOffset dx="2" dy="2" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <!-- 地面阴影 -->
        <ellipse cx="150" cy="400" rx="55" ry="12" fill="#000000" opacity="0.18" />
        
        <!-- 身体（下装）先画，这样上衣可以在上面 -->
        <rect
          v-if="imageConfig.bottom"
          x="100"
          y="240"
          width="100"
          height="140"
          rx="14"
          :fill="`url(#bottomGradient-${imageConfig.bottom.color || 'default'})`"
          filter="url(#shadow)"
        />
        <rect
          v-else
          x="100"
          y="240"
          width="100"
          height="140"
          rx="14"
          fill="#CCCCCC"
          filter="url(#shadow)"
        />
        
        <!-- 下装高光 -->
        <rect
          v-if="imageConfig.bottom"
          x="105"
          y="245"
          width="90"
          height="25"
          rx="10"
          fill="#FFFFFF"
          opacity="0.25"
        />
        
        <!-- 下装褶皱 -->
        <path
          v-if="imageConfig.bottom"
          d="M 120 280 Q 150 275 180 280"
          stroke="#000000"
          stroke-width="1"
          fill="none"
          opacity="0.1"
        />
        <path
          v-if="imageConfig.bottom"
          d="M 120 320 Q 150 315 180 320"
          stroke="#000000"
          stroke-width="1"
          fill="none"
          opacity="0.1"
        />
        
        <!-- 身体（上衣） -->
        <rect
          v-if="imageConfig.top"
          x="95"
          y="180"
          width="110"
          height="80"
          rx="14"
          :fill="`url(#topGradient-${imageConfig.top.color || 'default'})`"
          filter="url(#shadow)"
        />
        <rect
          v-else
          x="95"
          y="180"
          width="110"
          height="80"
          rx="14"
          fill="#CCCCCC"
          filter="url(#shadow)"
        />
        
        <!-- 上衣高光 -->
        <rect
          v-if="imageConfig.top"
          x="100"
          y="185"
          width="100"
          height="18"
          rx="10"
          fill="#FFFFFF"
          opacity="0.3"
        />
        
        <!-- 上衣领口 -->
        <ellipse
          v-if="imageConfig.top"
          cx="150"
          cy="185"
          rx="25"
          ry="8"
          fill="#000000"
          opacity="0.1"
        />
        
        <!-- 外套 -->
        <rect
          v-if="imageConfig.outerwear"
          x="80"
          y="165"
          width="120"
          height="85"
          rx="12"
          :fill="`url(#outerwearGradient-${imageConfig.outerwear.color || 'default'})`"
          opacity="0.88"
          filter="url(#shadow)"
        />
        
        <!-- 判断是否为长袖 -->
        
        <!-- 左手臂（根据袖长显示） -->
        <g v-if="isLongSleeve()">
          <!-- 长袖：手臂被袖子覆盖 -->
          <ellipse cx="75" cy="210" rx="18" ry="45" :fill="imageConfig.top ? `url(#topGradient-${imageConfig.top.color})` : 'url(#topGradient-default)'" filter="url(#shadow)" />
          <!-- 袖子高光 -->
          <ellipse cx="78" cy="205" rx="13" ry="18" fill="#FFFFFF" opacity="0.25" />
          <!-- 袖口（长袖） -->
          <ellipse cx="75" cy="250" rx="16" ry="9" :fill="imageConfig.top ? `url(#topGradient-${imageConfig.top.color})` : 'url(#topGradient-default)'" />
          <ellipse cx="75" cy="250" rx="14" ry="7" :fill="imageConfig.top ? adjustBrightness(imageConfig.top.color, -35) : '#666666'" />
        </g>
        <g v-else>
          <!-- 短袖：显示手臂 -->
          <ellipse cx="75" cy="210" rx="15" ry="42" fill="url(#skinGradient)" filter="url(#shadow)" />
          <!-- 手臂高光 -->
          <ellipse cx="78" cy="205" rx="11" ry="18" fill="#FFFFFF" opacity="0.35" />
          <!-- 短袖袖口 -->
          <ellipse cx="75" cy="225" rx="13" ry="7" :fill="imageConfig.top ? `url(#topGradient-${imageConfig.top.color})` : 'url(#topGradient-default)'" />
          <ellipse cx="75" cy="225" rx="11" ry="5" :fill="imageConfig.top ? adjustBrightness(imageConfig.top.color, -20) : '#888888'" />
        </g>
        
        <!-- 左手和手指（更清晰） -->
        <g>
          <!-- 左手腕 -->
          <ellipse cx="65" cy="250" rx="7" ry="11" fill="url(#skinGradient)" />
          <!-- 左手掌 -->
          <ellipse cx="58" cy="260" rx="8" ry="11" fill="url(#skinGradient)" filter="url(#shadow)" />
          <!-- 大拇指 -->
          <ellipse cx="48" cy="258" rx="4.5" ry="7" fill="url(#skinGradient)" />
          <!-- 食指 -->
          <ellipse cx="52" cy="265" rx="3.5" ry="7" fill="url(#skinGradient)" />
          <!-- 中指 -->
          <ellipse cx="56" cy="268" rx="3.5" ry="8" fill="url(#skinGradient)" />
          <!-- 无名指 -->
          <ellipse cx="60" cy="267" rx="3" ry="7" fill="url(#skinGradient)" />
          <!-- 小指 -->
          <ellipse cx="63" cy="265" rx="2.5" ry="6" fill="url(#skinGradient)" />
        </g>
        
        <!-- 右手臂（根据袖长显示） -->
        <g v-if="isLongSleeve()">
          <!-- 长袖：手臂被袖子覆盖 -->
          <ellipse cx="225" cy="210" rx="18" ry="45" :fill="imageConfig.top ? `url(#topGradient-${imageConfig.top.color})` : 'url(#topGradient-default)'" filter="url(#shadow)" />
          <!-- 袖子高光 -->
          <ellipse cx="222" cy="205" rx="13" ry="18" fill="#FFFFFF" opacity="0.25" />
          <!-- 袖口（长袖） -->
          <ellipse cx="225" cy="250" rx="16" ry="9" :fill="imageConfig.top ? `url(#topGradient-${imageConfig.top.color})` : 'url(#topGradient-default)'" />
          <ellipse cx="225" cy="250" rx="14" ry="7" :fill="imageConfig.top ? adjustBrightness(imageConfig.top.color, -35) : '#666666'" />
        </g>
        <g v-else>
          <!-- 短袖：显示手臂 -->
          <ellipse cx="225" cy="210" rx="15" ry="42" fill="url(#skinGradient)" filter="url(#shadow)" />
          <!-- 手臂高光 -->
          <ellipse cx="222" cy="205" rx="11" ry="18" fill="#FFFFFF" opacity="0.35" />
          <!-- 短袖袖口 -->
          <ellipse cx="225" cy="225" rx="13" ry="7" :fill="imageConfig.top ? `url(#topGradient-${imageConfig.top.color})` : 'url(#topGradient-default)'" />
          <ellipse cx="225" cy="225" rx="11" ry="5" :fill="imageConfig.top ? adjustBrightness(imageConfig.top.color, -20) : '#888888'" />
        </g>
        
        <!-- 右手和手指（更清晰） -->
        <g>
          <!-- 右手腕 -->
          <ellipse cx="235" cy="250" rx="7" ry="11" fill="url(#skinGradient)" />
          <!-- 右手掌 -->
          <ellipse cx="242" cy="260" rx="8" ry="11" fill="url(#skinGradient)" filter="url(#shadow)" />
          <!-- 大拇指 -->
          <ellipse cx="252" cy="258" rx="4.5" ry="7" fill="url(#skinGradient)" />
          <!-- 食指 -->
          <ellipse cx="248" cy="265" rx="3.5" ry="7" fill="url(#skinGradient)" />
          <!-- 中指 -->
          <ellipse cx="244" cy="268" rx="3.5" ry="8" fill="url(#skinGradient)" />
          <!-- 无名指 -->
          <ellipse cx="240" cy="267" rx="3" ry="7" fill="url(#skinGradient)" />
          <!-- 小指 -->
          <ellipse cx="237" cy="265" rx="2.5" ry="6" fill="url(#skinGradient)" />
        </g>
        
        <!-- 头部（大头风格，更大更圆） -->
        <circle cx="150" cy="100" r="65" fill="url(#skinGradient)" filter="url(#shadow)" />
        
        <!-- 头部高光 -->
        <ellipse cx="150" cy="85" rx="38" ry="28" fill="#FFFFFF" opacity="0.35" />
        
        <!-- 头发（可选，根据配饰） -->
        <ellipse
          v-if="!imageConfig.accessories"
          cx="150"
          cy="55"
          rx="60"
          ry="32"
          fill="#8B4513"
          opacity="0.9"
          filter="url(#shadow)"
        />
        <!-- 头发高光 -->
        <ellipse
          v-if="!imageConfig.accessories"
          cx="150"
          cy="50"
          rx="50"
          ry="22"
          fill="#A0522D"
          opacity="0.6"
        />
        
        <!-- 配饰（帽子，更立体） -->
        <g v-if="imageConfig.accessories">
          <!-- 帽子主体 -->
          <ellipse
            cx="150"
            cy="40"
            rx="70"
            ry="28"
            :fill="imageConfig.accessories.color"
            filter="url(#shadow)"
          />
          <!-- 帽子高光 -->
          <ellipse
            cx="150"
            cy="35"
            rx="60"
            ry="20"
            fill="#FFFFFF"
            opacity="0.35"
          />
          <!-- 帽子阴影 -->
          <ellipse
            cx="150"
            cy="45"
            rx="65"
            ry="22"
            fill="#000000"
            opacity="0.25"
          />
        </g>
        
        <!-- 眼睛（左，更大更可爱） -->
        <circle cx="135" cy="95" r="11" fill="#000000" />
        <circle cx="137" cy="93" r="5" fill="#FFFFFF" />
        <circle cx="138" cy="92" r="2.5" fill="#000000" />
        <!-- 眼睛（右） -->
        <circle cx="165" cy="95" r="11" fill="#000000" />
        <circle cx="167" cy="93" r="5" fill="#FFFFFF" />
        <circle cx="168" cy="92" r="2.5" fill="#000000" />
        
        <!-- 眉毛（左） -->
        <path
          d="M 128 85 Q 135 80 142 85"
          stroke="#8B4513"
          stroke-width="3.5"
          fill="none"
          stroke-linecap="round"
        />
        <!-- 眉毛（右） -->
        <path
          d="M 158 85 Q 165 80 172 85"
          stroke="#8B4513"
          stroke-width="3.5"
          fill="none"
          stroke-linecap="round"
        />
        
        <!-- 鼻子 -->
        <ellipse cx="150" cy="105" rx="5" ry="7" fill="#E6C5A0" />
        
        <!-- 嘴巴（更开心的微笑） -->
        <path
          d="M 130 115 Q 150 125 170 115"
          stroke="#000000"
          stroke-width="3"
          fill="none"
          stroke-linecap="round"
        />
        <!-- 嘴巴内部（舌头） -->
        <ellipse cx="150" cy="117" rx="9" ry="5" fill="#FF69B4" opacity="0.65" />
        
        <!-- 腮红（左） -->
        <ellipse cx="115" cy="110" rx="10" ry="7" fill="#FFB6C1" opacity="0.45" />
        <!-- 腮红（右） -->
        <ellipse cx="185" cy="110" rx="10" ry="7" fill="#FFB6C1" opacity="0.45" />
        
        <!-- 鞋子（左，更立体） -->
        <ellipse
          v-if="imageConfig.shoes"
          cx="120"
          cy="380"
          rx="26"
          ry="14"
          :fill="`url(#shoesGradient-${imageConfig.shoes.color})`"
          filter="url(#shadow)"
        />
        <ellipse
          v-else
          cx="120"
          cy="380"
          rx="26"
          ry="14"
          fill="#333333"
          filter="url(#shadow)"
        />
        <!-- 鞋子高光（左） -->
        <ellipse
          v-if="imageConfig.shoes"
          cx="118"
          cy="375"
          rx="20"
          ry="10"
          fill="#FFFFFF"
          opacity="0.35"
        />
        
        <!-- 鞋子（右） -->
        <ellipse
          v-if="imageConfig.shoes"
          cx="180"
          cy="380"
          rx="26"
          ry="14"
          :fill="`url(#shoesGradient-${imageConfig.shoes.color})`"
          filter="url(#shadow)"
        />
        <ellipse
          v-else
          cx="180"
          cy="380"
          rx="26"
          ry="14"
          fill="#333333"
          filter="url(#shadow)"
        />
        <!-- 鞋子高光（右） -->
        <ellipse
          v-if="imageConfig.shoes"
          cx="178"
          cy="375"
          rx="20"
          ry="10"
          fill="#FFFFFF"
          opacity="0.35"
        />
      </svg>
    </div>
    
    <!-- 颜色搭配信息 -->
    <div class="color-info">
      <div v-if="imageConfig.top" class="color-item">
        <span class="color-label">上衣：</span>
        <span class="color-box" :style="{ backgroundColor: imageConfig.top.color }"></span>
        <span>{{ imageConfig.top.type || imageConfig.top.name || '上衣' }}</span>
      </div>
      <div v-if="imageConfig.bottom" class="color-item">
        <span class="color-label">下装：</span>
        <span class="color-box" :style="{ backgroundColor: imageConfig.bottom.color }"></span>
        <span>{{ imageConfig.bottom.type || imageConfig.bottom.name || '下装' }}</span>
      </div>
      <div v-if="imageConfig.outerwear" class="color-item">
        <span class="color-label">外套：</span>
        <span class="color-box" :style="{ backgroundColor: imageConfig.outerwear.color }"></span>
        <span>{{ imageConfig.outerwear.type || imageConfig.outerwear.name || '外套' }}</span>
      </div>
      <div v-if="imageConfig.shoes" class="color-item">
        <span class="color-label">鞋子：</span>
        <span class="color-box" :style="{ backgroundColor: imageConfig.shoes.color }"></span>
        <span>{{ imageConfig.shoes.type || imageConfig.shoes.name || '鞋子' }}</span>
      </div>
      <div v-if="imageConfig.accessories" class="color-item">
        <span class="color-label">配饰：</span>
        <span class="color-box" :style="{ backgroundColor: imageConfig.accessories.color }"></span>
        <span>{{ imageConfig.accessories.type || imageConfig.accessories.name || '配饰' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, ref } from 'vue'
import type { OutfitImageConfig } from '../api/outfit'

interface Props {
  imageConfig: OutfitImageConfig
}

const props = defineProps<Props>()
const svgRef = ref<SVGElement | null>(null)

// 暴露SVG元素引用，以便父组件可以获取
defineExpose({
  svgElement: svgRef
})

// 监听imageConfig变化，确保颜色变化时重新渲染
watch(() => props.imageConfig, () => {
  // 强制更新渐变定义
}, { deep: true })

// 判断是否为长袖
function isLongSleeve(): boolean {
  const topName = props.imageConfig.top?.name || props.imageConfig.top?.type || ''
  return topName.includes('长袖') || topName.includes('长') || 
         (topName.includes('衬衫') || topName.includes('外套') || topName.includes('卫衣')) ||
         (!topName.includes('短袖') && !topName.includes('短') && !topName.includes('T恤') && topName !== '')
}

// 调整颜色亮度
function adjustBrightness(color: string, percent: number): string {
  // 移除#号
  const num = parseInt(color.replace('#', ''), 16)
  
  // 提取RGB值
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  
  // 调整亮度
  const newR = Math.max(0, Math.min(255, r + (r * percent / 100)))
  const newG = Math.max(0, Math.min(255, g + (g * percent / 100)))
  const newB = Math.max(0, Math.min(255, b + (b * percent / 100)))
  
  // 转换回十六进制
  const newColor = '#' + 
    Math.round(newR).toString(16).padStart(2, '0') +
    Math.round(newG).toString(16).padStart(2, '0') +
    Math.round(newB).toString(16).padStart(2, '0')
  
  return newColor
}
</script>

<style scoped>
.outfit-avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.avatar-wrapper {
  background: linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 50%, #F0F2F5 100%);
  border-radius: 20px;
  padding: 40px 30px;
  margin-bottom: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(228, 231, 237, 0.8);
  position: relative;
  overflow: visible;
}

.avatar-wrapper::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.1), rgba(103, 194, 58, 0.1));
  border-radius: 20px;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-wrapper:hover::before {
  opacity: 1;
}

.outfit-avatar {
  display: block;
}

.color-info {
  width: 100%;
  max-width: 300px;
}

.color-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
}

.color-label {
  width: 60px;
  font-weight: bold;
  color: #606266;
}

.color-box {
  width: 30px;
  height: 30px;
  border-radius: 4px;
  border: 2px solid #DCDFE6;
  margin-right: 10px;
  display: inline-block;
}
</style>

