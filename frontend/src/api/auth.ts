import { api } from "./client"
import type { User } from "../types"

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  first_name: string
  last_name: string
  email: string
  password: string
  rol: string
  numar_matricol?: string | null
  id_angajat?: number | null
  facultate_id?: number | null
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface RegistrationFaculty {
  id: number
  nume: string
  cod: string
  institutie_nume: string
}

export const authApi = {
  async getRegistrationFaculties(): Promise<RegistrationFaculty[]> {
    const { data } = await api.get<RegistrationFaculty[]>("/auth/faculties")
    return data
  },

  async login(payload: LoginPayload): Promise<TokenResponse> {
    const { data } = await api.post<TokenResponse>("/auth/login", payload)
    return data
  },

  async register(payload: RegisterPayload): Promise<User> {
    const { data } = await api.post<User>("/auth/register", payload)
    return data
  },

  async getMe(): Promise<User> {
    const { data } = await api.get<User>("/auth/me")
    return data
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout")
  },
}
