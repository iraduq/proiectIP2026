import { useNavigate } from "react-router-dom"
import { AlertCircle, CheckCircle2, Plus, Wrench } from "lucide-react"
import { AppLayout } from "../components/layout/AppLayout"
import { useAuth } from "../context/AuthContext"
import { useProfessorDashboard } from "../hooks/useProfessorDashboard"
import { Button } from "../components/ui/button"
import { ProfessorApprovalModal } from "../components/professor/ProfessorApprovalModal"
import { ProfessorRequestsPanel } from "../components/professor/ProfessorRequestsPanel"
import {
  ProfessorCatalogColumn,
  ProfessorStatsCards,
} from "../components/professor/ProfessorCatalogSection"

export function ProfessorDashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const canApproveRequests =
    user?.rol === "RESPONSABIL_LABORATOR" ||
    user?.rol === "ADMINISTRATOR" ||
    Boolean(user?.permissions?.includes("bookings:approve"))

  const roleBadgeLabel =
    user?.rol === "RESPONSABIL_LABORATOR"
      ? "Reprezentant laborator"
      : user?.rol === "ADMINISTRATOR"
      ? "Administrator"
      : "Profesor"

  const prof = useProfessorDashboard(canApproveRequests, user?.id_utilizator)

  return (
    <AppLayout
      breadcrumbs={[
        "Spațiu de lucru",
        canApproveRequests ? "Gestiune laborator" : "Panou departament",
      ]}
    >
      <div className="space-y-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                {canApproveRequests ? "Gestiune laborator" : "Panou departament"}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-xs font-semibold">
                {roleBadgeLabel}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              {canApproveRequests
                ? "Aprobarea cererilor de rezervare ale studenților, recepția echipamentelor și jurnalul tehnic"
                : "Activități didactice, rezervări pentru grupe de studenți și resursele departamentului"}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {canApproveRequests && (
              <Button
                variant="outline"
                onClick={() => navigate("/technical-history")}
                className="border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900 text-xs gap-1.5 h-9 rounded-lg font-semibold"
              >
                <Wrench className="h-3.5 w-3.5" />
                Jurnal tehnic
              </Button>
            )}
            <Button
              onClick={() => navigate("/professor/group-booking")}
              className="bg-black hover:bg-neutral-800 text-white text-xs gap-1.5 h-9 rounded-lg font-semibold shadow-xs"
            >
              <Plus className="h-4 w-4" />
              {canApproveRequests ? "Rezervare nouă" : "Rezervare grupă"}
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {user?.nume ? user.nume.charAt(0).toUpperCase() : "D"}
            </div>
            <div>
              <div className="font-bold text-xs text-neutral-900">
                {user?.nume || "Cadru didactic"}
              </div>
              <div className="text-[11px] text-neutral-500">{roleBadgeLabel}</div>
            </div>
          </div>
          <div className="text-xs text-neutral-500">
            {canApproveRequests
              ? "Responsabil cu aprobarea cererilor studenților și starea tehnică a resurselor"
              : "Rezervare echipamente pentru activitate didactică și grupe"}
          </div>
        </div>

        {prof.actionSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{prof.actionSuccess}</span>
            </div>
            <button
              type="button"
              onClick={() => prof.setActionSuccess(null)}
              className="font-bold text-emerald-700"
            >
              ✕
            </button>
          </div>
        )}

        {prof.actionError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span className="font-medium">{prof.actionError}</span>
            </div>
            <button
              type="button"
              onClick={() => prof.setActionError(null)}
              className="font-bold text-rose-700"
            >
              ✕
            </button>
          </div>
        )}

        <ProfessorStatsCards
          canApproveRequests={canApproveRequests}
          resourcesCount={prof.resourcesCount}
          pendingCount={prof.pendingCount}
          profActivitiesCount={prof.profActivitiesCount}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-2">
          <ProfessorCatalogColumn
            items={prof.displayCatalog}
            onOpenCatalog={() => navigate("/resources")}
            onSelectResource={(id) => navigate(`/resources/${id}`)}
          />

          <ProfessorRequestsPanel
            canApproveRequests={canApproveRequests}
            pendingCount={prof.pendingCount}
            pendingRequests={prof.pendingRequests}
            demoApprovals={prof.demoApprovals}
            myReservations={prof.myReservations}
            profActivitiesCount={prof.profActivitiesCount}
            onExamineRequest={(req) => {
              prof.setActionError(null)
              prof.setRejectionReason("")
              prof.setSelectedRequest(req)
            }}
            onExamineDemoRequest={(item) => {
              prof.setActionError(null)
              prof.setRejectionReason("")
              prof.setSelectedDemoRequest(item)
            }}
            onNavigateGroupBooking={() => navigate("/professor/group-booking")}
          />
        </div>
      </div>

      {canApproveRequests && (
        <ProfessorApprovalModal
          selectedRequest={prof.selectedRequest}
          selectedDemoRequest={prof.selectedDemoRequest}
          rejectionReason={prof.rejectionReason}
          onRejectionReasonChange={prof.setRejectionReason}
          isActing={prof.isActing}
          onCloseRequest={() => prof.setSelectedRequest(null)}
          onCloseDemoRequest={() => prof.setSelectedDemoRequest(null)}
          onApprove={prof.handleApprove}
          onReject={prof.handleReject}
          onApproveDemo={prof.handleApproveDemo}
          onRejectDemo={prof.handleRejectDemo}
        />
      )}
    </AppLayout>
  )
}

export default ProfessorDashboardPage
