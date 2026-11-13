import { AlertTriangle, Calendar, CheckCircle2, Layers } from "lucide-react"
import { Card } from "../ui/card"

interface DashboardStatsGridProps {
  activeCount: number
  maxQuota: number
  quotaPercent: number
  upcomingCount: number
  nextUpcomingText: string
  returnedCount: number
  dueTodayCount: number
  dueEndTimeStr?: string
}

export function DashboardStatsGrid({
  activeCount,
  maxQuota,
  quotaPercent,
  upcomingCount,
  nextUpcomingText,
  returnedCount,
  dueTodayCount,
  dueEndTimeStr,
}: DashboardStatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="rounded-2xl border-neutral-200 bg-white p-5 shadow-none space-y-2.5">
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span className="font-medium">Rezervări active</span>
          <Layers className="h-3.5 w-3.5 text-neutral-400" />
        </div>
        <div className="text-3xl font-extrabold text-neutral-900">{activeCount}</div>
        <div className="text-[11px] text-neutral-400">
          din cota maximă de {maxQuota} simultane
        </div>
        <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-neutral-950 rounded-full transition-all"
            style={{ width: `${quotaPercent}%` }}
          />
        </div>
      </Card>

      <Card className="rounded-2xl border-neutral-200 bg-white p-5 shadow-none space-y-2.5">
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span className="font-medium">Rezervări viitoare</span>
          <Calendar className="h-3.5 w-3.5 text-neutral-400" />
        </div>
        <div className="text-3xl font-extrabold text-neutral-900">{upcomingCount}</div>
        <div className="text-[11px] text-neutral-400 truncate">{nextUpcomingText}</div>
      </Card>

      <Card className="rounded-2xl border-neutral-200 bg-white p-5 shadow-none space-y-2.5">
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span className="font-medium">Resurse returnate</span>
          <CheckCircle2 className="h-3.5 w-3.5 text-neutral-400" />
        </div>
        <div className="text-3xl font-extrabold text-neutral-900">{returnedCount}</div>
        <div className="text-[11px] text-neutral-400">în anul universitar curent</div>
      </Card>

      <Card
        className={`rounded-2xl p-5 shadow-none space-y-2.5 ${
          dueTodayCount > 0 ? "border-amber-300 bg-amber-50/10" : "border-neutral-200 bg-white"
        }`}
      >
        <div className="flex items-center justify-between text-xs text-neutral-600">
          <span className="font-medium">Alerte scadente</span>
          <AlertTriangle
            className={`h-3.5 w-3.5 ${
              dueTodayCount > 0 ? "text-amber-600" : "text-neutral-400"
            }`}
          />
        </div>
        <div
          className={`text-3xl font-extrabold ${
            dueTodayCount > 0 ? "text-amber-600" : "text-neutral-900"
          }`}
        >
          {dueTodayCount}
        </div>
        <div
          className={`text-[11px] font-medium ${
            dueTodayCount > 0 ? "text-amber-700" : "text-neutral-400"
          }`}
        >
          {dueTodayCount > 0
            ? `Returnare azi la ${dueEndTimeStr || "16:00"}`
            : "Nicio returnare scadentă azi"}
        </div>
      </Card>
    </div>
  )
}
