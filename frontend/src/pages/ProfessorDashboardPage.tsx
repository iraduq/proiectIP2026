import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AppLayout } from "../components/layout/AppLayout"
import { useAuth } from "../context/AuthContext"
import { resourcesApi } from "../api/resources"
import { reservationsApi } from "../api/reservations"
import type { Resource, Reservation } from "../types"
import {
  Plus,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"

const DEMO_CATALOG_ITEMS = [
  {
    id: 1,
    nume: "Braț Robotic Educațional Niryo Ned 2",
    cod_inventar: "INV-USV-2026-088",
    sala_cod: "Lab 208",
    specs: "6 axe, ROS2",
    imagine_url: "https://images.unsplash.com/photo-1563206767-5b18f218e8de?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    nume: "Kit NVIDIA Jetson Orin Nano Dev Kit",
    cod_inventar: "INV-USV-2026-102",
    sala_cod: "Lab 210",
    specs: "40 TOPS",
    imagine_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    nume: "Osciloscop Digital Rohde & Schwarz RTB2004",
    cod_inventar: "INV-USV-2026-215",
    sala_cod: "Lab 105",
    specs: "300MHz",
    imagine_url: "https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=800&q=80",
  },
]

const DEMO_APPROVALS = [
  {
    id: 101,
    studentName: "Radu Ivan",
    resourceName: "Bambu Lab X1-Carbon AMS",
    scope: "Proiect de licență · AIA",
    timeRange: "26.10.2026 · 10:00–12:00",
  },
  {
    id: 102,
    studentName: "Mircea Marius",
    resourceName: "Niryo Ned 2",
    scope: "Proiect de robotică · Calculatoare",
    timeRange: "27.10.2026 · 12:00–14:00",
  },
  {
    id: 103,
    studentName: "Stelica Vali",
    resourceName: "Rohde & Schwarz RTB2004",
    scope: "Măsurători de laborator · AIA",
    timeRange: "28.10.2026 · 10:00–12:00",
  },
]

export function ProfessorDashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [resources, setResources] = useState<Resource[]>([])
  const [pendingRequests, setPendingRequests] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<Reservation | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isActing, setIsActing] = useState(false)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      const [resData, reqData] = await Promise.all([
        resourcesApi.getResources({ limit: 16 }),
        reservationsApi.getReservations({ stare: "IN_ASTEPTARE", limit: 10 }),
      ])
      setResources(resData.items)
      setPendingRequests(reqData.items)
    } catch {
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (id: number) => {
    setIsActing(true)
    setActionError(null)
    try {
      await reservationsApi.approveReservation(id)
      setActionSuccess("Rezervarea a fost aprobată.")
      setSelectedRequest(null)
      loadDashboardData()
    } catch (err: any) {
      setActionError(err.response?.data?.detail || "Eroare la aprobare.")
    } finally {
      setIsActing(false)
    }
  }

  const handleReject = async (id: number) => {
    if (!rejectionReason.trim()) {
      setActionError("Motivul respingerii este obligatoriu.")
      return
    }
    setIsActing(true)
    setActionError(null)
    try {
      await reservationsApi.rejectReservation(id, rejectionReason.trim())
      setActionSuccess("Rezervarea a fost respinsă.")
      setSelectedRequest(null)
      setRejectionReason("")
      loadDashboardData()
    } catch (err: any) {
      setActionError(err.response?.data?.detail || "Eroare la respingere.")
    } finally {
      setIsActing(false)
    }
  }

  const displayCatalog = resources.length >= 3 ? resources.slice(0, 3) : DEMO_CATALOG_ITEMS

  return (
    <AppLayout breadcrumbs={["Spațiu de lucru", "Panou didactic"]}>
      <div className="space-y-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                Panou departament
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-xs font-semibold">
                Profesor
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Activități, grupe și acces la resurse · 22 octombrie 2026
            </p>
          </div>

          <Button
            onClick={() => navigate("/professor/group-booking")}
            className="bg-black hover:bg-neutral-800 text-white text-xs gap-1.5 h-9 rounded-lg font-semibold shadow-xs shrink-0"
          >
            <Plus className="h-4 w-4" />
            Rezervare nouă
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {user?.nume ? user.nume.charAt(0).toUpperCase() : "M"}
            </div>
            <div>
              <div className="font-bold text-xs text-neutral-900">
                {user?.nume || "Conf. dr. ing. Mihai Popescu"}
              </div>
              <div className="text-[11px] text-neutral-500">Profesor</div>
            </div>
          </div>
          <div className="text-xs text-neutral-500">
            Pentru activitate didactică / grupă
          </div>
        </div>

        {actionSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess(null)} className="font-bold text-emerald-700">✕</button>
          </div>
        )}

        {actionError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span className="font-medium">{actionError}</span>
            </div>
            <button onClick={() => setActionError(null)} className="font-bold text-rose-700">✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-xs space-y-1">
            <div className="text-xs text-neutral-500">
              Elemente din catalog
            </div>
            <div className="text-3xl font-bold text-neutral-900">
              {resources.length || 16}
            </div>
            <div className="text-xs text-neutral-500 pt-0.5">unități active</div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-xs space-y-1">
            <div className="text-xs text-neutral-500">
              Cereri aprobare în așteptare
            </div>
            <div className="text-3xl font-bold text-neutral-900">
              {pendingRequests.length || 3}
            </div>
            <div className="text-xs text-neutral-500 pt-0.5">necesită decizia profesorului</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-2">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-neutral-900">Catalogul departamentului</h2>
                <p className="text-xs text-neutral-500">Acces la catalogul complet, dintr-un singur loc.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/resources")}
                className="text-xs h-8 border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-900 font-medium rounded-lg"
              >
                Catalog complet
              </Button>
            </div>

            <div className="space-y-4 pt-1">
              {displayCatalog.map((r: any) => (
                <div
                  key={r.id}
                  onClick={() => navigate(`/resources/${r.id}`)}
                  className="p-3 bg-white hover:bg-neutral-50/80 rounded-xl transition-colors cursor-pointer flex items-center gap-4"
                >
                  <div className="h-14 w-14 rounded-lg bg-neutral-900/5 border border-neutral-200 overflow-hidden shrink-0 flex items-center justify-center p-1">
                    {r.imagine_url ? (
                      <img
                        src={r.imagine_url}
                        alt={r.nume}
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      <div className="text-neutral-400 font-bold text-xs">RRM</div>
                    )}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <div className="text-xs font-bold text-neutral-900 leading-tight truncate">
                      {r.nume}
                    </div>
                    <div className="text-[11px] text-neutral-500 font-mono">
                      {r.specs ? `${r.specs} · ` : ""}{r.cod_inventar} · {r.sala_cod}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h2 className="text-sm font-bold text-neutral-900">Aprobări studenți</h2>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-black text-white">
                {pendingRequests.length || 3} în așteptare
              </span>
            </div>

            <div className="space-y-4 pt-1">
              {pendingRequests.length > 0 ? (
                pendingRequests.map((req) => (
                  <div key={req.id} className="p-4 rounded-xl border border-neutral-200 bg-white space-y-2 shadow-2xs">
                    <div className="text-xs font-bold text-neutral-900">{req.utilizator_nume || "Student"}</div>
                    <div className="text-xs text-neutral-800 font-semibold">{req.resursa_nume}</div>
                    <div className="text-[11px] text-neutral-500 leading-snug">{req.scop}</div>
                    <div className="text-[11px] text-neutral-500">
                      {req.data_inceput ? `${new Date(req.data_inceput).toLocaleDateString("ro-RO")} · ${new Date(req.data_inceput).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}–${new Date(req.data_sfarsit).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}` : "26.10.2026 · 10:00–12:00"}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/professor/approvals?id=${req.id}`)}
                      className="w-full h-8 text-xs bg-white text-neutral-900 hover:bg-neutral-50 border-neutral-200 font-medium rounded-lg mt-2"
                    >
                      Examinează cererea
                    </Button>
                  </div>
                ))
              ) : (
                DEMO_APPROVALS.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl border border-neutral-200 bg-white space-y-2 shadow-2xs">
                    <div className="text-xs font-bold text-neutral-900">{item.studentName}</div>
                    <div className="text-xs text-neutral-800 font-semibold">{item.resourceName}</div>
                    <div className="text-[11px] text-neutral-500 leading-snug">{item.scope}</div>
                    <div className="text-[11px] text-neutral-500">{item.timeRange}</div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/professor/approvals?id=${item.id}`)}
                      className="w-full h-8 text-xs bg-white text-neutral-900 hover:bg-neutral-50 border-neutral-200 font-medium rounded-lg mt-2"
                    >
                      Examinează cererea
                    </Button>
                  </div>
                ))
              )}

              <div className="pt-2 text-[11px] text-neutral-400 text-center leading-snug">
                Cele două cereri demonstrative sunt exemple de interfață, nu date personale reale.
              </div>
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
              <button onClick={() => setSelectedRequest(null)} className="text-neutral-400 hover:text-neutral-600">
                <X className="h-4 w-4" />
              </button>
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
                  <span className="text-neutral-800">{selectedRequest.sala_nume}</span>
                </div>
              </div>

              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-bold mb-1">Scopul utilizării</span>
                <p className="text-neutral-800 bg-neutral-50 p-3 rounded-xl border border-neutral-100 leading-relaxed">
                  {selectedRequest.scop}
                </p>
              </div>

              <div>
                <span className="text-neutral-400 block text-[10px] uppercase font-bold mb-1">Interval solicitat</span>
                <p className="text-neutral-800 font-mono bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                  {new Date(selectedRequest.data_inceput).toLocaleDateString("ro-RO")} · {new Date(selectedRequest.data_inceput).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })} - {new Date(selectedRequest.data_sfarsit).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-semibold text-neutral-700">
                  Motiv respingere (opțional pentru respingere)
                </label>
                <textarea
                  rows={2}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Introduceți motivul respingerii..."
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-neutral-100">
                <Button
                  variant="outline"
                  onClick={() => handleReject(selectedRequest.id)}
                  disabled={isActing}
                  className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                >
                  Respinge cererea
                </Button>
                <Button
                  onClick={() => handleApprove(selectedRequest.id)}
                  disabled={isActing}
                  className="text-xs bg-black hover:bg-neutral-800 text-white"
                >
                  Aprobă cererea
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
export default ProfessorDashboardPage
