/**
 * 将SVG元素转换为base64图片
 * @param svgElement SVG元素
 * @param options 转换选项
 * @returns Promise<string> base64图片数据
 */
export async function svgToBase64(
  svgElement: SVGElement,
  options: {
    width?: number
    height?: number
    format?: 'png' | 'jpeg' | 'webp'
    quality?: number
  } = {}
): Promise<string> {
  const {
    width = 300,
    height = 420,
    format = 'png',
    quality = 1
  } = options

  return new Promise((resolve, reject) => {
    try {
      // 克隆SVG元素，避免修改原始元素
      const clonedSvg = svgElement.cloneNode(true) as SVGElement
      
      // 设置SVG的尺寸
      clonedSvg.setAttribute('width', width.toString())
      clonedSvg.setAttribute('height', height.toString())
      clonedSvg.setAttribute('viewBox', `0 0 ${width} ${height}`)

      // 将SVG转换为字符串
      const svgData = new XMLSerializer().serializeToString(clonedSvg)
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)

      // 创建图片对象
      const img = new Image()
      img.onload = () => {
        try {
          // 创建canvas
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')

          if (!ctx) {
            reject(new Error('无法创建canvas上下文'))
            return
          }

          // 绘制图片到canvas
          ctx.drawImage(img, 0, 0, width, height)

          // 转换为base64
          const mimeType = `image/${format}`
          const base64 = canvas.toDataURL(mimeType, quality)
          
          // 清理URL
          URL.revokeObjectURL(url)
          
          resolve(base64)
        } catch (error) {
          URL.revokeObjectURL(url)
          reject(error)
        }
      }

      img.onerror = (error) => {
        URL.revokeObjectURL(url)
        reject(new Error('图片加载失败'))
      }

      img.src = url
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * 通过选择器获取SVG元素并转换为base64
 * @param selector SVG选择器，默认为'.outfit-avatar'
 * @param options 转换选项
 * @returns Promise<string> base64图片数据
 */
export async function getSvgAsBase64(
  selector: string = '.outfit-avatar',
  options: {
    width?: number
    height?: number
    format?: 'png' | 'jpeg' | 'webp'
    quality?: number
  } = {}
): Promise<string> {
  const svgElement = document.querySelector(selector) as SVGElement
  
  if (!svgElement) {
    throw new Error(`未找到SVG元素: ${selector}`)
  }

  return svgToBase64(svgElement, options)
}

