export interface ApprovalItem {
  id: number
  studentName: string
  studentDetail: string
  resourceName: string
  inventoryCode: string
  roomName: string
  purpose: string
  dateStr: string
  timeRange: string
  imageUrl: string
  status: "IN_ASTEPTARE" | "APROBATA" | "RESPINSA"
  rejectionReason?: string
  isDemo?: boolean
}

export const INITIAL_DEMO_REQUESTS: ApprovalItem[] = [
  {
    id: 101,
    studentName: "Radu Ivan",
    studentDetail: "AIA · Anul III",
    resourceName: "Imprimantă 3D Bambu Lab X1-Carbon AMS",
    inventoryCode: "INV-USV-2026-041",
    roomName: "Lab Prototipare",
    purpose: "Proiect de licență",
    dateStr: "26.10.2026",
    timeRange: "10:00–12:00",
    imageUrl:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80",
    status: "IN_ASTEPTARE",
  },
  {
    id: 102,
    studentName: "Marius Mitica",
    studentDetail: "Calculatoare · Anul IV",
    resourceName: "Braț Robotic Educațional Niryo Ned 2",
    inventoryCode: "INV-USV-2026-088",
    roomName: "Lab 208",
    purpose: "Proiect de robotică",
    dateStr: "27.10.2026",
    timeRange: "12:00–14:00",
    imageUrl:
      "https://images.unsplash.com/photo-1563206767-5b18f218e8de?auto=format&fit=crop&w=900&q=80",
    status: "IN_ASTEPTARE",
    isDemo: true,
  },
  {
    id: 103,
    studentName: "Gica Hagi",
    studentDetail: "AIA · Anul II",
    resourceName: "Osciloscop Digital Rohde & Schwarz RTB2004",
    inventoryCode: "INV-USV-2026-215",
    roomName: "Lab 105",
    purpose: "Măsurători de laborator",
    dateStr: "28.10.2026",
    timeRange: "10:00–12:00",
    imageUrl:
      "https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=900&q=80",
    status: "IN_ASTEPTARE",
    isDemo: true,
  },
]
