import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 60000, // 优化为60秒，平衡速度和稳定性
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // 详细的错误日志
    console.error('API错误:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      requestData: error.config?.data,
      message: error.message
    })
    
    // 如果是 500 错误，尝试提取后端返回的错误信息
    if (error.response?.status === 500) {
      const errorData = error.response.data
      const errorMessage = errorData?.message || errorData?.error || errorData?.detail || '服务器内部错误'
      console.error('500 错误详情:', errorMessage)
      
      // 创建一个包含详细错误信息的错误对象
      const enhancedError = new Error(errorMessage)
      ;(enhancedError as any).response = error.response
      ;(enhancedError as any).config = error.config
      return Promise.reject(enhancedError)
    }
    
    return Promise.reject(error)
  }
)

export default api

