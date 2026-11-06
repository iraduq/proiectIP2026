import { api } from "./client"
import type { Page, Reservation, StareRezervare, StudentQuota } from "../types"

export interface ReservationFilterParams {
  utilizator_id?: number
  resursa_id?: number
  stare?: StareRezervare
  skip?: number
  limit?: number
}

export interface ReservationCreatePayload {
  resursa_id: number
  data_inceput: string
  data_sfarsit: string
  scop: string
}

export const reservationsApi = {
  async getReservations(params: ReservationFilterParams = {}): Promise<Page<Reservation>> {
    const res = await api.get<Page<Reservation>>("/reservations", { params })
    return res.data
  },

  async getReservation(id: number): Promise<Reservation> {
    const res = await api.get<Reservation>(`/reservations/${id}`)
    return res.data
  },

  async getMyQuota(): Promise<StudentQuota> {
    const res = await api.get<StudentQuota>("/reservations/quota")
    return res.data
  },

  async createReservation(data: ReservationCreatePayload): Promise<Reservation> {
    const res = await api.post<Reservation>("/reservations", data)
    return res.data
  },

  async updateReservationStatus(
    id: number,
    data: { stare: StareRezervare; motiv_respingere?: string }
  ): Promise<Reservation> {
    const res = await api.patch<Reservation>(`/reservations/${id}/status`, data)
    return res.data
  },

  async cancelReservation(id: number): Promise<Reservation> {
    const res = await api.post<Reservation>(`/reservations/${id}/cancel`)
    return res.data
  },

  async approveReservation(id: number): Promise<Reservation> {
    const res = await api.post<Reservation>(`/reservations/${id}/approve`)
    return res.data
  },

  async rejectReservation(id: number, reason?: string): Promise<Reservation> {
    const res = await api.post<Reservation>(`/reservations/${id}/reject`, null, {
      params: reason ? { reason } : undefined,
    })
    return res.data
  },

  async returnReservation(
    id: number,
    params?: { stare_echipament?: string; observatii?: string }
  ): Promise<Reservation> {
    const res = await api.post<Reservation>(`/reservations/${id}/return`, null, {
      params: params || undefined,
    })
    return res.data
  },
}
