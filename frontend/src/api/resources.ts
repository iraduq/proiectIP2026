import { api } from "./client"
import type { Page, Resource, StareTehnica } from "../types"

export interface ResourceFilterParams {
  categorie_id?: number
  sala_id?: number
  departament_id?: number
  facultate_id?: number
  institutie_id?: number
  stare_tehnica?: StareTehnica
  is_active?: boolean
  search?: string
  skip?: number
  limit?: number
}

export interface ResourcePayload {
  nume: string
  cod_inventar: string
  categorie_id: number
  sala_id: number
  descriere?: string
  specificatii?: string
  stare_tehnica?: StareTehnica
}

export const resourcesApi = {
  async getResources(params: ResourceFilterParams = {}): Promise<Page<Resource>> {
    const res = await api.get<Page<Resource>>("/resources", { params })
    return res.data
  },

  async getResource(id: number): Promise<Resource> {
    const res = await api.get<Resource>(`/resources/${id}`)
    return res.data
  },

  async createResource(data: ResourcePayload): Promise<Resource> {
    const res = await api.post<Resource>("/resources", data)
    return res.data
  },

  async updateResource(
    id: number,
    data: Partial<ResourcePayload> & { is_active?: boolean }
  ): Promise<Resource> {
    const res = await api.patch<Resource>(`/resources/${id}`, data)
    return res.data
  },

  async deleteResource(id: number): Promise<void> {
    await api.delete(`/resources/${id}`)
  },
}
