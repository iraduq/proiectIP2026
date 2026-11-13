import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet"
import type { ApprovalItem } from "../../data/studentApprovalsConstants"

interface StudentApprovalSheetProps {
  selectedRequest: ApprovalItem | null
  rejectionReason: string
  onRejectionReasonChange: (value: string) => void
  onClose: () => void
  onApprove: (id: number) => void
  onReject: (id: number) => void
}

export function StudentApprovalSheet({
  selectedRequest,
  rejectionReason,
  onRejectionReasonChange,
  onClose,
  onApprove,
  onReject,
}: StudentApprovalSheetProps) {
  return (
    <Sheet
      open={Boolean(selectedRequest)}
      onOpenChange={(open) => {
        if (!open) onClose()
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

              <div className="overflow-hidden rounded-lg bg-neutral-100 h-52">
                <img
                  src={selectedRequest.imageUrl}
                  alt={selectedRequest.resourceName}
                  className="w-full h-full object-cover"
                />
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
                    onChange={(e) => onRejectionReasonChange(e.target.value)}
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
                  onClick={() => onApprove(selectedRequest.id)}
                  className="w-full bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold h-9 rounded-lg"
                >
                  Aprobă accesul
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onReject(selectedRequest.id)}
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
  )
}
