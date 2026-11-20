import type { StareTehnica } from "../../types"

export interface CatalogCardItem {
  id: number
  code: string
  name: string
  specsAndRoom: string
  categoryTag: string
  department: string
  specializare: string
  roomLabel: string
  statusBadge: "Disponibil" | "Rezervat" | "În utilizare"
  stareTehnica: StareTehnica
  returnTodayBadge?: string
  availabilityNote?: string
  buttonLabel: string
  imageUrl: string
  specs: { label: string; value: string }[]
}

export interface RawSeedEntry {
  code: string
  name: string
  spec1Label: string
  spec1Value: string
  spec2Label: string
  spec2Value: string
  roomLabel: string
  categoryTag: string
  department: string
  specializare: string
  statusBadge: "Disponibil" | "Rezervat" | "În utilizare"
  stareTehnica: StareTehnica
  imageUrl: string
  returnTodayBadge?: string
  availabilityNote?: string
}
