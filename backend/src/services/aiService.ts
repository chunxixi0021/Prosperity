import axios from 'axios'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

async function callDeepSeek(messages: Array<{ role: string; content: string }>): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    throw new Error('DeepSeek API密钥未配置，请设置DEEPSEEK_API_KEY环境变量')
  }

  try {
    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: 'deepseek-chat',
        messages: messages,
        temperature: 0.8, // 稍微提高，让回复更自然流畅
        max_tokens: 1500 // 优化为1500，平衡速度和质量
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 45000 // 优化为45秒，平衡速度和稳定性
      }
    )

    return response.data.choices[0]?.message?.content || '无法生成建议'
  } catch (error: any) {
    console.error('DeepSeek API调用失败:', error.response?.data || error.message)
    throw new Error(`DeepSeek API调用失败: ${error.response?.data?.error?.message || error.message}`)
  }
}

export async function generateOutfitSuggestion(
  weatherInfo: {
    temperature: number
    weatherType: string
    humidity: number
    description: string
  }
): Promise<string> {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error('DeepSeek API密钥未配置')
  }

  const prompt = `根据以下天气信息，给出合适的穿衣建议：
- 温度：${weatherInfo.temperature}°C
- 天气：${weatherInfo.weatherType}
- 湿度：${weatherInfo.humidity}%
- 描述：${weatherInfo.description}

请提供详细的穿衣建议，包括：
1. 上衣建议
2. 下装建议
3. 外套建议（如需要）
4. 配饰建议（如需要）
5. 注意事项

请用中文回答，语言要友好、实用。`

  try {
    const result = await callDeepSeek([
      {
        role: 'system',
        content: '你是一个专业的穿搭顾问，能够根据天气情况给出合适的穿衣建议。'
      },
      {
        role: 'user',
        content: prompt
      }
    ])

    return result
  } catch (error: any) {
    console.error('AI生成建议失败:', error)
    throw error
  }
}

