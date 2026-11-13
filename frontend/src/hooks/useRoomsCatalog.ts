import React, { useCallback, useEffect, useMemo, useState } from "react"
import { academicApi } from "../api/academic"
import { ALL_CATALOG_ITEMS } from "../data/catalogItems"
import {
  DEFAULT_FALLBACK_ROOMS,
  formatFloorLabel,
  resolveLabMetadata,
} from "../data/roomLocations"
import type { RoomFormState } from "../components/rooms/RoomFormModal"
import type { Department, Faculty, Room } from "../types"

const INITIAL_ROOM_FORM: RoomFormState = {
  departament_id: "",
  nume: "",
  cod: "",
  etaj: "1",
  capacitate: "24",
  descriere: "",
}

export function useRoomsCatalog(userId?: number) {
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
  const [formData, setFormData] = useState<RoomFormState>(INITIAL_ROOM_FORM)
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
    } catch {}
  }, [])

  const fetchRooms = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await academicApi.getRooms({
        limit: 100,
        departament_id: selectedDeptId ? Number(selectedDeptId) : undefined,
      })
      setRooms(res.items && res.items.length > 0 ? res.items : DEFAULT_FALLBACK_ROOMS)
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

  const enrichedRooms = useMemo(
    () =>
      rooms.map((room) => {
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
      }),
    [rooms, getDepartmentName, getFacultyCode]
  )

  const filteredRooms = useMemo(() => {
    const q = search.trim().toLowerCase()
    return enrichedRooms.filter(({ room, meta, floorText, equipmentInRoom, deptName }) => {
      if (selectedDeptId && room.departament_id !== Number(selectedDeptId)) return false
      if (selectedFloor !== "ALL" && floorText.toLowerCase() !== selectedFloor.toLowerCase()) {
        return false
      }
      if (selectedWing !== "ALL" && !meta.wing.toLowerCase().includes(selectedWing.toLowerCase())) {
        return false
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
      ...INITIAL_ROOM_FORM,
      departament_id: departments[0]?.id ? String(departments[0].id) : "1",
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
          responsabil_id: userId || 1,
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

  const resetFilters = () => {
    setSearch("")
    setSelectedFloor("ALL")
    setSelectedWing("ALL")
    setSelectedDeptId("")
  }

  return {
    roomsCount: rooms.length,
    departments,
    isLoading,
    search,
    setSearch,
    selectedDeptId,
    setSelectedDeptId,
    selectedFloor,
    setSelectedFloor,
    selectedWing,
    setSelectedWing,
    expandedRoomId,
    setExpandedRoomId,
    filteredRooms,
    isModalOpen,
    setIsModalOpen,
    editingRoom,
    formData,
    setFormData,
    formError,
    isSubmitting,
    openCreateModal,
    openEditModal,
    handleSubmit,
    resetFilters,
  }
}
