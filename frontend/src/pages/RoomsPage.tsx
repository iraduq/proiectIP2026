import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { academicApi } from "../api/academic"
import { useAuth } from "../context/AuthContext"
import { AppLayout } from "../components/layout/AppLayout"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Input } from "../components/ui/input"
import type { Department, Faculty, Institution, Room, TipSala } from "../types"
import {
  Search,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  Power,
  Trash2,
  X,
  AlertCircle,
  Filter,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react"

export function RoomsPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [rooms, setRooms] = useState<Room[]>([])
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [departments, setDepartments] = useState<Department[]>([])

  const [total, setTotal] = useState(0)
  const [skip, setSkip] = useState(0)
  const [limit] = useState(15)
  const [isLoading, setIsLoading] = useState(true)

  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<number | undefined>(undefined)
  const [selectedFacultyId, setSelectedFacultyId] = useState<number | undefined>(undefined)
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | undefined>(undefined)
  const [tipSala, setTipSala] = useState<string>("")
  const [minCapacitate, setMinCapacitate] = useState<string>("")
  const [maxCapacitate, setMaxCapacitate] = useState<string>("")
  const [etaj, setEtaj] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [sortBy, setSortBy] = useState<string>("cod")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false)

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [modalError, setModalError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formDepartamentId, setFormDepartamentId] = useState<number>(0)
  const [formCod, setFormCod] = useState("")
  const [formNume, setFormNume] = useState("")
  const [formTip, setFormTip] = useState<TipSala>("LABORATOR")
  const [formEtaj, setFormEtaj] = useState(1)
  const [formCapacitate, setFormCapacitate] = useState(24)
  const [formDescriere, setFormDescriere] = useState("")
  const [formResponsabilId, setFormResponsabilId] = useState<number>(0)

  const isAdmin = user?.rol === "ADMINISTRATOR" || user?.permissions?.includes("structure:manage")
  const isStudent = user?.rol === "STUDENT"

  useEffect(() => {
    const q = searchParams.get("search")
    if (q !== null && q !== search) {
      setSearch(q)
      setSkip(0)
    }
  }, [searchParams])

  useEffect(() => {
    const loadHierarchy = async () => {
      try {
        const [instRes, facRes, deptRes] = await Promise.all([
          academicApi.getInstitutions({ limit: 100 }),
          academicApi.getFaculties({ limit: 100 }),
          academicApi.getDepartments({ limit: 100 }),
        ])
        setInstitutions(instRes.items)
        setFaculties(facRes.items)
        setDepartments(deptRes.items)
        if (deptRes.items.length > 0 && formDepartamentId === 0) {
          setFormDepartamentId(deptRes.items[0].id)
        }
      } catch {}
    }
    loadHierarchy()
  }, [])

  const availableFaculties = selectedInstitutionId
    ? faculties.filter((f) => f.institutie_id === selectedInstitutionId)
    : faculties

  const availableDepartments = selectedFacultyId
    ? departments.filter((d) => d.facultate_id === selectedFacultyId)
    : selectedInstitutionId
    ? departments.filter((d) => d.institutie_id === selectedInstitutionId)
    : departments

  const loadRooms = async () => {
    setIsLoading(true)
    try {
      const activeParam =
        statusFilter === "active" ? true : statusFilter === "inactive" ? false : undefined

      const data = await academicApi.getRooms({
        skip,
        limit,
        search: search.trim() || undefined,
        institutie_id: selectedInstitutionId,
        facultate_id: selectedFacultyId,
        departament_id: selectedDepartmentId,
        tip_sala: tipSala || undefined,
        is_active: activeParam,
        min_capacitate: minCapacitate ? Number(minCapacitate) : undefined,
        max_capacitate: maxCapacitate ? Number(maxCapacitate) : undefined,
        etaj: etaj !== "" ? Number(etaj) : undefined,
        sort_by: sortBy || undefined,
        sort_order: sortOrder,
      })
      setRooms(data.items)
      setTotal(data.total)
    } catch {
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadRooms()
  }, [
    skip,
    selectedInstitutionId,
    selectedFacultyId,
    selectedDepartmentId,
    tipSala,
    statusFilter,
    etaj,
    sortBy,
    sortOrder,
  ])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSkip(0)
    loadRooms()
  }

  const handleResetFilters = () => {
    setSearch("")
    setSearchParams({})
    setSelectedInstitutionId(undefined)
    setSelectedFacultyId(undefined)
    setSelectedDepartmentId(undefined)
    setTipSala("")
    setMinCapacitate("")
    setMaxCapacitate("")
    setEtaj("")
    setStatusFilter("")
    setSortBy("cod")
    setSortOrder("asc")
    setSkip(0)
  }

  const hasActiveFilters =
    Boolean(search) ||
    selectedInstitutionId !== undefined ||
    selectedFacultyId !== undefined ||
    selectedDepartmentId !== undefined ||
    Boolean(tipSala) ||
    Boolean(minCapacitate) ||
    Boolean(maxCapacitate) ||
    etaj !== "" ||
    Boolean(statusFilter) ||
    sortBy !== "cod" ||
    sortOrder !== "asc"

  const openAddModal = () => {
    setModalError(null)
    setFormCod("")
    setFormNume("")
    setFormTip("LABORATOR")
    setFormEtaj(1)
    setFormCapacitate(24)
    setFormDescriere("")
    setFormResponsabilId(user?.id_utilizator || 1)
    if (departments.length > 0) {
      setFormDepartamentId(departments[0].id)
    }
    setIsAddModalOpen(true)
  }

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalError(null)
    setIsSubmitting(true)
    try {
      await academicApi.createRoom({
        departament_id: Number(formDepartamentId),
        cod: formCod.trim().toUpperCase(),
        nume: formNume.trim(),
        tip_sala: formTip,
        etaj: Number(formEtaj),
        capacitate: Number(formCapacitate),
        descriere: formDescriere.trim() || null,
        responsabil_id: Number(formResponsabilId),
      })
      setIsAddModalOpen(false)
      loadRooms()
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Eroare la crearea sălii. Verifică datele introduse."
      setModalError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditModal = (room: Room) => {
    setEditingRoom(room)
    setModalError(null)
    setFormCod(room.cod)
    setFormNume(room.nume)
    setFormTip(room.tip_sala)
    setFormEtaj(room.etaj)
    setFormCapacitate(room.capacitate)
    setFormDescriere(room.descriere || "")
    setIsEditModalOpen(true)
  }

  const handleUpdateRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRoom) return
    setModalError(null)
    setIsSubmitting(true)
    try {
      const payload = isAdmin
        ? {
            nume: formNume.trim(),
            cod: formCod.trim().toUpperCase(),
            tip_sala: formTip,
            etaj: Number(formEtaj),
            capacitate: Number(formCapacitate),
            descriere: formDescriere.trim() || null,
          }
        : {
            capacitate: Number(formCapacitate),
            descriere: formDescriere.trim() || null,
          }
      await academicApi.updateRoom(editingRoom.id, payload)
      setIsEditModalOpen(false)
      loadRooms()
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Eroare la modificarea sălii."
      setModalError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleActive = async (room: Room) => {
    try {
      if (room.is_active) {
        await academicApi.deactivateRoom(room.id)
      } else {
        await academicApi.activateRoom(room.id)
      }
      loadRooms()
    } catch (err: any) {
      alert(err.response?.data?.detail || "Eroare la schimbarea stării sălii.")
    }
  }

  const handleDeleteRoom = async (room: Room) => {
    if (!confirm(`Ești sigur că vrei să ștergi sala ${room.cod}?`)) return
    try {
      await academicApi.deleteRoom(room.id)
      loadRooms()
    } catch (err: any) {
      alert(err.response?.data?.detail || "Eroare la ștergerea sălii.")
    }
  }

  const totalPages = Math.ceil(total / limit)
  const currentPage = Math.floor(skip / limit) + 1

  return (
    <AppLayout breadcrumbs={["Spațiu de lucru", "Săli de cercetare"]}>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Săli de cercetare & Laboratoare</h1>
            <p className="text-xs text-neutral-500 mt-1">
              {isStudent
                ? `Spații și laboratoare din cadrul ${user?.facultate_nume || "facultății tale"}`
                : isAdmin
                ? "Administrează, adaugă, modifică și filtrează avansat sălile din sistem"
                : "Consultă detaliile și disponibilitatea spațiilor"}{" "}
              ({total} săli găsite)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAdvancedFiltersOpen(!isAdvancedFiltersOpen)}
              className={`h-9 text-xs flex items-center gap-1.5 ${
                isAdvancedFiltersOpen ? "bg-neutral-100 border-neutral-400" : ""
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Filtre Avansate</span>
              {hasActiveFilters && (
                <span className="h-2 w-2 rounded-full bg-indigo-600"></span>
              )}
            </Button>

            {isAdmin && (
              <Button
                onClick={openAddModal}
                className="h-9 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Adaugă Sală</span>
              </Button>
            )}
          </div>
        </div>

        <Card className="rounded-2xl border-neutral-200 shadow-sm p-4 bg-white space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
              <Input
                type="text"
                placeholder="Caută după cod (ex: SALA-101) sau nume..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9 text-xs bg-neutral-50 border-neutral-200"
              />
            </div>

            <select
              value={tipSala}
              onChange={(e) => {
                setTipSala(e.target.value)
                setSkip(0)
              }}
              className="h-9 rounded-md border border-neutral-200 bg-neutral-50 px-2.5 text-xs text-neutral-800 focus:outline-none"
            >
              <option value="">Toate tipurile</option>
              <option value="LABORATOR">Laborator</option>
              <option value="SALA_CERCETARE">Sală Cercetare</option>
              <option value="ATELIER">Atelier</option>
              <option value="SALA_SERVERE">Sală Servere</option>
              <option value="DEPOZIT">Depozit</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setSkip(0)
              }}
              className="h-9 rounded-md border border-neutral-200 bg-neutral-50 px-2.5 text-xs text-neutral-800 focus:outline-none"
            >
              <option value="">Toate stările</option>
              <option value="active">Doar active</option>
              <option value="inactive">Doar inactive</option>
            </select>

            <Button type="submit" size="sm" className="h-9 text-xs bg-neutral-900 hover:bg-black font-semibold">
              Caută
            </Button>

            {hasActiveFilters && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="h-9 text-xs text-neutral-600 hover:text-neutral-900 flex items-center gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Resetează</span>
              </Button>
            )}
          </form>

          {isAdvancedFiltersOpen && (
            <div className="pt-3 border-t border-neutral-100 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              {!isStudent && (
                <>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-neutral-500">Instituție</label>
                    <select
                      value={selectedInstitutionId || ""}
                      onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : undefined
                        setSelectedInstitutionId(val)
                        setSelectedFacultyId(undefined)
                        setSelectedDepartmentId(undefined)
                        setSkip(0)
                      }}
                      className="w-full h-8 rounded-md border border-neutral-200 bg-neutral-50 px-2 text-xs"
                    >
                      <option value="">Toate instituțiile</option>
                      {institutions.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.nume} ({i.cod})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-neutral-500">Facultate</label>
                    <select
                      value={selectedFacultyId || ""}
                      onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : undefined
                        setSelectedFacultyId(val)
                        setSelectedDepartmentId(undefined)
                        setSkip(0)
                      }}
                      className="w-full h-8 rounded-md border border-neutral-200 bg-neutral-50 px-2 text-xs"
                    >
                      <option value="">Toate facultățile</option>
                      {availableFaculties.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.nume} ({f.cod})
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-neutral-500">Departament</label>
                <select
                  value={selectedDepartmentId || ""}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : undefined
                    setSelectedDepartmentId(val)
                    setSkip(0)
                  }}
                  className="w-full h-8 rounded-md border border-neutral-200 bg-neutral-50 px-2 text-xs"
                >
                  <option value="">Toate departamentele</option>
                  {availableDepartments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nume} ({d.cod})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-neutral-500">Etaj</label>
                <select
                  value={etaj}
                  onChange={(e) => {
                    setEtaj(e.target.value)
                    setSkip(0)
                  }}
                  className="w-full h-8 rounded-md border border-neutral-200 bg-neutral-50 px-2 text-xs"
                >
                  <option value="">Toate etajele</option>
                  <option value="-1">Subsol (-1)</option>
                  <option value="0">Parter (0)</option>
                  <option value="1">Etaj 1</option>
                  <option value="2">Etaj 2</option>
                  <option value="3">Etaj 3</option>
                  <option value="4">Etaj 4</option>
                  <option value="5">Etaj 5</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-neutral-500">Capacitate Min</label>
                <Input
                  type="number"
                  min="1"
                  max="200"
                  placeholder="Minim"
                  value={minCapacitate}
                  onChange={(e) => {
                    setMinCapacitate(e.target.value)
                    setSkip(0)
                  }}
                  className="h-8 text-xs bg-neutral-50 border-neutral-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-neutral-500">Capacitate Max</label>
                <Input
                  type="number"
                  min="1"
                  max="200"
                  placeholder="Maxim"
                  value={maxCapacitate}
                  onChange={(e) => {
                    setMaxCapacitate(e.target.value)
                    setSkip(0)
                  }}
                  className="h-8 text-xs bg-neutral-50 border-neutral-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-neutral-500">Sortează după</label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value)
                    setSkip(0)
                  }}
                  className="w-full h-8 rounded-md border border-neutral-200 bg-neutral-50 px-2 text-xs"
                >
                  <option value="cod">Cod Sală</option>
                  <option value="nume">Nume Sală</option>
                  <option value="capacitate">Capacitate</option>
                  <option value="etaj">Etaj</option>
                  <option value="created_at">Data Adăugării</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-neutral-500">Direcție sortare</label>
                <select
                  value={sortOrder}
                  onChange={(e) => {
                    setSortOrder(e.target.value as "asc" | "desc")
                    setSkip(0)
                  }}
                  className="w-full h-8 rounded-md border border-neutral-200 bg-neutral-50 px-2 text-xs"
                >
                  <option value="asc">Crescător (A-Z / 1-9)</option>
                  <option value="desc">Descrescător (Z-A / 9-1)</option>
                </select>
              </div>
            </div>
          )}

          {hasActiveFilters && (
            <div className="pt-2 flex flex-wrap items-center gap-1.5 text-xs text-neutral-500">
              <span className="text-[11px] font-medium mr-1">Filtre active:</span>
              {search && (
                <Badge variant="outline" className="bg-neutral-50 flex items-center gap-1 text-[11px]">
                  <span>Căutare: {search}</span>
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSearch("")} />
                </Badge>
              )}
              {selectedInstitutionId && (
                <Badge variant="outline" className="bg-neutral-50 flex items-center gap-1 text-[11px]">
                  <span>
                    Instituție: {institutions.find((i) => i.id === selectedInstitutionId)?.cod}
                  </span>
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSelectedInstitutionId(undefined)}
                  />
                </Badge>
              )}
              {selectedFacultyId && (
                <Badge variant="outline" className="bg-neutral-50 flex items-center gap-1 text-[11px]">
                  <span>
                    Facultate: {faculties.find((f) => f.id === selectedFacultyId)?.cod}
                  </span>
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedFacultyId(undefined)} />
                </Badge>
              )}
              {selectedDepartmentId && (
                <Badge variant="outline" className="bg-neutral-50 flex items-center gap-1 text-[11px]">
                  <span>
                    Departament: {departments.find((d) => d.id === selectedDepartmentId)?.cod}
                  </span>
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSelectedDepartmentId(undefined)}
                  />
                </Badge>
              )}
              {tipSala && (
                <Badge variant="outline" className="bg-neutral-50 flex items-center gap-1 text-[11px]">
                  <span>Tip: {tipSala}</span>
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setTipSala("")} />
                </Badge>
              )}
              {statusFilter && (
                <Badge variant="outline" className="bg-neutral-50 flex items-center gap-1 text-[11px]">
                  <span>Stare: {statusFilter}</span>
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setStatusFilter("")} />
                </Badge>
              )}
              {etaj !== "" && (
                <Badge variant="outline" className="bg-neutral-50 flex items-center gap-1 text-[11px]">
                  <span>Etaj: {etaj}</span>
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setEtaj("")} />
                </Badge>
              )}
              {(minCapacitate || maxCapacitate) && (
                <Badge variant="outline" className="bg-neutral-50 flex items-center gap-1 text-[11px]">
                  <span>
                    Capacitate: {minCapacitate || "1"} - {maxCapacitate || "200"}
                  </span>
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => {
                      setMinCapacitate("")
                      setMaxCapacitate("")
                    }}
                  />
                </Badge>
              )}
            </div>
          )}
        </Card>

        <Card className="rounded-2xl border-neutral-200 shadow-sm overflow-hidden">
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-100">
                <tr>
                  <th className="py-3 px-5">Cod Sală</th>
                  <th className="py-3 px-5">Denumire</th>
                  <th className="py-3 px-5">Tip Sală</th>
                  <th className="py-3 px-5">Departament</th>
                  <th className="py-3 px-5">Etaj</th>
                  <th className="py-3 px-5">Capacitate</th>
                  <th className="py-3 px-5">Responsabil</th>
                  <th className="py-3 px-5">Stare</th>
                  {(isAdmin || user?.rol === "RESPONSABIL_LABORATOR" || user?.rol === "PROFESOR") && (
                    <th className="py-3 px-5 text-right">Acțiuni</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-neutral-400">
                      Se încarcă lista de săli conform criteriilor selectate...
                    </td>
                  </tr>
                ) : rooms.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-neutral-400">
                      Nu a fost găsită nicio sală conform filtrelor aplicate.
                    </td>
                  </tr>
                ) : (
                  rooms.map((room) => {
                    const canEdit = isAdmin || room.responsabil?.id_utilizator === user?.id_utilizator
                    return (
                      <tr key={room.id} className="hover:bg-neutral-50/60 transition-colors">
                        <td className="py-3 px-5 font-mono font-bold text-neutral-900">{room.cod}</td>
                        <td className="py-3 px-5 font-medium text-neutral-800">{room.nume}</td>
                        <td className="py-3 px-5">
                          <Badge variant="outline" className="text-[10px] font-semibold">
                            {room.tip_sala}
                          </Badge>
                        </td>
                        <td className="py-3 px-5 text-neutral-500 max-w-[150px] truncate">{room.departament_nume}</td>
                        <td className="py-3 px-5 text-neutral-600">{room.etaj === 0 ? "Parter" : `Etaj ${room.etaj}`}</td>
                        <td className="py-3 px-5 text-neutral-600 font-medium">{room.capacitate} locuri</td>
                        <td className="py-3 px-5 text-neutral-700">
                          <div className="flex items-center gap-1.5">
                            <UserCheck className="h-3.5 w-3.5 text-neutral-400" />
                            <span>{room.responsabil?.nume || "Neatribuit"}</span>
                          </div>
                        </td>
                        <td className="py-3 px-5">
                          <Badge variant={room.is_active ? "success" : "secondary"}>
                            {room.is_active ? "Activă" : "Inactivă"}
                          </Badge>
                        </td>
                        {(isAdmin || canEdit) && (
                          <td className="py-3 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {canEdit && (
                                <button
                                  onClick={() => openEditModal(room)}
                                  className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded"
                                  title="Editează sală"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                              )}
                              {isAdmin && (
                                <>
                                  <button
                                    onClick={() => handleToggleActive(room)}
                                    className={`p-1.5 rounded ${
                                      room.is_active
                                        ? "text-amber-600 hover:bg-amber-50"
                                        : "text-emerald-600 hover:bg-emerald-50"
                                    }`}
                                    title={room.is_active ? "Dezactivează sala" : "Activează sala"}
                                  >
                                    <Power className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteRoom(room)}
                                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                                    title="Șterge sală"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <div>
              Afișate {rooms.length} din {total} săli (Pagina {currentPage} din {totalPages || 1})
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={skip === 0}
                onClick={() => setSkip(Math.max(0, skip - limit))}
                className="h-8 text-xs flex items-center gap-1"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Anterior</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={skip + limit >= total}
                onClick={() => setSkip(skip + limit)}
                className="h-8 text-xs flex items-center gap-1"
              >
                <span>Următor</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-base font-bold text-neutral-900">Adaugă Sală Nouă</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateRoom} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Departament afiliat</label>
                <select
                  value={formDepartamentId}
                  onChange={(e) => setFormDepartamentId(Number(e.target.value))}
                  className="w-full h-9 rounded-lg border border-neutral-200 px-3 bg-neutral-50 text-xs"
                  required
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nume} ({d.cod}) - {d.facultate_nume}
                    </option>
                  ))}
                </select>
              </div>

              {!isAdmin && (
                <div className="p-3 rounded-xl bg-neutral-100 border border-neutral-200 text-xs text-neutral-700">
                  În calitate de responsabil de sală, puteți actualiza capacitatea și descrierea conform regulamentului. Modificarea codului, numelui sau etajului este rezervată administratorilor.
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Cod Sală</label>
                  <Input
                    type="text"
                    placeholder="ex: LAB-201"
                    value={formCod}
                    onChange={(e) => setFormCod(e.target.value)}
                    required
                    disabled={!isAdmin}
                    className="h-9 text-xs disabled:opacity-60 disabled:bg-neutral-100"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Denumire Sală</label>
                  <Input
                    type="text"
                    placeholder="ex: Laborator Rețele"
                    value={formNume}
                    onChange={(e) => setFormNume(e.target.value)}
                    required
                    disabled={!isAdmin}
                    className="h-9 text-xs disabled:opacity-60 disabled:bg-neutral-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Tip Sală</label>
                  <select
                    value={formTip}
                    onChange={(e) => setFormTip(e.target.value as TipSala)}
                    disabled={!isAdmin}
                    className="w-full h-9 rounded-lg border border-neutral-200 px-2 bg-neutral-50 text-xs disabled:opacity-60 disabled:bg-neutral-100"
                  >
                    <option value="LABORATOR">Laborator</option>
                    <option value="SALA_CERCETARE">Sală Cercetare</option>
                    <option value="ATELIER">Atelier</option>
                    <option value="SALA_SERVERE">Sală Servere</option>
                    <option value="DEPOZIT">Depozit</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Etaj</label>
                  <Input
                    type="number"
                    min="-3"
                    max="30"
                    value={formEtaj}
                    onChange={(e) => setFormEtaj(Number(e.target.value))}
                    required
                    disabled={!isAdmin}
                    className="h-9 text-xs disabled:opacity-60 disabled:bg-neutral-100"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Capacitate</label>
                  <Input
                    type="number"
                    min="1"
                    max="200"
                    value={formCapacitate}
                    onChange={(e) => setFormCapacitate(Number(e.target.value))}
                    required
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">ID Responsabil (Personal/Profesor)</label>
                <Input
                  type="number"
                  min="1"
                  value={formResponsabilId}
                  onChange={(e) => setFormResponsabilId(Number(e.target.value))}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Descriere (opțional)</label>
                <textarea
                  value={formDescriere}
                  onChange={(e) => setFormDescriere(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-neutral-200 p-2 text-xs bg-neutral-50 focus:bg-white focus:outline-none"
                  placeholder="Detalii suplimentare despre echipamente sau destinație..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Anulează
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {isSubmitting ? "Se salvează..." : "Salvează Sala"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && editingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-base font-bold text-neutral-900">
                Editează Sala <span className="font-mono text-indigo-600">{editingRoom.cod}</span>
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateRoom} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Cod Sală</label>
                  <Input
                    type="text"
                    value={formCod}
                    onChange={(e) => setFormCod(e.target.value)}
                    required
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Denumire Sală</label>
                  <Input
                    type="text"
                    value={formNume}
                    onChange={(e) => setFormNume(e.target.value)}
                    required
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Tip Sală</label>
                  <select
                    value={formTip}
                    onChange={(e) => setFormTip(e.target.value as TipSala)}
                    className="w-full h-9 rounded-lg border border-neutral-200 px-2 bg-neutral-50 text-xs"
                  >
                    <option value="LABORATOR">Laborator</option>
                    <option value="SALA_CERCETARE">Sală Cercetare</option>
                    <option value="ATELIER">Atelier</option>
                    <option value="SALA_SERVERE">Sală Servere</option>
                    <option value="DEPOZIT">Depozit</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Etaj</label>
                  <Input
                    type="number"
                    min="-3"
                    max="30"
                    value={formEtaj}
                    onChange={(e) => setFormEtaj(Number(e.target.value))}
                    required
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Capacitate</label>
                  <Input
                    type="number"
                    min="1"
                    max="200"
                    value={formCapacitate}
                    onChange={(e) => setFormCapacitate(Number(e.target.value))}
                    required
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Descriere</label>
                <textarea
                  value={formDescriere}
                  onChange={(e) => setFormDescriere(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-neutral-200 p-2 text-xs bg-neutral-50 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Anulează
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-neutral-900 hover:bg-black text-white"
                >
                  {isSubmitting ? "Se actualizează..." : "Actualizează Sala"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
