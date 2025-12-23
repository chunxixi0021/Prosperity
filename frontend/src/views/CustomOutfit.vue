<template>
  <div class="custom-outfit-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>自定义穿搭建议</span>
        </div>
      </template>
      <div class="custom-outfit-content">
        <p class="description">请添加您拥有的衣物，AI将为您生成合理的搭配建议和卡通效果图</p>

        <el-form :model="form" label-width="100px">
          <el-form-item label="穿搭场景">
            <el-input
              v-model="form.scene"
              placeholder="请输入穿搭场景，如：日常通勤、约会、运动、聚会、正式场合等（可选）"
              style="width: 500px"
              clearable
            />
            <el-text type="info" style="margin-left: 10px">
              如果不填写，AI会询问您的场景需求
            </el-text>
          </el-form-item>
          <el-divider />
          <el-form-item
            v-for="(item, index) in form.clothes"
            :key="index"
            :label="`衣物 ${index + 1}`"
          >
            <div class="clothes-item">
              <el-input
                v-model="item.name"
                placeholder="衣物名称，如：蓝色T恤"
                style="width: 200px; margin-right: 10px"
              />
              <el-select
                v-model="item.type"
                placeholder="类型"
                style="width: 150px; margin-right: 10px"
              >
                <el-option label="上衣" value="top" />
                <el-option label="下装" value="bottom" />
                <el-option label="外套" value="outerwear" />
                <el-option label="鞋子" value="shoes" />
                <el-option label="配饰" value="accessories" />
              </el-select>
              <el-color-picker
                v-model="item.color"
                show-alpha
                :predefine="predefineColors"
                style="margin-right: 10px"
              />
              <el-input
                v-model="item.colorName"
                placeholder="颜色名称"
                style="width: 120px; margin-right: 10px"
              />
              <el-button
                type="danger"
                :icon="Delete"
                @click="removeClothes(index)"
                :disabled="form.clothes.length === 1"
              >
                删除
              </el-button>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Plus" @click="addClothes">
              添加衣物
            </el-button>
          </el-form-item>
          <el-form-item>
            <el-button
              type="success"
              size="large"
              @click="handleGenerate"
              :loading="outfitStore.loading"
              :disabled="!canGenerate"
            >
              生成搭配建议和效果图
            </el-button>
          </el-form-item>
        </el-form>

        <el-divider />

        <div v-if="outfitStore.loading" class="loading-container">
          <el-alert
            v-if="outfitStore.imageConfig"
            title="效果图已生成，正在生成AI建议..."
            type="info"
            :closable="false"
            style="margin-bottom: 20px"
          />
          <el-skeleton :rows="8" animated />
        </div>

        <el-alert
          v-if="outfitStore.error"
          :title="outfitStore.error"
          type="error"
          :closable="false"
          style="margin-bottom: 20px"
        />

        <div v-if="outfitStore.suggestion && !outfitStore.loading" class="result-container">
          <!-- 多个搭配方案效果图展示 -->
          <el-card v-if="outfitStore.schemes && outfitStore.schemes.length > 0" shadow="hover" class="schemes-card">
            <template #header>
              <div class="card-title">多个搭配方案效果图</div>
            </template>
            <div class="schemes-container">
              <div
                v-for="(scheme, index) in outfitStore.schemes"
                :key="index"
                class="scheme-item"
                :class="{ 'scheme-selected': selectedSchemeIndex === index }"
                @click="selectScheme(index)"
              >
                <div class="scheme-header">
                  <h4 class="scheme-title">方案 {{ index + 1 }}: {{ scheme.description }}</h4>
                  <el-tag v-if="selectedSchemeIndex === index" type="success" size="small">已选择</el-tag>
                </div>
                <OutfitAvatar :image-config="convertSchemeToImageConfig(scheme)" />
                <div class="scheme-details">
                  <div v-if="scheme.top" class="scheme-detail-item">
                    <span class="color-dot" :style="{ backgroundColor: scheme.top.color }"></span>
                    <span>上衣：{{ scheme.top.name }}</span>
                  </div>
                  <div v-if="scheme.bottom" class="scheme-detail-item">
                    <span class="color-dot" :style="{ backgroundColor: scheme.bottom.color }"></span>
                    <span>下装：{{ scheme.bottom.name }}</span>
                  </div>
                  <div v-if="scheme.shoes" class="scheme-detail-item">
                    <span class="color-dot" :style="{ backgroundColor: scheme.shoes.color }"></span>
                    <span>鞋子：{{ scheme.shoes.name }}</span>
                  </div>
                  <div v-if="scheme.outerwear" class="scheme-detail-item">
                    <span class="color-dot" :style="{ backgroundColor: scheme.outerwear.color }"></span>
                    <span>外套：{{ scheme.outerwear.name }}</span>
                  </div>
                  <div v-if="scheme.accessories" class="scheme-detail-item">
                    <span class="color-dot" :style="{ backgroundColor: scheme.accessories.color }"></span>
                    <span>配饰：{{ scheme.accessories.name }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="selectedSchemeIndex !== null" class="scheme-actions">
              <el-button type="primary" size="large" @click="applySelectedScheme">
                应用此方案
              </el-button>
            </div>
          </el-card>

          <!-- 用户提供的衣物效果图（如果用户提供了完整衣物） -->
          <el-card v-if="outfitStore.selectedColors" shadow="hover" class="image-card">
            <template #header>
              <div class="card-title">您提供的衣物效果图</div>
            </template>
            <div class="image-section">
              <OutfitAvatar 
                ref="outfitAvatarRef"
                v-if="selectedColors || outfitStore.selectedColors" 
                :key="`avatar-${Date.now()}-${selectedColors?.top?.color}-${selectedColors?.bottom?.color}-${selectedColors?.shoes?.color}`"
                :image-config="selectedColors || outfitStore.selectedColors" 
              />
              
              <!-- 颜色选择器 -->
              <div v-if="selectedColors" class="color-selector">
                <h4>调整颜色搭配：</h4>
                <div class="color-controls">
                  <div v-if="selectedColors.top" class="color-control-item">
                    <label>上衣颜色：</label>
                    <el-color-picker
                      v-model="selectedColors.top.color"
                      @change="(val: string | null) => handleColorChange('top', val)"
                      color-format="hex"
                      :predefine="predefineColors"
                    />
                    <span class="color-value">{{ selectedColors.top.color }}</span>
                  </div>
                  <div v-if="selectedColors.bottom" class="color-control-item">
                    <label>下装颜色：</label>
                    <el-color-picker
                      v-model="selectedColors.bottom.color"
                      @change="(val: string | null) => handleColorChange('bottom', val)"
                      color-format="hex"
                      :predefine="predefineColors"
                    />
                    <span class="color-value">{{ selectedColors.bottom.color }}</span>
                  </div>
                  <div v-if="selectedColors.outerwear" class="color-control-item">
                    <label>外套颜色：</label>
                    <el-color-picker
                      v-model="selectedColors.outerwear.color"
                      @change="(val: string | null) => handleColorChange('outerwear', val)"
                      color-format="hex"
                      :predefine="predefineColors"
                    />
                    <span class="color-value">{{ selectedColors.outerwear.color }}</span>
                  </div>
                  <div v-if="selectedColors.shoes" class="color-control-item">
                    <label>鞋子颜色：</label>
                    <el-color-picker
                      v-model="selectedColors.shoes.color"
                      @change="(val: string | null) => handleColorChange('shoes', val)"
                      color-format="hex"
                      :predefine="predefineColors"
                    />
                    <span class="color-value">{{ selectedColors.shoes.color }}</span>
                  </div>
                  <div v-if="selectedColors.accessories" class="color-control-item">
                    <label>配饰颜色：</label>
                    <el-color-picker
                      v-model="selectedColors.accessories.color"
                      @change="(val: string | null) => handleColorChange('accessories', val)"
                      color-format="hex"
                      :predefine="predefineColors"
                    />
                    <span class="color-value">{{ selectedColors.accessories.color }}</span>
                  </div>
                </div>
              </div>
            </div>
          </el-card>

          <!-- 穿搭建议 -->
          <el-card shadow="hover" class="suggestion-card">
            <template #header>
              <div class="card-title">AI穿搭建议</div>
            </template>
            <div class="suggestion-text" v-html="formatSuggestion(outfitStore.suggestion)"></div>
          </el-card>

          <!-- 搭配理由 -->
          <el-card v-if="outfitStore.reasoning" shadow="hover" class="reasoning-card">
            <template #header>
              <div class="card-title">搭配理由和目的</div>
            </template>
            <div class="reasoning-text" v-html="formatSuggestion(outfitStore.reasoning)"></div>
          </el-card>

          <!-- 全身色彩搭配 -->
          <el-card v-if="outfitStore.colorScheme" shadow="hover" class="color-scheme-card">
            <template #header>
              <div class="card-title">全身色彩搭配分析</div>
            </template>
            <div class="color-scheme-text" v-html="formatSuggestion(outfitStore.colorScheme)"></div>
            <!-- 色彩搭配可视化 -->
            <div v-if="selectedColors" class="color-visualization">
              <div class="color-palette">
                <div v-if="selectedColors.top" class="color-item-large">
                  <div class="color-swatch" :style="{ backgroundColor: selectedColors.top.color }"></div>
                  <span class="color-label-large">上衣</span>
                </div>
                <div v-if="selectedColors.bottom" class="color-item-large">
                  <div class="color-swatch" :style="{ backgroundColor: selectedColors.bottom.color }"></div>
                  <span class="color-label-large">下装</span>
                </div>
                <div v-if="selectedColors.outerwear" class="color-item-large">
                  <div class="color-swatch" :style="{ backgroundColor: selectedColors.outerwear.color }"></div>
                  <span class="color-label-large">外套</span>
                </div>
                <div v-if="selectedColors.shoes" class="color-item-large">
                  <div class="color-swatch" :style="{ backgroundColor: selectedColors.shoes.color }"></div>
                  <span class="color-label-large">鞋子</span>
                </div>
                <div v-if="selectedColors.accessories" class="color-item-large">
                  <div class="color-swatch" :style="{ backgroundColor: selectedColors.accessories.color }"></div>
                  <span class="color-label-large">配饰</span>
                </div>
              </div>
            </div>
          </el-card>

          <!-- 保存按钮 -->
          <el-button
            type="success"
            size="large"
            style="margin-top: 20px; width: 100%"
            @click="handleSaveHistory"
            :loading="historyStore.loading"
          >
            保存当前颜色搭配到历史记录
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useOutfitStore } from '../stores/outfit'
import { useHistoryStore } from '../stores/history'
import { ElMessage } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import OutfitAvatar from '../components/OutfitAvatar.vue'
import { generateOutfitImage } from '../api/outfit'
import type { OutfitImageConfig, OutfitScheme } from '../api/outfit'
import { svgToBase64 } from '../utils/imageUtils'

