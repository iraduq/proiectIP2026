import { useState, useEffect } from "react"
import { AppLayout } from "../components/layout/AppLayout"
import { useAuth } from "../context/AuthContext"
import { resourcesApi } from "../api/resources"
import { categoriesApi } from "../api/categories"
import { academicApi } from "../api/academic"
import { reservationsApi } from "../api/reservations"
import { technicalHistoryApi } from "../api/technicalHistory"
import type { Category, Resource, Room, StareTehnica, TechnicalHistory } from "../types"
import {
  Cpu,
  Search,
  Filter,
  Plus,
  Calendar,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Building,
  DoorOpen,
  Tag,
  Trash2,
  Edit2,
  RefreshCw,
  Info,
  Layers,
  X,
  FileText,
} from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"

export function ResourcesPage() {
  const { user } = useAuth()

  const [resources, setResources] = useState<Resource[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<number | "ALL">("ALL")
  const [selectedStatus, setSelectedStatus] = useState<StareTehnica | "ALL">("ALL")
  const [selectedRoom, setSelectedRoom] = useState<number | "ALL">("ALL")

  // Modals
  const [reserveModalResource, setReserveModalResource] = useState<Resource | null>(null)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [purpose, setPurpose] = useState("")
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)

  // Technical history modal
  const [historyModalResource, setHistoryModalResource] = useState<Resource | null>(null)
  const [techHistory, setTechHistory] = useState<TechnicalHistory[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [newLogType, setNewLogType] = useState("MENTENANTA_PREVENTIVA")
  const [newLogDesc, setNewLogDesc] = useState("")
  const [newLogState, setNewLogState] = useState<StareTehnica>("DISPONIBILA")
  const [isSubmittingLog, setIsSubmittingLog] = useState(false)

  // Admin Create/Edit Modal
  const [editResource, setEditResource] = useState<Resource | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    nume: "",
    cod_inventar: "",
    categorie_id: 0,
    sala_id: 0,
    descriere: "",
    specificatii: "",
    stare_tehnica: "DISPONIBILA" as StareTehnica,
  })
  const [isSubmittingResource, setIsSubmittingResource] = useState(false)

  // Category modal
  const [isCatModalOpen, setIsCatModalOpen] = useState(false)
  const [newCatName, setNewCatName] = useState("")
  const [newCatDesc, setNewCatDesc] = useState("")
  const [isSubmittingCat, setIsSubmittingCat] = useState(false)

  const isAdmin = user?.rol === "ADMINISTRATOR"
  const canManageResource =
    isAdmin ||
    user?.rol === "RESPONSABIL_LABORATOR" ||
    Boolean(user?.permissions?.includes("resources:update"))
  const canManageTechnicalHistory =
    isAdmin ||
    user?.rol === "RESPONSABIL_LABORATOR" ||
    Boolean(user?.permissions?.includes("technical_history:create"))

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    loadResources()
  }, [search, selectedCategory, selectedStatus, selectedRoom])

  const loadInitialData = async () => {
    try {
      const [catsRes, roomsRes] = await Promise.all([
        categoriesApi.getCategories({ limit: 100 }),
        academicApi.getRooms({ limit: 100 }),
      ])
      setCategories(catsRes.items)
      setRooms(roomsRes.items)
    } catch (err: any) {
      console.error(err)
    }
  }

  const loadResources = async () => {
    setIsLoading(true)
    setErrorMsg(null)
    try {
      const params: any = { limit: 100 }
      if (search.trim()) params.search = search.trim()
      if (selectedCategory !== "ALL") params.categorie_id = selectedCategory
      if (selectedStatus !== "ALL") params.stare_tehnica = selectedStatus
      if (selectedRoom !== "ALL") params.sala_id = selectedRoom

      const res = await resourcesApi.getResources(params)
      setResources(res.items)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Eroare la încărcarea resurselor.")
    } finally {
      setIsLoading(false)
    }
  }

  // Counts
  const totalCount = resources.length
  const availableCount = resources.filter((r) => r.stare_tehnica === "DISPONIBILA").length
  const maintenanceCount = resources.filter((r) => r.stare_tehnica === "IN_MENTENANTA").length
  const defectiveCount = resources.filter((r) => r.stare_tehnica === "DEFECTA").length

  // Reservation handling
  const handleOpenReserve = (resource: Resource) => {
    setReserveModalResource(resource)
    setBookingError(null)
    // Default to tomorrow 09:00 - 13:00
    const now = new Date()
    now.setDate(now.getDate() + 1)
    now.setHours(9, 0, 0, 0)
    const end = new Date(now)
    end.setHours(13, 0, 0, 0)
    setStartDate(now.toISOString().slice(0, 16))
    setEndDate(end.toISOString().slice(0, 16))
    setPurpose("")
  }

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reserveModalResource) return
    setIsSubmittingBooking(true)
    setBookingError(null)

    try {
      await reservationsApi.createReservation({
        resursa_id: reserveModalResource.id,
        data_inceput: new Date(startDate).toISOString(),
        data_sfarsit: new Date(endDate).toISOString(),
        scop: purpose,
      })
      setSuccessMsg(`Rezervarea pentru „${reserveModalResource.nume}” a fost trimisă cu succes!`)
      setReserveModalResource(null)
      loadResources()
    } catch (err: any) {
      setBookingError(err.response?.data?.detail || "Eroare la crearea rezervării.")
    } finally {
      setIsSubmittingBooking(false)
    }
  }

  // Technical History handling
  const handleOpenHistory = async (resource: Resource) => {
    setHistoryModalResource(resource)
    setNewLogState(resource.stare_tehnica)
    setNewLogDesc("")
    setNewLogType("MENTENANTA_PREVENTIVA")
    setIsLoadingHistory(true)
    try {
      const res = await technicalHistoryApi.getTechnicalHistory({
        resursa_id: resource.id,
        limit: 50,
      })
      setTechHistory(res.items)
    } catch (err: any) {
      console.error(err)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const handleAddTechnicalLog = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!historyModalResource || !canManageTechnicalHistory) return
    setIsSubmittingLog(true)
    try {
      await technicalHistoryApi.createTechnicalHistory({
        resursa_id: historyModalResource.id,
        tip_interventie: newLogType,
        descriere: newLogDesc,
        stare_noua: newLogState,
      })
      setSuccessMsg(`Intervenția tehnică pentru „${historyModalResource.nume}” a fost salvată.`)
      const res = await technicalHistoryApi.getTechnicalHistory({
        resursa_id: historyModalResource.id,
        limit: 50,
      })
      setTechHistory(res.items)
      setNewLogDesc("")
      loadResources()
    } catch (err: any) {
      alert(err.response?.data?.detail || "Eroare la salvarea intervenției.")
    } finally {
      setIsSubmittingLog(false)
    }
  }

  // Admin CRUD
  const handleOpenCreate = () => {
    setEditResource(null)
    setFormData({
      nume: "",
      cod_inventar: "",
      categorie_id: categories[0]?.id || 0,
      sala_id: rooms[0]?.id || 0,
      descriere: "",
      specificatii: "",
      stare_tehnica: "DISPONIBILA",
    })
    setIsCreateModalOpen(true)
  }

  const handleOpenEdit = (res: Resource) => {
    setEditResource(res)
    setFormData({
      nume: res.nume,
      cod_inventar: res.cod_inventar,
      categorie_id: res.categorie_id,
      sala_id: res.sala_id,
      descriere: res.descriere || "",
      specificatii: res.specificatii || "",
      stare_tehnica: res.stare_tehnica,
    })
    setIsCreateModalOpen(true)
  }

  const handleSubmitResource = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingResource(false)
    try {
      if (editResource) {
        const payload = isAdmin
          ? formData
          : {
              stare_tehnica: formData.stare_tehnica,
              specificatii: formData.specificatii,
              descriere: formData.descriere,
            }
        await resourcesApi.updateResource(editResource.id, payload)
        setSuccessMsg("Resursa a fost actualizată cu succes.")
      } else {
        await resourcesApi.createResource(formData)
        setSuccessMsg("Resursa a fost creată cu succes.")
      }
      setIsCreateModalOpen(false)
      loadResources()
    } catch (err: any) {
      alert(err.response?.data?.detail || "Eroare la salvarea resursei.")
    } finally {
      setIsSubmittingResource(false)
    }
  }

  const handleDeleteResource = async (res: Resource) => {
    if (!confirm(`Sigur doriți să dezactivați resursa „${res.nume}”?`)) return
    try {
      await resourcesApi.deleteResource(res.id)
      setSuccessMsg(`Resursa „${res.nume}” a fost dezactivată.`)
      loadResources()
    } catch (err: any) {
      alert(err.response?.data?.detail || "Eroare la dezactivarea resursei.")
    }
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName.trim()) return
    setIsSubmittingCat(true)
    try {
      await categoriesApi.createCategory({
        nume: newCatName.trim(),
        descriere: newCatDesc.trim() || undefined,
      })
      setSuccessMsg(`Categoria „${newCatName}” a fost creată cu succes.`)
      setNewCatName("")
      setNewCatDesc("")
      const catsRes = await categoriesApi.getCategories({ limit: 100 })
      setCategories(catsRes.items)
    } catch (err: any) {
      alert(err.response?.data?.detail || "Eroare la crearea categoriei.")
    } finally {
      setIsSubmittingCat(false)
    }
  }

  const handleDeleteCategory = async (cat: Category) => {
    if (!confirm(`Sigur doriți să ștergeți sau dezactivați categoria „${cat.nume}”?`)) return
    try {
      await categoriesApi.deleteCategory(cat.id)
      setSuccessMsg(`Categoria „${cat.nume}” a fost ștearsă/dezactivată.`)
      const catsRes = await categoriesApi.getCategories({ limit: 100 })
      setCategories(catsRes.items)
      loadResources()
    } catch (err: any) {
      alert(err.response?.data?.detail || "Eroare la ștergerea categoriei.")
    }
  }

  const resetFilters = () => {
    setSearch("")
    setSelectedCategory("ALL")
    setSelectedStatus("ALL")
    setSelectedRoom("ALL")
  }

  const getStatusBadge = (status: StareTehnica) => {
    switch (status) {
      case "DISPONIBILA":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            Disponibilă
          </span>
        )
      case "IN_MENTENANTA":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            În mentenanță
          </span>
        )
      case "DEFECTA":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
            Defectă
          </span>
        )
    }
  }

  return (
    <AppLayout breadcrumbs={["Spațiu de lucru", "Catalog Resurse"]}>
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2.5">
              <Cpu className="h-6 w-6 text-neutral-800" />
              Catalog Resurse & Echipamente
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Evidența centralizată a echipamentelor de calcul, roboticii, aparaturii de măsură și rezervărilor academice.
            </p>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCatModalOpen(true)}
                className="text-xs font-semibold gap-1.5 h-9"
              >
                <Tag className="h-4 w-4" />
                Categorii ({categories.length})
              </Button>
              <Button onClick={handleOpenCreate} className="bg-black hover:bg-neutral-800 text-white gap-2 shadow-sm h-9">
                <Plus className="h-4 w-4" />
                Adaugă Echipament
              </Button>
            </div>
          )}
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800 font-bold">
              ✕
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-rose-600 hover:text-rose-800 font-bold">
              ✕
            </button>
          </div>
        )}

        {/* Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-neutral-500">Total Echipamente</div>
              <div className="text-2xl font-bold text-neutral-900 mt-1">{totalCount}</div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700">
              <Cpu className="h-5 w-5" />
            </div>
          </div>
          <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-neutral-500">Disponibile</div>
              <div className="text-2xl font-bold text-emerald-600 mt-1">{availableCount}</div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-neutral-500">În Mentenanță</div>
              <div className="text-2xl font-bold text-amber-600 mt-1">{maintenanceCount}</div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Wrench className="h-5 w-5" />
            </div>
          </div>
          <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-neutral-500">Defecte</div>
              <div className="text-2xl font-bold text-rose-600 mt-1">{defectiveCount}</div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <Input
                type="text"
                placeholder="Caută după denumire, cod inventar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <div>
              <select
                value={selectedCategory}
                onChange={(e) =>
                  setSelectedCategory(e.target.value === "ALL" ? "ALL" : Number(e.target.value))
                }
                className="w-full h-9 rounded-md border border-neutral-200 bg-white px-3 text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="ALL">Toate Categoriile</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nume}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="w-full h-9 rounded-md border border-neutral-200 bg-white px-3 text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="ALL">Toate Stările Tehnice</option>
                <option value="DISPONIBILA">Doar Disponibile</option>
                <option value="IN_MENTENANTA">În Mentenanță</option>
                <option value="DEFECTA">Defecte</option>
              </select>
            </div>
            <div>
              <select
                value={selectedRoom}
                onChange={(e) =>
                  setSelectedRoom(e.target.value === "ALL" ? "ALL" : Number(e.target.value))
                }
                className="w-full h-9 rounded-md border border-neutral-200 bg-white px-3 text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="ALL">Toate Sălile</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.cod} - {r.nume}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(search || selectedCategory !== "ALL" || selectedStatus !== "ALL" || selectedRoom !== "ALL") && (
            <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-neutral-400">Filtre active:</span>
                {search && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    Căutare: "{search}"
                    <button onClick={() => setSearch("")}>✕</button>
                  </Badge>
                )}
                {selectedCategory !== "ALL" && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    Categorie: {categories.find((c) => c.id === selectedCategory)?.nume}
                    <button onClick={() => setSelectedCategory("ALL")}>✕</button>
                  </Badge>
                )}
                {selectedStatus !== "ALL" && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    Stare: {selectedStatus}
                    <button onClick={() => setSelectedStatus("ALL")}>✕</button>
                  </Badge>
                )}
                {selectedRoom !== "ALL" && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    Sală: {rooms.find((r) => r.id === selectedRoom)?.cod}
                    <button onClick={() => setSelectedRoom("ALL")}>✕</button>
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs text-neutral-500 h-7">
                Resetează filtre
              </Button>
            </div>
          )}
        </div>

        {/* Resources Table */}
        <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-neutral-500 space-y-3">
              <div className="h-7 w-7 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div className="text-xs font-medium">Se încarcă catalogul de resurse...</div>
            </div>
          ) : resources.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                <Cpu className="h-6 w-6" />
              </div>
              <div className="font-semibold text-neutral-800 text-sm">Nu s-a găsit nicio resursă</div>
              <div className="text-xs text-neutral-500 max-w-sm mx-auto">
                Nu există echipamente care să corespundă criteriilor sau facultății dumneavoastră.
              </div>
              <Button variant="outline" size="sm" onClick={resetFilters} className="mt-2 text-xs">
                Resetează filtrele
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Cod Inventar</th>
                    <th className="py-3.5 px-4">Denumire & Detalii</th>
                    <th className="py-3.5 px-4">Categorie</th>
                    <th className="py-3.5 px-4">Locație (Sală / Dept)</th>
                    <th className="py-3.5 px-4">Stare Tehnică</th>
                    <th className="py-3.5 px-4 text-right">Acțiuni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-800">
                  {resources.map((res) => (
                    <tr key={res.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">
                        {res.cod_inventar}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-medium text-neutral-900 leading-snug">{res.nume}</div>
                        {res.specificatii && (
                          <div className="text-[11px] text-neutral-500 truncate mt-0.5">
                            {res.specificatii}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="outline" className="text-[11px] font-normal border-neutral-300">
                          {res.categorie_nume || "Categorie n/a"}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-neutral-900">
                          <DoorOpen className="h-3.5 w-3.5 text-neutral-500" />
                          <span>{res.sala_cod}</span>
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          {res.departament_nume || res.facultate_nume}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(res.stare_tehnica)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {res.stare_tehnica === "DISPONIBILA" ? (
                            <Button
                              size="sm"
                              onClick={() => handleOpenReserve(res)}
                              className="h-8 text-xs bg-black text-white hover:bg-neutral-800 gap-1.5 shadow-sm"
                            >
                              <Calendar className="h-3.5 w-3.5" />
                              Rezervă
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled
                              className="h-8 text-xs text-neutral-400 border-neutral-200"
                            >
                              Indisponibil
                            </Button>
                          )}

                          {canManageResource && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenHistory(res)}
                                title="Jurnal Tehnic & Mentenanță"
                                className="h-8 w-8 p-0 border-neutral-200 text-neutral-600 hover:text-neutral-900"
                              >
                                <Wrench className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenEdit(res)}
                                title="Editare stare & detalii tehnice"
                                className="h-8 w-8 p-0 border-neutral-200 text-neutral-600 hover:text-neutral-900"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}

                          {isAdmin && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteResource(res)}
                              title="Dezactivare"
                              className="h-8 w-8 p-0 border-neutral-200 text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Rezervare Echipament */}
        {reserveModalResource && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-neutral-200 overflow-hidden">
              <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-neutral-900 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-neutral-700" />
                    Rezervare Echipament
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {reserveModalResource.nume} ({reserveModalResource.cod_inventar})
                  </p>
                </div>
                <button
                  onClick={() => setReserveModalResource(null)}
                  className="text-neutral-400 hover:text-neutral-600 text-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateReservation} className="p-6 space-y-4">
                {bookingError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                    <span>{bookingError}</span>
                  </div>
                )}

                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-1">
                  <div className="font-semibold text-neutral-800">Informații resursă:</div>
                  <div className="text-neutral-600">Categorie: {reserveModalResource.categorie_nume}</div>
                  <div className="text-neutral-600">
                    Locație: Sala {reserveModalResource.sala_cod} ({reserveModalResource.sala_nume})
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Data & Ora Început
                    </label>
                    <Input
                      type="datetime-local"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Data & Ora Sfârșit
                    </label>
                    <Input
                      type="datetime-local"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Scopul / Proiectul de cercetare
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Descrieți scopul didactic sau tema de cercetare pentru care solicitați rezervarea..."
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full text-xs rounded-md border border-neutral-200 p-2.5 focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setReserveModalResource(null)}
                    className="text-xs"
                  >
                    Anulează
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmittingBooking}
                    className="bg-black hover:bg-neutral-800 text-white text-xs"
                  >
                    {isSubmittingBooking ? "Se trimite cererea..." : "Confirmă Rezervarea"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Jurnal Tehnic & Mentenanță */}
        {historyModalResource && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-neutral-200 overflow-hidden flex flex-col max-h-[85vh]">
              <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-neutral-900 flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-neutral-700" />
                    Jurnal Tehnic & Mentenanță
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {historyModalResource.nume} ({historyModalResource.cod_inventar})
                  </p>
                </div>
                <button
                  onClick={() => setHistoryModalResource(null)}
                  className="text-neutral-400 hover:text-neutral-600 text-lg"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                {canManageTechnicalHistory && (
                  <form
                    onSubmit={handleAddTechnicalLog}
                    className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3"
                  >
                    <div className="font-semibold text-xs text-neutral-800 flex items-center gap-1.5">
                      <Plus className="h-3.5 w-3.5 text-neutral-600" />
                      Înregistrează Intervenție / Actualizează Starea
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                          Tip Intervenție
                        </label>
                        <select
                          value={newLogType}
                          onChange={(e) => setNewLogType(e.target.value)}
                          className="w-full h-8 rounded border border-neutral-200 bg-white px-2 text-xs"
                        >
                          <option value="MENTENANTA_PREVENTIVA">Mentenanță Preventivă</option>
                          <option value="DEFECTIUNE">Defecțiune Raportată</option>
                          <option value="REPARATIE">Reparație / Înlocuire Piese</option>
                          <option value="CALIBRARE">Calibrare & Testare</option>
                          <option value="INSTALARE_SOFTWARE">Actualizare Software/Firmware</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                          Noua Stare Tehnică
                        </label>
                        <select
                          value={newLogState}
                          onChange={(e) => setNewLogState(e.target.value as StareTehnica)}
                          className="w-full h-8 rounded border border-neutral-200 bg-white px-2 text-xs"
                        >
                          <option value="DISPONIBILA">Disponibilă (Operațională)</option>
                          <option value="IN_MENTENANTA">În Mentenanță</option>
                          <option value="DEFECTA">Defectă (Blocată)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                        Descriere Tehnică Intervenție
                      </label>
                      <textarea
                        required
                        rows={2}
                        placeholder="Detaliați acțiunile efectuate, componentele înlocuite sau natura defecțiunii..."
                        value={newLogDesc}
                        onChange={(e) => setNewLogDesc(e.target.value)}
                        className="w-full text-xs rounded border border-neutral-200 p-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={isSubmittingLog || !newLogDesc.trim()}
                        className="h-8 text-xs bg-black text-white hover:bg-neutral-800"
                      >
                        {isSubmittingLog ? "Se salvează..." : "Salvează în Jurnal"}
                      </Button>
                    </div>
                  </form>
                )}

                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Istoric Imutabil Intervenții ({techHistory.length})
                  </div>
                  {isLoadingHistory ? (
                    <div className="text-center py-6 text-xs text-neutral-400">Se încarcă jurnalul...</div>
                  ) : techHistory.length === 0 ? (
                    <div className="text-center py-6 text-xs text-neutral-400 bg-neutral-50 rounded-xl border border-neutral-100">
                      Nicio intervenție înregistrată în jurnalul tehnic.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {techHistory.map((item) => (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-xl border border-neutral-200 bg-white shadow-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-neutral-900">{item.tip_interventie}</span>
                            <span className="text-neutral-400 text-[11px]">
                              {new Date(item.created_at).toLocaleString("ro-RO")}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-700 leading-relaxed">{item.descriere}</p>
                          <div className="flex items-center justify-between pt-1 text-[11px] text-neutral-500 border-t border-neutral-100">
                            <div>
                              Înregistrat de: <span className="font-medium text-neutral-800">{item.utilizator_nume}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span>Stare:</span>
                              <span className="font-mono text-neutral-600">{item.stare_anterioara}</span>
                              <span>→</span>
                              <span className="font-mono font-bold text-neutral-900">{item.stare_noua}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Creare / Editare Resursă (Admin) */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-neutral-200 overflow-hidden">
              <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
                <h3 className="font-bold text-base text-neutral-900">
                  {editResource ? "Editare Echipament" : "Adăugare Echipament Nou"}
                </h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-neutral-400 hover:text-neutral-600 text-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitResource} className="p-6 space-y-3.5">
                {!isAdmin && (
                  <div className="p-3 rounded-xl bg-neutral-100 border border-neutral-200 text-xs text-neutral-700">
                    În calitate de responsabil de laborator, puteți transfera echipamentul într-un alt laborator, actualiza starea tehnică, specificațiile și descrierea.
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Denumire Resursă / Echipament
                  </label>
                  <Input
                    required
                    value={formData.nume}
                    onChange={(e) => setFormData({ ...formData, nume: e.target.value })}
                    placeholder="ex: Stație AI RTX 4090"
                    disabled={!isAdmin}
                    className="text-xs disabled:opacity-60 disabled:bg-neutral-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Cod Inventar</label>
                    <Input
                      required
                      value={formData.cod_inventar}
                      onChange={(e) => setFormData({ ...formData, cod_inventar: e.target.value })}
                      placeholder="ex: RES-HPC-001"
                      disabled={!isAdmin}
                      className="text-xs font-mono disabled:opacity-60 disabled:bg-neutral-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Stare Tehnică</label>
                    <select
                      value={formData.stare_tehnica}
                      onChange={(e) =>
                        setFormData({ ...formData, stare_tehnica: e.target.value as StareTehnica })
                      }
                      className="w-full h-9 rounded-md border border-neutral-200 bg-white px-3 text-xs"
                    >
                      <option value="DISPONIBILA">Disponibilă</option>
                      <option value="IN_MENTENANTA">În Mentenanță</option>
                      <option value="DEFECTA">Defectă</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Categorie</label>
                    <select
                      value={formData.categorie_id}
                      onChange={(e) =>
                        setFormData({ ...formData, categorie_id: Number(e.target.value) })
                      }
                      disabled={!isAdmin}
                      className="w-full h-9 rounded-md border border-neutral-200 bg-white px-3 text-xs disabled:opacity-60 disabled:bg-neutral-100"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nume}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Sală de cercetare</label>
                    <select
                      value={formData.sala_id}
                      onChange={(e) => setFormData({ ...formData, sala_id: Number(e.target.value) })}
                      disabled={!canManageResource}
                      className="w-full h-9 rounded-md border border-neutral-200 bg-white px-3 text-xs disabled:opacity-60 disabled:bg-neutral-100"
                    >
                      {rooms.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.cod} - {r.nume}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Specificații Tehnice</label>
                  <textarea
                    rows={2}
                    placeholder="ex: Procesor, Memorie RAM, Placă Video, Interfețe comunicație..."
                    value={formData.specificatii}
                    onChange={(e) => setFormData({ ...formData, specificatii: e.target.value })}
                    className="w-full text-xs rounded-md border border-neutral-200 p-2.5 focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Descriere adițională</label>
                  <textarea
                    rows={2}
                    placeholder="Instrucțiuni sau detalii utile..."
                    value={formData.descriere}
                    onChange={(e) => setFormData({ ...formData, descriere: e.target.value })}
                    className="w-full text-xs rounded-md border border-neutral-200 p-2.5 focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="text-xs"
                  >
                    Anulează
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmittingResource}
                    className="bg-black hover:bg-neutral-800 text-white text-xs"
                  >
                    {isSubmittingResource ? "Se salvează..." : "Salvează Echipament"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Gestiune Categorii Resurse */}
        {isCatModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-neutral-200 overflow-hidden flex flex-col max-h-[85vh]">
              <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-neutral-900 flex items-center gap-2">
                    <Tag className="h-5 w-5 text-neutral-700" />
                    Gestiune Categorii de Resurse
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">Clasificarea resurselor universitare</p>
                </div>
                <button
                  onClick={() => setIsCatModalOpen(false)}
                  className="text-neutral-400 hover:text-neutral-600 text-lg"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                {/* Form to add category */}
                <form
                  onSubmit={handleCreateCategory}
                  className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3"
                >
                  <div className="font-semibold text-xs text-neutral-800 flex items-center gap-1.5">
                    <Plus className="h-3.5 w-3.5 text-neutral-600" />
                    Adaugă Categorie Nouă
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                      Denumire Categorie
                    </label>
                    <Input
                      required
                      placeholder="ex: Drone & Senzori Autonomi"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                      Descriere
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Descrierea categoriei..."
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                      className="w-full text-xs rounded border border-neutral-200 p-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSubmittingCat || !newCatName.trim()}
                      className="h-8 text-xs bg-black text-white hover:bg-neutral-800"
                    >
                      {isSubmittingCat ? "Se creează..." : "Salvează Categoria"}
                    </Button>
                  </div>
                </form>

                {/* Categories Table */}
                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Categorii Existente ({categories.length})
                  </div>
                  <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-xl overflow-hidden bg-white">
                    {categories.map((c) => (
                      <div key={c.id} className="p-3.5 flex items-center justify-between hover:bg-neutral-50/60 transition-colors">
                        <div>
                          <div className="font-semibold text-xs text-neutral-900">{c.nume}</div>
                          {c.descriere && (
                            <div className="text-[11px] text-neutral-500 mt-0.5">{c.descriere}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-medium">
                            {c.resources_count ?? 0} resurse
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteCategory(c)}
                            title="Șterge / Dezactivează"
                            className="h-7 w-7 p-0 text-neutral-400 hover:text-rose-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
export default ResourcesPage
