import { Compass } from "lucide-react"
import { Card } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"

interface DashboardSidebarWidgetsProps {
  initials: string
  fullName: string
  roleLabel: string
  activeCount: number
  maxQuota: number
  quotaPercent: number
  totalCatalogCount: number
  onNavigateResources: () => void
  onNavigateReservations: () => void
  onNavigateRooms: () => void
}

export function DashboardSidebarWidgets({
  initials,
  fullName,
  roleLabel,
  activeCount,
  maxQuota,
  quotaPercent,
  totalCatalogCount,
  onNavigateResources,
  onNavigateReservations,
  onNavigateRooms,
}: DashboardSidebarWidgetsProps) {
  return (
    <div className="lg:col-span-4 space-y-5">
      <Card className="rounded-2xl border-neutral-200 bg-white p-5 shadow-none space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-neutral-100">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
            {initials}
          </div>
          <div>
            <div className="text-sm font-bold text-neutral-900">{fullName}</div>
            <Badge
              variant="outline"
              className="rounded-full bg-neutral-100 border-neutral-200 text-neutral-700 text-[10px] font-medium px-2 py-0 mt-0.5"
            >
              {roleLabel}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-600 font-medium">Cotă activă în interval</span>
            <span className="font-bold text-neutral-900">
              {activeCount} / {maxQuota}
            </span>
          </div>
          <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-neutral-950 rounded-full transition-all"
              style={{ width: `${quotaPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Maximum 4 resurse pot fi rezervate simultan în același interval orar.
          </p>
        </div>
      </Card>

      <Card className="rounded-2xl border-neutral-200 bg-white p-5 shadow-none space-y-3">
        <div className="flex items-center gap-2 pb-1">
          <Compass className="h-4 w-4 text-neutral-800" />
          <h2 className="text-sm font-bold text-neutral-900">Acces rapid</h2>
        </div>

        <div className="space-y-2">
          <Button
            variant="outline"
            onClick={onNavigateResources}
            className="w-full h-9 rounded-xl border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-semibold text-neutral-800"
          >
            Explorează catalogul ({totalCatalogCount} resurse)
          </Button>
          <Button
            variant="outline"
            onClick={onNavigateReservations}
            className="w-full h-9 rounded-xl border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-semibold text-neutral-800"
          >
            Rezervările mele
          </Button>
          <Button
            variant="outline"
            onClick={onNavigateRooms}
            className="w-full h-9 rounded-xl border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-semibold text-neutral-800"
          >
            Laboratoare și săli (localizare)
          </Button>
          <Button
            onClick={onNavigateResources}
            className="w-full h-9 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold"
          >
            Rezervă o resursă
          </Button>
        </div>
      </Card>
    </div>
  )
}
