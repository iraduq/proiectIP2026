// Date demonstrative pentru sectiunile fara endpoint in backend (utilizatori, audit, RBAC).

export interface DemoUser {
  nume: string
  email: string
  dept: string
  rol: "Student" | "Profesor" | "Tehnician" | "Administrator"
  stare: "Activ" | "Inactiv"
  nota?: string
}

export interface DemoAuditEntry {
  timestamp: string
  user: string
  actiune: string
  entitate: string
  ip: string
}

export interface RbacRole {
  rol: string
  permisiuni: string
  restrictii: string
}

export const ADMIN_ROLES = ["Student", "Profesor", "Tehnician", "Administrator"] as const

export const DEMO_USERS: DemoUser[] = [
  { nume: "Radu Ivan", email: "radu.ivan@demo.usv.ro", dept: "AIA / Calculatoare", rol: "Student", stare: "Activ" },
  { nume: "Conf. dr. ing. Mihai Popescu", email: "m.popescu@demo.usv.ro", dept: "Robotică / Calculatoare", rol: "Profesor", stare: "Activ" },
  { nume: "Ing. Andrei Ionescu", email: "a.ionescu@demo.usv.ro", dept: "Tehnician", rol: "Tehnician", stare: "Activ", nota: "Alocat: Lab 204" },
  { nume: "Admin RAVI", email: "admin.ravi@demo.usv.ro", dept: "IT / Administrare", rol: "Administrator", stare: "Activ" },
]

export const DEMO_AUDIT: DemoAuditEntry[] = [
  { timestamp: "2026-10-22 11:42", user: "admin_ravi", actiune: "Schimbare rol", entitate: "student_radu → Profesor", ip: "193.226.5.12" },
  { timestamp: "2026-10-22 11:58", user: "admin_ravi", actiune: "Schimbare rol", entitate: "student_radu → Student", ip: "193.226.5.12" },
  { timestamp: "2026-10-22 09:15", user: "admin_ravi", actiune: "Stare resursă", entitate: "INV-USV-2026-215 → Mentenanță", ip: "193.226.5.14" },
  { timestamp: "2026-10-22 08:52", user: "admin_ravi", actiune: "Autentificare", entitate: "Autentificare 2FA reușită", ip: "193.226.5.14" },
  { timestamp: "2026-10-20 14:30", user: "admin_ravi", actiune: "Dezactivare resursă", entitate: "INV-USV-2026-041 · istoric păstrat", ip: "193.226.5.12" },
]

export const RBAC_MATRIX: RbacRole[] = [
  { rol: "Student", permisiuni: "Rezervări personale · max 4 suprapuse · acces propriu", restrictii: "Fără acces inventar global sau RBAC" },
  { rol: "Profesor", permisiuni: "Rezervări grup / laborator · aprobări studenți", restrictii: "Fără custodie fizică sau jurnal tehnic" },
  { rol: "Tehnician", permisiuni: "Custodie · jurnal tehnic propriu laborator (Lab 204)", restrictii: "Fără acces alte laboratoare, RBAC sau audit global" },
  { rol: "Administrator", permisiuni: "RBAC · inventar CRUD · setări · audit doar citire", restrictii: "NU scrie jurnal tehnic · NU confirmă predare/retur" },
]

export const STARE_LABELS: Record<string, string> = {
  DISPONIBILA: "Disponibil",
  DEFECTA: "Defect",
  IN_MENTENANTA: "Mentenanță",
}
