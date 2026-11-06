import { useState, useEffect } from "react"
import { AppLayout } from "../components/layout/AppLayout"
import { useAuth } from "../context/AuthContext"
import { reservationsApi } from "../api/reservations"
import type { Reservation, StareRezervare, StudentQuota } from "../types"
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Check,
  X,
  Filter,
  Search,
  RotateCcw,
  DoorOpen,
  Cpu,
  User as UserIcon,
  HelpCircle,
} from "lucide-react"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"

export function ReservationsPage() {
  const { user } = useAuth()

  const [reservations, setReservations] = useState<Reservation[]>([])
  const [quota, setQuota] = useState<StudentQuota | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"MY" | "MANAGEMENT">("MY")
  const [statusFilter, setStatusFilter] = useState<StareRezervare | "ALL">("ALL")
  const [search, setSearch] = useState("")
  const [rejectModalReservation, setRejectModalReservation] = useState<Reservation | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isRejecting, setIsRejecting] = useState(false)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  const isStudent = user?.rol === "STUDENT"
  const isStaff =
    user?.rol === "ADMINISTRATOR" ||
    user?.rol === "PROFESOR" ||
    user?.rol === "RESPONSABIL_LABORATOR"

  useEffect(() => {
    loadData()
  }, [activeTab, statusFilter])

  const loadData = async () => {
    setIsLoading(true)
    setActionSuccess(null)
    try {
      if (isStudent) {
        const [qRes, rRes] = await Promise.all([
          reservationsApi.getMyQuota(),
          reservationsApi.getReservations({
            stare: statusFilter !== "ALL" ? statusFilter : undefined,
            limit: 100,
          }),
        ])
        setQuota(qRes)
        setReservations(rRes.items)
      } else {
        const params: any = { limit: 100 }
        if (statusFilter !== "ALL") params.stare = statusFilter
        if (activeTab === "MY") params.utilizator_id = user?.id_utilizator

        const rRes = await reservationsApi.getReservations(params)
        setReservations(rRes.items)
      }
    } catch (err: any) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async (id: number, name: string) => {
    if (!confirm(`Sigur doriți să anulați rezervarea pentru „${name}”?`)) return
    try {
      await reservationsApi.cancelReservation(id)
      setActionSuccess("Rezervarea a fost anulată cu succes.")
      loadData()
    } catch (err: any) {
      alert(err.response?.data?.detail || "Eroare la anularea rezervării.")
    }
  }

  const handleApprove = async (id: number, name: string) => {
    try {
      await reservationsApi.approveReservation(id)
      setActionSuccess(`Rezervarea pentru „${name}” a fost aprobată.`)
      loadData()
    } catch (err: any) {
      alert(err.response?.data?.detail || "Eroare la aprobarea rezervării.")
    }
  }

  const handleOpenReject = (res: Reservation) => {
    setRejectModalReservation(res)
    setRejectionReason("")
  }

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectModalReservation) return
    setIsRejecting(true)
    try {
      await reservationsApi.rejectReservation(rejectModalReservation.id, rejectionReason)
      setActionSuccess(`Rezervarea pentru „${rejectModalReservation.resursa_nume}” a fost respinsă.`)
      setRejectModalReservation(null)
      loadData()
    } catch (err: any) {
      alert(err.response?.data?.detail || "Eroare la respingerea rezervării.")
    } finally {
      setIsRejecting(false)
    }
  }

  const handleReturn = async (id: number, name: string) => {
    if (!confirm(`Confirmați predarea și returul echipamentului „${name}”?`)) return
    try {
      await reservationsApi.returnReservation(id)
      setActionSuccess(`Returul pentru „${name}” a fost înregistrat cu succes.`)
      loadData()
    } catch (err: any) {
      alert(err.response?.data?.detail || "Eroare la finalizarea rezervării.")
    }
  }

  const getStatusBadge = (stare: StareRezervare) => {
    switch (stare) {
      case "IN_ASTEPTARE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="h-3.5 w-3.5" />
            În așteptare
          </span>
        )
      case "APROBATA":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Aprobată
          </span>
        )
      case "FINALIZATA":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Check className="h-3.5 w-3.5" />
            Finalizată / Returnată
          </span>
        )
      case "RESPINSA":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="h-3.5 w-3.5" />
            Respinsă
          </span>
        )
      case "ANULATA":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200">
            <RotateCcw className="h-3.5 w-3.5" />
            Anulată
          </span>
        )
    }
  }

  const filteredReservations = reservations.filter((r) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      r.resursa_nume?.toLowerCase().includes(q) ||
      r.resursa_cod?.toLowerCase().includes(q) ||
      r.utilizator_nume?.toLowerCase().includes(q) ||
      r.scop?.toLowerCase().includes(q)
    )
  })

  return (
    <AppLayout breadcrumbs={["Spațiu de lucru", "Rezervări"]}>
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2.5">
              <Calendar className="h-6 w-6 text-neutral-800" />
              Gestiune Rezervări Echipamente
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Programări, cereri de împrumut, aprobări didactice și urmărirea termenelor de restituire.
            </p>
          </div>
        </div>

        {/* Action success message */}
        {actionSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess(null)} className="text-emerald-600 hover:text-emerald-800 font-bold">
              ✕
            </button>
          </div>
        )}

        {/* Student Quota Info Card */}
        {isStudent && quota && (
          <div className="p-5 rounded-2xl bg-neutral-900 text-white shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                  Cota Ta de Rezervare
                </div>
                <div className="text-2xl font-bold mt-0.5">
                  {quota.active_count} / {quota.max_limit} resurse active
                </div>
              </div>
              <div className="text-xs text-neutral-300 max-w-md bg-neutral-800 p-3 rounded-xl border border-neutral-700">
                <div className="font-semibold text-white flex items-center gap-1.5 mb-1">
                  <HelpCircle className="h-3.5 w-3.5 text-neutral-400" />
                  Reguli academice de împrumut:
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-neutral-400">
                  <li>Maximum 4 echipamente simultan per student</li>
                  <li>Nu puteți rezerva două resurse din aceeași categorie în același timp</li>
                  <li>Rezervările sunt supuse aprobării de către profesor sau responsabilul de laborator</li>
                </ul>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-neutral-800 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  quota.active_count >= quota.max_limit ? "bg-rose-500" : "bg-emerald-400"
                }`}
                style={{ width: `${(quota.active_count / quota.max_limit) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Staff Tabs */}
        {isStaff && (
          <div className="flex border-b border-neutral-200 gap-4">
            <button
              onClick={() => setActiveTab("MY")}
              className={`pb-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                activeTab === "MY"
                  ? "border-black text-black"
                  : "border-transparent text-neutral-500 hover:text-neutral-900"
              }`}
            >
              Rezervările mele
            </button>
            <button
              onClick={() => setActiveTab("MANAGEMENT")}
              className={`pb-3 text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center gap-2 ${
                activeTab === "MANAGEMENT"
                  ? "border-black text-black"
                  : "border-transparent text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <span>Aprobare & Gestiune Cereri</span>
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-neutral-100 text-neutral-800 font-bold">
                {reservations.filter((r) => r.stare === "IN_ASTEPTARE").length} în așteptare
              </span>
            </button>
          </div>
        )}

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-neutral-200 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Caută în rezervări după echipament, utilizator, scop..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 h-9 text-xs rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-500">Stare:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-9 px-3 rounded-lg border border-neutral-200 bg-white text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="ALL">Toate stările</option>
              <option value="IN_ASTEPTARE">În așteptare</option>
              <option value="APROBATA">Aprobate</option>
              <option value="FINALIZATA">Finalizate</option>
              <option value="RESPINSA">Respinse</option>
              <option value="ANULATA">Anulate</option>
            </select>
          </div>
        </div>

        {/* Reservations Table */}
        <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-neutral-500 space-y-3">
              <div className="h-7 w-7 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div className="text-xs font-medium">Se încarcă rezervările...</div>
            </div>
          ) : filteredReservations.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                <Calendar className="h-6 w-6" />
              </div>
              <div className="font-semibold text-neutral-800 text-sm">Nicio rezervare găsită</div>
              <div className="text-xs text-neutral-500 max-w-sm mx-auto">
                Nu există rezervări înregistrate care să corespundă filtrului selectat.
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Echipament & Locație</th>
                    <th className="py-3.5 px-4">Solicitant</th>
                    <th className="py-3.5 px-4">Interval Orar Rezervare</th>
                    <th className="py-3.5 px-4">Scop Didactic / Cercetare</th>
                    <th className="py-3.5 px-4">Stare</th>
                    <th className="py-3.5 px-4 text-right">Acțiuni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-800">
                  {filteredReservations.map((r) => (
                    <tr key={r.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-neutral-900">{r.resursa_nume}</div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-neutral-500 font-mono">
                          <span>{r.resursa_cod}</span>
                          {r.sala_nume && <span>• Sala {r.sala_nume}</span>}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-neutral-900">{r.utilizator_nume}</div>
                        <div className="text-[11px] text-neutral-500">
                          {r.numar_matricol ? `Matricol: ${r.numar_matricol}` : r.utilizator_email}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-neutral-900">
                          {new Date(r.data_inceput).toLocaleDateString("ro-RO", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          până la{" "}
                          {new Date(r.data_sfarsit).toLocaleDateString("ro-RO", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="text-neutral-700 leading-snug line-clamp-2">{r.scop}</div>
                        {r.motiv_respingere && (
                          <div className="text-[11px] text-rose-600 font-medium mt-1">
                            Motiv respingere: {r.motiv_respingere}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(r.stare)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Student or owner cancel */}
                          {(r.stare === "IN_ASTEPTARE" || r.stare === "APROBATA") &&
                            (r.utilizator_id === user?.id_utilizator || user?.rol === "ADMINISTRATOR") && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancel(r.id, r.resursa_nume || "Resursă")}
                                className="h-8 text-xs text-neutral-600 hover:text-rose-600"
                              >
                                Anulează
                              </Button>
                            )}

                          {/* Staff Management actions */}
                          {isStaff && activeTab === "MANAGEMENT" && (
                            <>
                              {r.stare === "IN_ASTEPTARE" && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleApprove(r.id, r.resursa_nume || "Resursă")}
                                    className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                    Aprobă
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleOpenReject(r)}
                                    className="h-8 text-xs text-rose-600 hover:bg-rose-50 border-rose-200 gap-1"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                    Respinge
                                  </Button>
                                </>
                              )}

                              {r.stare === "APROBATA" && (
                                <Button
                                  size="sm"
                                  onClick={() => handleReturn(r.id, r.resursa_nume || "Resursă")}
                                  className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  Confirmă Retur
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Respingere Rezervare */}
        {rejectModalReservation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-neutral-200 overflow-hidden">
              <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
                <h3 className="font-bold text-base text-neutral-900 flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-rose-600" />
                  Respinge Cererea de Rezervare
                </h3>
                <button
                  onClick={() => setRejectModalReservation(null)}
                  className="text-neutral-400 hover:text-neutral-600 text-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleConfirmReject} className="p-6 space-y-4">
                <div className="text-xs text-neutral-600">
                  Specificați motivul pentru care cererea studentului{" "}
                  <span className="font-semibold text-neutral-900">
                    {rejectModalReservation.utilizator_nume}
                  </span>{" "}
                  este respinsă:
                </div>
                <div>
                  <textarea
                    required
                    rows={3}
                    placeholder="ex: Echipamentul este rezervat pentru o sesiune de laborator didactic..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full text-xs rounded-md border border-neutral-200 p-2.5 focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setRejectModalReservation(null)}
                    className="text-xs"
                  >
                    Anulează
                  </Button>
                  <Button
                    type="submit"
                    disabled={isRejecting || !rejectionReason.trim()}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs"
                  >
                    {isRejecting ? "Se respinge..." : "Confirmă Respingerea"}
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
export default ReservationsPage
