import type { StareTehnica } from "../../../types"

export const LAB_PAGE_SIZE = 5
export const JOURNAL_FORM_ID = "lab-journal-form"

export type ReturnCondition = "FUNCTIONAL" | "VERIFICARE" | "DEFECT"

/** Starea echipamentului la retur -> starea tehnică din catalog. */
export const RETURN_CONDITIONS: { value: ReturnCondition; label: string; stare: StareTehnica }[] = [
  { value: "FUNCTIONAL", label: "Funcțional", stare: "DISPONIBILA" },
  { value: "VERIFICARE", label: "Necesită verificare / Curățare", stare: "IN_MENTENANTA" },
  { value: "DEFECT", label: "Defect / Piesă lipsă", stare: "DEFECTA" },
]

export const STARE_TEHNICA_LABELS: Record<StareTehnica, string> = {
  DISPONIBILA: "Disponibilă",
  IN_MENTENANTA: "Mentenanță",
  DEFECTA: "Defectă",
}

export const STARE_TEHNICA_OPTIONS: { value: StareTehnica; label: string }[] = [
  { value: "DISPONIBILA", label: "Disponibilă" },
  { value: "IN_MENTENANTA", label: "Mentenanță" },
  { value: "DEFECTA", label: "Defectă" },
]

export const JOURNAL_STATUS_LABELS: Record<StareTehnica, string> = {
  DISPONIBILA: "Rezolvat",
  IN_MENTENANTA: "În lucru",
  DEFECTA: "Deschis",
}
