import type { Room } from "../../../types"
import { LAB_LOCATION_METADATA, type LabLocationMeta } from "./labLocationMetadata"
import { DEFAULT_FALLBACK_ROOMS } from "./fallbackRooms"

export { LAB_LOCATION_METADATA, DEFAULT_FALLBACK_ROOMS }
export type { LabLocationMeta }

export function formatFloorLabel(etaj: number): string {
  if (etaj < 0) return "Subsol"
  if (etaj === 0) return "Parter"
  return `Etaj ${etaj}`
}

export function resolveLabMetadata(room: Room): LabLocationMeta {
  if (LAB_LOCATION_METADATA[room.cod]) {
    return LAB_LOCATION_METADATA[room.cod]
  }
  const nameLower = room.nume.toLowerCase()
  if (nameLower.includes("204") || nameLower.includes("inteligen")) {
    return LAB_LOCATION_METADATA["UPT-AC-CTI-L1"]
  }
  if (nameLower.includes("210") || nameLower.includes("încorporate")) {
    return LAB_LOCATION_METADATA["UPT-AC-CTI-L2"]
  }
  if (nameLower.includes("server") || nameLower.includes("hpc")) {
    return LAB_LOCATION_METADATA["UPT-AC-CTI-S1"]
  }
  if (nameLower.includes("prototip") || nameLower.includes("3d")) {
    return LAB_LOCATION_METADATA["UPT-AC-IS-L1"]
  }
  if (nameLower.includes("208") || nameLower.includes("robot")) {
    return LAB_LOCATION_METADATA["UPT-AC-IS-L2"]
  }
  if (nameLower.includes("105") || nameLower.includes("electronic")) {
    return LAB_LOCATION_METADATA["UPT-ETcTI-EA-L1"]
  }
  if (nameLower.includes("305") || nameLower.includes("comunica") || nameLower.includes("optic")) {
    return LAB_LOCATION_METADATA["UPT-ETcTI-COM-L1"]
  }
  const floorLabel = formatFloorLabel(room.etaj)
  return {
    shortCode: room.cod,
    building: "Corp Electro (Bd. Vasile Pârvan nr. 2)",
    wing: `Aripa Principală · ${floorLabel}`,
    directions: `Acces prin intrarea principală Corp Electro → ${floorLabel}, urmând indicatoarele pentru sala ${room.cod}.`,
    schedule: "Luni – Vineri · 08:00 – 20:00",
    accessNote: "Acces cu cardul de student / cadru didactic sau rezervare activă",
    coordinator: room.responsabil?.nume || "Prof. dr. ing. Dan Georgescu",
    coordinatorEmail: room.responsabil?.email || "dan.georgescu@upt.ro",
    catalogRoomKey: "Lab 204",
  }
}

export const FLOOR_FILTER_OPTIONS = ["ALL", "Subsol", "Parter", "Etaj 1", "Etaj 2"]

export const WING_FILTER_OPTIONS = [
  { id: "ALL", label: "Toate aripile din campus" },
  { id: "Aripa A", label: "Aripa A (Automatică și FabLab)" },
  { id: "Aripa B", label: "Aripa B (Calculatoare și AI)" },
  { id: "Aripa C", label: "Aripa C (Electronică și comunicații)" },
]
