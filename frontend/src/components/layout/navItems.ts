import type { LucideIcon } from "lucide-react"
import {
  Building2, Calendar, Cpu, DoorOpen, LayoutDashboard, ShieldCheck, Wrench,
} from "lucide-react"
import type { User } from "../../types"

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
}

/** Elementele de meniu in functie de rolul si permisiunile utilizatorului. */
export function getNavItems(user: User | null | undefined): NavItem[] {
  const isAdmin = user?.rol === "ADMINISTRATOR" || user?.permissions?.includes("structure:manage")
  const canViewTechnical =
    user?.rol === "ADMINISTRATOR" ||
    user?.rol === "RESPONSABIL_LABORATOR" ||
    Boolean(user?.permissions?.includes("technical_history:read"))

  if (user?.rol === "RESPONSABIL_LABORATOR") {
    return [
      { label: "Panou de bord", path: "/dashboard", icon: LayoutDashboard },
      { label: "Gestiune laborator", path: "/professor", icon: Building2 },
      { label: "Catalog resurse", path: "/resources", icon: Cpu },
      { label: "Rezervări și cereri", path: "/reservations", icon: Calendar },
      { label: "Jurnal tehnic", path: "/technical-history", icon: Wrench },
      { label: "Laboratoare și săli", path: "/rooms", icon: DoorOpen },
    ]
  }
  if (user?.rol === "PROFESOR") {
    return [
      { label: "Panou de bord", path: "/dashboard", icon: LayoutDashboard },
      { label: "Panou departament", path: "/professor", icon: Building2 },
      { label: "Catalog resurse", path: "/resources", icon: Cpu },
      { label: "Rezervările mele", path: "/reservations", icon: Calendar },
      { label: "Laboratoare și săli", path: "/rooms", icon: DoorOpen },
    ]
  }
  if (isAdmin) {
    return [
      { label: "Panou de bord", path: "/dashboard", icon: LayoutDashboard },
      { label: "Catalog resurse", path: "/resources", icon: Cpu },
      { label: "Rezervările mele", path: "/reservations", icon: Calendar },
      ...(canViewTechnical ? [{ label: "Jurnal tehnic", path: "/technical-history", icon: Wrench }] : []),
      { label: "Laboratoare și săli", path: "/rooms", icon: DoorOpen },
      { label: "Administrare", path: "/admin", icon: ShieldCheck },
      { label: "Structură academică", path: "/admin/academic", icon: Building2 },
    ]
  }
  return [
    { label: "Panou de bord", path: "/dashboard", icon: LayoutDashboard },
    { label: "Catalog resurse", path: "/resources", icon: Cpu },
    { label: "Rezervările mele", path: "/reservations", icon: Calendar },
    { label: "Laboratoare și săli", path: "/rooms", icon: DoorOpen },
  ]
}

export function roleLabel(rol: string | undefined, withDepartment = false): string {
  if (rol === "RESPONSABIL_LABORATOR") return "Reprezentant laborator"
  if (rol === "PROFESOR") return withDepartment ? "Profesor · Departamentul Calculatoare" : "Profesor"
  if (rol === "ADMINISTRATOR") return "Administrator"
  return "Student"
}
