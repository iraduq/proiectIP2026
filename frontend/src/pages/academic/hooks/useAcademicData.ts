import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { academicApi } from "../../../api/academic"
import type { AcademicTab } from "../components/AcademicFilterBar"
import type { Department, Faculty, Institution } from "../../../types"

/** Incarcarea si filtrarea listelor (institutii, facultati, departamente). */
export function useAcademicData() {
  const [tab, setTab] = useState<AcademicTab>("institutions")
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [search, setSearch] = useState("")
  const [filterInstitutionId, setFilterInstitutionId] = useState<number | undefined>(undefined)
  const [filterFacultyId, setFilterFacultyId] = useState<number | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)

  const loadHierarchyData = async () => {
    try {
      const [iRes, fRes] = await Promise.all([
        academicApi.getInstitutions({ limit: 100 }),
        academicApi.getFaculties({ limit: 100 }),
      ])
      setInstitutions(iRes.items)
      setFaculties(fRes.items)
    } catch {}
  }

  useEffect(() => {
    loadHierarchyData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      if (tab === "institutions") {
        const res = await academicApi.getInstitutions({
          search: search.trim() || undefined,
          limit: 100,
        })
        setInstitutions(res.items)
      } else if (tab === "faculties") {
        const res = await academicApi.getFaculties({
          institutie_id: filterInstitutionId,
          search: search.trim() || undefined,
          limit: 100,
        })
        setFaculties(res.items)
      } else {
        const res = await academicApi.getDepartments({
          facultate_id: filterFacultyId,
          institutie_id: filterInstitutionId,
          search: search.trim() || undefined,
          limit: 200,
        })
        setDepartments(res.items)
      }
    } catch {
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [tab, filterInstitutionId, filterFacultyId])

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault()
    loadData()
  }

  return {
    tab, setTab, institutions, faculties, departments,
    search, setSearch,
    filterInstitutionId, setFilterInstitutionId,
    filterFacultyId, setFilterFacultyId,
    isLoading, loadData, loadHierarchyData, handleSearchSubmit,
  }
}
