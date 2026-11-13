import type { Room } from "../types"

export interface LabLocationMeta {
  shortCode: string
  building: string
  wing: string
  directions: string
  schedule: string
  accessNote: string
  coordinator: string
  coordinatorEmail: string
  catalogRoomKey: string
}

export const LAB_LOCATION_METADATA: Record<string, LabLocationMeta> = {
  "UPT-AC-CTI-L1": {
    shortCode: "Lab 204",
    building: "Corp Electro (Bd. Vasile Pârvan nr. 2)",
    wing: "Aripa B · Tronson CTI",
    directions:
      "Intrarea principală Corp Electro → Scara B → Etajul 2, culoarul din stânga, a doua ușă pe dreapta (sala B204).",
    schedule: "Luni – Vineri · 08:00 – 20:00",
    accessNote: "Acces pe bază de legitimație student / card RFID sau rezervare activă",
    coordinator: "Prof. dr. ing. Dan Georgescu",
    coordinatorEmail: "dan.georgescu@upt.ro",
    catalogRoomKey: "Lab 204",
  },
  "UPT-AC-CTI-L2": {
    shortCode: "Lab 210",
    building: "Corp Electro (Bd. Vasile Pârvan nr. 2)",
    wing: "Aripa B · Tronson CTI",
    directions:
      "Intrarea principală Corp Electro → Scara B → Etajul 2, capătul culoarului spre curtea interioară (sala B210).",
    schedule: "Luni – Vineri · 08:00 – 20:00",
    accessNote: "Acces liber în timpul orelor de laborator sau prin rezervare în platformă",
    coordinator: "Conf. dr. ing. Mihai Radu",
    coordinatorEmail: "mihai.radu@upt.ro",
    catalogRoomKey: "Lab 210",
  },
  "UPT-AC-CTI-S1": {
    shortCode: "Sala Servere",
    building: "Corp Electro (Bd. Vasile Pârvan nr. 2)",
    wing: "Aripa B · Subsol Tehnic",
    directions:
      "Coborâre pe Scara B până la Subsol (-1) → Ușa securizată DataCenter (acces asistat de administratorul de rețea).",
    schedule: "24/7 (Acces fizic asistat 08:00 – 18:00)",
    accessNote: "Conectare remote SSH/VPN pentru nodurile GPU; acces fizic cu aprobare",
    coordinator: "Ing. Vlad Munteanu",
    coordinatorEmail: "vlad.munteanu@upt.ro",
    catalogRoomKey: "Sala Servere",
  },
  "UPT-AC-IS-L1": {
    shortCode: "Lab Prototipare",
    building: "Corp Electro (Bd. Vasile Pârvan nr. 2)",
    wing: "Aripa A · Parter",
    directions:
      "Intrarea dinspre Parcul Rozelor (Aripa A) → Parter, prima sală pe dreapta lângă atelierul de mecatronică.",
    schedule: "Luni – Vineri · 08:00 – 19:00",
    accessNote: "Instructaj scurt SSM la prima utilizare a imprimantelor 3D / CNC",
    coordinator: "Ș.l. dr. ing. Elena Ionescu",
    coordinatorEmail: "elena.ionescu@upt.ro",
    catalogRoomKey: "Lab Prototipare",
  },
  "UPT-AC-IS-L2": {
    shortCode: "Lab 208",
    building: "Corp Electro (Bd. Vasile Pârvan nr. 2)",
    wing: "Aripa A · Etaj 1",
    directions:
      "Scara principală Aripa A → Etajul 1, vizavi de avizierul Departamentului Automatică și Informatică Aplicată.",
    schedule: "Luni – Vineri · 08:00 – 20:00",
    accessNote: "Acces pe bază de rezervare pentru brațele robotice și roverele autonome",
    coordinator: "Prof. dr. ing. Cristian Toma",
    coordinatorEmail: "cristian.toma@upt.ro",
    catalogRoomKey: "Lab 208",
  },
  "UPT-ETcTI-EA-L1": {
    shortCode: "Lab 105",
    building: "Corp Electro (Bd. Vasile Pârvan nr. 2)",
    wing: "Aripa C · Etaj 1 (Electronică)",
    directions:
      "Intrarea Aripa C → Etajul 1, a treia sală pe partea stângă (Laborator măsurări și osciloscoape).",
    schedule: "Luni – Vineri · 08:00 – 20:00",
    accessNote: "Sondele și kiturile RF se preiau de la tehnicianul sălii 105",
    coordinator: "Conf. dr. ing. Andrei Marin",
    coordinatorEmail: "andrei.marin@upt.ro",
    catalogRoomKey: "Lab 105",
  },
  "UPT-ETcTI-COM-L1": {
    shortCode: "Lab 305",
    building: "Corp Electro (Bd. Vasile Pârvan nr. 2)",
    wing: "Aripa C · Etaj 2 (Comunicații)",
    directions:
      "Intrarea Aripa C → Etajul 2, sala C305 lângă laboratorul de rețele optice și radiocomunicații.",
    schedule: "Luni – Vineri · 08:00 – 19:00",
    accessNote: "Echipamentele de fibră optică și analiză spectrală necesită rezervare prealabilă",
    coordinator: "Prof. dr. ing. Sorin Dumitrescu",
    coordinatorEmail: "sorin.dumitrescu@upt.ro",
    catalogRoomKey: "Lab 305",
  },
}

