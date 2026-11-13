import { useEffect, useState } from "react"
import { academicApi } from "../api/academic"
import type { AcademicTab } from "../components/academic/AcademicFilterBar"
import type { Department, Faculty, Institution } from "../types"

export function useAcademicAdmin() {
  const [tab, setTab] = useState<AcademicTab>("institutions")
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [search, setSearch] = useState("")
  const [filterInstitutionId, setFilterInstitutionId] = useState<number | undefined>(undefined)
  const [filterFacultyId, setFilterFacultyId] = useState<number | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)

  const [isInstModalOpen, setIsInstModalOpen] = useState(false)
  const [editingInst, setEditingInst] = useState<Institution | null>(null)
  const [instNume, setInstNume] = useState("")
  const [instCod, setInstCod] = useState("")
  const [instOras, setInstOras] = useState("")
  const [instAdresa, setInstAdresa] = useState("")
  const [instEmail, setInstEmail] = useState("")
  const [instTelefon, setInstTelefon] = useState("")
  const [instWebsite, setInstWebsite] = useState("")

  const [isFacModalOpen, setIsFacModalOpen] = useState(false)
  const [editingFac, setEditingFac] = useState<Faculty | null>(null)
  const [facInstitutieId, setFacInstitutieId] = useState<number>(0)
  const [facNume, setFacNume] = useState("")
  const [facCod, setFacCod] = useState("")
  const [facDescriere, setFacDescriere] = useState("")

  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false)
  const [editingDept, setEditingDept] = useState<Department | null>(null)
  const [deptFacultateId, setDeptFacultateId] = useState<number>(0)
  const [deptNume, setDeptNume] = useState("")
  const [deptCod, setDeptCod] = useState("")
  const [deptDescriere, setDeptDescriere] = useState("")
  const [deptSefId, setDeptSefId] = useState<string>("")

  const [modalError, setModalError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadHierarchyData = async () => {
    try {
      const [iRes, fRes] = await Promise.all([
        academicApi.getInstitutions({ limit: 100 }),
        academicApi.getFaculties({ limit: 100 }),
      ])
      setInstitutions(iRes.items)
      setFaculties(fRes.items)
      if (iRes.items.length > 0 && facInstitutieId === 0) {
        setFacInstitutieId(iRes.items[0].id)
      }
      if (fRes.items.length > 0 && deptFacultateId === 0) {
        setDeptFacultateId(fRes.items[0].id)
      }
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loadData()
  }

  const openAddInstitution = () => {
    setEditingInst(null)
    setModalError(null)
    setInstNume("")
    setInstCod("")
    setInstOras("")
    setInstAdresa("")
    setInstEmail("")
    setInstTelefon("")
    setInstWebsite("")
    setIsInstModalOpen(true)
  }

  const openEditInstitution = (inst: Institution) => {
    setEditingInst(inst)
    setModalError(null)
    setInstNume(inst.nume)
    setInstCod(inst.cod)
    setInstOras(inst.oras)
    setInstAdresa(inst.adresa)
    setInstEmail(inst.email_contact || "")
    setInstTelefon(inst.telefon || "")
    setInstWebsite(inst.website || "")
    setIsInstModalOpen(true)
  }

  const handleSaveInstitution = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalError(null)
    setIsSubmitting(true)
    const payload = {
      nume: instNume.trim(),
      cod: instCod.trim().toUpperCase(),
      oras: instOras.trim(),
      adresa: instAdresa.trim(),
      email_contact: instEmail.trim() || null,
      telefon: instTelefon.trim() || null,
      website: instWebsite.trim() || null,
    }
    try {
      if (editingInst) {
        await academicApi.updateInstitution(editingInst.id, payload)
      } else {
        await academicApi.createInstitution(payload)
      }
      setIsInstModalOpen(false)
      loadData()
      loadHierarchyData()
    } catch (err: any) {
      setModalError(err.response?.data?.detail || "Eroare la salvarea instituției.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleInstitution = async (inst: Institution) => {
    try {
      if (inst.is_active) {
        await academicApi.deactivateInstitution(inst.id)
      } else {
        await academicApi.activateInstitution(inst.id)
      }
      loadData()
      loadHierarchyData()
    } catch (err: any) {
      alert(err.response?.data?.detail || "Eroare la schimbarea stării.")
    }
  }

  const handleDeleteInstitution = async (inst: Institution) => {
    if (!confirm(`Ești sigur că vrei să ștergi instituția ${inst.cod}?`)) return
    try {
      await academicApi.deleteInstitution(inst.id)
      loadData()
      loadHierarchyData()
    } catch (err: any) {
      alert(err.response?.data?.detail || "Eroare la ștergere.")
    }
  }

  const openAddFaculty = () => {
    setEditingFac(null)
    setModalError(null)
    setFacNume("")
    setFacCod("")
    setFacDescriere("")
    if (institutions.length > 0 && facInstitutieId === 0) {
      setFacInstitutieId(institutions[0].id)
    }
    setIsFacModalOpen(true)
  }

  const openEditFaculty = (fac: Faculty) => {
    setEditingFac(fac)
    setModalError(null)
    setFacInstitutieId(fac.institutie_id)
    setFacNume(fac.nume)
    setFacCod(fac.cod)
    setFacDescriere(fac.descriere || "")
    setIsFacModalOpen(true)
  }

  const handleSaveFaculty = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalError(null)
    setIsSubmitting(true)
    try {
      if (editingFac) {
        await academicApi.updateFaculty(editingFac.id, {
          nume: facNume.trim(),
          cod: facCod.trim().toUpperCase(),
          descriere: facDescriere.trim() || null,
        })
      } else {
        await academicApi.createFaculty({
          institutie_id: Number(facInstitutieId),
          nume: facNume.trim(),
          cod: facCod.trim().toUpperCase(),
          descriere: facDescriere.trim() || null,
        })
      }
      setIsFacModalOpen(false)
      loadData()
      loadHierarchyData()
    } catch (err: any) {
      setModalError(err.response?.data?.detail || "Eroare la salvarea facultății.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleFaculty = async (fac: Faculty) => {
    try {
      if (fac.is_active) {
        await academicApi.deactivateFaculty(fac.id)
      } else {
        await academicApi.activateFaculty(fac.id)
      }
      loadData()
      loadHierarchyData()
    } catch (err: any) {
      alert(err.response?.data?.detail || "Eroare la schimbarea stării.")
    }
  }

  const handleDeleteFaculty = async (fac: Faculty) => {
    if (!confirm(`Ești sigur că vrei să ștergi facultatea ${fac.cod}?`)) return
    try {
      await academicApi.deleteFaculty(fac.id)
      loadData()
      loadHierarchyData()
    } catch (err: any) {
      alert(err.response?.data?.detail || "Eroare la ștergere.")
    }
  }

  const openAddDepartment = () => {
    setEditingDept(null)
    setModalError(null)
    setDeptNume("")
    setDeptCod("")
    setDeptDescriere("")
    setDeptSefId("")
    if (faculties.length > 0 && deptFacultateId === 0) {
      setDeptFacultateId(faculties[0].id)
    }
    setIsDeptModalOpen(true)
  }

  const openEditDepartment = (dept: Department) => {
    setEditingDept(dept)
    setModalError(null)
    setDeptFacultateId(dept.facultate_id)
    setDeptNume(dept.nume)
    setDeptCod(dept.cod)
    setDeptDescriere(dept.descriere || "")
    setDeptSefId(dept.sef_departament ? String(dept.sef_departament.id_utilizator) : "")
    setIsDeptModalOpen(true)
  }

  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalError(null)
    setIsSubmitting(true)
    try {
      const sefIdNum = deptSefId.trim() ? Number(deptSefId.trim()) : null
      if (editingDept) {
        await academicApi.updateDepartment(editingDept.id, {
          nume: deptNume.trim(),
          cod: deptCod.trim().toUpperCase(),
          descriere: deptDescriere.trim() || null,
          sef_departament_id: sefIdNum,
        })
      } else {
        await academicApi.createDepartment({
          facultate_id: Number(deptFacultateId),
          nume: deptNume.trim(),
          cod: deptCod.trim().toUpperCase(),
          descriere: deptDescriere.trim() || null,
          sef_departament_id: sefIdNum,
        })
      }
      setIsDeptModalOpen(false)
      loadData()
    } catch (err: any) {
      setModalError(err.response?.data?.detail || "Eroare la salvarea departamentului.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleDepartment = async (dept: Department) => {
    try {
      if (dept.is_active) {
        await academicApi.deactivateDepartment(dept.id)
      } else {
        await academicApi.activateDepartment(dept.id)
      }
      loadData()
    } catch (err: any) {
      alert(err.response?.data?.detail || "Eroare la schimbarea stării.")
    }
  }

  const handleDeleteDepartment = async (dept: Department) => {
    if (!confirm(`Ești sigur că vrei să ștergi departamentul ${dept.cod}?`)) return
    try {
      await academicApi.deleteDepartment(dept.id)
      loadData()
    } catch (err: any) {
      alert(err.response?.data?.detail || "Eroare la ștergere.")
    }
  }

  return {
    tab,
    setTab,
    institutions,
    faculties,
    departments,
    search,
    setSearch,
    filterInstitutionId,
    setFilterInstitutionId,
    filterFacultyId,
    setFilterFacultyId,
    isLoading,
    handleSearchSubmit,
    modalError,
    isSubmitting,
    isInstModalOpen,
    setIsInstModalOpen,
    editingInst,
    instNume,
    setInstNume,
    instCod,
    setInstCod,
    instOras,
    setInstOras,
    instAdresa,
    setInstAdresa,
    instEmail,
    setInstEmail,
    instTelefon,
    setInstTelefon,
    instWebsite,
    setInstWebsite,
    openAddInstitution,
    openEditInstitution,
    handleSaveInstitution,
    handleToggleInstitution,
    handleDeleteInstitution,
    isFacModalOpen,
    setIsFacModalOpen,
    editingFac,
    facInstitutieId,
    setFacInstitutieId,
    facNume,
    setFacNume,
    facCod,
    setFacCod,
    facDescriere,
    setFacDescriere,
    openAddFaculty,
    openEditFaculty,
    handleSaveFaculty,
    handleToggleFaculty,
    handleDeleteFaculty,
    isDeptModalOpen,
    setIsDeptModalOpen,
    editingDept,
    deptFacultateId,
    setDeptFacultateId,
    deptNume,
    setDeptNume,
    deptCod,
    setDeptCod,
    deptDescriere,
    setDeptDescriere,
    deptSefId,
    setDeptSefId,
    openAddDepartment,
    openEditDepartment,
    handleSaveDepartment,
    handleToggleDepartment,
    handleDeleteDepartment,
  }
}
