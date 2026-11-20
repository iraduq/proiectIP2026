import { useState } from "react"
import type { FormEvent } from "react"
import { academicApi } from "../../../api/academic"
import type { Faculty, Institution } from "../../../types"
import type { ModalStatus } from "./useModalStatus"

interface Options {
  status: ModalStatus
  institutions: Institution[]
  loadData: () => void
  loadHierarchyData: () => void
}

export function useFacultyForm({ status, institutions, loadData, loadHierarchyData }: Options) {
  const { setModalError, setIsSubmitting } = status
  const [isFacModalOpen, setIsFacModalOpen] = useState(false)
  const [editingFac, setEditingFac] = useState<Faculty | null>(null)
  const [facInstitutieId, setFacInstitutieId] = useState<number>(0)
  const [facNume, setFacNume] = useState("")
  const [facCod, setFacCod] = useState("")
  const [facDescriere, setFacDescriere] = useState("")

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

  const handleSaveFaculty = async (e: FormEvent) => {
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

  return {
    isFacModalOpen, setIsFacModalOpen, editingFac,
    facInstitutieId, setFacInstitutieId, facNume, setFacNume,
    facCod, setFacCod, facDescriere, setFacDescriere,
    openAddFaculty, openEditFaculty,
    handleSaveFaculty, handleToggleFaculty, handleDeleteFaculty,
  }
}
