import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { reservationsApi } from "../api/reservations"
import {
  INITIAL_DEMO_REQUESTS,
  type ApprovalItem,
} from "../data/studentApprovalsConstants"

export function useStudentApprovals() {
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

  return {
    activeTab,
    setActiveTab,
    selectedRequest,
    setSelectedId,
    rejectionReason,
    setRejectionReason,
    actionSuccess,
    setActionSuccess,
    actionError,
    setActionError,
    pendingList,
    displayedList: activeTab === "pending" ? pendingList : resolvedList,
    handleApprove,
    handleReject,
  }
}
