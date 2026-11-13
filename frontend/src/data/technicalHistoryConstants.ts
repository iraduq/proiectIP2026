import type { StareTehnica } from "../types"

export const INTERVENTION_FILTER_OPTIONS = [
  { value: "ALL", label: "Toate tipurile" },
  { value: "MENTENANTA_PREVENTIVA", label: "Mentenanță preventivă" },
  { value: "DEFECTIUNE", label: "Defecțiuni" },
  { value: "REPARATIE", label: "Reparații" },
  { value: "CALIBRARE", label: "Calibrare" },
  { value: "INSTALARE_SOFTWARE", label: "Software / firmware" },
] as const

export const INTERVENTION_LOG_OPTIONS = [
  { value: "MENTENANTA_PREVENTIVA", label: "Mentenanță preventivă" },
  { value: "DEFECTIUNE", label: "Defecțiune semnalată" },
  { value: "REPARATIE", label: "Reparație / piese schimb" },
  { value: "CALIBRARE", label: "Calibrare / ajustare parametri" },
  { value: "INSTALARE_SOFTWARE", label: "Actualizare software / firmware" },
] as const

export const TECHNICAL_STATE_OPTIONS: { value: StareTehnica; label: string }[] = [
  { value: "DISPONIBILA", label: "Disponibilă (operațională)" },
  { value: "IN_MENTENANTA", label: "În mentenanță" },
  { value: "DEFECTA", label: "Defectă (inoperabilă)" },
]
