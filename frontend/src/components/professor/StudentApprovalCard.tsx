import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import type { ApprovalItem } from "../../data/studentApprovalsConstants"

interface StudentApprovalCardProps {
  request: ApprovalItem
  isSelected: boolean
  onSelect: (id: number) => void
  onApprove: (id: number) => void
}

export function StudentApprovalCard({
  request,
  isSelected,
  onSelect,
  onApprove,
}: StudentApprovalCardProps) {
  return (
    <div onClick={() => onSelect(request.id)} className="py-5 first:pt-2 space-y-3 cursor-pointer">
      <div className="flex items-center justify-between">
        <span className="font-bold text-xs text-neutral-900">{request.studentName}</span>
        <Badge
          variant="outline"
          className="rounded-full border-neutral-200 bg-neutral-100/80 text-neutral-600 text-[11px] font-medium px-2.5 py-0.5"
        >
          {isSelected ? "Selectată" : request.isDemo ? "Exemplu UI" : request.dateStr}
        </Badge>
      </div>

      <Card className="rounded-xl border-neutral-200 bg-neutral-50/40 p-4 shadow-none space-y-0.5">
        <div className="font-medium text-xs text-neutral-900">{request.resourceName}</div>
        <div className="text-[11px] text-neutral-500">
          {request.inventoryCode} · {request.roomName}
        </div>
        <div className="text-[11px] text-neutral-500">Scop: {request.purpose}</div>
        <div className="text-[11px] text-neutral-500">
          Interval: {request.dateStr} · {request.timeRange}
        </div>
      </Card>

      <div className="flex items-center gap-2">
        {isSelected ? (
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              onSelect(request.id)
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
              onApprove(request.id)
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
            onSelect(request.id)
          }}
          className="h-8 rounded-lg border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900 text-xs font-semibold px-3"
        >
          Respinge cu motiv
        </Button>
      </div>
    </div>
  )
}
