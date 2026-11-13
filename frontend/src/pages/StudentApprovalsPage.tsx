import { AlertCircle, CheckCircle2 } from "lucide-react"
import { AppLayout } from "../components/layout/AppLayout"
import { useStudentApprovals } from "../hooks/useStudentApprovals"
import { Badge } from "../components/ui/badge"
import { Card } from "../components/ui/card"
import { StudentApprovalCard } from "../components/professor/StudentApprovalCard"
import { StudentApprovalSheet } from "../components/professor/StudentApprovalSheet"

export function StudentApprovalsPage() {
  const approvals = useStudentApprovals()

  return (
    <AppLayout breadcrumbs={["Spațiu de lucru", "Aprobări studenți"]}>
      <div className="max-w-3xl space-y-6">
        {approvals.actionSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{approvals.actionSuccess}</span>
            </div>
            <button
              onClick={() => approvals.setActionSuccess(null)}
              className="font-bold text-emerald-700"
            >
              ✕
            </button>
          </div>
        )}

        {approvals.actionError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span className="font-medium">{approvals.actionError}</span>
            </div>
            <button
              onClick={() => approvals.setActionError(null)}
              className="font-bold text-rose-700"
            >
              ✕
            </button>
          </div>
        )}

        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Aprobări studenți</h1>
            <Badge className="rounded-full bg-black hover:bg-black text-white text-[11px] font-semibold px-2.5 py-0.5 border-transparent">
              {approvals.pendingList.length} în așteptare
            </Badge>
          </div>
          <p className="text-xs text-neutral-500">
            Verifică scopul și acordă acces la resursele solicitate. Decizia nu creează o rezervare.
          </p>
        </div>

        <div className="inline-flex items-center rounded-lg bg-neutral-100 p-1">
          <button
            type="button"
            onClick={() => approvals.setActiveTab("pending")}
            className={`px-3 py-1 text-xs rounded-md transition-all ${
              approvals.activeTab === "pending"
                ? "bg-white text-neutral-900 font-semibold shadow-xs"
                : "text-neutral-500 hover:text-neutral-900 font-medium"
            }`}
          >
            În așteptare ({approvals.pendingList.length})
          </button>
          <button
            type="button"
            onClick={() => approvals.setActiveTab("resolved")}
            className={`px-3 py-1 text-xs rounded-md transition-all ${
              approvals.activeTab === "resolved"
                ? "bg-white text-neutral-900 font-semibold shadow-xs"
                : "text-neutral-500 hover:text-neutral-900 font-medium"
            }`}
          >
            Soluționate
          </button>
        </div>

        <div className="divide-y divide-neutral-200">
          {approvals.displayedList.length === 0 ? (
            <Card className="p-8 text-center text-xs text-neutral-400 bg-white border-neutral-200 rounded-xl shadow-none">
              Nu există cereri în această secțiune.
            </Card>
          ) : (
            approvals.displayedList.map((req) => (
              <StudentApprovalCard
                key={req.id}
                request={req}
                isSelected={req.id === approvals.selectedRequest?.id}
                onSelect={approvals.setSelectedId}
                onApprove={approvals.handleApprove}
              />
            ))
          )}
        </div>

        <p className="text-[11px] text-neutral-400">
          Solicitanții demonstrativi sunt exemple de interfață; nu reprezintă persoane reale.
        </p>
      </div>

      <StudentApprovalSheet
        selectedRequest={approvals.selectedRequest}
        rejectionReason={approvals.rejectionReason}
        onRejectionReasonChange={approvals.setRejectionReason}
        onClose={() => approvals.setSelectedId(null)}
        onApprove={approvals.handleApprove}
        onReject={approvals.handleReject}
      />
    </AppLayout>
  )
}
export default StudentApprovalsPage
