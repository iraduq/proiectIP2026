import { CalendarClock, MonitorCheck, TriangleAlert, Wrench } from "lucide-react"
import { cn } from "../../../lib/utils"

interface Props {
  labName: string
  metrics: { available: number; inUse: number; maintenance: number; defect: number }
}

export function LabMetrics({ labName, metrics }: Props) {
  const cards = [
    { title: "Disponibile tehnic", value: metrics.available, note: `Stare tehnică bună${labName ? ` · ${labName}` : ""}`, icon: MonitorCheck },
    { title: "În utilizare", value: metrics.inUse, note: "Rezervări active azi", icon: CalendarClock },
    { title: "Mentenanță", value: metrics.maintenance, note: metrics.maintenance ? "Intervenții active" : "Fără intervenții active", icon: Wrench },
    { title: "Defect", value: metrics.defect, note: metrics.defect ? "Necesită inspecție" : "Inspecția nu este confirmată", icon: TriangleAlert, warn: true },
  ]
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.title}
          className={cn(
            "rounded-[14px] border bg-white p-5 shadow-sm",
            c.warn ? "border-[#fde68a]" : "border-neutral-200"
          )}
        >
          <div className="flex items-center justify-between text-sm font-medium text-neutral-500">
            {c.title}
            <c.icon className={cn("h-4 w-4", c.warn ? "text-[#d97706]" : "text-neutral-500")} />
          </div>
          <div className={cn("mt-2 text-3xl font-bold leading-9", c.warn ? "text-[#d97706]" : "text-neutral-900")}>{c.value}</div>
          <div className="mt-2 text-xs text-neutral-500">{c.note}</div>
        </div>
      ))}
    </div>
  )
}
