import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Plus } from "lucide-react"
import { AppLayout } from "../components/layout/AppLayout"
import { useAuth } from "../context/AuthContext"
import { resourcesApi } from "../api/resources"
import { ALL_CATALOG_ITEMS, type CatalogCardItem } from "../data/catalogItems"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Card } from "../components/ui/card"
import {
  ResourceFilterBar,
  SPEC_KEYWORDS,
  type ResourceFilterValues,
} from "../components/resources/ResourceFilterBar"
import { ResourceCatalogCard } from "../components/resources/ResourceCatalogCard"
import { CatalogPagination } from "../components/resources/CatalogPagination"

const PAGE_SIZE = 12

const INITIAL_FILTERS: ResourceFilterValues = {
  search: "",
  typeFilter: "toate",
  deptFilter: "toate",
  specFilter: "toate",
  roomFilter: "toate",
  statusFilter: "toate",
  techFilter: "toate",
  specKeywordFilter: "toate",
}

export function ResourcesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [items, setItems] = useState<CatalogCardItem[]>(ALL_CATALOG_ITEMS)
  const [filters, setFilters] = useState<ResourceFilterValues>(INITIAL_FILTERS)
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

  const handleFilterChange = <K extends keyof ResourceFilterValues>(
    key: K,
    value: ResourceFilterValues[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS)
    setSortBy("Disponibilitate")
    setCurrentPage(1)
  }

  const activeFiltersCount = [
    filters.search.trim() !== "",
    filters.typeFilter !== "toate",
    filters.deptFilter !== "toate",
    filters.specFilter !== "toate",
    filters.roomFilter !== "toate",
    filters.statusFilter !== "toate",
    filters.techFilter !== "toate",
    filters.specKeywordFilter !== "toate",
  ].filter(Boolean).length

  const filteredItems = useMemo(() => {
    const kwEntry = SPEC_KEYWORDS.find((k) => k.id === filters.specKeywordFilter)
    const kwRegex = kwEntry && kwEntry.match ? new RegExp(kwEntry.match, "i") : null
    const q = filters.search.trim().toLowerCase()

    return visibleBaseItems
      .filter((item) => {
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
        if (filters.typeFilter !== "toate" && item.categoryTag !== filters.typeFilter) {
          return false
        }
        if (filters.deptFilter !== "toate" && item.department !== filters.deptFilter) {
          return false
        }
        if (filters.specFilter !== "toate" && item.specializare !== filters.specFilter) {
          return false
        }
        if (filters.roomFilter !== "toate" && item.roomLabel !== filters.roomFilter) {
          return false
        }
        if (filters.statusFilter !== "toate" && item.statusBadge !== filters.statusFilter) {
          return false
        }
        if (!isStudent && filters.techFilter !== "toate" && item.stareTehnica !== filters.techFilter) {
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
  }, [visibleBaseItems, filters, sortBy, isStudent])

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
              Filtrează rapid după clasă, departament, specializare, sală sau
              specificații tehnice și rezervă pe ore sau pe mai multe zile.
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

        <ResourceFilterBar
          filters={filters}
          classCounts={classCounts}
          departmentsList={departmentsList}
          specializationsList={specializationsList}
          roomsList={roomsList}
          activeFiltersCount={activeFiltersCount}
          isStudent={isStudent}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
        />

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
            <option value="Disponibilitate">Sortează: disponibilitate</option>
            <option value="Clasă / Categorie">Sortează: clasă / categorie</option>
            <option value="Nume (A-Z)">Sortează: nume (A–Z)</option>
            <option value="Nume (Z-A)">Sortează: nume (Z–A)</option>
            <option value="Laborator / Sală">Sortează: laborator / sală</option>
            <option value="Cod inventar">Sortează: cod inventar</option>
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
              <ResourceCatalogCard
                key={`${item.code}-${item.id}`}
                item={item}
                onOpenDetail={(id) => navigate(`/resources/${id}`)}
                onSelectCategory={(category) => handleFilterChange("typeFilter", category)}
                onSelectDepartment={(dept) => handleFilterChange("deptFilter", dept)}
                onSelectRoom={(room) => handleFilterChange("roomFilter", room)}
              />
            ))}
          </div>
        )}

        <CatalogPagination
          totalItems={totalItems}
          pageSize={PAGE_SIZE}
          currentPage={safePage}
          onPageChange={setCurrentPage}
        />
      </div>
    </AppLayout>
  )
}
