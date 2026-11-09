import { useState, useEffect } from "react"
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
} from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { Card } from "../components/ui/card"

const PAGE_SIZE = 12

export function ResourcesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [items, setItems] = useState<CatalogCardItem[]>(ALL_CATALOG_ITEMS)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("toate")
  const [deptFilter, setDeptFilter] = useState("toate")
  const [statusFilter, setStatusFilter] = useState("toate")
  const [maxDuration, setMaxDuration] = useState(4)
  const [sortBy, setSortBy] = useState("Disponibilitate")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    resourcesApi
      .getResources({ limit: 200 })
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
                stareTehnica: card.stareTehnica !== "DISPONIBILA" ? card.stareTehnica : matched.stare_tehnica,
              }
            })
          )
        }
      })
      .catch(() => {})
  }, [])

  const handleResetFilters = () => {
    setSearch("")
    setTypeFilter("toate")
    setDeptFilter("toate")
    setStatusFilter("toate")
    setMaxDuration(4)
    setCurrentPage(1)
  }

  const isStudent = !user || user.rol === "STUDENT"

  const filteredItems = items
    .filter((item) => {
      if (isStudent && item.stareTehnica !== "DISPONIBILA") {
        return false
      }
      const q = search.trim().toLowerCase()
      if (
        q &&
        !item.name.toLowerCase().includes(q) &&
        !item.code.toLowerCase().includes(q) &&
        !item.specsAndRoom.toLowerCase().includes(q) &&
        !item.categoryTag.toLowerCase().includes(q)
      ) {
        return false
      }
      if (typeFilter !== "toate" && item.categoryTag !== typeFilter) {
        return false
      }
      if (deptFilter !== "toate" && item.department !== deptFilter) {
        return false
      }
      if (statusFilter !== "toate" && item.statusBadge !== statusFilter) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy === "Nume") return a.name.localeCompare(b.name)
      if (sortBy === "Categorie") return a.categoryTag.localeCompare(b.categoryTag)
      return a.id - b.id
    })

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
              Găsește resursa potrivită și consultă disponibilitatea în timp real.
            </p>
          </div>

          <Button
            onClick={() => navigate("/resources/1")}
            className="bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold h-9 px-4 rounded-lg gap-1.5 shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            Rezervare nouă
          </Button>
        </Card>

        <Card className="rounded-2xl border-neutral-200 bg-white p-5 shadow-none space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <Input
              type="text"
              placeholder="Caută după nume sau cod resursă..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9 h-9 rounded-xl border-neutral-200 bg-neutral-50/40 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-neutral-500 mr-1">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filtre:
              </span>

              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="h-7 rounded-full border border-neutral-200 bg-white px-3 text-[11px] font-semibold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                <option value="toate">Tip: toate</option>
                <option value="Calculatoare">Tip: Calculatoare</option>
                <option value="Roboți">Tip: Roboți</option>
                <option value="Kituri IoT">Tip: Kituri IoT</option>
                <option value="Instrumente">Tip: Instrumente</option>
                <option value="Prototipare">Tip: Prototipare</option>
                <option value="Drone & Vehicule">Tip: Drone & Vehicule</option>
                <option value="Rețelistică & Cyber">Tip: Rețelistică & Cyber</option>
                <option value="Optoelectronică">Tip: Optoelectronică</option>
                <option value="Biomed & VR">Tip: Biomed & VR</option>
                <option value="Energetică & PLC">Tip: Energetică & PLC</option>
              </select>

              <select
                value={deptFilter}
                onChange={(e) => {
                  setDeptFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="h-7 rounded-full border border-neutral-200 bg-white px-3 text-[11px] font-semibold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                <option value="toate">Departament: toate</option>
                <option value="Calculatoare">Departament: Calculatoare</option>
                <option value="Electronică">Departament: Electronică</option>
                <option value="Automatică">Departament: Automatică</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="h-7 rounded-full border border-neutral-200 bg-white px-3 text-[11px] font-semibold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                <option value="toate">Stare: toate</option>
                <option value="Disponibil">Stare: Disponibil</option>
                <option value="Rezervat">Stare: Rezervat</option>
                <option value="În utilizare">Stare: În utilizare</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-semibold text-neutral-700 hover:text-neutral-950 transition-colors"
            >
              Resetează
            </button>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-600 font-medium">Durată maximă rezervare</span>
              <span className="font-bold text-neutral-900">{maxDuration} ore</span>
            </div>
            <input
              type="range"
              min={1}
              max={12}
              value={maxDuration}
              onChange={(e) => setMaxDuration(Number(e.target.value))}
              className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-black"
            />
          </div>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-neutral-900">
              {filteredItems.length} resurse
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
            <option value="Nume">Sortează: Nume</option>
            <option value="Categorie">Sortează: Categorie</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedItems.map((item) => (
            <Card
              key={`${item.code}-${item.id}`}
              className="rounded-2xl border-neutral-200 bg-white overflow-hidden shadow-none flex flex-col justify-between"
            >
              <div>
                <div className="h-44 w-full bg-neutral-100 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
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

                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 leading-snug">
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      {item.specsAndRoom}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <Badge
                      variant="outline"
                      className="rounded-full bg-neutral-100 border-neutral-200 text-neutral-800 text-[10px] font-semibold px-2.5 py-0.5"
                    >
                      {item.categoryTag}
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
                  className="w-full h-9 rounded-xl border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900 text-xs font-semibold"
                >
                  {item.buttonLabel}
                </Button>
              </div>
            </Card>
          ))}
        </div>

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
