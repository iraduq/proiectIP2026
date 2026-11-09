import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { AppLayout } from "../components/layout/AppLayout"
import { useAuth } from "../context/AuthContext"
import { reservationsApi } from "../api/reservations"
import {
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Card } from "../components/ui/card"

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
  imageUrl: string
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
    imageUrl: "https://images.unsplash.com/photo-1631556097152-c39479cbfeab?auto=format&fit=crop&w=800&q=80",
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
    imageUrl: "https://images.unsplash.com/photo-1563206767-5b18f218e8de?auto=format&fit=crop&w=800&q=80",
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
    imageUrl: "https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=800&q=80",
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
          imageUrl: "https://images.unsplash.com/photo-1631556097152-c39479cbfeab?auto=format&fit=crop&w=800&q=80",
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
    <AppLayout breadcrumbs={["Spațiu de lucru", "Aprobări studenți"]}>
      <div className="space-y-6 max-w-7xl mx-auto w-full">
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-5">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-neutral-900">
                  Aprobări studenți
                </h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-black text-white">
                  {pendingList.length} în așteptare
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Verifică scopul și acordă acces la resursele solicitate. Decizia nu creează o rezervare.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("pending")}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  activeTab === "pending"
                    ? "bg-neutral-200/80 text-neutral-900"
                    : "text-neutral-500 hover:text-black hover:bg-neutral-100"
                }`}
              >
                În așteptare ({pendingList.length})
              </button>
              <button
                onClick={() => setActiveTab("resolved")}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  activeTab === "resolved"
                    ? "bg-neutral-200/80 text-neutral-900"
                    : "text-neutral-500 hover:text-black hover:bg-neutral-100"
                }`}
              >
                Soluționate
              </button>
            </div>

            <div className="space-y-3">
              {displayedList.length === 0 ? (
                <div className="p-8 text-center text-xs text-neutral-400 bg-white border border-neutral-200 rounded-2xl">
                  Nu există cereri în această secțiune.
                </div>
              ) : (
                displayedList.map((req) => {
                  const isSelected = req.id === selectedRequest?.id
                  return (
                    <div
                      key={req.id}
                      onClick={() => setSelectedId(req.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer bg-white space-y-2.5 ${
                        isSelected
                          ? "border-neutral-400 shadow-xs"
                          : "border-neutral-200 hover:border-neutral-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-neutral-900">{req.studentName}</span>
                        <span className="text-[11px] text-neutral-400">
                          {isSelected ? "Selectată" : req.isDemo ? "Exemplu UI" : req.dateStr}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <div className="font-semibold text-xs text-neutral-900">
                          {req.resourceName}
                        </div>
                        <div className="text-[11px] text-neutral-400 font-mono">
                          {req.inventoryCode} · {req.roomName}
                        </div>
                        <div className="text-[11px] text-neutral-500 pt-0.5">
                          <span>Scop: </span>
                          <span>{req.purpose}</span>
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          <span>Interval: </span>
                          <span>{req.dateStr} · {req.timeRange}</span>
                        </div>
                      </div>

                      <div className="pt-1 flex items-center gap-2">
                        {isSelected ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs bg-white text-neutral-900 border-neutral-300 hover:bg-neutral-50"
                          >
                            Cerere deschisă
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleApprove(req.id)
                            }}
                            className="h-7 text-xs bg-white text-neutral-900 border-neutral-300 hover:bg-neutral-50"
                          >
                            Aprobă
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedId(req.id)
                          }}
                          className="h-7 text-xs text-neutral-600 hover:text-black hover:bg-neutral-50"
                        >
                          Respinge cu motiv
                        </Button>
                      </div>
                    </div>
                  )
                })
              )}

              <div className="pt-2 text-[11px] text-neutral-400 text-center leading-snug">
                Solicitanții demonstrativi sunt exemple de interfață; nu reprezintă persoane reale.
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            {selectedRequest ? (
              <Card className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-xs space-y-4">
                <div className="flex items-start justify-between border-b border-neutral-100 pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-neutral-900">Examinează cererea</h2>
                    <p className="text-[11px] text-neutral-500 mt-0.5">Acces la resursă · cerere în așteptare</p>
                  </div>
                  <button onClick={() => navigate("/professor")} className="text-neutral-400 hover:text-neutral-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <Badge variant="secondary" className="bg-neutral-100 text-neutral-800 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                    În așteptare
                  </Badge>
                  <span className="text-[11px] text-neutral-400">22 octombrie 2026</span>
                </div>

                <div className="rounded-xl overflow-hidden h-44 bg-neutral-900 border border-neutral-200">
                  <img
                    src={selectedRequest.imageUrl}
                    alt={selectedRequest.resourceName}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <h3 className="font-bold text-sm text-neutral-900 leading-tight">
                    {selectedRequest.resourceName}
                  </h3>
                  <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                    {selectedRequest.inventoryCode} · {selectedRequest.roomName}
                  </div>
                </div>

                <div className="space-y-3 pt-1 text-xs">
                  <div>
                    <span className="text-[11px] text-neutral-400 block mb-0.5">Student</span>
                    <span className="font-semibold text-neutral-900">{selectedRequest.studentName}</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-neutral-400 block mb-0.5">Scopul solicitării</span>
                    <span className="font-semibold text-neutral-900">{selectedRequest.purpose}</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-neutral-400 block mb-0.5">Interval solicitat</span>
                    <span className="font-semibold text-neutral-900">{selectedRequest.dateStr} · {selectedRequest.timeRange}</span>
                  </div>

                  {selectedRequest.status === "RESPINSA" && selectedRequest.rejectionReason && (
                    <div>
                      <span className="text-[11px] text-rose-500 block mb-0.5">Motivul respingerii</span>
                      <span className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-100 block">
                        {selectedRequest.rejectionReason}
                      </span>
                    </div>
                  )}

                  {selectedRequest.status === "IN_ASTEPTARE" && (
                    <div className="space-y-1.5 pt-1">
                      <label className="block text-xs font-semibold text-neutral-900">
                        Motivul respingerii
                      </label>
                      <textarea
                        rows={3}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Scrie motivul pentru student…"
                        className="w-full text-xs p-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-black resize-none placeholder:text-neutral-400"
                      />
                      <p className="text-[10px] text-neutral-400 leading-snug">
                        Obligatoriu pentru „Respinge cu motiv”. Nu este necesar pentru aprobare.
                      </p>

                      <div className="pt-2 space-y-2">
                        <Button
                          onClick={() => handleApprove(selectedRequest.id)}
                          className="w-full bg-black hover:bg-neutral-800 text-white text-xs h-10 rounded-xl font-semibold shadow-xs"
                        >
                          Aprobă accesul
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleReject(selectedRequest.id)}
                          className="w-full border-neutral-300 text-neutral-900 hover:bg-neutral-50 text-xs h-10 rounded-xl font-medium"
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
