import { LayoutDashboard, Package2, TriangleAlert, Users } from "lucide-react"
import type { AdminCounts } from "../hooks/useAdminInventory"

export function AdminStats({ counts }: { counts: AdminCounts }) {
  const cards = [
    { label: "Resurse totale", value: counts.total, caption: "Total în inventar", icon: Package2 },
    { label: "Grad de utilizare", value: "68%", caption: "Date demonstrative · luna curentă", icon: LayoutDashboard, bar: 68 },
    { label: "Conturi înregistrate", value: 86, caption: "Studenți · Profesori · Tehnicieni", icon: Users },
    {
      label: "Defecțiuni / Mentenanță",
      value: counts.defecte + counts.mentenanta,
      caption: `Active acum · ${counts.defecte} defect, ${counts.mentenanta} mentenanță`,
      icon: TriangleAlert,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, caption, icon: Icon, bar }) => (
        <div key={label} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-sm text-neutral-600">
            <span>{label}</span>
            <Icon className="h-4 w-4 text-neutral-500" />
          </div>
          <div className="mt-3 text-3xl font-bold text-neutral-950">{value}</div>
          {bar !== undefined && (
            <div className="mt-3 h-1 rounded-full bg-neutral-100">
              <div className="h-1 rounded-full bg-neutral-900" style={{ width: `${bar}%` }} />
            </div>
          )}
          <p className="mt-2 text-xs text-neutral-500">{caption}</p>
        </div>
      ))}
    </div>
  )
}
