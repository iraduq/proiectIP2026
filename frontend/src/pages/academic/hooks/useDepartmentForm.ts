import { useState } from "react"
import type { FormEvent } from "react"
import { academicApi } from "../../../api/academic"
import type { Department, Faculty } from "../../../types"
import type { ModalStatus } from "./useModalStatus"

interface Options {
  status: ModalStatus
  faculties: Faculty[]
  loadData: () => void
}

export function useDepartmentForm({ status, faculties, loadData }: Options) {
  const { setModalError, setIsSubmitting } = status
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false)
  const [editingDept, setEditingDept] = useState<Department | null>(null)
  const [deptFacultateId, setDeptFacultateId] = useState<number>(0)
  const [deptNume, setDeptNume] = useState("")
  const [deptCod, setDeptCod] = useState("")
  const [deptDescriere, setDeptDescriere] = useState("")
  const [deptSefId, setDeptSefId] = useState<string>("")

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

  const handleSaveDepartment = async (e: FormEvent) => {
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
    isDeptModalOpen, setIsDeptModalOpen, editingDept,
    deptFacultateId, setDeptFacultateId, deptNume, setDeptNume,
    deptCod, setDeptCod, deptDescriere, setDeptDescriere, deptSefId, setDeptSefId,
    openAddDepartment, openEditDepartment,
    handleSaveDepartment, handleToggleDepartment, handleDeleteDepartment,
  }
}
