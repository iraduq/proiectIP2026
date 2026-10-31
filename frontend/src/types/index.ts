export type UserRole = "ADMINISTRATOR" | "PROFESOR" | "STUDENT" | "RESPONSABIL_LABORATOR"

export type TipSala = "LABORATOR" | "SALA_CERCETARE" | "ATELIER" | "SALA_SERVERE" | "DEPOZIT"

export interface UserBrief {
  id_utilizator: number
  nume: string
  email: string
  rol?: string
}

export interface User {
  id_utilizator: number
  nume: string
  email: string
  rol: UserRole
  numar_matricol?: string | null
  id_angajat?: number | null
  facultate_id?: number | null
  facultate_nume?: string | null
  facultate_cod?: string | null
  is_active: boolean
  permissions: string[]
  created_at: string
}

export interface Institution {
  id: number
  nume: string
  cod: string
  oras: string
  adresa: string
  email_contact?: string | null
  telefon?: string | null
  website?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface InstitutionStats {
  institutie_id: number
  institutie_nume: string
  numar_facultati: number
  numar_departamente: number
  numar_sali: number
  numar_sali_active: number
}

export interface Faculty {
  id: number
  institutie_id: number
  institutie_nume: string
  nume: string
  cod: string
  descriere?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Department {
  id: number
  facultate_id: number
  facultate_nume: string
  institutie_id: number
  institutie_nume: string
  nume: string
  cod: string
  descriere?: string | null
  sef_departament?: UserBrief | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Room {
  id: number
  cod: string
  nume: string
  tip_sala: TipSala
  etaj: number
  capacitate: number
  descriere?: string | null
  departament_id: number
  departament_nume: string
  facultate_id: number
  facultate_nume: string
  institutie_id: number
  institutie_nume: string
  responsabil: UserBrief
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Page<T> {
  items: T[]
  total: number
  skip: number
  limit: number
  has_more: boolean
}

export interface ApiError {
  detail: string
  code: string
  details?: unknown
}
