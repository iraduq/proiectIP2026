import { useCallback, useEffect, useState } from "react"
import { academicApi } from "../../../api/academic"
import { categoriesApi } from "../../../api/categories"
import { resourcesApi, type ResourcePayload } from "../../../api/resources"
import type { Category, Resource, Room, StareTehnica } from "../../../types"

export const INVENTORY_PAGE_SIZE = 5

export interface AdminCounts {
  total: number
  defecte: number
  mentenanta: number
}

export function useAdminInventory(enabled: boolean) {
  const [items, setItems] = useState<Resource[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [stare, setStare] = useState<StareTehnica | "ALL">("ALL")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [counts, setCounts] = useState<AdminCounts>({ total: 0, defecte: 0, mentenanta: 0 })

  const load = useCallback(async () => {
    if (!enabled) return
    setIsLoading(true)
    setError(null)
    try {
      const res = await resourcesApi.getResources({
        skip: (page - 1) * INVENTORY_PAGE_SIZE,
        limit: INVENTORY_PAGE_SIZE,
        search: search || undefined,
        stare_tehnica: stare === "ALL" ? undefined : stare,
      })
      setItems(res.items)
      setTotal(res.total)
    } catch {
      setError("Inventarul nu a putut fi încărcat.")
    } finally {
      setIsLoading(false)
    }
  }, [enabled, page, search, stare])

  const loadCounts = useCallback(async () => {
    if (!enabled) return
    try {
      const [all, bad, maint] = await Promise.all([
        resourcesApi.getResources({ limit: 1 }),
        resourcesApi.getResources({ limit: 1, stare_tehnica: "DEFECTA" }),
        resourcesApi.getResources({ limit: 1, stare_tehnica: "IN_MENTENANTA" }),
      ])
      setCounts({ total: all.total, defecte: bad.total, mentenanta: maint.total })
    } catch {
      /* statisticile raman la valorile anterioare */
    }
  }, [enabled])

  const loadLookups = useCallback(async () => {
    if (!enabled) return
    try {
      const [cats, rms] = await Promise.all([
        categoriesApi.getCategories({ limit: 100 }),
        academicApi.getRooms({ limit: 100 }),
      ])
      setCategories(cats.items)
      setRooms(rms.items)
    } catch {
      /* selectoarele raman goale */
    }
  }, [enabled])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    loadCounts()
    loadLookups()
  }, [loadCounts, loadLookups])

  const applySearch = () => {
    setPage(1)
    setSearch(searchInput.trim())
  }

  const changeStare = (value: StareTehnica | "ALL") => {
    setPage(1)
    setStare(value)
  }

  const refresh = async () => {
    await Promise.all([load(), loadCounts()])
  }

  const saveResource = async (id: number | null, data: ResourcePayload) => {
    if (id === null) await resourcesApi.createResource(data)
    else await resourcesApi.updateResource(id, data)
    await refresh()
  }

  const setActive = async (id: number, isActive: boolean) => {
    await resourcesApi.updateResource(id, { is_active: isActive })
    await refresh()
  }

  return {
    items, total, page, setPage, searchInput, setSearchInput, applySearch,
    stare, changeStare, isLoading, error, categories, rooms, counts,
    saveResource, setActive,
  }
}
