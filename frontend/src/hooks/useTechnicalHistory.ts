import React, { useEffect, useState } from "react"
import { resourcesApi } from "../api/resources"
import { technicalHistoryApi } from "../api/technicalHistory"
import type { Resource, StareTehnica, TechnicalHistory } from "../types"

export function useTechnicalHistory(canAccess: boolean, canCreate: boolean) {
  const [history, setHistory] = useState<TechnicalHistory[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("ALL")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedResourceId, setSelectedResourceId] = useState<number>(0)
  const [logType, setLogType] = useState("MENTENANTA_PREVENTIVA")
  const [logDesc, setLogDesc] = useState("")
  const [logState, setLogState] = useState<StareTehnica>("IN_MENTENANTA")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [hRes, rRes] = await Promise.all([
        technicalHistoryApi.getTechnicalHistory({ limit: 100 }),
        resourcesApi.getResources({ limit: 100 }),
      ])
      setHistory(hRes.items)
      setResources(rRes.items)
      if (rRes.items.length > 0) setSelectedResourceId(rRes.items[0].id)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (canAccess) loadData()
    else setIsLoading(false)
  }, [canAccess])

  const handleCreateLog = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedResourceId || !canCreate) return
    setIsSubmitting(true)
    try {
      await technicalHistoryApi.createTechnicalHistory({
        resursa_id: selectedResourceId,
        tip_interventie: logType,
        descriere: logDesc,
        stare_noua: logState,
      })
      setSuccessMsg("Înregistrarea a fost adăugată cu succes în jurnalul tehnic.")
      setIsModalOpen(false)
      setLogDesc("")
      loadData()
    } catch (err: any) {
      alert(err.response?.data?.detail || "Eroare la adăugarea înregistrării.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredHistory = history.filter((h) => {
    if (typeFilter !== "ALL" && h.tip_interventie !== typeFilter) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      h.resursa_nume?.toLowerCase().includes(q) ||
      h.resursa_cod?.toLowerCase().includes(q) ||
      h.descriere?.toLowerCase().includes(q) ||
      h.utilizator_nume?.toLowerCase().includes(q)
    )
  })

  return {
    resources,
    isLoading,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    isModalOpen,
    setIsModalOpen,
    selectedResourceId,
    setSelectedResourceId,
    logType,
    setLogType,
    logDesc,
    setLogDesc,
    logState,
    setLogState,
    isSubmitting,
    successMsg,
    setSuccessMsg,
    filteredHistory,
    handleCreateLog,
  }
}
