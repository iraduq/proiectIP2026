import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { AppLayout } from "../components/layout/AppLayout"
import { useAuth } from "../context/AuthContext"
import { reservationsApi } from "../api/reservations"
import type { Reservation } from "../types"
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  UserCheck,
  FileText,
  Calendar,
  Layers,
  Info,
} from "lucide-react"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Card, CardContent } from "../components/ui/card"

interface ApprovalItem {
  id: number
  studentName: string
  studentDetail: string
  resourceName: string
  inventoryCode: string
  roomName: string
  purpose: string
  dateStr: string
  timeRange: string
  status: "IN_ASTEPTARE" | "APROBATA" | "RESPINSA"
  rejectionReason?: string
  isDemo?: boolean
}

const INITIAL_DEMO_REQUESTS: ApprovalItem[] = [
  {
    id: 101,
    studentName: "Radu Ivan",
    studentDetail: "AIA · Anul III",
    resourceName: "Imprimantă 3D Bambu Lab X1-Carbon AMS",
    inventoryCode: "INV-USV-2026-041",
    roomName: "Lab Prototipare",
    purpose: "Proiect de licență",
    dateStr: "26.10.2026",
    timeRange: "10:00–12:00",
    status: "IN_ASTEPTARE",
  },
  {
    id: 102,
    studentName: "Marius Mitica",
    studentDetail: "Calculatoare · Anul IV",
    resourceName: "Braț Robotic Educațional Niryo Ned 2",
    inventoryCode: "INV-USV-2026-088",
    roomName: "Lab 208",
    purpose: "Proiect de robotică",
    dateStr: "27.10.2026",
    timeRange: "12:00–14:00",
    status: "IN_ASTEPTARE",
    isDemo: true,
  },
  {
    id: 103,
    studentName: "Gica Hagi",
    studentDetail: "AIA · Anul II",
    resourceName: "Osciloscop Digital Rohde & Schwarz RTB2004",
    inventoryCode: "INV-USV-2026-215",
    roomName: "Lab 105",
    purpose: "Măsurători de laborator",
    dateStr: "28.10.2026",
    timeRange: "10:00–12:00",
    status: "IN_ASTEPTARE",
    isDemo: true,
  },
]

