import { useState } from "react"
import type { FormEvent } from "react"
import { academicApi } from "../../../api/academic"
import type { Institution } from "../../../types"
import type { ModalStatus } from "./useModalStatus"

interface Options {
  status: ModalStatus
  loadData: () => void
  loadHierarchyData: () => void
}

export function useInstitutionForm({ status, loadData, loadHierarchyData }: Options) {
  const { setModalError, setIsSubmitting } = status
  const [isInstModalOpen, setIsInstModalOpen] = useState(false)
  const [editingInst, setEditingInst] = useState<Institution | null>(null)
  const [instNume, setInstNume] = useState("")
  const [instCod, setInstCod] = useState("")
  const [instOras, setInstOras] = useState("")
  const [instAdresa, setInstAdresa] = useState("")
  const [instEmail, setInstEmail] = useState("")
  const [instTelefon, setInstTelefon] = useState("")
  const [instWebsite, setInstWebsite] = useState("")

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

  const handleSaveInstitution = async (e: FormEvent) => {
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

  return {
    isInstModalOpen, setIsInstModalOpen, editingInst,
    instNume, setInstNume, instCod, setInstCod, instOras, setInstOras,
    instAdresa, setInstAdresa, instEmail, setInstEmail,
    instTelefon, setInstTelefon, instWebsite, setInstWebsite,
    openAddInstitution, openEditInstitution,
    handleSaveInstitution, handleToggleInstitution, handleDeleteInstitution,
  }
}
