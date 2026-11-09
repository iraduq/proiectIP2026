import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { AppLayout } from "../components/layout/AppLayout"
import { reservationsApi } from "../api/reservations"
import { CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Card } from "../components/ui/card"
import { Textarea } from "../components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "../components/ui/sheet"

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
    imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80",
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
    imageUrl: "https://images.unsplash.com/photo-1563206767-5b18f218e8de?auto=format&fit=crop&w=900&q=80",
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
    imageUrl: "https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=900&q=80",
    status: "IN_ASTEPTARE",
    isDemo: true,
  },
]

export function StudentApprovalsPage() {
  const [searchParams] = useSearchParams()

  const [activeTab, setActiveTab] = useState<"pending" | "resolved">("pending")
  const [requests, setRequests] = useState<ApprovalItem[]>(INITIAL_DEMO_REQUESTS)
  const [selectedId, setSelectedId] = useState<number | null>(101)
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
      if (res.items && res.items.length > 0) {
        const mapped: ApprovalItem[] = res.items.map((item) => {
          const dStart = new Date(item.data_inceput)
          const dEnd = new Date(item.data_sfarsit)
          const dateFormatted = dStart.toLocaleDateString("ro-RO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
          const tStart = dStart.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })
          const tEnd = dEnd.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })
          return {
            id: item.id,
            studentName: item.utilizator_nume || "Radu Ivan",
            studentDetail: "Student · USV",
            resourceName: item.resursa_nume || "Echipament de laborator",
            inventoryCode: item.resursa_cod || "INV-USV-2026-041",
            roomName: item.sala_nume || "Lab Prototipare",
            purpose: item.scop || "Proiect de licență",
            dateStr: dateFormatted,
            timeRange: `${tStart}–${tEnd}`,
            imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80",
            status: "IN_ASTEPTARE",
          }
        })
        setRequests([...mapped, ...INITIAL_DEMO_REQUESTS.slice(1)])
        if (!searchParams.get("id")) {
          setSelectedId(mapped[0].id)
        }
      }
    } catch {
    }
  }

  const selectedRequest =
    selectedId !== null ? requests.find((r) => r.id === selectedId) || null : null

  const handleApprove = async (id: number) => {
    setActionError(null)
    try {
      if (id < 100) {
        await reservationsApi.approveReservation(id)
      }
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "APROBATA" } : r))
      )
      setActionSuccess("Accesul la resursă a fost aprobat cu succes.")
      setRejectionReason("")
      const remaining = requests.filter((r) => r.id !== id && r.status === "IN_ASTEPTARE")
      setSelectedId(remaining.length > 0 ? remaining[0].id : null)
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
      const remaining = requests.filter((r) => r.id !== id && r.status === "IN_ASTEPTARE")
      setSelectedId(remaining.length > 0 ? remaining[0].id : null)
    } catch (err: any) {
      setActionError(err.response?.data?.detail || "Eroare la respingerea cererii.")
    }
  }

  const pendingList = requests.filter((r) => r.status === "IN_ASTEPTARE")
  const resolvedList = requests.filter((r) => r.status !== "IN_ASTEPTARE")
  const displayedList = activeTab === "pending" ? pendingList : resolvedList

  return (
    <AppLayout breadcrumbs={["Spațiu de lucru", "Aprobări studenți"]}>
      <div className="max-w-3xl space-y-6">
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

        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Aprobări studenți
            </h1>
            <Badge className="rounded-full bg-black hover:bg-black text-white text-[11px] font-semibold px-2.5 py-0.5 border-transparent">
              {pendingList.length} în așteptare
            </Badge>
          </div>
          <p className="text-xs text-neutral-500">
            Verifică scopul și acordă acces la resursele solicitate. Decizia nu creează o rezervare.
          </p>
        </div>

        <div className="inline-flex items-center rounded-lg bg-neutral-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={`px-3 py-1 text-xs rounded-md transition-all ${
              activeTab === "pending"
                ? "bg-white text-neutral-900 font-semibold shadow-xs"
                : "text-neutral-500 hover:text-neutral-900 font-medium"
            }`}
          >
            În așteptare ({pendingList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("resolved")}
            className={`px-3 py-1 text-xs rounded-md transition-all ${
              activeTab === "resolved"
                ? "bg-white text-neutral-900 font-semibold shadow-xs"
                : "text-neutral-500 hover:text-neutral-900 font-medium"
            }`}
          >
            Soluționate
          </button>
        </div>

        <div className="divide-y divide-neutral-200">
          {displayedList.length === 0 ? (
            <Card className="p-8 text-center text-xs text-neutral-400 bg-white border-neutral-200 rounded-xl shadow-none">
              Nu există cereri în această secțiune.
            </Card>
          ) : (
            displayedList.map((req) => {
              const isSelected = req.id === selectedRequest?.id
              return (
                <div
                  key={req.id}
                  onClick={() => setSelectedId(req.id)}
                  className="py-5 first:pt-2 space-y-3 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-neutral-900">{req.studentName}</span>
                    <Badge
                      variant="outline"
                      className="rounded-full border-neutral-200 bg-neutral-100/80 text-neutral-600 text-[11px] font-medium px-2.5 py-0.5"
                    >
                      {isSelected ? "Selectată" : req.isDemo ? "Exemplu UI" : req.dateStr}
                    </Badge>
                  </div>

                  <Card className="rounded-xl border-neutral-200 bg-neutral-50/40 p-4 shadow-none space-y-0.5">
                    <div className="font-medium text-xs text-neutral-900">
                      {req.resourceName}
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      {req.inventoryCode} · {req.roomName}
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      Scop: {req.purpose}
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      Interval: {req.dateStr} · {req.timeRange}
                    </div>
                  </Card>

                  <div className="flex items-center gap-2">
                    {isSelected ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedId(req.id)
                        }}
                        className="h-8 rounded-lg border-neutral-200 bg-neutral-100/90 text-neutral-800 hover:bg-neutral-200/70 text-xs font-semibold px-3"
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
                        className="h-8 rounded-lg border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900 text-xs font-semibold px-3"
                      >
                        Aprobă
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedId(req.id)
                      }}
                      className="h-8 rounded-lg border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900 text-xs font-semibold px-3"
                    >
                      Respinge cu motiv
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <p className="text-[11px] text-neutral-400">
          Solicitanții demonstrativi sunt exemple de interfață; nu reprezintă persoane reale.
        </p>
      </div>

      <Sheet
        open={Boolean(selectedRequest)}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null)
        }}
      >
        <SheetContent side="right">
          {selectedRequest && (
            <>
              <SheetHeader>
                <SheetTitle>Examinează cererea</SheetTitle>
                <SheetDescription>Acces la resursă · cerere în așteptare</SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="rounded-full border-neutral-200 bg-neutral-50 text-neutral-800 text-[11px] font-medium px-2.5 py-0.5"
                  >
                    În așteptare
                  </Badge>
                  <span className="text-xs text-neutral-400">22 octombrie 2026</span>
                </div>

                <div className="px-4">
                  <div className="overflow-hidden rounded-md bg-neutral-100 h-44">
                    <img
                      src={selectedRequest.imageUrl}
                      alt={selectedRequest.resourceName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-neutral-900 leading-snug">
                    {selectedRequest.resourceName}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    {selectedRequest.inventoryCode} · {selectedRequest.roomName}
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  <div>
                    <span className="block text-[11px] text-neutral-400">Student</span>
                    <span className="block text-xs font-medium text-neutral-900 mt-0.5">
                      {selectedRequest.studentName}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[11px] text-neutral-400">Scopul solicitării</span>
                    <span className="block text-xs font-medium text-neutral-900 mt-0.5">
                      {selectedRequest.purpose}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[11px] text-neutral-400">Interval solicitat</span>
                    <span className="block text-xs font-medium text-neutral-900 mt-0.5">
                      {selectedRequest.dateStr} · {selectedRequest.timeRange}
                    </span>
                  </div>
                </div>

                {selectedRequest.status === "IN_ASTEPTARE" && (
                  <div className="space-y-2 pt-1">
                    <label className="block text-xs font-bold text-neutral-900">
                      Motivul respingerii
                    </label>
                    <Textarea
                      rows={3}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Scrie motivul pentru student..."
                    />
                    <p className="text-[11px] text-neutral-400 leading-snug">
                      Obligatoriu pentru „Respinge cu motiv”. Nu este necesar pentru aprobare.
                    </p>
                  </div>
                )}
              </div>

              {selectedRequest.status === "IN_ASTEPTARE" && (
                <SheetFooter>
                  <Button
                    onClick={() => handleApprove(selectedRequest.id)}
                    className="w-full bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold h-9 rounded-lg"
                  >
                    Aprobă accesul
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleReject(selectedRequest.id)}
                    className="w-full border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900 text-xs font-semibold h-9 rounded-lg"
                  >
                    Respinge cu motiv
                  </Button>
                </SheetFooter>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </AppLayout>
  )
}