interface ClothesItem {
  name: string
  type: string
  color: string
  colorName: string
}

const form = ref<{ clothes: ClothesItem[]; scene: string }>({
  clothes: [
    { name: '', type: '', color: '#409EFF', colorName: '' }
  ],
  scene: ''
})

const outfitStore = useOutfitStore()
const historyStore = useHistoryStore()

// 预定义颜色
const predefineColors = [
  '#FF4444', '#4444FF', '#44FF44', '#FFFF44',
  '#333333', '#FFFFFF', '#888888', '#FF88CC',
  '#8844FF', '#FF8844', '#8B4513', '#000080',
  '#87CEEB', '#555555', '#CCCCCC'
]

// 选择的颜色搭配
const selectedColors = ref<OutfitImageConfig | null>(null)
// 选中的方案索引
const selectedSchemeIndex = ref<number | null>(null)
// OutfitAvatar组件引用
const outfitAvatarRef = ref<InstanceType<typeof OutfitAvatar> | null>(null)

// 监听imageConfig变化，初始化selectedColors
watch(() => outfitStore.imageConfig, (newConfig) => {
  if (newConfig) {
    selectedColors.value = JSON.parse(JSON.stringify(newConfig))
  }
}, { immediate: true })

const canGenerate = computed(() => {
  return form.value.clothes.some(
    item => item.name.trim() && item.type && item.color
  )
})