export const DEFAULT_FALLBACK_ROOMS: Room[] = [
  {
    id: 1,
    departament_id: 1,
    departament_nume: "Departamentul Calculatoare și Tehnologia Informației",
    facultate_id: 1,
    facultate_nume: "Facultatea de Automatică și Calculatoare",
    institutie_id: 1,
    institutie_nume: "Universitatea Politehnica Timișoara",
    nume: "Laborator de inteligență artificială și cloud computing (Lab 204)",
    cod: "UPT-AC-CTI-L1",
    tip_sala: "LABORATOR",
    etaj: 2,
    capacitate: 28,
    descriere: "Stații grafice Deep Learning RTX 4090, servere GPU și kituri Edge AI Jetson.",
    responsabil: {
      id_utilizator: 2,
      nume: "Prof. dr. ing. Dan Georgescu",
      email: "dan.georgescu@upt.ro",
    },
    is_active: true,
    created_at: "2026-01-10T08:00:00Z",
    updated_at: "2026-01-10T08:00:00Z",
  },
  {
    id: 2,
    departament_id: 1,
    departament_nume: "Departamentul Calculatoare și Tehnologia Informației",
    facultate_id: 1,
    facultate_nume: "Facultatea de Automatică și Calculatoare",
    institutie_id: 1,
    institutie_nume: "Universitatea Politehnica Timișoara",
    nume: "Laborator de sisteme încorporate și arhitectura calculatoarelor (Lab 210)",
    cod: "UPT-AC-CTI-L2",
    tip_sala: "LABORATOR",
    etaj: 2,
    capacitate: 24,
    descriere: "Plăci FPGA Xilinx Zynq, kituri STM32 Nucleo, Raspberry Pi 5 și analizoare logice.",
    responsabil: {
      id_utilizator: 2,
      nume: "Conf. dr. ing. Mihai Radu",
      email: "mihai.radu@upt.ro",
    },
    is_active: true,
    created_at: "2026-01-10T08:00:00Z",
    updated_at: "2026-01-10T08:00:00Z",
  },
  {
    id: 3,
    departament_id: 1,
    departament_nume: "Departamentul Calculatoare și Tehnologia Informației",
    facultate_id: 1,
    facultate_nume: "Facultatea de Automatică și Calculatoare",
    institutie_id: 1,
    institutie_nume: "Universitatea Politehnica Timișoara",
    nume: "Centru de date și cluster HPC de cercetare (Sala servere)",
    cod: "UPT-AC-CTI-S1",
    tip_sala: "SALA_CERCETARE",
    etaj: -1,
    capacitate: 10,
    descriere: "Noduri HPC NVIDIA A100/H100, servere de virtualizare Proxmox și stocare NVMe.",
    responsabil: {
      id_utilizator: 2,
      nume: "Ing. Vlad Munteanu",
      email: "vlad.munteanu@upt.ro",
    },
    is_active: true,
    created_at: "2026-01-10T08:00:00Z",
    updated_at: "2026-01-10T08:00:00Z",
  },
  {
    id: 4,
    departament_id: 2,
    departament_nume: "Departamentul Automatică și Informatică Aplicată",
    facultate_id: 1,
    facultate_nume: "Facultatea de Automatică și Calculatoare",
    institutie_id: 1,
    institutie_nume: "Universitatea Politehnica Timișoara",
    nume: "Laborator de prototipare rapidă, FabLab și imprimare 3D",
    cod: "UPT-AC-IS-L1",
    tip_sala: "LABORATOR",
    etaj: 0,
    capacitate: 20,
    descriere: "Imprimante 3D Bambu Lab X1C, Prusa MK4, Formlabs SLA, gravator laser și CNC.",
    responsabil: {
      id_utilizator: 2,
      nume: "Ș.l. dr. ing. Elena Ionescu",
      email: "elena.ionescu@upt.ro",
    },
    is_active: true,
    created_at: "2026-01-10T08:00:00Z",
    updated_at: "2026-01-10T08:00:00Z",
  },
  {
    id: 5,
    departament_id: 2,
    departament_nume: "Departamentul Automatică și Informatică Aplicată",
    facultate_id: 1,
    facultate_nume: "Facultatea de Automatică și Calculatoare",
    institutie_id: 1,
    institutie_nume: "Universitatea Politehnica Timișoara",
    nume: "Laborator de robotică, drone și sisteme autonome (Lab 208)",
    cod: "UPT-AC-IS-L2",
    tip_sala: "SALA_CERCETARE",
    etaj: 1,
    capacitate: 18,
    descriere: "Brațe robotice Niryo Ned 2, Dobot Magician, rovere ROS2 cu LiDAR și drone.",
    responsabil: {
      id_utilizator: 2,
      nume: "Prof. dr. ing. Cristian Toma",
      email: "cristian.toma@upt.ro",
    },
    is_active: true,
    created_at: "2026-01-10T08:00:00Z",
    updated_at: "2026-01-10T08:00:00Z",
  },
  {
    id: 6,
    departament_id: 3,
    departament_nume: "Departamentul Electronică Aplicată",
    facultate_id: 2,
    facultate_nume: "Facultatea de Electronică, Telecomunicații și Tehnologii Informaționale",
    institutie_id: 1,
    institutie_nume: "Universitatea Politehnica Timișoara",
    nume: "Laborator de electronică aplicată, osciloscoape și RF (Lab 105)",
    cod: "UPT-ETcTI-EA-L1",
    tip_sala: "LABORATOR",
    etaj: 1,
    capacitate: 26,
    descriere: "Osciloscoape digitale 4 canale, generatoare de semnal, analizoare de spectru și stații lipit.",
    responsabil: {
      id_utilizator: 2,
      nume: "Conf. dr. ing. Andrei Marin",
      email: "andrei.marin@upt.ro",
    },
    is_active: true,
    created_at: "2026-01-10T08:00:00Z",
    updated_at: "2026-01-10T08:00:00Z",
  },
  {
    id: 7,
    departament_id: 4,
    departament_nume: "Departamentul Comunicații",
    facultate_id: 2,
    facultate_nume: "Facultatea de Electronică, Telecomunicații și Tehnologii Informaționale",
    institutie_id: 1,
    institutie_nume: "Universitatea Politehnica Timișoara",
    nume: "Laborator de rețele optice, 5G și comunicații (Lab 305)",
    cod: "UPT-ETcTI-COM-L1",
    tip_sala: "LABORATOR",
    etaj: 2,
    capacitate: 24,
    descriere: "Echipamente SDR USRP, aparate de sudură fibră optică, OTDR și routere enterprise.",
    responsabil: {
      id_utilizator: 2,
      nume: "Prof. dr. ing. Sorin Dumitrescu",
      email: "sorin.dumitrescu@upt.ro",
    },
    is_active: true,
    created_at: "2026-01-10T08:00:00Z",
    updated_at: "2026-01-10T08:00:00Z",
  },
]

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
