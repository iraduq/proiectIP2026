import { useState, useEffect, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { DoorOpen, Plus } from "lucide-react"
import { AppLayout } from "../components/layout/AppLayout"
import { academicApi } from "../api/academic"
import { useAuth } from "../context/AuthContext"
import { ALL_CATALOG_ITEMS } from "../data/catalogItems"
import {
  DEFAULT_FALLBACK_ROOMS,
  formatFloorLabel,
  resolveLabMetadata,
} from "../data/roomLocations"
import { RoomFilterBar } from "../components/rooms/RoomFilterBar"
import { RoomLocatorCard } from "../components/rooms/RoomLocatorCard"
import { RoomFormModal, type RoomFormState } from "../components/rooms/RoomFormModal"
import type { Room, Department, Faculty } from "../types"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Card } from "../components/ui/card"

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
  const [formData, setFormData] = useState<RoomFormState>({
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

  const getDepartmentName = useCallback(
    (room: Room) => {
      if (room.departament_nume) return room.departament_nume
      const dept = departments.find((d) => d.id === room.departament_id)
      if (dept) return dept.nume
      if (room.departament_id === 1) return "Departamentul Calculatoare și Tehnologia Informației"
      if (room.departament_id === 2) return "Departamentul Automatică și Informatică Aplicată"
      if (room.departament_id === 3) return "Departamentul Electronică Aplicată"
      if (room.departament_id === 4) return "Departamentul Comunicații"
      return "Departament Universitar"
    },
    [departments]
  )

  const getFacultyCode = useCallback(
    (room: Room) => {
      const dept = departments.find((d) => d.id === room.departament_id)
      if (dept) {
        const fac = faculties.find((f) => f.id === dept.facultate_id)
        if (fac) return fac.cod
      }
      return room.departament_id <= 2 ? "AC" : "ETcTI"
    },
    [departments, faculties]
  )

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
  }, [rooms, getDepartmentName, getFacultyCode])

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

        <RoomFilterBar
          search={search}
          onSearchChange={setSearch}
          selectedWing={selectedWing}
          onWingChange={setSelectedWing}
          selectedDeptId={selectedDeptId}
          onDeptChange={setSelectedDeptId}
          selectedFloor={selectedFloor}
          onFloorChange={setSelectedFloor}
          departments={departments}
          filteredCount={filteredRooms.length}
        />

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
            {filteredRooms.map(({ room, meta, floorText, equipmentInRoom, deptName, facCode }) => (
              <RoomLocatorCard
                key={room.id}
                room={room}
                meta={meta}
                floorText={floorText}
                equipmentInRoom={equipmentInRoom}
                deptName={deptName}
                facCode={facCode}
                canEdit={canEdit}
                isExpanded={expandedRoomId === room.id}
                onToggleExpand={(id) => setExpandedRoomId(expandedRoomId === id ? null : id)}
                onEdit={openEditModal}
                onSelectEquipment={(resId) => navigate(`/resources/${resId}`)}
                onBrowseResources={() => navigate("/resources")}
              />
            ))}
          </div>
        )}
      </div>

      <RoomFormModal
        isOpen={isModalOpen}
        editingRoom={editingRoom}
        formData={formData}
        formError={formError}
        isSubmitting={isSubmitting}
        departments={departments}
        onClose={() => setIsModalOpen(false)}
        onChange={setFormData}
        onSubmit={handleSubmit}
      />
    </AppLayout>
  )
}
