import { useState, useEffect, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { AppLayout } from "../components/layout/AppLayout"
import { academicApi } from "../api/academic"
import { useAuth } from "../context/AuthContext"
import { ALL_CATALOG_ITEMS } from "../data/catalogItems"
import type { Room, Department, Faculty } from "../types"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { Card } from "../components/ui/card"
import {
  DoorOpen,
  Plus,
  Search,
  Edit2,
  MapPin,
  Users,
  Building2,
  X,
  Compass,
  Clock,
  UserCheck,
  Cpu,
  Navigation,
  ChevronRight,
  Layers,
  CheckCircle2,
} from "lucide-react"

interface LabLocationMeta {
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

const LAB_LOCATION_METADATA: Record<string, LabLocationMeta> = {
  "UPT-AC-CTI-L1": {
    shortCode: "Lab 204",
    building: "Corp Electro (Bd. Vasile Pârvan nr. 2)",
    wing: "Aripa B · Tronson CTI",
    directions: "Intrarea principală Corp Electro → Scara B → Etajul 2, culoarul din stânga, a doua ușă pe dreapta (sala B204).",
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
    directions: "Intrarea principală Corp Electro → Scara B → Etajul 2, capătul culoarului spre curtea interioară (sala B210).",
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
    directions: "Coborâre pe Scara B până la Subsol (-1) → Ușa securizată DataCenter (acces asistat de administratorul de rețea).",
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
    directions: "Intrarea dinspre Parcul Rozelor (Aripa A) → Parter, prima sală pe dreapta lângă atelierul de mecatronică.",
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
    directions: "Scara principală Aripa A → Etajul 1, vizavi de avizierul Departamentului Automatică și Informatică Aplicată.",
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
    directions: "Intrarea Aripa C → Etajul 1, a treia sală pe partea stângă (Laborator măsurări și osciloscoape).",
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
    directions: "Intrarea Aripa C → Etajul 2, sala C305 lângă laboratorul de rețele optice și radiocomunicații.",
    schedule: "Luni – Vineri · 08:00 – 19:00",
    accessNote: "Echipamentele de fibră optică și analiză spectrală necesită rezervare prealabilă",
    coordinator: "Prof. dr. ing. Sorin Dumitrescu",
    coordinatorEmail: "sorin.dumitrescu@upt.ro",
    catalogRoomKey: "Lab 305",
  },
}

const DEFAULT_FALLBACK_ROOMS: Room[] = [
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

function formatFloorLabel(etaj: number): string {
  if (etaj < 0) return "Subsol"
  if (etaj === 0) return "Parter"
  return `Etaj ${etaj}`
}

function resolveLabMetadata(room: Room): LabLocationMeta {
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

export function RoomsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const canEdit =
    user?.rol === "ADMINISTRATOR" ||
    user?.rol === "RESPONSABIL_LABORATOR" ||
    Boolean(user?.permissions?.includes("rooms:write"))

  const [rooms, setRooms] = useState<Room[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [search, setSearch] = useState("")
  const [selectedDeptId, setSelectedDeptId] = useState<string>("")
  const [selectedFloor, setSelectedFloor] = useState<string>("ALL")
  const [selectedWing, setSelectedWing] = useState<string>("ALL")
  const [expandedRoomId, setExpandedRoomId] = useState<number | null>(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [formData, setFormData] = useState({
    departament_id: "",
    nume: "",
    cod: "",
    etaj: "1",
    capacitate: "24",
    descriere: "",
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchInitialData = useCallback(async () => {
    try {
      const [deptsRes, facsRes] = await Promise.all([
        academicApi.getDepartments({ limit: 100 }),
        academicApi.getFaculties({ limit: 100 }),
      ])
      setDepartments(deptsRes.items)
      setFaculties(facsRes.items)
    } catch {
    }
  }, [])

  const fetchRooms = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await academicApi.getRooms({
        limit: 100,
        departament_id: selectedDeptId ? Number(selectedDeptId) : undefined,
      })
      if (res.items && res.items.length > 0) {
        setRooms(res.items)
      } else {
        setRooms(DEFAULT_FALLBACK_ROOMS)
      }
    } catch {
      setRooms(DEFAULT_FALLBACK_ROOMS)
    } finally {
      setIsLoading(false)
    }
  }, [selectedDeptId])

  useEffect(() => {
    fetchInitialData()
  }, [fetchInitialData])

  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  const getDepartmentName = (room: Room) => {
    if (room.departament_nume) return room.departament_nume
    const dept = departments.find((d) => d.id === room.departament_id)
    if (dept) return dept.nume
    if (room.departament_id === 1) return "Departamentul Calculatoare și Tehnologia Informației"
    if (room.departament_id === 2) return "Departamentul Automatică și Informatică Aplicată"
    if (room.departament_id === 3) return "Departamentul Electronică Aplicată"
    if (room.departament_id === 4) return "Departamentul Comunicații"
    return "Departament Universitar"
  }

  const getFacultyCode = (room: Room) => {
    const dept = departments.find((d) => d.id === room.departament_id)
    if (dept) {
      const fac = faculties.find((f) => f.id === dept.facultate_id)
      if (fac) return fac.cod
    }
    return room.departament_id <= 2 ? "AC" : "ETcTI"
  }

  const enrichedRooms = useMemo(() => {
    return rooms.map((room) => {
      const meta = resolveLabMetadata(room)
      const floorText = formatFloorLabel(room.etaj)
      const equipmentInRoom = ALL_CATALOG_ITEMS.filter(
        (item) => item.roomLabel.toLowerCase() === meta.catalogRoomKey.toLowerCase()
      )
      return {
        room,
        meta,
        floorText,
        equipmentInRoom,
        deptName: getDepartmentName(room),
        facCode: getFacultyCode(room),
      }
    })
  }, [rooms, departments, faculties])

  const filteredRooms = useMemo(() => {
    const q = search.trim().toLowerCase()
    return enrichedRooms.filter(({ room, meta, floorText, equipmentInRoom, deptName }) => {
      if (selectedDeptId && room.departament_id !== Number(selectedDeptId)) {
        return false
      }
      if (selectedFloor !== "ALL") {
        if (floorText.toLowerCase() !== selectedFloor.toLowerCase()) {
          return false
        }
      }
      if (selectedWing !== "ALL") {
        if (!meta.wing.toLowerCase().includes(selectedWing.toLowerCase())) {
          return false
        }
      }
      if (!q) return true

      const matchesRoomText =
        room.nume.toLowerCase().includes(q) ||
        room.cod.toLowerCase().includes(q) ||
        meta.shortCode.toLowerCase().includes(q) ||
        meta.building.toLowerCase().includes(q) ||
        meta.wing.toLowerCase().includes(q) ||
        meta.directions.toLowerCase().includes(q) ||
        meta.coordinator.toLowerCase().includes(q) ||
        floorText.toLowerCase().includes(q) ||
        deptName.toLowerCase().includes(q) ||
        (room.descriere || "").toLowerCase().includes(q)

      const matchesEquipment = equipmentInRoom.some(
        (eq) =>
          eq.name.toLowerCase().includes(q) ||
          eq.code.toLowerCase().includes(q) ||
          eq.categoryTag.toLowerCase().includes(q)
      )

      return matchesRoomText || matchesEquipment
    })
  }, [enrichedRooms, search, selectedDeptId, selectedFloor, selectedWing])

  const openCreateModal = () => {
    setEditingRoom(null)
    setFormError(null)
    setFormData({
      departament_id: departments[0]?.id ? String(departments[0].id) : "1",
      nume: "",
      cod: "",
      etaj: "1",
      capacitate: "24",
      descriere: "",
    })
    setIsModalOpen(true)
  }

  const openEditModal = (room: Room) => {
    setEditingRoom(room)
    setFormError(null)
    setFormData({
      departament_id: String(room.departament_id),
      nume: room.nume,
      cod: room.cod,
      etaj: String(room.etaj ?? 1),
      capacitate: String(room.capacitate ?? 24),
      descriere: room.descriere || "",
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setIsSubmitting(true)

    try {
      const etajNum = Number(formData.etaj) || 0
      const capNum = Number(formData.capacitate) || 20

      if (editingRoom) {
        await academicApi.updateRoom(editingRoom.id, {
          nume: formData.nume.trim(),
          cod: formData.cod.trim().toUpperCase(),
          tip_sala: editingRoom.tip_sala || "LABORATOR",
          etaj: etajNum,
          capacitate: capNum,
          descriere: formData.descriere.trim() || null,
        })
      } else {
        await academicApi.createRoom({
          departament_id: Number(formData.departament_id),
          nume: formData.nume.trim(),
          cod: formData.cod.trim().toUpperCase(),
          tip_sala: "LABORATOR",
          etaj: etajNum,
          capacitate: capNum,
          descriere: formData.descriere.trim() || null,
          responsabil_id: user?.id_utilizator || 1,
        })
      }

      setIsModalOpen(false)
      fetchRooms()
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { detail?: string } } }
      setFormError(errorObj.response?.data?.detail || "Eroare la salvarea laboratorului.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const floorOptions = ["ALL", "Subsol", "Parter", "Etaj 1", "Etaj 2"]
  const wingOptions = [
    { id: "ALL", label: "Toate aripile din campus" },
    { id: "Aripa A", label: "Aripa A (Automatică și FabLab)" },
    { id: "Aripa B", label: "Aripa B (Calculatoare și AI)" },
    { id: "Aripa C", label: "Aripa C (Electronică și comunicații)" },
  ]

  return (
    <AppLayout breadcrumbs={["Spațiu de lucru", "Laboratoare și săli"]}>
      <div className="max-w-7xl mx-auto space-y-5">
        <Card className="rounded-2xl border-neutral-200 bg-white p-6 shadow-none">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="rounded-full bg-neutral-950 text-white text-[10px] font-semibold px-2.5 py-0.5">
                  Localizare campus
                </Badge>
                <span className="text-xs text-neutral-500 font-medium">
                  Corp Electro · Bd. Vasile Pârvan nr. 2
                </span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-neutral-900">
                Laboratoare și săli de cercetare
              </h1>
              <p className="text-xs text-neutral-500 max-w-2xl">
                Caută rapid unde se află un laborator în campus (aripă, etaj, indicații de orientare),
                verifică programul de acces, cadrul didactic responsabil și ce echipamente poți rezerva în fiecare sală.
              </p>
            </div>
            {canEdit && (
              <Button
                onClick={openCreateModal}
                className="rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white h-9 px-4 text-xs font-semibold gap-1.5 shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                Adaugă laborator
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-neutral-100">
            <div className="rounded-xl bg-neutral-50 border border-neutral-200/70 p-3">
              <div className="text-[11px] text-neutral-500 font-medium">Laboratoare active</div>
              <div className="text-lg font-bold text-neutral-900 mt-0.5">{rooms.length} săli</div>
              <div className="text-[10px] text-neutral-400">În Corpul Electro (Aripile A, B, C)</div>
            </div>
            <div className="rounded-xl bg-neutral-50 border border-neutral-200/70 p-3">
              <div className="text-[11px] text-neutral-500 font-medium">Program standard acces</div>
              <div className="text-lg font-bold text-neutral-900 mt-0.5">08:00 – 20:00</div>
              <div className="text-[10px] text-neutral-400">Luni – Vineri (Card student / Rezervare)</div>
            </div>
            <div className="rounded-xl bg-neutral-50 border border-neutral-200/70 p-3">
              <div className="text-[11px] text-neutral-500 font-medium">Echipamente găzduite</div>
              <div className="text-lg font-bold text-neutral-900 mt-0.5">
                {ALL_CATALOG_ITEMS.length} resurse
              </div>
              <div className="text-[10px] text-neutral-400">Distribuite în sălile de laborator</div>
            </div>
            <div className="rounded-xl bg-neutral-50 border border-neutral-200/70 p-3">
              <div className="text-[11px] text-neutral-500 font-medium">Punct predare / ridicare</div>
              <div className="text-lg font-bold text-neutral-900 mt-0.5">La sala indicată</div>
              <div className="text-[10px] text-neutral-400">Pe baza rezervării din platformă</div>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border-neutral-200 bg-white p-5 shadow-none space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-6 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Caută unde e laboratorul (ex: Lab 204, Lab 105, Robotică, RTX 4090, Bambu X1, etaj...)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl border-neutral-200"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="md:col-span-3">
              <select
                value={selectedWing}
                onChange={(e) => setSelectedWing(e.target.value)}
                className="w-full h-9 rounded-xl border border-neutral-200 bg-white px-3 text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                {wingOptions.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <select
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value)}
                className="w-full h-9 rounded-xl border border-neutral-200 bg-white px-3 text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                <option value="">Toate departamentele</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nume} ({d.cod})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-neutral-500 mr-1">Filtru rapid etaj:</span>
              {floorOptions.map((floor) => {
                const active = selectedFloor === floor
                return (
                  <button
                    key={floor}
                    type="button"
                    onClick={() => setSelectedFloor(floor)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                      active
                        ? "bg-neutral-950 text-white"
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    }`}
                  >
                    {floor === "ALL" ? "Toate etajele" : floor}
                  </button>
                )
              })}
            </div>

            <div className="text-xs text-neutral-500 font-medium">
              {filteredRooms.length} {filteredRooms.length === 1 ? "laborator găsit" : "laboratoare găsite"}
            </div>
          </div>
        </Card>

        {isLoading ? (
          <Card className="rounded-2xl border-neutral-200 bg-white p-12 text-center text-xs text-neutral-400 shadow-none">
            Se încarcă harta și lista laboratoarelor...
          </Card>
        ) : filteredRooms.length === 0 ? (
          <Card className="rounded-2xl border-neutral-200 bg-white p-12 text-center space-y-3 shadow-none">
            <DoorOpen className="h-8 w-8 text-neutral-300 mx-auto" />
            <div className="text-sm font-bold text-neutral-800">
              Niciun laborator găsit pentru criteriile selectate
            </div>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              Încearcă să cauți după indicativul sălii (ex: Lab 204, Lab 208, Lab 105) sau resetează filtrele de etaj și aripă.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("")
                setSelectedFloor("ALL")
                setSelectedWing("ALL")
                setSelectedDeptId("")
              }}
              className="rounded-xl text-xs"
            >
              Resetează toate filtrele
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredRooms.map(({ room, meta, floorText, equipmentInRoom, deptName, facCode }) => {
              const isExpanded = expandedRoomId === room.id
              const previewEquipment = isExpanded ? equipmentInRoom : equipmentInRoom.slice(0, 4)

              return (
                <Card
                  key={room.id}
                  className="rounded-2xl border-neutral-200 bg-white p-5 shadow-none flex flex-col justify-between space-y-4 hover:border-neutral-300 transition-colors"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className="rounded-lg bg-neutral-950 text-white text-xs font-bold px-2.5 py-0.5">
                            {meta.shortCode}
                          </Badge>
                          <span className="font-mono text-[11px] font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md">
                            {room.cod}
                          </span>
                          <Badge
                            variant="outline"
                            className="rounded-full bg-emerald-50 border-emerald-200 text-emerald-800 text-[10px] font-semibold px-2.5 py-0.5 gap-1"
                          >
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            Deschis accesului
                          </Badge>
                        </div>
                        <h2 className="text-base font-bold text-neutral-900 leading-snug pt-1">
                          {room.nume}
                        </h2>
                        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                          <Building2 className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                          <span>
                            Facultatea {facCode} · {deptName}
                          </span>
                        </div>
                      </div>

                      {canEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(room)}
                          className="h-8 px-2.5 rounded-lg border-neutral-200 text-xs text-neutral-700 shrink-0 gap-1"
                        >
                          <Edit2 className="h-3 w-3" />
                          Editează
                        </Button>
                      )}
                    </div>

                    <div className="rounded-xl bg-neutral-50 border border-neutral-200/80 p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-neutral-900">
                          <Navigation className="h-3.5 w-3.5 text-neutral-800" />
                          <span>Unde se află laboratorul și cum ajungi:</span>
                        </div>
                        <Badge
                          variant="outline"
                          className="rounded-md bg-white border-neutral-200 text-neutral-800 text-[11px] font-semibold"
                        >
                          <MapPin className="h-3 w-3 mr-1 text-neutral-500" />
                          {floorText}
                        </Badge>
                      </div>

                      <div className="text-xs text-neutral-700 font-medium">
                        {meta.building} — <span className="font-bold text-neutral-900">{meta.wing}</span>
                      </div>

                      <p className="text-xs text-neutral-600 leading-relaxed bg-white rounded-lg p-2.5 border border-neutral-200/60">
                        {meta.directions}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                        <div className="flex items-center gap-1.5 text-neutral-600">
                          <Clock className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                          <span className="truncate">{meta.schedule}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-neutral-600">
                          <UserCheck className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                          <span className="truncate" title={meta.coordinatorEmail}>
                            {meta.coordinator}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-neutral-600">
                          <Users className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                          <span>Capacitate: {room.capacitate || 24} locuri</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800">
                          <Cpu className="h-3.5 w-3.5 text-neutral-600" />
                          <span>
                            Echipamente în {meta.shortCode} ({equipmentInRoom.length} resurse)
                          </span>
                        </div>
                        {equipmentInRoom.length > 4 && (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedRoomId(isExpanded ? null : room.id)
                            }
                            className="text-[11px] font-semibold text-neutral-600 hover:text-neutral-950"
                          >
                            {isExpanded
                              ? "Restrânge lista"
                              : `Vezi toate (${equipmentInRoom.length})`}
                          </button>
                        )}
                      </div>

                      {previewEquipment.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {previewEquipment.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => navigate(`/resources/${item.id}`)}
                              className="group flex items-center justify-between gap-2 rounded-xl border border-neutral-200/80 bg-white hover:border-neutral-900 p-2 cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="h-8 w-8 rounded-lg object-cover bg-neutral-100 shrink-0"
                                />
                                <div className="min-w-0">
                                  <div className="text-xs font-semibold text-neutral-900 truncate group-hover:underline">
                                    {item.name}
                                  </div>
                                  <div className="text-[10px] text-neutral-400 font-mono">
                                    {item.code}
                                  </div>
                                </div>
                              </div>
                              <ChevronRight className="h-3.5 w-3.5 text-neutral-400 group-hover:text-neutral-900 shrink-0" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-neutral-400 italic">
                          {room.descriere || "Sală dotată cu stații de lucru și infrastructură de cercetare."}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-neutral-500">
                      {meta.accessNote}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/resources")}
                      className="h-8 px-3 rounded-xl border-neutral-200 text-xs font-semibold text-neutral-900 hover:bg-neutral-50 shrink-0 gap-1"
                    >
                      <Layers className="h-3.5 w-3.5" />
                      Rezervă echipament din sală
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-neutral-900" />
                <h2 className="text-base font-bold text-neutral-900">
                  {editingRoom ? "Editează laborator sau sală" : "Adaugă laborator sau sală"}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
                  {formError}
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="departament_id" className="text-xs font-semibold text-neutral-700">
                  Departament
                </label>
                <select
                  id="departament_id"
                  required
                  value={formData.departament_id}
                  onChange={(e) => setFormData({ ...formData, departament_id: e.target.value })}
                  className="w-full h-9 rounded-md border border-neutral-200 bg-white px-3 text-sm"
                >
                  <option value="" disabled>
                    Selectează departamentul
                  </option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nume} ({d.cod})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="cod" className="text-xs font-semibold text-neutral-700">
                    Cod sală / indicativ
                  </label>
                  <Input
                    id="cod"
                    required
                    placeholder="UPT-AC-CTI-L1"
                    value={formData.cod}
                    onChange={(e) => setFormData({ ...formData, cod: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="etaj" className="text-xs font-semibold text-neutral-700">
                    Etaj (-1 subsol, 0 parter, 1, 2)
                  </label>
                  <Input
                    id="etaj"
                    type="number"
                    min={-2}
                    max={10}
                    placeholder="2"
                    value={formData.etaj}
                    onChange={(e) => setFormData({ ...formData, etaj: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="nume" className="text-xs font-semibold text-neutral-700">
                  Denumire laborator
                </label>
                <Input
                  id="nume"
                  required
                  placeholder="Laborator inteligență artificială (Lab 204)"
                  value={formData.nume}
                  onChange={(e) => setFormData({ ...formData, nume: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="capacitate" className="text-xs font-semibold text-neutral-700">
                  Capacitate (locuri de lucru)
                </label>
                <Input
                  id="capacitate"
                  type="number"
                  min={1}
                  placeholder="28"
                  value={formData.capacitate}
                  onChange={(e) => setFormData({ ...formData, capacitate: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="descriere" className="text-xs font-semibold text-neutral-700">
                  Detalii orientare și dotări principale
                </label>
                <Input
                  id="descriere"
                  placeholder="Indicații de acces și echipamente găzduite..."
                  value={formData.descriere}
                  onChange={(e) => setFormData({ ...formData, descriere: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Anulează
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Se salvează..." : "Salvează"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
