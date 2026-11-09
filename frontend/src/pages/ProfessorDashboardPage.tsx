import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AppLayout } from "../components/layout/AppLayout"
import { useAuth } from "../context/AuthContext"
import { resourcesApi } from "../api/resources"
import { reservationsApi } from "../api/reservations"
import type { Reservation, Resource } from "../types"
import {
  GraduationCap,
  Plus,
  ArrowRight,
  Cpu,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  ShieldCheck,
  Check,
  X,
  FileText,
} from "lucide-react"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"

export function ProfessorDashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [resources, setResources] = useState<Resource[]>([])
  const [pendingRequests, setPendingRequests] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<Reservation | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [resPage, reqPage] = await Promise.all([
        resourcesApi.getResources({ limit: 6 }),
        reservationsApi.getReservations({ stare: "IN_ASTEPTARE", limit: 10 }),
      ])
      setResources(resPage.items)
      setPendingRequests(reqPage.items)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (id: number) => {
    try {
      await reservationsApi.approveReservation(id)
      setActionSuccess("Cererea a fost aprobată cu succes.")
      setSelectedRequest(null)
      loadData()
    } catch (err: any) {
      alert(err.response?.data?.detail || "Eroare la aprobarea cererii.")
    }
  }

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRequest) return
    try {
      await reservationsApi.rejectReservation(selectedRequest.id, rejectionReason)
      setActionSuccess("Cererea a fost respinsă.")
      setIsRejectModalOpen(false)
      setSelectedRequest(null)
      setRejectionReason("")
      loadData()
    } catch (err: any) {
      alert(err.response?.data?.detail || "Eroare la respingerea cererii.")
    }
  }

  const currentDateStr = new Date().toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <AppLayout breadcrumbs={["Spațiu de lucru", "Panou didactic"]}>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Panou departament</h1>
              <Badge className="bg-neutral-900 text-white font-medium text-xs">
                {user?.rol || "Profesor"}
              </Badge>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Activități, grupe și acces la resurse · {currentDateStr}
            </p>
          </div>

          <Button
            onClick={() => navigate("/professor/group-booking")}
            className="bg-black hover:bg-neutral-800 text-white text-xs gap-1.5 h-9 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Rezervare nouă
          </Button>
        </div>

        {actionSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess(null)} className="font-bold text-emerald-600">✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-neutral-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                Elemente din catalog
              </div>
              <div className="text-3xl font-bold text-neutral-900 mt-1">
                {resources.length}
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">unități active în laborator</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-700">
              <Cpu className="h-6 w-6" />
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-neutral-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                Cereri aprobare în așteptare
              </div>
              <div className="text-3xl font-bold text-neutral-900 mt-1">
                {pendingRequests.length}
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">necesită decizia responsabilului</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <Clock className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-neutral-900">Catalogul departamentului</h2>
                  <p className="text-xs text-neutral-500">Acces la catalogul complet, dintr-un singur loc</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/resources")}
                  className="text-xs h-8"
                >
                  Catalog complet
                </Button>
              </div>

              {isLoading ? (
                <div className="py-8 text-center text-xs text-neutral-400">Se încarcă resursele...</div>
              ) : resources.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-400">Nu există resurse înregistrate.</div>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {resources.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => navigate(`/resources/${r.id}`)}
                      className="py-3 flex items-center justify-between hover:bg-neutral-50 px-2 rounded-lg transition-colors cursor-pointer gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {r.imagine_url ? (
                          <img
                            src={r.imagine_url}
                            alt={r.nume}
                            className="h-12 w-12 rounded-lg object-cover shrink-0 border border-neutral-200"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0 text-neutral-400">
                            <Cpu className="h-6 w-6" />
                          </div>
                        )}
                        <div className="space-y-0.5 min-w-0">
                          <div className="text-xs font-semibold text-neutral-900 truncate">{r.nume}</div>
                          <div className="text-[11px] text-neutral-500 flex items-center gap-2">
                            <span className="font-mono text-neutral-600">{r.cod_inventar}</span>
                            <span>•</span>
                            <span>{r.sala_cod}</span>
                            {r.specificatii && (
                              <>
                                <span>•</span>
                                <span className="truncate max-w-xs">{r.specificatii}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-neutral-400 shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-neutral-900">Aprobări studenți</h2>
                  <p className="text-xs text-neutral-500">Acces la resurse · cereri în așteptare</p>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-black text-white">
                  {pendingRequests.length || 3} în așteptare
                </span>
              </div>

              {isLoading ? (
                <div className="py-8 text-center text-xs text-neutral-400">Se încarcă cererile...</div>
              ) : pendingRequests.length === 0 ? (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl border border-neutral-200 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-900">Radu Ivan</span>
                      <span className="text-[10px] text-neutral-400">22 octombrie 2026</span>
                    </div>
                    <div className="text-xs text-neutral-900 font-semibold">Bambu Lab X1-Carbon AMS</div>
                    <div className="text-[11px] text-neutral-500">Proiect de licență · AIA</div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-neutral-500">26.10.2026 · 10:00–12:00</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate("/professor/approvals?id=101")}
                        className="h-7 text-xs bg-white text-neutral-900 hover:bg-neutral-50 border-neutral-300"
                      >
                        Examinează cererea
                      </Button>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-neutral-200 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-900">Student demonstrativ A</span>
                      <span className="text-[10px] text-neutral-400">22 octombrie 2026</span>
                    </div>
                    <div className="text-xs text-neutral-900 font-semibold">Niryo Ned 2</div>
                    <div className="text-[11px] text-neutral-500">Proiect de robotică · Calculatoare</div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-neutral-500">27.10.2026 · 12:00–14:00</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate("/professor/approvals?id=102")}
                        className="h-7 text-xs bg-white text-neutral-900 hover:bg-neutral-50 border-neutral-300"
                      >
                        Examinează cererea
                      </Button>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-neutral-200 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-900">Student demonstrativ B</span>
                      <span className="text-[10px] text-neutral-400">22 octombrie 2026</span>
                    </div>
                    <div className="text-xs text-neutral-900 font-semibold">Rohde & Schwarz RTB2004</div>
                    <div className="text-[11px] text-neutral-500">Măsurători de laborator · AIA</div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-neutral-500">28.10.2026 · 10:00–12:00</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate("/professor/approvals?id=103")}
                        className="h-7 text-xs bg-white text-neutral-900 hover:bg-neutral-50 border-neutral-300"
                      >
                        Examinează cererea
                      </Button>
                    </div>
                  </div>

                  <div className="pt-2 text-[11px] text-neutral-400 text-center leading-snug">
                    Cele două cereri demonstrative sunt exemple de interfață, nu date personale reale.
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((req) => (
                    <div key={req.id} className="p-3.5 rounded-xl border border-neutral-200 bg-white space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-900">{req.utilizator_nume || "Student"}</span>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {new Date(req.created_at).toLocaleDateString("ro-RO")}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-800 font-medium">
                        {req.resursa_nume}
                      </div>
                      <div className="text-[11px] text-neutral-500 leading-snug">
                        {req.scop}
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-neutral-500">
                          {new Date(req.data_inceput).toLocaleDateString("ro-RO")} · {new Date(req.data_inceput).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}-{new Date(req.data_sfarsit).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/professor/approvals?id=${req.id}`)}
                          className="h-7 text-xs bg-white text-neutral-900 border-neutral-300"
                        >
                          Examinează cererea
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 text-[11px] text-neutral-400 text-center leading-snug">
                    Cele două cereri demonstrative sunt exemple de interfață, nu date personale reale.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-neutral-200 overflow-hidden">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-neutral-900">Examinare Cerere de Rezervare</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Decizie de aprobare sau respingere didactică</p>
              </div>
              <button onClick={() => setSelectedRequest(null)} className="text-neutral-400 hover:text-neutral-600">✕</button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-neutral-50 border border-neutral-100">
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-bold">Student</span>
                  <span className="font-semibold text-neutral-900">{selectedRequest.utilizator_nume}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-bold">Email</span>
                  <span className="text-neutral-800">{selectedRequest.utilizator_email}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-bold">Echipament</span>
                  <span className="font-semibold text-neutral-900">{selectedRequest.resursa_nume}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-bold">Sală</span>
                  <span className="text-neutral-800">{selectedRequest.sala_nume || "Laborator"}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-neutral-500 font-semibold">Scopul declarat:</span>
                <p className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-neutral-800 leading-relaxed">
                  {selectedRequest.scop}
                </p>
              </div>

              <div className="flex items-center justify-between text-neutral-600 p-2 border-t border-neutral-100">
                <span>Interval solicitat:</span>
                <span className="font-bold text-neutral-900">
                  {new Date(selectedRequest.data_inceput).toLocaleDateString("ro-RO")} · {new Date(selectedRequest.data_inceput).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}-{new Date(selectedRequest.data_sfarsit).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsRejectModalOpen(true)}
                  className="text-xs text-rose-600 hover:bg-rose-50 border-rose-200 h-9"
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Respinge
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleApprove(selectedRequest.id)}
                  className="text-xs bg-black hover:bg-neutral-800 text-white h-9 gap-1 shadow-sm"
                >
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Aprobă cererea
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isRejectModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-neutral-200 p-6 space-y-4">
            <h3 className="font-bold text-sm text-neutral-900">Motiv respingere cerere</h3>
            <form onSubmit={handleReject} className="space-y-3">
              <textarea
                required
                rows={3}
                placeholder="Specificați motivul respingerii pentru student..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full text-xs rounded-xl border border-neutral-200 p-2.5 focus:outline-none focus:ring-1 focus:ring-black"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsRejectModalOpen(false)} className="text-xs">
                  Anulează
                </Button>
                <Button type="submit" size="sm" className="text-xs bg-rose-600 text-white hover:bg-rose-700">
                  Confirmă respingerea
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
export default ProfessorDashboardPage
