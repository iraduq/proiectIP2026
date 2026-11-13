import { MapPin } from "lucide-react"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Card } from "../ui/card"

interface ResourceDetailHeaderProps {
  displayTitle: string
  displayCategory: string
  displayRoom: string
  specializare: string
  displayCode: string
  onReserveClick: () => void
}

export function ResourceDetailHeader({
  displayTitle,
  displayCategory,
  displayRoom,
  specializare,
  displayCode,
  onReserveClick,
}: ResourceDetailHeaderProps) {
  return (
    <Card className="rounded-2xl border-neutral-200 bg-white p-6 shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{displayTitle}</h1>
          <Badge
            variant="outline"
            className="rounded-full bg-neutral-100 border-neutral-200 text-neutral-700 text-[11px] font-medium px-2.5 py-0.5"
          >
            {displayCategory}
          </Badge>
          <Badge className="rounded-full bg-neutral-950 hover:bg-neutral-950 text-white text-[11px] font-semibold px-2.5 py-0.5 border-transparent">
            Disponibil
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
          <MapPin className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
          <span>
            {displayRoom} · {specializare} · {displayCode}
          </span>
        </div>
      </div>

      <Button
        onClick={onReserveClick}
        className="bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold h-9 px-4 rounded-lg shrink-0"
      >
        Rezervă resursa
      </Button>
    </Card>
  )
}
