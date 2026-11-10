import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { AppLayout } from "../components/layout/AppLayout"
import { useAuth } from "../context/AuthContext"
import { resourcesApi } from "../api/resources"
import { ALL_CATALOG_ITEMS, type CatalogCardItem } from "../data/catalogItems"
import {
  Search,
  SlidersHorizontal,
  Plus,
  AlertTriangle,
  Calendar,
  Layers,
  MapPin,
  RotateCcw,
} from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { Card } from "../components/ui/card"

const PAGE_SIZE = 12

const CLASS_TABS = [
  { id: "toate", label: "Toate clasele" },
  { id: "Calculatoare", label: "Calculatoare și HPC" },
  { id: "Roboți", label: "Roboți și autonomie" },
  { id: "Kituri IoT", label: "Kituri IoT și FPGA" },
  { id: "Instrumente", label: "Instrumente și măsură" },
  { id: "Prototipare", label: "Prototipare și 3D" },
  { id: "Drone și vehicule", label: "Drone și vehicule" },
  { id: "Rețelistică și cyber", label: "Rețelistică și cyber" },
  { id: "Optoelectronică", label: "Optoelectronică" },
  { id: "Biomed și VR", label: "Biomed și VR" },
  { id: "Energetică și PLC", label: "Energetică și PLC" },
]

const SPEC_KEYWORDS = [
  { id: "toate", label: "Dotare tehnică: toate", match: "" },
  { id: "gpu", label: "GPU / RTX / AI deep learning", match: "rtx|a100|h100|l40s|gpu|tops|ai" },
  { id: "ros", label: "ROS2 / brațe robotice", match: "ros2|axe|dof|robot|gripper" },
  { id: "fpga", label: "FPGA / embedded / MCU", match: "fpga|zynq|artix|stm32|cortex|jetson|lora" },
  { id: "rf", label: "Osciloscoape / RF / spectru", match: "mhz|ghz|gs/s|gsa/s|vna|osciloscop|spectru" },
  { id: "3d", label: "Imprimare 3D / laser / CNC", match: "corexy|fdm|sla|laser|cnc|pcb|smd" },
  { id: "drone", label: "LiDAR / RTK / drone", match: "rtk|lidar|dron|gnss|px4|rov" },
  { id: "net", label: "Switch L3 / firewall / SDR 5G", match: "sfp|poe|firewall|sdr|5g|otdr|hsm" },
  { id: "opt", label: "Fotonică / spectrometrie / camere", match: "nm|fps|laser|optic|microscop|interferometru" },
  { id: "bio", label: "EEG / EMG / BCI / căști VR", match: "eeg|emg|ecg|bci|vr|eye|haptic" },
  { id: "pwr", label: "Energetică / PLC / HIL", match: "hil|plc|simatic|kw|fotovoltaic|invertor" },
]

