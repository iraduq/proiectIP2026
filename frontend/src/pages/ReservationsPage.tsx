import { useState, useEffect, useCallback } from "react"
import { Calendar, CheckCircle2 } from "lucide-react"
import { AppLayout } from "../components/layout/AppLayout"
import { useAuth } from "../context/AuthContext"
import { reservationsApi } from "../api/reservations"
import type { Reservation, StareRezervare, StudentQuota } from "../types"
import { ReservationFilterBar } from "../components/reservations/ReservationFilterBar"
import { ReservationsTable } from "../components/reservations/ReservationsTable"
import { ReservationActionModals } from "../components/reservations/ReservationActionModals"

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
  const [returnModalReservation, setReturnModalReservation] = useState<Reservation | null>(null)
  const [returnCondition, setReturnCondition] = useState<
    "DISPONIBILA" | "IN_MENTENANTA" | "DEFECTA"
  >("DISPONIBILA")
  const [returnNotes, setReturnNotes] = useState("")
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  const isStudent = user?.rol === "STUDENT"
  const canApprove =
    user?.rol === "ADMINISTRATOR" ||
    user?.rol === "RESPONSABIL_LABORATOR" ||
    Boolean(user?.permissions?.includes("bookings:approve"))
  const canReturn =
    user?.rol === "ADMINISTRATOR" ||
    user?.rol === "RESPONSABIL_LABORATOR" ||
    Boolean(user?.permissions?.includes("bookings:return"))
  const isStaff = canApprove || canReturn

  const loadData = useCallback(async () => {
    setIsLoading(true)
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
        const params: {
          limit: number
          stare?: StareRezervare
          utilizator_id?: number
        } = { limit: 100 }
        if (statusFilter !== "ALL") params.stare = statusFilter
        if (activeTab === "MY") params.utilizator_id = user?.id_utilizator

        const rRes = await reservationsApi.getReservations(params)
        setReservations(rRes.items)
      }
    } catch {
    } finally {
      setIsLoading(false)
    }
  }, [isStudent, statusFilter, activeTab, user?.id_utilizator])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleCancel = async (id: number, name: string) => {
    if (!confirm(`Sigur doriți să anulați rezervarea pentru „${name}”?`)) return
    try {
      await reservationsApi.cancelReservation(id)
      setActionSuccess("Rezervarea a fost anulată cu succes.")
      loadData()
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { detail?: string } } }
      alert(errorObj.response?.data?.detail || "Eroare la anularea rezervării.")
    }
  }

  const handleApprove = async (id: number, name: string) => {
    try {
      await reservationsApi.approveReservation(id)
      setActionSuccess(`Rezervarea pentru „${name}” a fost aprobată.`)
      loadData()
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { detail?: string } } }
      alert(errorObj.response?.data?.detail || "Eroare la aprobarea rezervării.")
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
      setActionSuccess(
        `Rezervarea pentru „${rejectModalReservation.resursa_nume}” a fost respinsă.`
      )
      setRejectModalReservation(null)
      loadData()
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { detail?: string } } }
      alert(errorObj.response?.data?.detail || "Eroare la respingerea rezervării.")
    } finally {
      setIsRejecting(false)
    }
  }

  const handleConfirmReturn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!returnModalReservation) return
    setIsSubmittingReturn(true)
    try {
      await reservationsApi.returnReservation(returnModalReservation.id, {
        stare_echipament: returnCondition,
        observatii: returnNotes.trim() || undefined,
      })
      setActionSuccess(
        `Returul pentru „${returnModalReservation.resursa_nume}” a fost consemnat cu succes.`
      )
      setReturnModalReservation(null)
      setReturnNotes("")
      setReturnCondition("DISPONIBILA")
      loadData()
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { detail?: string } } }
      alert(errorObj.response?.data?.detail || "Eroare la finalizarea rezervării.")
    } finally {
      setIsSubmittingReturn(false)
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2.5">
              <Calendar className="h-6 w-6 text-neutral-800" />
              Gestiune rezervări echipamente
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Programări, cereri de împrumut, aprobări didactice și urmărirea termenelor de restituire.
            </p>
          </div>
        </div>

        {actionSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionSuccess(null)}
              className="text-emerald-600 hover:text-emerald-800 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        <ReservationFilterBar
          isStudent={isStudent}
          quota={quota}
          isStaff={isStaff}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pendingCount={reservations.filter((r) => r.stare === "IN_ASTEPTARE").length}
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        <ReservationsTable
          reservations={filteredReservations}
          isLoading={isLoading}
          activeTab={activeTab}
          currentUserId={user?.id_utilizator}
          currentUserRole={user?.rol}
          canApprove={canApprove}
          canReturn={canReturn}
          onCancel={handleCancel}
          onApprove={handleApprove}
          onOpenReject={handleOpenReject}
          onOpenReturn={(r) => {
            setReturnModalReservation(r)
            setReturnCondition("DISPONIBILA")
            setReturnNotes("")
          }}
        />

        <ReservationActionModals
          returnModalReservation={returnModalReservation}
          returnCondition={returnCondition}
          onReturnConditionChange={setReturnCondition}
          returnNotes={returnNotes}
          onReturnNotesChange={setReturnNotes}
          isSubmittingReturn={isSubmittingReturn}
          onCloseReturnModal={() => setReturnModalReservation(null)}
          onConfirmReturn={handleConfirmReturn}
          rejectModalReservation={rejectModalReservation}
          rejectionReason={rejectionReason}
          onRejectionReasonChange={setRejectionReason}
          isRejecting={isRejecting}
          onCloseRejectModal={() => setRejectModalReservation(null)}
          onConfirmReject={handleConfirmReject}
        />
      </div>
    </AppLayout>
  )
}

export default ReservationsPage