export async function generateOutfitByClothes(
  clothes: Array<{ name: string; type: string; color: string }>,
  scene?: string
): Promise<{
  suggestion: string
  colorScheme: string
  reasoning: string
  schemes: Array<{
    top: { color: string; name: string } | null
    bottom: { color: string; name: string } | null
    outerwear: { color: string; name: string } | null
    shoes: { color: string; name: string } | null
    accessories: { color: string; name: string } | null
    description: string
  }>
}> {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error('DeepSeek API密钥未配置')
  }

  // 分析用户提供了哪些类型的衣物
  const providedTypes = new Set(clothes.map(item => item.type))
  const missingTypes: string[] = []
  if (!providedTypes.has('top')) missingTypes.push('上衣')
  if (!providedTypes.has('bottom')) missingTypes.push('下装')
  if (!providedTypes.has('shoes')) missingTypes.push('鞋子')
  if (!providedTypes.has('outerwear')) missingTypes.push('外套（可选）')
  if (!providedTypes.has('accessories')) missingTypes.push('配饰（可选）')

  const clothesDescription = clothes
    .map(item => `${item.name}（${item.type}，颜色：${item.color}）`)
    .join('、')

  const scenePrompt = scene 
    ? `场景：${scene}`
    : ''

  const missingPrompt = missingTypes.length > 0 
    ? `\n注意：用户未提供${missingTypes.join('、')}，请为每个方案补全这些缺失部分，并说明推荐的颜色和款式。`
    : ''

  // 优化后的prompt，要求生成多个方案并补全缺失部分，明确要求颜色信息
  const prompt = `用户提供的衣物：${clothesDescription}${scenePrompt ? '，' + scenePrompt : ''}${missingPrompt}

请提供2-3个不同的穿搭方案，每个方案必须包含完整的搭配（上衣、下装、鞋子，以及可选的外套和配饰）。

重要：每个方案必须明确指定颜色，格式为"颜色+款式名称"，例如："黑色长袖"、"深灰色运动裤"、"白色运动鞋"。

请按以下格式回答：

## 一、搭配方案（提供2-3个方案）
### 方案一：[方案名称]
- 上衣：[颜色+款式，如：黑色长袖T恤 或 使用用户提供的：${clothes.find(c => c.type === 'top')?.name || '无'}]
- 下装：[颜色+款式，如：深灰色运动紧身裤 或 使用用户提供的：${clothes.find(c => c.type === 'bottom')?.name || '无'}]
- 鞋子：[颜色+款式，如：白色运动鞋 或 使用用户提供的：${clothes.find(c => c.type === 'shoes')?.name || '无'}]
- 外套：[颜色+款式，如：黑色轻薄运动夹克 或 无]
- 配饰：[颜色+款式，如：红色运动发带 或 无]
- 搭配说明：[简要说明这个方案的特色]

### 方案二：[方案名称]
- 上衣：[颜色+款式]
- 下装：[颜色+款式]
- 鞋子：[颜色+款式]
- 外套：[颜色+款式 或 无]
- 配饰：[颜色+款式 或 无]
- 搭配说明：[简要说明]

### 方案三：[方案名称]（可选）
- 上衣：[颜色+款式]
- 下装：[颜色+款式]
- 鞋子：[颜色+款式]
- 外套：[颜色+款式 或 无]
- 配饰：[颜色+款式 或 无]
- 搭配说明：[简要说明]

## 二、搭配理由和目的
解释为什么这样搭配（色彩原理、风格统一性），目的是什么（突出什么、适合场合、达到效果），搭配亮点。

## 三、全身色彩搭配分析
说明整体色彩方案（主色、辅色、点缀色），色彩协调关系，视觉效果和情感表达。${scene ? '说明色彩如何适应' + scene + '场景。' : ''}

## 四、场景适配性
说明适合的场景和调整建议。

${scene ? '' : '注意：如果未提供场景，请在开头询问用户希望用于什么场景。'}用中文回答，专业友好。`

  try {
    const result = await callDeepSeek([
      {
        role: 'system',
        content: '你是专业穿搭顾问，根据用户衣物提供搭配建议、理由和色彩分析。回答简洁专业。'
      },
      {
        role: 'user',
        content: prompt
      }
    ])

    // 优化提取逻辑，更高效
    const colorSchemeMatch = result.match(/##\s*三[、.]全身色彩搭配分析\s*([\s\S]*?)(?=\n##|$)/i) || 
                             result.match(/全身色彩搭配[：:]\s*([\s\S]*?)(?=\n##|$)/i)
    const colorScheme = colorSchemeMatch ? colorSchemeMatch[1].trim().replace(/^[\n\r]+|[\n\r]+$/g, '') : 
                       result.includes('色彩') ? '请查看上方AI建议中的色彩搭配分析部分' : ''

    // 优化提取搭配理由
    const reasoningMatch = result.match(/##\s*二[、.]搭配理由和目的\s*([\s\S]*?)(?=\n##|$)/i) ||
                          result.match(/搭配理由[：:]\s*([\s\S]*?)(?=\n##|$)/i)
    const reasoning = reasoningMatch ? reasoningMatch[1].trim().replace(/^[\n\r]+|[\n\r]+$/g, '') : 
                     result.includes('理由') || result.includes('为什么') ? '请查看上方AI建议中的搭配理由部分' : ''

    // 提取多个方案并生成配置
    const schemes = extractOutfitSchemes(result, clothes)

    return {
      suggestion: result,
      colorScheme,
      reasoning,
      schemes
    }
  } catch (error: any) {
    console.error('AI生成建议失败:', error)
    throw error
  }
}

// 从AI回复中提取多个搭配方案
function extractOutfitSchemes(
  aiResult: string,
  userClothes: Array<{ name: string; type: string; color: string }>
): Array<{
  top: { color: string; name: string } | null
  bottom: { color: string; name: string } | null
  outerwear: { color: string; name: string } | null
  shoes: { color: string; name: string } | null
  accessories: { color: string; name: string } | null
  description: string
}> {
  const schemes: Array<{
    top: { color: string; name: string } | null
    bottom: { color: string; name: string } | null
    outerwear: { color: string; name: string } | null
    shoes: { color: string; name: string } | null
    accessories: { color: string; name: string } | null
    description: string
  }> = []

  // 提取方案一、方案二、方案三 - 改进正则表达式，支持更多格式
  const schemePatterns = [
    /###\s*方案[一二三123][：:]\s*([^\n]+)\n([\s\S]*?)(?=\n###\s*方案|##|$)/gi,
    /方案[一二三123][：:]\s*([^\n]+)\n([\s\S]*?)(?=\n方案[一二三123]|##|$)/gi,
    /【方案[一二三123]】\s*([^\n]+)\n([\s\S]*?)(?=\n【方案|##|$)/gi
  ]
  
  let schemeMatches: IterableIterator<RegExpMatchArray> | null = null
  for (const pattern of schemePatterns) {
    const matches = aiResult.matchAll(pattern)
    const matchArray = Array.from(matches)
    if (matchArray.length > 0) {
      schemeMatches = matches
      console.log(`找到 ${matchArray.length} 个方案，使用模式: ${pattern}`)
      break
    }
  }
  
  // 如果没有匹配到，尝试更宽松的匹配
  if (!schemeMatches || Array.from(aiResult.matchAll(/###\s*方案[一二三123]/gi)).length === 0) {
    // 尝试匹配所有包含"方案"的部分
    const fallbackMatches = aiResult.matchAll(/(?:方案|搭配)[一二三123一二三][：:：]\s*([^\n]+)\n([\s\S]*?)(?=(?:方案|搭配)[一二三123一二三]|##|$)/gi)
    const fallbackArray = Array.from(fallbackMatches)
    if (fallbackArray.length > 0) {
      schemeMatches = aiResult.matchAll(/(?:方案|搭配)[一二三123一二三][：:：]\s*([^\n]+)\n([\s\S]*?)(?=(?:方案|搭配)[一二三123一二三]|##|$)/gi)
      console.log(`使用备用匹配，找到 ${fallbackArray.length} 个方案`)
    }
  }
  
  // 创建用户衣物的映射，方便查找
  const userClothesMap = new Map<string, { name: string; color: string }>()
  userClothes.forEach(item => {
    userClothesMap.set(item.type, { name: item.name, color: item.color })
  })

  // 颜色映射函数
  const getColorHex = (colorName: string): string => {
    const colorMapping: { [key: string]: string } = {
      '红色': '#FF4444', '红': '#FF4444',
      '蓝色': '#4444FF', '蓝': '#4444FF',
      '绿色': '#44FF44', '绿': '#44FF44',
      '黄色': '#FFFF44', '黄': '#FFFF44',
      '黑色': '#333333', '黑': '#333333',
      '白色': '#FFFFFF', '白': '#FFFFFF',
      '灰色': '#888888', '灰': '#888888',
      '粉色': '#FF88CC', '粉': '#FF88CC',
      '紫色': '#8844FF', '紫': '#8844FF',
      '橙色': '#FF8844', '橙': '#FF8844',
      '棕色': '#8B4513', '棕': '#8B4513',
      '深蓝': '#000080', '浅蓝': '#87CEEB',
      '浅粉': '#FFB6C1', '深红': '#8B0000',
      '浅绿': '#90EE90', '深绿': '#006400',
      '米色': '#F5F5DC', '卡其色': '#F0E68C', '卡其': '#F0E68C',
      '驼色': '#DEB887', '咖啡色': '#6F4E37', '咖啡': '#6F4E37',
      '藏青色': '#191970', '藏青': '#191970',
      '天蓝色': '#87CEEB', '天蓝': '#87CEEB',
      '海军蓝': '#000080', '海军': '#000080',
      '军绿色': '#556B2F', '军绿': '#556B2F',
      '深灰色': '#555555', '深灰': '#555555',
      '浅灰色': '#CCCCCC', '浅灰': '#CCCCCC',
      '炭灰色': '#36454F', '炭灰': '#36454F',
      '运动': '#888888' // 默认灰色
    }
    
    let color = colorName.trim()
    if (color.startsWith('#')) {
      return /^#[0-9A-Fa-f]{6}$/.test(color) ? color : '#CCCCCC'
    }
    color = colorMapping[color] || colorMapping[color.toLowerCase()] || color
    if (!color.startsWith('#')) {
      color = '#' + color
    }
    return /^#[0-9A-Fa-f]{6}$/.test(color) ? color : '#CCCCCC'
  }

  // 解析每个方案
  if (schemeMatches) {
    for (const match of schemeMatches) {
    const schemeName = match[1]?.trim() || ''
    const schemeContent = match[2] || ''
    
    const scheme: {
      top: { color: string; name: string } | null
      bottom: { color: string; name: string } | null
      outerwear: { color: string; name: string } | null
      shoes: { color: string; name: string } | null
      accessories: { color: string; name: string } | null
      description: string
    } = {
      top: null,
      bottom: null,
      outerwear: null,
      shoes: null,
      accessories: null,
      description: schemeName
    }

    // 提取上衣 - 改进提取逻辑，更健壮
    const topMatch = schemeContent.match(/上衣[：:]\s*([^\n]+)/i)
    if (topMatch) {
      const topText = topMatch[1].trim()
      // 检查是否使用用户提供的
      if (topText.includes('使用用户提供的') || topText.includes('用户提供的') || topText.includes('无')) {
        if (userClothesMap.has('top')) {
          const userTop = userClothesMap.get('top')!
          scheme.top = { color: getColorHex(userTop.color), name: userTop.name }
        }
      } else {
        // 从AI建议中提取颜色和名称
        // 改进的颜色匹配：匹配"黑色"、"深灰色"、"炭灰色"等
        let color = ''
        const colorPatterns = [
          /(深|浅)?(红|橙|黄|绿|蓝|紫|粉|黑|白|灰|棕|卡其|米|驼|咖啡|藏青|天蓝|海军|军绿|炭灰)(色|蓝|红|黑|白)?/,
          /(黑色|白色|灰色|红色|蓝色|绿色|黄色|粉色|紫色|橙色|棕色)/,
          /(深|浅)(灰|蓝|绿|红|粉|棕)(色)?/
        ]
        
        for (const pattern of colorPatterns) {
          const match = topText.match(pattern)
          if (match) {
            color = match[0]
            break
          }
        }
        
        // 如果没匹配到，尝试提取单个颜色字
        if (!color) {
          const singleColor = topText.match(/[黑白灰红蓝绿黄粉紫橙棕]/)
          if (singleColor) {
            color = singleColor[0] + '色'
          } else {
            color = '灰色' // 默认
          }
        }
        
        // 提取款式名称（去除颜色和标点）
        let name = topText
          .replace(/(深|浅)?(红|橙|黄|绿|蓝|紫|粉|黑|白|灰|棕|卡其|米|驼|咖啡|藏青|天蓝|海军|军绿|炭灰)(色|蓝|红|黑|白)?/g, '')
          .replace(/[，,、。]/g, '')
          .trim()
        
        if (!name || name.length < 2) {
          name = topText.split(/[，,、]/)[0].trim() || '推荐上衣'
        }
        
        scheme.top = { color: getColorHex(color), name: name }
        console.log(`提取上衣: 颜色=${color}(${getColorHex(color)}), 名称=${name}`)
      }
    } else if (userClothesMap.has('top')) {
      const userTop = userClothesMap.get('top')!
      scheme.top = { color: getColorHex(userTop.color), name: userTop.name }
    } else {
      // 如果没有上衣，至少提供一个默认的
      scheme.top = { color: '#FFFFFF', name: '推荐白色上衣' }
    }

    // 提取下装 - 改进提取逻辑，更健壮
    const bottomMatch = schemeContent.match(/下装[：:]\s*([^\n]+)/i)
    if (bottomMatch) {
      const bottomText = bottomMatch[1].trim()
      if (bottomText.includes('使用用户提供的') || bottomText.includes('用户提供的') || bottomText.includes('无')) {
        if (userClothesMap.has('bottom')) {
          const userBottom = userClothesMap.get('bottom')!
          scheme.bottom = { color: getColorHex(userBottom.color), name: userBottom.name }
        }
      } else {
        // 改进的颜色匹配
        let color = ''
        const colorPatterns = [
          /(深|浅)?(红|橙|黄|绿|蓝|紫|粉|黑|白|灰|棕|卡其|米|驼|咖啡|藏青|天蓝|海军|军绿|炭灰)(色|蓝|红|黑|白)?/,
          /(黑色|白色|灰色|红色|蓝色|绿色|黄色|粉色|紫色|橙色|棕色|藏蓝色|军绿色|炭灰色)/,
          /(深|浅)(灰|蓝|绿|红|粉|棕)(色)?/
        ]
        
        for (const pattern of colorPatterns) {
          const match = bottomText.match(pattern)
          if (match) {
            color = match[0]
            break
          }
        }
        
        if (!color) {
          const singleColor = bottomText.match(/[黑白灰红蓝绿黄粉紫橙棕]/)
          if (singleColor) {
            color = singleColor[0] + '色'
          } else {
            color = '黑色' // 默认
          }
        }
        
        let name = bottomText
          .replace(/(深|浅)?(红|橙|黄|绿|蓝|紫|粉|黑|白|灰|棕|卡其|米|驼|咖啡|藏青|天蓝|海军|军绿|炭灰)(色|蓝|红|黑|白)?/g, '')
          .replace(/[，,、。]/g, '')
          .trim()
        
        if (!name || name.length < 2) {
          name = bottomText.split(/[，,、]/)[0].trim() || '推荐下装'
        }
        
        scheme.bottom = { color: getColorHex(color), name: name }
        console.log(`提取下装: 颜色=${color}(${getColorHex(color)}), 名称=${name}`)
      }
    } else if (userClothesMap.has('bottom')) {
      const userBottom = userClothesMap.get('bottom')!
      scheme.bottom = { color: getColorHex(userBottom.color), name: userBottom.name }
    } else {
      // 如果没有下装，至少提供一个默认的
      scheme.bottom = { color: '#333333', name: '推荐黑色下装' }
    }

    // 提取鞋子 - 改进提取逻辑，更健壮
    const shoesMatch = schemeContent.match(/鞋子[：:]\s*([^\n]+)/i)
    if (shoesMatch) {
      const shoesText = shoesMatch[1].trim()
      if (shoesText.includes('使用用户提供的') || shoesText.includes('用户提供的') || shoesText.includes('无')) {
        if (userClothesMap.has('shoes')) {
          const userShoes = userClothesMap.get('shoes')!
          scheme.shoes = { color: getColorHex(userShoes.color), name: userShoes.name }
        }
      } else {
        // 改进的颜色匹配
        let color = ''
        const colorPatterns = [
          /(深|浅)?(红|橙|黄|绿|蓝|紫|粉|黑|白|灰|棕|卡其|米|驼|咖啡|藏青|天蓝|海军|军绿|炭灰)(色|蓝|红|黑|白)?/,
          /(黑色|白色|灰色|红色|蓝色|绿色|黄色|粉色|紫色|橙色|棕色)/,
          /(深|浅)(灰|蓝|绿|红|粉|棕)(色)?/
        ]
        
        for (const pattern of colorPatterns) {
          const match = shoesText.match(pattern)
          if (match) {
            color = match[0]
            break
          }
        }
        
        if (!color) {
          const singleColor = shoesText.match(/[黑白灰红蓝绿黄粉紫橙棕]/)
          if (singleColor) {
            color = singleColor[0] + '色'
          } else {
            color = '黑色' // 默认
          }
        }
        
        let name = shoesText
          .replace(/(深|浅)?(红|橙|黄|绿|蓝|紫|粉|黑|白|灰|棕|卡其|米|驼|咖啡|藏青|天蓝|海军|军绿|炭灰)(色|蓝|红|黑|白)?/g, '')
          .replace(/[，,、。]/g, '')
          .trim()
        
        if (!name || name.length < 2) {
          name = shoesText.split(/[，,、]/)[0].trim() || '推荐鞋子'
        }
        
        scheme.shoes = { color: getColorHex(color), name: name }
        console.log(`提取鞋子: 颜色=${color}(${getColorHex(color)}), 名称=${name}`)
      }
    } else if (userClothesMap.has('shoes')) {
      const userShoes = userClothesMap.get('shoes')!
      scheme.shoes = { color: getColorHex(userShoes.color), name: userShoes.name }
    } else {
      // 默认推荐黑色鞋子
      scheme.shoes = { color: '#333333', name: '推荐黑色鞋子' }
    }

    // 提取外套 - 改进提取逻辑
    const outerwearMatch = schemeContent.match(/外套[：:]\s*([^\n]+)/i)
    if (outerwearMatch) {
      const outerwearText = outerwearMatch[1].trim()
      if (outerwearText.includes('使用用户提供的') || outerwearText.includes('用户提供的')) {
        if (userClothesMap.has('outerwear')) {
          const userOuterwear = userClothesMap.get('outerwear')!
          scheme.outerwear = { color: getColorHex(userOuterwear.color), name: userOuterwear.name }
        }
      } else if (!outerwearText.includes('无') && !outerwearText.includes('不需要') && !outerwearText.includes('可选')) {
        const colorMatch = outerwearText.match(/(深|浅)?(红|橙|黄|绿|蓝|紫|粉|黑|白|灰|棕|卡其|米|驼|咖啡|藏青|天蓝|海军)(色|蓝|红|黑|白)?/)
        const color = colorMatch ? colorMatch[0] : (outerwearText.match(/[黑白灰]/) ? outerwearText.match(/[黑白灰]/)![0] + '色' : '灰色')
        const nameMatch = outerwearText.replace(/(深|浅)?(红|橙|黄|绿|蓝|紫|粉|黑|白|灰|棕|卡其|米|驼|咖啡|藏青|天蓝|海军)(色|蓝|红|黑|白)?/, '').trim()
        const name = nameMatch || outerwearText.split(/[，,、]/)[0].trim() || '推荐外套'
        scheme.outerwear = { color: getColorHex(color), name: name }
      }
    } else if (userClothesMap.has('outerwear')) {
      const userOuterwear = userClothesMap.get('outerwear')!
      scheme.outerwear = { color: getColorHex(userOuterwear.color), name: userOuterwear.name }
    }

    // 提取配饰 - 改进提取逻辑
    const accessoriesMatch = schemeContent.match(/配饰[：:]\s*([^\n]+)/i)
    if (accessoriesMatch) {
      const accessoriesText = accessoriesMatch[1].trim()
      if (accessoriesText.includes('使用用户提供的') || accessoriesText.includes('用户提供的')) {
        if (userClothesMap.has('accessories')) {
          const userAccessories = userClothesMap.get('accessories')!
          scheme.accessories = { color: getColorHex(userAccessories.color), name: userAccessories.name }
        }
      } else if (!accessoriesText.includes('无') && !accessoriesText.includes('不需要') && !accessoriesText.includes('可选')) {
        const colorMatch = accessoriesText.match(/(深|浅)?(红|橙|黄|绿|蓝|紫|粉|黑|白|灰|棕|卡其|米|驼|咖啡|藏青|天蓝|海军)(色|蓝|红|黑|白)?/)
        const color = colorMatch ? colorMatch[0] : (accessoriesText.match(/[黑白灰]/) ? accessoriesText.match(/[黑白灰]/)![0] + '色' : '黑色')
        const nameMatch = accessoriesText.replace(/(深|浅)?(红|橙|黄|绿|蓝|紫|粉|黑|白|灰|棕|卡其|米|驼|咖啡|藏青|天蓝|海军)(色|蓝|红|黑|白)?/, '').trim()
        const name = nameMatch || accessoriesText.split(/[，,、]/)[0].trim() || '推荐配饰'
        scheme.accessories = { color: getColorHex(color), name: name }
      }
    } else if (userClothesMap.has('accessories')) {
      const userAccessories = userClothesMap.get('accessories')!
      scheme.accessories = { color: getColorHex(userAccessories.color), name: userAccessories.name }
    }

    // 提取搭配说明
    const descMatch = schemeContent.match(/搭配说明[：:]\s*([^\n]+)/i)
    if (descMatch) {
      scheme.description = `${schemeName} - ${descMatch[1].trim()}`
    }

      schemes.push(scheme)
    }
  }

  // 如果AI没有提取到方案，或者只提取到一个方案，生成多个不同的方案
  if (schemes.length === 0 || schemes.length === 1) {
    console.log(`只提取到 ${schemes.length} 个方案，生成多个不同方案`)
    
    // 生成2-3个不同的方案
    const schemeVariations = [
      { bottomColor: '#333333', bottomName: '黑色下装', shoesColor: '#333333', shoesName: '黑色鞋子', desc: '经典黑色系' },
      { bottomColor: '#888888', bottomName: '灰色下装', shoesColor: '#333333', shoesName: '黑色鞋子', desc: '简约灰色系' },
      { bottomColor: '#000080', bottomName: '深蓝色下装', shoesColor: '#FFFFFF', shoesName: '白色鞋子', desc: '清新蓝白系' }
    ]
    
    for (let i = 0; i < Math.min(3, schemeVariations.length); i++) {
      const variation = schemeVariations[i]
      const scheme: {
        top: { color: string; name: string } | null
        bottom: { color: string; name: string } | null
        outerwear: { color: string; name: string } | null
        shoes: { color: string; name: string } | null
        accessories: { color: string; name: string } | null
        description: string
      } = {
        top: null,
        bottom: null,
        outerwear: null,
        shoes: { color: variation.shoesColor, name: variation.shoesName },
        accessories: null,
        description: `方案${i + 1} - ${variation.desc}`
      }

      // 使用用户提供的衣物
      userClothes.forEach(item => {
        const colorHex = getColorHex(item.color)
        switch (item.type) {
          case 'top':
            scheme.top = { color: colorHex, name: item.name }
            break
          case 'bottom':
            scheme.bottom = { color: colorHex, name: item.name }
            break
          case 'outerwear':
            scheme.outerwear = { color: colorHex, name: item.name }
            break
          case 'shoes':
            scheme.shoes = { color: colorHex, name: item.name }
            break
          case 'accessories':
            scheme.accessories = { color: colorHex, name: item.name }
            break
        }
      })

      // 如果没有下装，使用变体推荐
      if (!scheme.bottom) {
        scheme.bottom = { color: variation.bottomColor, name: variation.bottomName }
      }
      // 如果没有上衣，推荐一个
      if (!scheme.top) {
        scheme.top = { color: '#FFFFFF', name: '推荐白色上衣' }
      }
      // 如果鞋子是默认的，使用变体
      if (scheme.shoes && scheme.shoes.color === '#333333' && scheme.shoes.name === '推荐黑色鞋子') {
        scheme.shoes = { color: variation.shoesColor, name: variation.shoesName }
      }

      schemes.push(scheme)
    }
  } else if (schemes.length > 1) {
    // 确保多个方案真的不同
    console.log(`提取到 ${schemes.length} 个方案，检查是否不同`)
    // 可以在这里添加去重逻辑，但通常AI会返回不同的方案
  }

  console.log(`最终生成 ${schemes.length} 个方案`)
  return schemes
}

// 生成卡通效果图的配置数据（前端会根据这个配置渲染效果图）
export function generateOutfitImageConfig(
  clothes: Array<{ name: string; type: string; color: string }>
): {
  top: { color: string; type: string } | null
  bottom: { color: string; type: string } | null
  outerwear: { color: string; type: string } | null
  shoes: { color: string; type: string } | null
  accessories: { color: string; type: string } | null
} {
  const config: {
    top: { color: string; type: string } | null
    bottom: { color: string; type: string } | null
    outerwear: { color: string; type: string } | null
    shoes: { color: string; type: string } | null
    accessories: { color: string; type: string } | null
  } = {
    top: null,
    bottom: null,
    outerwear: null,
    shoes: null,
    accessories: null
  }

  clothes.forEach(item => {
    const colorMapping: { [key: string]: string } = {
      '红色': '#FF4444',
      '红': '#FF4444',
      '蓝色': '#4444FF',
      '蓝': '#4444FF',
      '绿色': '#44FF44',
      '绿': '#44FF44',
      '黄色': '#FFFF44',
      '黄': '#FFFF44',
      '黑色': '#333333',
      '黑': '#333333',
      '白色': '#FFFFFF',
      '白': '#FFFFFF',
      '灰色': '#888888',
      '灰': '#888888',
      '粉色': '#FF88CC',
      '粉': '#FF88CC',
      '紫色': '#8844FF',
      '紫': '#8844FF',
      '橙色': '#FF8844',
      '橙': '#FF8844',
      '棕色': '#8B4513',
      '棕': '#8B4513',
      '深蓝': '#000080',
      '浅蓝': '#87CEEB',
      '深灰': '#555555',
      '浅灰': '#CCCCCC',
      '浅粉': '#FFB6C1',
      '深红': '#8B0000',
      '浅绿': '#90EE90',
      '深绿': '#006400',
      '米色': '#F5F5DC',
      '卡其色': '#F0E68C',
      '卡其': '#F0E68C',
      '驼色': '#DEB887',
      '咖啡色': '#6F4E37',
      '咖啡': '#6F4E37',
      '藏青色': '#191970',
      '藏青': '#191970',
      '天蓝色': '#87CEEB',
      '天蓝': '#87CEEB',
      '海军蓝': '#000080',
      '海军': '#000080'
    }

    // 如果已经是十六进制颜色值，直接使用；否则查找映射表
    let color = item.color || '#CCCCCC'
    if (!color.startsWith('#')) {
      color = colorMapping[color] || colorMapping[color.toLowerCase()] || color
      // 如果仍然不是十六进制，尝试添加#前缀
      if (!color.startsWith('#')) {
        color = '#' + color
      }
    }
    // 确保颜色值是有效的十六进制格式
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
      color = '#CCCCCC'
    }

    switch (item.type) {
      case 'top':
        config.top = { color, type: item.name }
        break
      case 'bottom':
        config.bottom = { color, type: item.name }
        break
      case 'outerwear':
        config.outerwear = { color, type: item.name }
        break
      case 'shoes':
        config.shoes = { color, type: item.name }
        break
      case 'accessories':
        config.accessories = { color, type: item.name }
        break
    }
  })

  return config
}

