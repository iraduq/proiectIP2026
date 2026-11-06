import { api } from "./client"
import type { Category, Page } from "../types"

export interface CategoryFilterParams {
  search?: string
  is_active?: boolean
  skip?: number
  limit?: number
}

export interface CategoryPayload {
  nume: string
  descriere?: string
}

export const categoriesApi = {
  async getCategories(params: CategoryFilterParams = {}): Promise<Page<Category>> {
    const res = await api.get<Page<Category>>("/categories", { params })
    return res.data
  },

  async getCategory(id: number): Promise<Category> {
    const res = await api.get<Category>(`/categories/${id}`)
    return res.data
  },

  async createCategory(data: CategoryPayload): Promise<Category> {
    const res = await api.post<Category>("/categories", data)
    return res.data
  },

  async updateCategory(id: number, data: Partial<CategoryPayload> & { is_active?: boolean }): Promise<Category> {
    const res = await api.patch<Category>(`/categories/${id}`, data)
    return res.data
  },

  async deleteCategory(id: number): Promise<void> {
    await api.delete(`/categories/${id}`)
  },
}
