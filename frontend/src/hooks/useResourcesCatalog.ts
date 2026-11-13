import { useEffect, useMemo, useState } from "react"
import { resourcesApi } from "../api/resources"
import { ALL_CATALOG_ITEMS, type CatalogCardItem } from "../data/catalogItems"
import {
  SPEC_KEYWORDS,
  type ResourceFilterValues,
} from "../components/resources/ResourceFilterBar"

export const RESOURCES_PAGE_SIZE = 12

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

export function useResourcesCatalog(isStudent: boolean) {
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

  const visibleBaseItems = useMemo(
    () => items.filter((item) => !(isStudent && item.stareTehnica !== "DISPONIBILA")),
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
        if (filters.typeFilter !== "toate" && item.categoryTag !== filters.typeFilter) return false
        if (filters.deptFilter !== "toate" && item.department !== filters.deptFilter) return false
        if (filters.specFilter !== "toate" && item.specializare !== filters.specFilter) return false
        if (filters.roomFilter !== "toate" && item.roomLabel !== filters.roomFilter) return false
        if (filters.statusFilter !== "toate" && item.statusBadge !== filters.statusFilter) return false
        if (!isStudent && filters.techFilter !== "toate" && item.stareTehnica !== filters.techFilter) {
          return false
        }
        if (kwRegex) {
          const hay = `${item.name} ${item.specsAndRoom} ${item.categoryTag} ${item.specializare}`
          if (!kwRegex.test(hay)) return false
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
  const totalPages = Math.max(1, Math.ceil(totalItems / RESOURCES_PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * RESOURCES_PAGE_SIZE

  return {
    filters,
    sortBy,
    setSortBy,
    safePage,
    setCurrentPage,
    totalItems,
    paginatedItems: filteredItems.slice(startIndex, startIndex + RESOURCES_PAGE_SIZE),
    availableCount: filteredItems.filter((i) => i.statusBadge === "Disponibil").length,
    inUseCount: filteredItems.filter((i) => i.statusBadge === "În utilizare").length,
    reservedCount: filteredItems.filter((i) => i.statusBadge === "Rezervat").length,
    departmentsList,
    specializationsList,
    roomsList,
    classCounts,
    activeFiltersCount,
    handleFilterChange,
    handleResetFilters,
  }
}
