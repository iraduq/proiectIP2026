import { useEffect, useRef, useState } from "react"
import { academicApi } from "../../api/academic"
import { resourcesApi } from "../../api/resources"
import type { Department, Faculty, Resource, Room } from "../../types"

export interface GlobalSearchResults {
  rooms: Room[]
  departments: Department[]
  faculties: Faculty[]
  resources: Resource[]
}

const EMPTY_RESULTS: GlobalSearchResults = { rooms: [], departments: [], faculties: [], resources: [] }

/** Cautarea globala din bara laterala (debounce 250 ms, minim 2 caractere). */
export function useGlobalSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<GlobalSearchResults>(EMPTY_RESULTS)
  const [showResults, setShowResults] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const trimmed = searchQuery.trim()
    if (trimmed.length < 2) {
      setSearchResults(EMPTY_RESULTS)
      setIsSearching(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const [roomsRes, deptsRes, facsRes, resourcesRes] = await Promise.all([
          academicApi.getRooms({ search: trimmed, limit: 5 }),
          academicApi.getDepartments({ search: trimmed, limit: 5 }),
          academicApi.getFaculties({ search: trimmed, limit: 5 }),
          resourcesApi.getResources({ search: trimmed, limit: 5 }),
        ])
        setSearchResults({
          rooms: roomsRes.items,
          departments: deptsRes.items,
          faculties: facsRes.items,
          resources: resourcesRes.items,
        })
        setShowResults(true)
      } catch {
      } finally {
        setIsSearching(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const totalResults =
    searchResults.rooms.length +
    searchResults.departments.length +
    searchResults.faculties.length +
    searchResults.resources.length

  return {
    searchQuery, setSearchQuery, isSearching, searchResults,
    showResults, setShowResults, searchContainerRef, totalResults,
  }
}