const addClothes = () => {
  form.value.clothes.push({ name: '', type: '', color: '#409EFF', colorName: '' })
}

const removeClothes = (index: number) => {
  if (form.value.clothes.length > 1) {
    form.value.clothes.splice(index, 1)
  }
}

const handleGenerate = async () => {
  const validClothes = form.value.clothes
    .filter(item => item.name.trim() && item.type && item.color)
    .map(item => ({
      name: item.name.trim(),
      type: item.type,
      color: item.colorName || item.color
    }))

  if (validClothes.length === 0) {
    ElMessage.warning('请至少添加一件完整的衣物信息')
    return
  }

  // 先立即生成效果图配置（同步，很快）
  try {
    const imageResponse = await generateOutfitImage(validClothes)
    if (imageResponse.success && imageResponse.data.imageConfig) {
      outfitStore.imageConfig = imageResponse.data.imageConfig
      outfitStore.selectedColors = imageResponse.data.imageConfig
      selectedColors.value = JSON.parse(JSON.stringify(imageResponse.data.imageConfig))
    }
  } catch (error) {
    console.warn('效果图配置生成失败，将继续等待AI建议', error)
  }

  // 然后生成AI建议（异步，较慢）
  await outfitStore.generateByClothes(validClothes, form.value.scene.trim() || undefined, 3) // 生成3个不同的方案
  
  // 确保selectedColors已设置
  if (outfitStore.imageConfig && !selectedColors.value) {
    selectedColors.value = JSON.parse(JSON.stringify(outfitStore.imageConfig))
  }
}

