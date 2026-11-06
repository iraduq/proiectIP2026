import { api } from "./client"
import type { Page, StareTehnica, TechnicalHistory } from "../types"

export interface TechnicalHistoryFilterParams {
  resursa_id?: number
  utilizator_id?: number
  skip?: number
  limit?: number
}

export interface TechnicalHistoryCreatePayload {
  resursa_id: number
  tip_interventie: string
  descriere: string
  stare_noua: StareTehnica
}

export const technicalHistoryApi = {
  async getTechnicalHistory(params: TechnicalHistoryFilterParams = {}): Promise<Page<TechnicalHistory>> {
    const res = await api.get<Page<TechnicalHistory>>("/technical-history", { params })
    return res.data
  },

  async createTechnicalHistory(data: TechnicalHistoryCreatePayload): Promise<TechnicalHistory> {
    const res = await api.post<TechnicalHistory>("/technical-history", data)
    return res.data
  },
}
