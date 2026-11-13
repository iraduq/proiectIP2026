import type { DemoApprovalItem } from "../components/professor/ProfessorApprovalModal"

export interface DemoCatalogItem {
  id: number
  nume: string
  cod_inventar: string
  sala_cod: string
  specs: string
  imagine_url: string
}

export const DEMO_CATALOG_ITEMS: DemoCatalogItem[] = [
  {
    id: 1,
    nume: "Braț robotic educațional Niryo Ned 2",
    cod_inventar: "INV-USV-2026-088",
    sala_cod: "Lab 208",
    specs: "6 axe, ROS2",
    imagine_url:
      "https://images.unsplash.com/photo-1563206767-5b18f218e8de?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    nume: "Kit NVIDIA Jetson Orin Nano Dev Kit",
    cod_inventar: "INV-USV-2026-102",
    sala_cod: "Lab 210",
    specs: "40 TOPS",
    imagine_url:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    nume: "Osciloscop digital Rohde & Schwarz RTB2004",
    cod_inventar: "INV-USV-2026-215",
    sala_cod: "Lab 105",
    specs: "300 MHz",
    imagine_url:
      "https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=800&q=80",
  },
]

export const DEMO_APPROVALS: DemoApprovalItem[] = [
  {
    id: 101,
    studentName: "Radu Ivan",
    resourceName: "Bambu Lab X1-Carbon AMS",
    scope: "Proiect de licență · AIA",
    timeRange: "26.10.2026 · 10:00–12:00",
  },
  {
    id: 102,
    studentName: "Mircea Marius",
    resourceName: "Niryo Ned 2",
    scope: "Proiect de robotică · Calculatoare",
    timeRange: "27.10.2026 · 12:00–14:00",
  },
  {
    id: 103,
    studentName: "Stelica Vali",
    resourceName: "Rohde & Schwarz RTB2004",
    scope: "Măsurători de laborator · AIA",
    timeRange: "28.10.2026 · 10:00–12:00",
  },
]
