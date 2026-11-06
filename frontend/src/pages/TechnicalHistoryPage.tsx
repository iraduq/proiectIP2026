import { useState, useEffect } from "react"
import { AppLayout } from "../components/layout/AppLayout"
import { useAuth } from "../context/AuthContext"
import { technicalHistoryApi } from "../api/technicalHistory"
import { resourcesApi } from "../api/resources"
import type { Resource, StareTehnica, TechnicalHistory } from "../types"
import {
  Wrench,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cpu,
  User as UserIcon,
  Filter,
  ShieldAlert,
} from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"

export function TechnicalHistoryPage() {
  const { user } = useAuth()

  const [history, setHistory] = useState<TechnicalHistory[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("ALL")

  // Modal create
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedResourceId, setSelectedResourceId] = useState<number>(0)
  const [logType, setLogType] = useState("MENTENANTA_PREVENTIVA")
  const [logDesc, setLogDesc] = useState("")
  const [logState, setLogState] = useState<StareTehnica>("IN_MENTENANTA")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const isStaff =
    user?.rol === "ADMINISTRATOR" ||
    user?.rol === "PROFESOR" ||
    user?.rol === "RESPONSABIL_LABORATOR"

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [hRes, rRes] = await Promise.all([
        technicalHistoryApi.getTechnicalHistory({ limit: 100 }),
        resourcesApi.getResources({ limit: 100 }),
      ])
      setHistory(hRes.items)
      setResources(rRes.items)
      if (rRes.items.length > 0) {
        setSelectedResourceId(rRes.items[0].id)
      }
    } catch (err: any) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateLog = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedResourceId) return
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

  const getInterventionBadge = (type: string) => {
    switch (type) {
      case "DEFECTIUNE":
      case "DEFECTIUNE_RAPORTATA":
      case "RAPORT_DEFECTIUNE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="h-3 w-3" />
            Defecțiune
          </span>
        )
      case "MENTENANTA_PREVENTIVA":
      case "MENTENANTA":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Wrench className="h-3 w-3" />
            Mentenanță
          </span>
        )
      case "REPARATIE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <CheckCircle2 className="h-3 w-3" />
            Reparație
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200">
            <Clock className="h-3 w-3" />
            {type}
          </span>
        )
    }
  }

  return (
    <AppLayout breadcrumbs={["Spațiu de lucru", "Jurnal Tehnic"]}>
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2.5">
              <Wrench className="h-6 w-6 text-neutral-800" />
              Jurnal Tehnic & Fișe de Mentenanță
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Istoric complet și imutabil al intervențiilor, reparațiilor și raportărilor de defecțiuni.
            </p>
          </div>
          {isStaff && (
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-black hover:bg-neutral-800 text-white gap-2 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Înregistrează Intervenție
            </Button>
          )}
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800 font-bold">
              ✕
            </button>
          </div>
        )}

        {/* Filter Bar */}
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
              <option value="ALL">Toate tipurile</option>
              <option value="MENTENANTA_PREVENTIVA">Mentenanță preventivă</option>
              <option value="DEFECTIUNE">Defecțiuni</option>
              <option value="REPARATIE">Reparații</option>
              <option value="CALIBRARE">Calibrare</option>
              <option value="INSTALARE_SOFTWARE">Software / Firmware</option>
            </select>
          </div>
        </div>

        {/* History Table */}
        <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-neutral-500 space-y-3">
              <div className="h-7 w-7 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div className="text-xs font-medium">Se încarcă jurnalul tehnic...</div>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                <Wrench className="h-6 w-6" />
              </div>
              <div className="font-semibold text-neutral-800 text-sm">Nicio intervenție găsită</div>
              <div className="text-xs text-neutral-500 max-w-sm mx-auto">
                Nu există intrări în jurnalul tehnic care să corespundă filtrului selectat.
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Dată Înregistrare</th>
                    <th className="py-3.5 px-4">Echipament & Cod</th>
                    <th className="py-3.5 px-4">Tip Eveniment</th>
                    <th className="py-3.5 px-4">Descriere Tehnică</th>
                    <th className="py-3.5 px-4">Tranziție Stare</th>
                    <th className="py-3.5 px-4">Înregistrat De</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-800">
                  {filteredHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3.5 px-4 text-neutral-500 font-mono text-[11px] whitespace-nowrap">
                        {new Date(item.created_at).toLocaleString("ro-RO")}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-neutral-900">{item.resursa_nume}</div>
                        <div className="font-mono text-[11px] text-neutral-500">{item.resursa_cod}</div>
                      </td>
                      <td className="py-3.5 px-4">{getInterventionBadge(item.tip_interventie)}</td>
                      <td className="py-3.5 px-4 max-w-md text-neutral-700 leading-snug">
                        {item.descriere}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <span className="text-neutral-500">{item.stare_anterioara}</span>
                          <span className="text-neutral-400">→</span>
                          <span className="font-bold text-neutral-900">{item.stare_noua}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-neutral-900">{item.utilizator_nume}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Adăugare Înregistrare Jurnal Tehnic */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-neutral-200 overflow-hidden">
              <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
                <h3 className="font-bold text-base text-neutral-900 flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-neutral-700" />
                  Înregistrează În Jurnalul Tehnic
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-neutral-400 hover:text-neutral-600 text-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateLog} className="p-6 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Selectează Echipamentul
                  </label>
                  <select
                    value={selectedResourceId}
                    onChange={(e) => setSelectedResourceId(Number(e.target.value))}
                    className="w-full h-9 rounded-md border border-neutral-200 bg-white px-3 text-xs"
                  >
                    {resources.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.cod_inventar} - {r.nume} ({r.stare_tehnica})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Tip Intervenție</label>
                    <select
                      value={logType}
                      onChange={(e) => setLogType(e.target.value)}
                      className="w-full h-9 rounded-md border border-neutral-200 bg-white px-3 text-xs"
                    >
                      <option value="MENTENANTA_PREVENTIVA">Mentenanță Preventivă</option>
                      <option value="DEFECTIUNE">Defecțiune Semnalată</option>
                      <option value="REPARATIE">Reparație / Piese Schimb</option>
                      <option value="CALIBRARE">Calibrare / Ajustare Parametri</option>
                      <option value="INSTALARE_SOFTWARE">Actualizare Software/Firmware</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Stare Nouă Rezultată</label>
                    <select
                      value={logState}
                      onChange={(e) => setLogState(e.target.value as StareTehnica)}
                      className="w-full h-9 rounded-md border border-neutral-200 bg-white px-3 text-xs"
                    >
                      <option value="DISPONIBILA">Disponibilă (Operațională)</option>
                      <option value="IN_MENTENANTA">În Mentenanță</option>
                      <option value="DEFECTA">Defectă (Inoperabilă)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Descriere Detaliată a Intervenției
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Specificați ce operațiuni au fost realizate sau ce probleme au fost constatate..."
                    value={logDesc}
                    onChange={(e) => setLogDesc(e.target.value)}
                    className="w-full text-xs rounded-md border border-neutral-200 p-2.5 focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="text-xs"
                  >
                    Anulează
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !logDesc.trim()}
                    className="bg-black hover:bg-neutral-800 text-white text-xs"
                  >
                    {isSubmitting ? "Se înregistrează..." : "Salvează Eveniment"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
export default TechnicalHistoryPage
