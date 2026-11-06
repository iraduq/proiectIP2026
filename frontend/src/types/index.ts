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

export type StareTehnica = "DISPONIBILA" | "DEFECTA" | "IN_MENTENANTA"
export type StareRezervare = "IN_ASTEPTARE" | "APROBATA" | "ANULATA" | "RESPINSA" | "FINALIZATA"

export interface Category {
  id: number
  nume: string
  descriere?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  resources_count?: number
}

export interface Resource {
  id: number
  nume: string
  cod_inventar: string
  categorie_id: number
  categorie_nume?: string | null
  sala_id: number
  sala_cod?: string | null
  sala_nume?: string | null
  departament_id?: number | null
  departament_nume?: string | null
  facultate_id?: number | null
  facultate_nume?: string | null
  institutie_id?: number | null
  institutie_nume?: string | null
  stare_tehnica: StareTehnica
  descriere?: string | null
  specificatii?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Reservation {
  id: number
  resursa_id: number
  resursa_nume?: string | null
  resursa_cod?: string | null
  categorie_id?: number | null
  categorie_nume?: string | null
  sala_id?: number | null
  sala_nume?: string | null
  facultate_id?: number | null
  facultate_nume?: string | null
  utilizator_id: number
  utilizator_nume?: string | null
  utilizator_email?: string | null
  utilizator_rol?: string | null
  numar_matricol?: string | null
  data_inceput: string
  data_sfarsit: string
  stare: StareRezervare
  scop: string
  motiv_respingere?: string | null
  created_at: string
  updated_at: string
}

export interface StudentQuota {
  active_count: number
  max_limit: number
  can_reserve: boolean
  active_reservations: Reservation[]
}

export interface TechnicalHistory {
  id: number
  resursa_id: number
  resursa_nume?: string | null
  resursa_cod?: string | null
  utilizator_id: number
  utilizator_nume?: string | null
  tip_interventie: string
  descriere: string
  stare_anterioara: StareTehnica
  stare_noua: StareTehnica
  created_at: string
}
