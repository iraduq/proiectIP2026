import { Calendar, CheckCircle2 } from "lucide-react"
import { AppLayout } from "../components/layout/AppLayout"
import { useAuth } from "../context/AuthContext"
import { useReservationsData } from "../hooks/useReservationsData"
import { ReservationFilterBar } from "../components/reservations/ReservationFilterBar"
import { ReservationsTable } from "../components/reservations/ReservationsTable"
import { ReservationActionModals } from "../components/reservations/ReservationActionModals"

export function ReservationsPage() {
  const { user } = useAuth()
  const data = useReservationsData(user)

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
              Programări, cereri de împrumut, aprobări didactice și urmărirea termenelor de
              restituire.
            </p>
          </div>
        </div>

        {data.actionSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{data.actionSuccess}</span>
            </div>
            <button
              type="button"
              onClick={() => data.setActionSuccess(null)}
              className="text-emerald-600 hover:text-emerald-800 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        <ReservationFilterBar
          isStudent={data.isStudent}
          quota={data.quota}
          isStaff={data.isStaff}
          activeTab={data.activeTab}
          onTabChange={data.setActiveTab}
          pendingCount={data.pendingCount}
          search={data.search}
          onSearchChange={data.setSearch}
          statusFilter={data.statusFilter}
          onStatusFilterChange={data.setStatusFilter}
        />

        <ReservationsTable
          reservations={data.filteredReservations}
          isLoading={data.isLoading}
          activeTab={data.activeTab}
          currentUserId={user?.id_utilizator}
          currentUserRole={user?.rol}
          canApprove={data.canApprove}
          canReturn={data.canReturn}
          onCancel={data.handleCancel}
          onApprove={data.handleApprove}
          onOpenReject={data.handleOpenReject}
          onOpenReturn={(r) => {
            data.setReturnModalReservation(r)
            data.setReturnCondition("DISPONIBILA")
            data.setReturnNotes("")
          }}
        />

        <ReservationActionModals
          returnModalReservation={data.returnModalReservation}
          returnCondition={data.returnCondition}
          onReturnConditionChange={data.setReturnCondition}
          returnNotes={data.returnNotes}
          onReturnNotesChange={data.setReturnNotes}
          isSubmittingReturn={data.isSubmittingReturn}
          onCloseReturnModal={() => data.setReturnModalReservation(null)}
          onConfirmReturn={data.handleConfirmReturn}
          rejectModalReservation={data.rejectModalReservation}
          rejectionReason={data.rejectionReason}
          onRejectionReasonChange={data.setRejectionReason}
          isRejecting={data.isRejecting}
          onCloseRejectModal={() => data.setRejectModalReservation(null)}
          onConfirmReject={data.handleConfirmReject}
        />
      </div>
    </AppLayout>
  )
}

export default ReservationsPage
