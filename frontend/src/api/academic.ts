import { api } from "./client"
import type { Department, Faculty, Institution, InstitutionStats, Page, Room } from "../types"

export const academicApi = {
  async getInstitutions(params?: {
    search?: string
    is_active?: boolean
    oras?: string
    skip?: number
    limit?: number
  }): Promise<Page<Institution>> {
    const { data } = await api.get<Page<Institution>>("/institutions", { params })
    return data
  },

  async getInstitution(id: number): Promise<Institution> {
    const { data } = await api.get<Institution>(`/institutions/${id}`)
    return data
  },

  async createInstitution(payload: {
    nume: string
    cod: string
    oras: string
    adresa: string
    email_contact?: string | null
    telefon?: string | null
    website?: string | null
  }): Promise<Institution> {
    const { data } = await api.post<Institution>("/institutions", payload)
    return data
  },

  async updateInstitution(
    id: number,
    payload: {
      nume?: string
      cod?: string
      oras?: string
      adresa?: string
      email_contact?: string | null
      telefon?: string | null
      website?: string | null
    }
  ): Promise<Institution> {
    const { data } = await api.patch<Institution>(`/institutions/${id}`, payload)
    return data
  },

  async activateInstitution(id: number): Promise<Institution> {
    const { data } = await api.post<Institution>(`/institutions/${id}/activate`)
    return data
  },

  async deactivateInstitution(id: number): Promise<Institution> {
    const { data } = await api.post<Institution>(`/institutions/${id}/deactivate`)
    return data
  },

  async deleteInstitution(id: number): Promise<void> {
    await api.delete(`/institutions/${id}`)
  },

  async getInstitutionStats(id: number): Promise<InstitutionStats> {
    const { data } = await api.get<InstitutionStats>(`/institutions/${id}/stats`)
    return data
  },

  async getFaculties(params?: {
    institutie_id?: number
    search?: string
    is_active?: boolean
    skip?: number
    limit?: number
  }): Promise<Page<Faculty>> {
    const { data } = await api.get<Page<Faculty>>("/faculties", { params })
    return data
  },

  async getFaculty(id: number): Promise<Faculty> {
    const { data } = await api.get<Faculty>(`/faculties/${id}`)
    return data
  },

  async createFaculty(payload: {
    institutie_id: number
    nume: string
    cod: string
    descriere?: string | null
  }): Promise<Faculty> {
    const { data } = await api.post<Faculty>("/faculties", payload)
    return data
  },

  async updateFaculty(
    id: number,
    payload: {
      nume?: string
      cod?: string
      descriere?: string | null
    }
  ): Promise<Faculty> {
    const { data } = await api.patch<Faculty>(`/faculties/${id}`, payload)
    return data
  },

  async activateFaculty(id: number): Promise<Faculty> {
    const { data } = await api.post<Faculty>(`/faculties/${id}/activate`)
    return data
  },

  async deactivateFaculty(id: number): Promise<Faculty> {
    const { data } = await api.post<Faculty>(`/faculties/${id}/deactivate`)
    return data
  },

  async deleteFaculty(id: number): Promise<void> {
    await api.delete(`/faculties/${id}`)
  },

  async getDepartments(params?: {
    facultate_id?: number
    institutie_id?: number
    sef_departament_id?: number
    search?: string
    is_active?: boolean
    skip?: number
    limit?: number
  }): Promise<Page<Department>> {
    const { data } = await api.get<Page<Department>>("/departments", { params })
    return data
  },

  async getDepartment(id: number): Promise<Department> {
    const { data } = await api.get<Department>(`/departments/${id}`)
    return data
  },

  async createDepartment(payload: {
    facultate_id: number
    nume: string
    cod: string
    descriere?: string | null
    sef_departament_id?: number | null
  }): Promise<Department> {
    const { data } = await api.post<Department>("/departments", payload)
    return data
  },

  async updateDepartment(
    id: number,
    payload: {
      nume?: string
      cod?: string
      descriere?: string | null
      sef_departament_id?: number | null
    }
  ): Promise<Department> {
    const { data } = await api.patch<Department>(`/departments/${id}`, payload)
    return data
  },

  async activateDepartment(id: number): Promise<Department> {
    const { data } = await api.post<Department>(`/departments/${id}/activate`)
    return data
  },

  async deactivateDepartment(id: number): Promise<Department> {
    const { data } = await api.post<Department>(`/departments/${id}/deactivate`)
    return data
  },

  async deleteDepartment(id: number): Promise<void> {
    await api.delete(`/departments/${id}`)
  },

  async getRooms(params?: {
    departament_id?: number
    facultate_id?: number
    institutie_id?: number
    responsabil_id?: number
    tip_sala?: string
    search?: string
    is_active?: boolean
    min_capacitate?: number
    max_capacitate?: number
    etaj?: number
    sort_by?: string
    sort_order?: "asc" | "desc"
    skip?: number
    limit?: number
  }): Promise<Page<Room>> {
    const { data } = await api.get<Page<Room>>("/rooms", { params })
    return data
  },

  async getMyRooms(params?: { skip?: number; limit?: number }): Promise<Page<Room>> {
    const { data } = await api.get<Page<Room>>("/rooms/my", { params })
    return data
  },

  async createRoom(payload: {
    departament_id: number
    cod: string
    nume: string
    tip_sala: string
    etaj: number
    capacitate: number
    descriere?: string | null
    responsabil_id: number
  }): Promise<Room> {
    const { data } = await api.post<Room>("/rooms", payload)
    return data
  },

  async updateRoom(
    id: number,
    payload: {
      nume?: string
      cod?: string
      tip_sala?: string
      etaj?: number
      capacitate?: number
      descriere?: string | null
    }
  ): Promise<Room> {
    const { data } = await api.patch<Room>(`/rooms/${id}`, payload)
    return data
  },

  async activateRoom(id: number): Promise<Room> {
    const { data } = await api.post<Room>(`/rooms/${id}/activate`)
    return data
  },

  async deactivateRoom(id: number): Promise<Room> {
    const { data } = await api.post<Room>(`/rooms/${id}/deactivate`)
    return data
  },

  async deleteRoom(id: number): Promise<void> {
    await api.delete(`/rooms/${id}`)
  },
}