export function StudentApprovalsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()

  const [activeTab, setActiveTab] = useState<"pending" | "resolved">("pending")
  const [requests, setRequests] = useState<ApprovalItem[]>(INITIAL_DEMO_REQUESTS)
  const [selectedId, setSelectedId] = useState<number>(101)
  const [rejectionReason, setRejectionReason] = useState<string>("")
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    loadRealPending()
  }, [])

  useEffect(() => {
    const paramId = searchParams.get("id")
    if (paramId) {
      setSelectedId(Number(paramId))
    }
  }, [searchParams])

  const loadRealPending = async () => {
    try {
      const res = await reservationsApi.getReservations({ stare: "IN_ASTEPTARE", limit: 20 })
      if (res && res.items.length > 0) {
        const mapped: ApprovalItem[] = res.items.map((item) => ({
          id: item.id,
          studentName: item.utilizator_nume || "Student",
          studentDetail: item.numar_matricol || item.utilizator_email || "Student",
          resourceName: item.resursa_nume || "Echipament laborator",
          inventoryCode: item.resursa_cod || "INV-USV",
          roomName: item.sala_nume || "Laborator",
          purpose: item.scop,
          dateStr: item.data_inceput ? item.data_inceput.split("T")[0] : "2026-10-26",
          timeRange: `${item.data_inceput ? item.data_inceput.substring(11, 16) : "10:00"}–${
            item.data_sfarsit ? item.data_sfarsit.substring(11, 16) : "12:00"
          }`,
          status: "IN_ASTEPTARE",
        }))

        setRequests((prev) => {
          const existingIds = new Set(mapped.map((m) => m.id))
          const remainingDemo = prev.filter((p) => !existingIds.has(p.id))
          return [...mapped, ...remainingDemo]
        })

        if (mapped.length > 0) {
          setSelectedId(mapped[0].id)
        }
      }
    } catch {
    }
  }

  const selectedRequest = requests.find((r) => r.id === selectedId) || requests[0]

  const handleApprove = async (id: number) => {
    setActionError(null)
    try {
      if (id < 100) {
        await reservationsApi.approveReservation(id)
      }
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "APROBATA" } : r))
      )
      setActionSuccess("Cererea de acces a fost aprobată cu succes.")
      setRejectionReason("")
    } catch (err: any) {
      setActionError(err.response?.data?.detail || "Eroare la aprobarea cererii.")
    }
  }

  const handleReject = async (id: number) => {
    if (!rejectionReason.trim()) {
      setActionError("Motivul respingerii este obligatoriu pentru a respinge cererea.")
      return
    }
    setActionError(null)
    try {
      if (id < 100) {
        await reservationsApi.rejectReservation(id, rejectionReason.trim())
      }
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: "RESPINSA", rejectionReason: rejectionReason.trim() } : r
        )
      )
      setActionSuccess("Cererea a fost respinsă și studentul a fost notificat.")
      setRejectionReason("")
    } catch (err: any) {
      setActionError(err.response?.data?.detail || "Eroare la respingerea cererii.")
    }
  }

  const pendingList = requests.filter((r) => r.status === "IN_ASTEPTARE")
  const resolvedList = requests.filter((r) => r.status !== "IN_ASTEPTARE")
  const displayedList = activeTab === "pending" ? pendingList : resolvedList

  return (
    <AppLayout breadcrumbs={["Spațiu de lucru", "Aprobări studenți", "Examinează cererea"]}>
      <div className="space-y-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-neutral-900">
                Aprobări studenți
              </h1>
              <Badge variant="secondary" className="bg-neutral-100 text-neutral-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {pendingList.length} în așteptare
              </Badge>
            </div>
            <p className="text-xs text-neutral-500">
              Verifică scopul și acordă acces la resursele solicitate. Decizia nu creează o rezervare.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/professor")}
              className="text-xs h-8 border-neutral-300"
            >
              Panou departament
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/professor/group-booking")}
              className="text-xs h-8 bg-black hover:bg-neutral-800 text-white"
            >
              Rezervare nouă
            </Button>
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

        <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === "pending"
                ? "bg-black text-white"
                : "text-neutral-600 hover:text-black hover:bg-neutral-100"
            }`}
          >
            <span>În așteptare</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-white/20">
              {pendingList.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("resolved")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === "resolved"
                ? "bg-black text-white"
                : "text-neutral-600 hover:text-black hover:bg-neutral-100"
            }`}
          >
            <span>Soluționate</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-neutral-200 text-neutral-800">
              {resolvedList.length}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 space-y-3">
            {displayedList.length === 0 ? (
              <Card className="p-8 text-center text-xs text-neutral-400 bg-white border-neutral-200 rounded-2xl">
                Nu există cereri în această secțiune.
              </Card>
            ) : (
              displayedList.map((req) => {
                const isSelected = req.id === selectedRequest?.id
                return (
                  <Card
                    key={req.id}
                    onClick={() => setSelectedId(req.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer bg-white ${
                      isSelected
                        ? "border-black shadow-sm ring-1 ring-black"
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-neutral-900">{req.studentName}</span>
                          <span className="text-[11px] text-neutral-400">·</span>
                          <span className="text-[11px] text-neutral-500">{req.dateStr}</span>
                          {isSelected && (
                            <Badge variant="outline" className="text-[10px] font-medium border-neutral-300 bg-neutral-50">
                              Selectată
                            </Badge>
                          )}
                        </div>
                        <div className="font-semibold text-xs text-neutral-800">
                          {req.resourceName}
                        </div>
                        <div className="text-[11px] text-neutral-500 flex items-center gap-1.5">
                          <span className="font-mono text-neutral-600">{req.inventoryCode}</span>
                          <span>·</span>
                          <span>{req.roomName}</span>
                        </div>
                        <div className="text-[11px] text-neutral-600 pt-1">
                          <span className="font-medium text-neutral-700">Scop: </span>
                          <span>{req.purpose}</span>
                        </div>
                        <div className="text-[11px] text-neutral-600">
                          <span className="font-medium text-neutral-700">Interval: </span>
                          <span>{req.dateStr} · {req.timeRange}</span>
                        </div>
                      </div>

                      <div className="shrink-0 flex flex-col items-end gap-2">
                        {req.status === "IN_ASTEPTARE" ? (
                          <Badge variant="secondary" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                            În așteptare
                          </Badge>
                        ) : req.status === "APROBATA" ? (
                          <Badge variant="secondary" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                            Aprobată
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] bg-rose-50 text-rose-700 border-rose-200">
                            Respinsă
                          </Badge>
                        )}

                        {req.status === "IN_ASTEPTARE" && req.isDemo && (
                          <div className="flex items-center gap-1.5 pt-1">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleApprove(req.id)
                              }}
                              className="h-6 text-[10px] px-2 bg-black text-white hover:bg-neutral-800"
                            >
                              Aprobă
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedId(req.id)
                              }}
                              className="h-6 text-[10px] px-2 border-neutral-300"
                            >
                              Respinge
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })
            )}

            <div className="p-3 text-[11px] text-neutral-400 text-center">
              Solicitanții demonstrativi sunt exemple de interfață; nu reprezintă persoane reale.
            </div>
          </div>

          <div className="lg:col-span-6">
            {selectedRequest ? (
              <Card className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-neutral-900">Cerere deschisă</h2>
                    <p className="text-[11px] text-neutral-500">Examinare detaliată și decizie acces</p>
                  </div>
                  {selectedRequest.status === "IN_ASTEPTARE" ? (
                    <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                      În așteptare
                    </Badge>
                  ) : selectedRequest.status === "APROBATA" ? (
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                      Aprobată
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-rose-50 text-rose-700 border-rose-200 text-xs">
                      Respinsă
                    </Badge>
                  )}
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Student:</span>
                      <span className="font-semibold text-neutral-900">{selectedRequest.studentName} ({selectedRequest.studentDetail})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Echipament:</span>
                      <span className="font-semibold text-neutral-900">{selectedRequest.resourceName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Inventar / Sală:</span>
                      <span className="font-mono text-neutral-800">{selectedRequest.inventoryCode} · {selectedRequest.roomName}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="font-semibold text-neutral-700">Scopul solicitării:</span>
                    <p className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 text-neutral-800 leading-relaxed">
                      {selectedRequest.purpose}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="font-semibold text-neutral-700">Interval solicitat:</span>
                    <p className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 text-neutral-800 font-medium">
                      {selectedRequest.dateStr} · {selectedRequest.timeRange}
                    </p>
                  </div>

                  {selectedRequest.status === "RESPINSA" && selectedRequest.rejectionReason && (
                    <div className="space-y-1">
                      <span className="font-semibold text-rose-700">Motivul respingerii:</span>
                      <p className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-800">
                        {selectedRequest.rejectionReason}
                      </p>
                    </div>
                  )}

                  {selectedRequest.status === "IN_ASTEPTARE" && (
                    <div className="space-y-2 pt-2">
                      <label className="block font-semibold text-neutral-800">
                        Motivul respingerii
                      </label>
                      <textarea
                        rows={3}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Scrie motivul pentru student…"
                        className="w-full text-xs p-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-black resize-none"
                      />
                      <p className="text-[11px] text-neutral-400 leading-snug">
                        Obligatoriu pentru „Respinge cu motiv”. Nu este necesar pentru aprobare.
                      </p>

                      <div className="pt-3 flex flex-wrap items-center gap-3">
                        <Button
                          onClick={() => handleApprove(selectedRequest.id)}
                          className="bg-black hover:bg-neutral-800 text-white text-xs h-9 px-4 rounded-lg font-medium"
                        >
                          Aprobă accesul
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleReject(selectedRequest.id)}
                          className="border-neutral-300 text-rose-700 hover:bg-rose-50 text-xs h-9 px-4 rounded-lg font-medium"
                        >
                          Respinge cu motiv
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ) : null}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