// 将颜色转换为标准的hex格式（去除alpha通道）
function normalizeColor(color: string): string {
  if (!color) return '#CCCCCC'
  
  // 如果已经是hex格式，直接返回（去除#号后的空格等）
  if (color.startsWith('#')) {
    // 处理 #RRGGBBAA 格式，去除alpha通道
    if (color.length === 9) {
      return color.substring(0, 7)
    }
    return color.length === 7 ? color : '#CCCCCC'
  }
  
  // 如果是rgba格式，转换为hex
  if (color.startsWith('rgba') || color.startsWith('rgb')) {
    const match = color.match(/\d+/g)
    if (match && match.length >= 3) {
      const r = parseInt(match[0] || '0', 10)
      const g = parseInt(match[1] || '0', 10)
      const b = parseInt(match[2] || '0', 10)
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    }
  }
  
  return color
}

// 处理单个颜色变化
const handleColorChange = (type: 'top' | 'bottom' | 'outerwear' | 'shoes' | 'accessories', colorValue: string | null | undefined) => {
  if (!selectedColors.value || !colorValue) return
  
  // 规范化颜色值
  const normalizedColor = normalizeColor(colorValue)
  
  // 更新对应类型的颜色
  if (selectedColors.value[type]) {
    selectedColors.value[type]!.color = normalizedColor
    // 立即更新store，触发效果图更新
    outfitStore.updateSelectedColors(selectedColors.value)
    console.log(`${type}颜色已更新: ${colorValue} -> ${normalizedColor}`)
  }
}


