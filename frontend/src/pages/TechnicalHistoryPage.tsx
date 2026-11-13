import React, { useState, useEffect } from "react"
import { CheckCircle2, Plus, Search, ShieldAlert, Wrench } from "lucide-react"
import { AppLayout } from "../components/layout/AppLayout"
import { useAuth } from "../context/AuthContext"
import { technicalHistoryApi } from "../api/technicalHistory"
import { resourcesApi } from "../api/resources"
import { Button } from "../components/ui/button"
import { TechnicalHistoryTable } from "../components/technical/TechnicalHistoryTable"
import { TechnicalLogModal } from "../components/technical/TechnicalLogModal"
import { INTERVENTION_FILTER_OPTIONS } from "../data/technicalHistoryConstants"
import type { Resource, StareTehnica, TechnicalHistory } from "../types"

export function TechnicalHistoryPage() {
  const { user } = useAuth()

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

  const canAccess =
    user?.rol === "ADMINISTRATOR" ||
    user?.rol === "RESPONSABIL_LABORATOR" ||
    Boolean(user?.permissions?.includes("technical_history:read"))

  const canCreate =
    user?.rol === "ADMINISTRATOR" ||
    user?.rol === "RESPONSABIL_LABORATOR" ||
    Boolean(user?.permissions?.includes("technical_history:create"))

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

  if (!canAccess) {
    return (
      <AppLayout breadcrumbs={["Spațiu de lucru", "Jurnal tehnic"]}>
        <div className="p-8 max-w-2xl mx-auto my-12 text-center space-y-4 bg-white rounded-2xl border border-neutral-200 shadow-sm">
          <div className="h-14 w-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900">Acces restricționat</h2>
          <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
            Consultarea și consemnarea în fișele de mentenanță și jurnalul tehnic sunt rezervate
            exclusiv personalului tehnic autorizat (responsabili de laborator și administratori).
          </p>
          <div className="pt-2">
            <Button
              onClick={() => (window.location.href = "/dashboard")}
              className="text-xs bg-black text-white hover:bg-neutral-800"
            >
              Înapoi la panoul de bord
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout breadcrumbs={["Spațiu de lucru", "Jurnal tehnic"]}>
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2.5">
              <Wrench className="h-6 w-6 text-neutral-800" />
              Jurnal tehnic și fișe de mentenanță
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Istoric complet și imutabil al intervențiilor, reparațiilor și raportărilor de
              defecțiuni.
            </p>
          </div>
          {canCreate && (
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-black hover:bg-neutral-800 text-white gap-2 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Înregistrează intervenție
            </Button>
          )}
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button
              onClick={() => setSuccessMsg(null)}
              className="text-emerald-600 hover:text-emerald-800 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-neutral-200 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Caută în jurnal după echipament, autor sau descriere..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 h-9 text-xs rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-500">Tip intervenție:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-9 px-3 rounded-lg border border-neutral-200 bg-white text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-black"
            >
              {INTERVENTION_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <TechnicalHistoryTable items={filteredHistory} isLoading={isLoading} />

        {isModalOpen && (
          <TechnicalLogModal
            resources={resources}
            selectedResourceId={selectedResourceId}
            logType={logType}
            logState={logState}
            logDesc={logDesc}
            isSubmitting={isSubmitting}
            onResourceChange={setSelectedResourceId}
            onTypeChange={setLogType}
            onStateChange={setLogState}
            onDescChange={setLogDesc}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleCreateLog}
          />
        )}
      </div>
    </AppLayout>
  )
}
export default TechnicalHistoryPage