export function ResourcesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [items, setItems] = useState<CatalogCardItem[]>(ALL_CATALOG_ITEMS)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("toate")
  const [deptFilter, setDeptFilter] = useState("toate")
  const [specFilter, setSpecFilter] = useState("toate")
  const [roomFilter, setRoomFilter] = useState("toate")
  const [statusFilter, setStatusFilter] = useState("toate")
  const [techFilter, setTechFilter] = useState("toate")
  const [specKeywordFilter, setSpecKeywordFilter] = useState("toate")
  const [sortBy, setSortBy] = useState("Disponibilitate")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    resourcesApi
      .getResources({ limit: 500 })
      .then((res) => {
        if (res.items && res.items.length > 0) {
          setItems((prev) =>
            prev.map((card, idx) => {
              const matched =
                res.items.find((dbItem) => dbItem.cod_inventar === card.code) ||
                res.items[idx % res.items.length]
              if (!matched) return card
              return {
                ...card,
                id: matched.id,
                stareTehnica:
                  card.stareTehnica !== "DISPONIBILA"
                    ? card.stareTehnica
                    : matched.stare_tehnica,
              }
            })
          )
        }
      })
      .catch(() => {})
  }, [])

  const isStudent = !user || user.rol === "STUDENT"

  const visibleBaseItems = useMemo(
    () =>
      items.filter((item) => {
        if (isStudent && item.stareTehnica !== "DISPONIBILA") {
          return false
        }
        return true
      }),
    [items, isStudent]
  )

  const departmentsList = useMemo(
    () => Array.from(new Set(visibleBaseItems.map((i) => i.department))).sort(),
    [visibleBaseItems]
  )

  const specializationsList = useMemo(
    () => Array.from(new Set(visibleBaseItems.map((i) => i.specializare))).sort(),
    [visibleBaseItems]
  )

  const roomsList = useMemo(
    () => Array.from(new Set(visibleBaseItems.map((i) => i.roomLabel))).sort(),
    [visibleBaseItems]
  )

  const classCounts = useMemo(() => {
    const counts: Record<string, number> = { toate: visibleBaseItems.length }
    for (const item of visibleBaseItems) {
      counts[item.categoryTag] = (counts[item.categoryTag] || 0) + 1
    }
    return counts
  }, [visibleBaseItems])

  const handleResetFilters = () => {
    setSearch("")
    setTypeFilter("toate")
    setDeptFilter("toate")
    setSpecFilter("toate")
    setRoomFilter("toate")
    setStatusFilter("toate")
    setTechFilter("toate")
    setSpecKeywordFilter("toate")
    setSortBy("Disponibilitate")
    setCurrentPage(1)
  }

  const activeFiltersCount = [
    search.trim() !== "",
    typeFilter !== "toate",
    deptFilter !== "toate",
    specFilter !== "toate",
    roomFilter !== "toate",
    statusFilter !== "toate",
    techFilter !== "toate",
    specKeywordFilter !== "toate",
  ].filter(Boolean).length

  const filteredItems = useMemo(() => {
    const kwEntry = SPEC_KEYWORDS.find((k) => k.id === specKeywordFilter)
    const kwRegex = kwEntry && kwEntry.match ? new RegExp(kwEntry.match, "i") : null

    return visibleBaseItems
      .filter((item) => {
        const q = search.trim().toLowerCase()
        if (
          q &&
          !item.name.toLowerCase().includes(q) &&
          !item.code.toLowerCase().includes(q) &&
          !item.specsAndRoom.toLowerCase().includes(q) &&
          !item.categoryTag.toLowerCase().includes(q) &&
          !item.specializare.toLowerCase().includes(q) &&
          !item.department.toLowerCase().includes(q) &&
          !item.roomLabel.toLowerCase().includes(q)
        ) {
          return false
        }
        if (typeFilter !== "toate" && item.categoryTag !== typeFilter) {
          return false
        }
        if (deptFilter !== "toate" && item.department !== deptFilter) {
          return false
        }
        if (specFilter !== "toate" && item.specializare !== specFilter) {
          return false
        }
        if (roomFilter !== "toate" && item.roomLabel !== roomFilter) {
          return false
        }
        if (statusFilter !== "toate" && item.statusBadge !== statusFilter) {
          return false
        }
        if (!isStudent && techFilter !== "toate" && item.stareTehnica !== techFilter) {
          return false
        }
        if (kwRegex) {
          const hay = `${item.name} ${item.specsAndRoom} ${item.categoryTag} ${item.specializare}`
          if (!kwRegex.test(hay)) {
            return false
          }
        }
        return true
      })
      .sort((a, b) => {
        if (sortBy === "Nume (A-Z)") return a.name.localeCompare(b.name, "ro")
        if (sortBy === "Nume (Z-A)") return b.name.localeCompare(a.name, "ro")
        if (sortBy === "Clasă / Categorie") return a.categoryTag.localeCompare(b.categoryTag, "ro")
        if (sortBy === "Laborator / Sală") return a.roomLabel.localeCompare(b.roomLabel, "ro")
        if (sortBy === "Cod inventar") return a.code.localeCompare(b.code, "ro")
        if (a.statusBadge === "Disponibil" && b.statusBadge !== "Disponibil") return -1
        if (a.statusBadge !== "Disponibil" && b.statusBadge === "Disponibil") return 1
        return a.id - b.id
      })
  }, [
    visibleBaseItems,
    search,
    typeFilter,
    deptFilter,
    specFilter,
    roomFilter,
    statusFilter,
    techFilter,
    specKeywordFilter,
    sortBy,
    isStudent,
  ])

  const totalItems = filteredItems.length
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * PAGE_SIZE
  const paginatedItems = filteredItems.slice(startIndex, startIndex + PAGE_SIZE)

  const availableCount = filteredItems.filter((i) => i.statusBadge === "Disponibil").length
  const inUseCount = filteredItems.filter((i) => i.statusBadge === "În utilizare").length
  const reservedCount = filteredItems.filter((i) => i.statusBadge === "Rezervat").length

  return (
    <AppLayout breadcrumbs={["Spațiu de lucru", "Catalog de resurse"]}>
      <div className="max-w-7xl mx-auto space-y-4">
        <Card className="rounded-2xl border-neutral-200 bg-white p-5 shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Catalog de resurse
            </h1>
            <p className="text-xs text-neutral-500">
              Filtrează rapid după clasă, departament, specializare, sală sau specificații tehnice și rezervă pe ore sau pe mai multe zile.
            </p>
          </div>

          <Button
            onClick={() => {
              const el = document.getElementById("catalog-search-input")
              el?.focus()
              el?.scrollIntoView({ behavior: "smooth", block: "center" })
            }}
            className="bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold h-9 px-4 rounded-lg gap-1.5 shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            Rezervare nouă
          </Button>
        </Card>

        <Card className="rounded-2xl border-neutral-200 bg-white p-5 shadow-none space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-neutral-800">
                <Layers className="h-3.5 w-3.5 text-neutral-700" />
                Clasă echipament (acces rapid)
              </span>
              {typeFilter !== "toate" && (
                <button
                  type="button"
                  onClick={() => {
                    setTypeFilter("toate")
                    setCurrentPage(1)
                  }}
                  className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900"
                >
                  Afișează toate clasele
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {CLASS_TABS.map((tab) => {
                const active = typeFilter === tab.id
                const count = classCounts[tab.id] || 0
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setTypeFilter(tab.id)
                      setCurrentPage(1)
                    }}
                    className={`h-8 px-3 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      active
                        ? "bg-neutral-950 text-white shadow-xs"
                        : "bg-neutral-100/80 hover:bg-neutral-200/70 text-neutral-700 border border-neutral-200/70"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        active
                          ? "bg-white/20 text-white"
                          : "bg-white text-neutral-500"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="relative pt-1">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-neutral-400" />
            <Input
              id="catalog-search-input"
              type="text"
              placeholder="Caută după nume, cod inventar (ex. INV-USV-2026-001), specificații (ex. RTX 4090, ROS2, LiDAR), sală sau specializare..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9 h-9 rounded-xl border-neutral-200 bg-neutral-50/40 text-xs"
            />
          </div>

          <div className="space-y-2.5 pt-1 border-t border-neutral-100">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filtre detaliate {activeFiltersCount > 0 ? `(${activeFiltersCount} active)` : ""}
              </span>

              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-xs font-semibold text-neutral-700 hover:text-neutral-950 transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                Resetează toate filtrele
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="h-8 rounded-xl border border-neutral-200 bg-white px-2.5 text-[11px] font-semibold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                <option value="toate">Clasă: toate</option>
                {CLASS_TABS.filter((t) => t.id !== "toate").map((t) => (
                  <option key={t.id} value={t.id}>
                    Clasă: {t.label}
                  </option>
                ))}
              </select>

              <select
                value={deptFilter}
                onChange={(e) => {
                  setDeptFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="h-8 rounded-xl border border-neutral-200 bg-white px-2.5 text-[11px] font-semibold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                <option value="toate">Departament: toate</option>
                {departmentsList.map((dept) => (
                  <option key={dept} value={dept}>
                    Departament: {dept}
                  </option>
                ))}
              </select>

              <select
                value={specFilter}
                onChange={(e) => {
                  setSpecFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="h-8 rounded-xl border border-neutral-200 bg-white px-2.5 text-[11px] font-semibold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                <option value="toate">Specializare: toate</option>
                {specializationsList.map((sp) => (
                  <option key={sp} value={sp}>
                    Specializare: {sp}
                  </option>
                ))}
              </select>

              <select
                value={roomFilter}
                onChange={(e) => {
                  setRoomFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="h-8 rounded-xl border border-neutral-200 bg-white px-2.5 text-[11px] font-semibold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                <option value="toate">Sală / Lab: toate</option>
                {roomsList.map((rm) => (
                  <option key={rm} value={rm}>
                    Sală: {rm}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="h-8 rounded-xl border border-neutral-200 bg-white px-2.5 text-[11px] font-semibold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                <option value="toate">Disponibilitate: toate</option>
                <option value="Disponibil">Disponibil acum</option>
                <option value="Rezervat">Rezervat</option>
                <option value="În utilizare">În utilizare</option>
              </select>

              <select
                value={specKeywordFilter}
                onChange={(e) => {
                  setSpecKeywordFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="h-8 rounded-xl border border-neutral-200 bg-white px-2.5 text-[11px] font-semibold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                {SPEC_KEYWORDS.map((kw) => (
                  <option key={kw.id} value={kw.id}>
                    {kw.label}
                  </option>
                ))}
              </select>
            </div>

            {!isStudent && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-neutral-500 font-medium">Stare tehnică:</span>
                {["toate", "DISPONIBILA", "IN_MENTENANTA", "DEFECTA"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      setTechFilter(st)
                      setCurrentPage(1)
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                      techFilter === st
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    {st === "toate"
                      ? "Toate"
                      : st === "DISPONIBILA"
                      ? "Funcțională"
                      : st === "IN_MENTENANTA"
                      ? "În mentenanță"
                      : "Defectă"}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-neutral-900">
              {filteredItems.length} resurse găsite
            </span>
            <Badge
              variant="outline"
              className="rounded-full bg-neutral-100 border-neutral-200 text-neutral-700 text-[11px] font-medium px-2.5 py-0.5"
            >
              {availableCount} disponibile · {reservedCount} rezervate · {inUseCount} în utilizare
            </Badge>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-8 rounded-lg border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          >
            <option value="Disponibilitate">Sortează: Disponibilitate</option>
            <option value="Clasă / Categorie">Sortează: Clasă / Categorie</option>
            <option value="Nume (A-Z)">Sortează: Nume (A–Z)</option>
            <option value="Nume (Z-A)">Sortează: Nume (Z–A)</option>
            <option value="Laborator / Sală">Sortează: Laborator / Sală</option>
            <option value="Cod inventar">Sortează: Cod inventar</option>
          </select>
        </div>

        {paginatedItems.length === 0 ? (
          <Card className="rounded-2xl border-neutral-200 bg-white p-10 text-center space-y-3 shadow-none">
            <div className="text-sm font-bold text-neutral-900">
              Nicio resursă nu corespunde filtrelor selectate
            </div>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              Încearcă să selectezi altă clasă de echipament sau să resetezi filtrele active.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="rounded-xl text-xs font-semibold"
            >
              Resetează filtrele
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedItems.map((item) => (
              <Card
                key={`${item.code}-${item.id}`}
                className="rounded-2xl border-neutral-200 bg-white overflow-hidden shadow-none hover:border-neutral-400 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div
                    onClick={() => navigate(`/resources/${item.id}`)}
                    className="h-44 w-full bg-neutral-100 overflow-hidden cursor-pointer relative group"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span
                        onClick={(e) => {
                          e.stopPropagation()
                          setTypeFilter(item.categoryTag)
                          setCurrentPage(1)
                        }}
                        className="px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-xs text-white text-[10px] font-semibold cursor-pointer hover:bg-black"
                      >
                        {item.categoryTag}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-neutral-400 font-mono">
                        {item.code}
                      </span>

                      {item.statusBadge === "În utilizare" ? (
                        <Badge className="rounded-full bg-neutral-950 hover:bg-neutral-950 text-white text-[10px] font-semibold px-2.5 py-0.5 border-transparent">
                          În utilizare
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="rounded-full bg-neutral-50 border-neutral-200 text-neutral-800 text-[10px] font-semibold px-2.5 py-0.5"
                        >
                          {item.statusBadge}
                        </Badge>
                      )}
                    </div>

                    <div
                      onClick={() => navigate(`/resources/${item.id}`)}
                      className="cursor-pointer"
                    >
                      <h3 className="text-sm font-bold text-neutral-900 leading-snug hover:underline">
                        {item.name}
                      </h3>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        {item.specsAndRoom}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <Badge
                        variant="outline"
                        onClick={() => {
                          setDeptFilter(item.department)
                          setCurrentPage(1)
                        }}
                        className="rounded-full bg-neutral-100 border-neutral-200 text-neutral-800 text-[10px] font-semibold px-2.5 py-0.5 cursor-pointer hover:bg-neutral-200"
                      >
                        {item.department}
                      </Badge>

                      <Badge
                        variant="outline"
                        onClick={() => {
                          setRoomFilter(item.roomLabel)
                          setCurrentPage(1)
                        }}
                        className="rounded-full bg-neutral-50 border-neutral-200 text-neutral-600 text-[10px] font-medium px-2 py-0.5 cursor-pointer hover:bg-neutral-100 gap-1"
                      >
                        <MapPin className="h-2.5 w-2.5 text-neutral-400" />
                        {item.roomLabel}
                      </Badge>

                      {item.returnTodayBadge && (
                        <Badge
                          variant="outline"
                          className="rounded-full bg-amber-50 border-amber-200 text-amber-800 text-[10px] font-semibold px-2.5 py-0.5 gap-1"
                        >
                          <AlertTriangle className="h-2.5 w-2.5 text-amber-600" />
                          {item.returnTodayBadge}
                        </Badge>
                      )}
                    </div>

                    {item.availabilityNote && (
                      <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 pt-0.5">
                        <Calendar className="h-3 w-3 text-neutral-400 shrink-0" />
                        <span>{item.availabilityNote}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-4 pb-4 pt-1">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/resources/${item.id}`)}
                    className="w-full h-9 rounded-xl border-neutral-200 bg-white hover:bg-neutral-950 hover:text-white text-neutral-900 text-xs font-semibold transition-colors"
                  >
                    Rezervă pe ore sau zile
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 pb-6 text-xs text-neutral-500">
          <span>
            Se afișează {totalItems === 0 ? 0 : startIndex + 1}–
            {Math.min(startIndex + PAGE_SIZE, totalItems)} din {totalItems} resurse
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-8 px-3 rounded-lg border border-neutral-200 bg-white text-neutral-700 font-medium hover:bg-neutral-50 disabled:opacity-40 transition-colors"
            >
              Anterior
            </button>

            {Array.from({ length: totalPages }, (_, idx) => idx + 1)
              .filter(
                (page) =>
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - safePage) <= 2
              )
              .map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`h-8 w-8 rounded-lg font-bold flex items-center justify-center transition-colors ${
                    page === safePage
                      ? "bg-neutral-950 text-white"
                      : "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  {page}
                </button>
              ))}

            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 px-3 rounded-lg border border-neutral-200 bg-white text-neutral-700 font-medium hover:bg-neutral-50 disabled:opacity-40 transition-colors"
            >
              Următor
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
