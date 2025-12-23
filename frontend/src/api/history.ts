import api from './index'

export interface OutfitHistory {
  id: number
  userId?: number
  date: string
  outfitData: any
  weatherInfo?: any
  created_at: string
}

export interface HistoryResponse {
  code: number
  message: string
  success: boolean
  data: OutfitHistory[]
}

export interface SaveHistoryRequest {
  userId?: number
  outfitData: any
  weatherInfo?: any
}

export function saveHistory(data: SaveHistoryRequest): Promise<any> {
  return api.post('/history/save', data)
}

export function getHistory(params?: {
  userId?: number
  startDate?: string
  endDate?: string
}): Promise<HistoryResponse> {
  return api.get('/history', { params })
}

export function getHistoryById(id: number): Promise<any> {
  return api.get(`/history/${id}`)
}