const handleSaveHistory = async () => {
  if (!outfitStore.selectedColors) {
    ElMessage.warning('没有可保存的颜色搭配')
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
      // 即使获取图片失败，也继续保存其他数据
    }
    
    const validClothes = form.value.clothes.filter(
      item => item.name.trim() && item.type && item.color
    )
    
    await historyStore.saveOutfitHistory({
      outfitData: {
        type: 'custom_outfit',
        imageBase64: outfitImageBase64, // 保存效果图（base64）
        imageConfig: outfitStore.selectedColors, // 保存颜色配置（用于重新渲染）
        clothes: validClothes
        // 不再保存suggestion（AI建议）
      }
    })
    ElMessage.success('效果图已保存到历史记录')
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const formatSuggestion = (text: string) => {
  return text.replace(/\n/g, '<br>')
}

// 将OutfitScheme转换为OutfitImageConfig
const convertSchemeToImageConfig = (scheme: OutfitScheme): OutfitImageConfig => {
  return {
    top: scheme.top ? { color: scheme.top.color, type: scheme.top.name } : null,
    bottom: scheme.bottom ? { color: scheme.bottom.color, type: scheme.bottom.name } : null,
    outerwear: scheme.outerwear ? { color: scheme.outerwear.color, type: scheme.outerwear.name } : null,
    shoes: scheme.shoes ? { color: scheme.shoes.color, type: scheme.shoes.name } : null,
    accessories: scheme.accessories ? { color: scheme.accessories.color, type: scheme.accessories.name } : null
  }
}

// 选择方案
const selectScheme = (index: number) => {
  selectedSchemeIndex.value = index
}

// 应用选中的方案
const applySelectedScheme = () => {
  if (selectedSchemeIndex.value !== null && 
      outfitStore.schemes && 
      outfitStore.schemes.length > selectedSchemeIndex.value &&
      outfitStore.schemes[selectedSchemeIndex.value]) {
    const selectedScheme = outfitStore.schemes[selectedSchemeIndex.value]
    if (selectedScheme) {
      const imageConfig = convertSchemeToImageConfig(selectedScheme)
      outfitStore.updateSelectedColors(imageConfig)
      selectedColors.value = JSON.parse(JSON.stringify(imageConfig))
      ElMessage.success(`已应用方案 ${selectedSchemeIndex.value + 1}`)
    }
  }
}
</script>

<style scoped>
.custom-outfit-page {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
}

.description {
  color: #606266;
  margin-bottom: 20px;
  font-size: 14px;
}

.custom-outfit-content {
  padding: 20px 0;
}

.clothes-item {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.loading-container {
  padding: 20px;
}

.result-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.image-card,
.suggestion-card {
  width: 100%;
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
  gap: 30px;
}

.color-selector {
  width: 100%;
  max-width: 500px;
}

.color-selector h4 {
  margin-bottom: 15px;
  color: #303133;
}

.color-controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.color-control-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.color-control-item label {
  width: 100px;
  font-weight: 500;
  color: #606266;
}

.color-value {
  margin-left: 10px;
  font-size: 12px;
  color: #909399;
  font-family: monospace;
}

.suggestion-text,
.reasoning-text,
.color-scheme-text {
  text-align: left;
  line-height: 1.8;
  color: #303133;
  font-size: 16px;
  white-space: pre-wrap;
  padding: 20px;
}

.schemes-card {
  width: 100%;
  margin-bottom: 20px;
}

.schemes-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  padding: 20px;
}

.scheme-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border: 2px solid #E4E7ED;
  border-radius: 10px;
  background: #FAFAFA;
  cursor: pointer;
  transition: all 0.3s;
}

.scheme-item:hover {
  border-color: #409EFF;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
  transform: translateY(-2px);
}

.scheme-item.scheme-selected {
  border-color: #67C23A;
  background: #F0F9FF;
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.3);
}

.scheme-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 15px;
  width: 100%;
}

.scheme-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  text-align: center;
  margin: 0;
}

.scheme-details {
  margin-top: 15px;
  width: 100%;
  padding-top: 15px;
  border-top: 1px solid #E4E7ED;
}

.scheme-detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.color-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #DCDFE6;
  flex-shrink: 0;
}

.scheme-actions {
  margin-top: 20px;
  text-align: center;
  padding: 20px;
  background: #F5F7FA;
  border-radius: 8px;
}

.reasoning-card,
.color-scheme-card {
  width: 100%;
}

.color-visualization {
  margin-top: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.color-palette {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  align-items: center;
}

.color-item-large {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.color-swatch {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  border: 3px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.color-label-large {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}
</style>

