import { useAcademicData } from "./useAcademicData"
import { useDepartmentForm } from "./useDepartmentForm"
import { useFacultyForm } from "./useFacultyForm"
import { useInstitutionForm } from "./useInstitutionForm"
import { useModalStatus } from "./useModalStatus"

/** Hook-ul paginii de administrare academica: compune datele si formularele pe entitati. */
export function useAcademicAdmin() {
  const status = useModalStatus()
  const data = useAcademicData()
  const { loadData, loadHierarchyData, institutions, faculties } = data

  const institution = useInstitutionForm({ status, loadData, loadHierarchyData })
  const faculty = useFacultyForm({ status, institutions, loadData, loadHierarchyData })
  const department = useDepartmentForm({ status, faculties, loadData })

  return {
    tab: data.tab,
    setTab: data.setTab,
    institutions,
    faculties,
    departments: data.departments,
    search: data.search,
    setSearch: data.setSearch,
    filterInstitutionId: data.filterInstitutionId,
    setFilterInstitutionId: data.setFilterInstitutionId,
    filterFacultyId: data.filterFacultyId,
    setFilterFacultyId: data.setFilterFacultyId,
    isLoading: data.isLoading,
    handleSearchSubmit: data.handleSearchSubmit,
    modalError: status.modalError,
    isSubmitting: status.isSubmitting,
    ...institution,
    ...faculty,
    ...department,
  }
}
