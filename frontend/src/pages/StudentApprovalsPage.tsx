import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { CheckCircle2, AlertCircle } from "lucide-react"
import { AppLayout } from "../components/layout/AppLayout"
import { reservationsApi } from "../api/reservations"
import { Badge } from "../components/ui/badge"
import { Card } from "../components/ui/card"
import { StudentApprovalCard } from "../components/professor/StudentApprovalCard"
import { StudentApprovalSheet } from "../components/professor/StudentApprovalSheet"
import {
  INITIAL_DEMO_REQUESTS,
  type ApprovalItem,
} from "../data/studentApprovalsConstants"

export function StudentApprovalsPage() {
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<"pending" | "resolved">("pending")
  const [requests, setRequests] = useState<ApprovalItem[]>(INITIAL_DEMO_REQUESTS)
  const [selectedId, setSelectedId] = useState<number | null>(101)
  const [rejectionReason, setRejectionReason] = useState<string>("")
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
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
              imageUrl:
                "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80",
              status: "IN_ASTEPTARE",
            }
          })
          setRequests([...mapped, ...INITIAL_DEMO_REQUESTS.slice(1)])
          if (!searchParams.get("id")) setSelectedId(mapped[0].id)
        }
      } catch {}
    }
    loadRealPending()
  }, [])

  useEffect(() => {
    const paramId = searchParams.get("id")
    if (paramId) setSelectedId(Number(paramId))
  }, [searchParams])

  const selectedRequest =
    selectedId !== null ? requests.find((r) => r.id === selectedId) || null : null

  const selectNextPending = (id: number) => {
    const remaining = requests.filter((r) => r.id !== id && r.status === "IN_ASTEPTARE")
    setSelectedId(remaining.length > 0 ? remaining[0].id : null)
  }

  const handleApprove = async (id: number) => {
    setActionError(null)
    try {
      if (id < 100) await reservationsApi.approveReservation(id)
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "APROBATA" } : r)))
      setActionSuccess("Accesul la resursă a fost aprobat cu succes.")
      setRejectionReason("")
      selectNextPending(id)
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
      if (id < 100) await reservationsApi.rejectReservation(id, rejectionReason.trim())
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: "RESPINSA", rejectionReason: rejectionReason.trim() } : r
        )
      )
      setActionSuccess("Cererea a fost respinsă și studentul a fost notificat.")
      setRejectionReason("")
      selectNextPending(id)
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
            <button onClick={() => setActionSuccess(null)} className="font-bold text-emerald-700">
              ✕
            </button>
          </div>
        )}

        {actionError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span className="font-medium">{actionError}</span>
            </div>
            <button onClick={() => setActionError(null)} className="font-bold text-rose-700">
              ✕
            </button>
          </div>
        )}

        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Aprobări studenți</h1>
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
            displayedList.map((req) => (
              <StudentApprovalCard
                key={req.id}
                request={req}
                isSelected={req.id === selectedRequest?.id}
                onSelect={setSelectedId}
                onApprove={handleApprove}
              />
            ))
          )}
        </div>

        <p className="text-[11px] text-neutral-400">
          Solicitanții demonstrativi sunt exemple de interfață; nu reprezintă persoane reale.
        </p>
      </div>

      <StudentApprovalSheet
        selectedRequest={selectedRequest}
        rejectionReason={rejectionReason}
        onRejectionReasonChange={setRejectionReason}
        onClose={() => setSelectedId(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </AppLayout>
  )
}
export default StudentApprovalsPage
