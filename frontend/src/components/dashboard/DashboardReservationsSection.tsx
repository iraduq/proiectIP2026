import { Link } from "react-router-dom"
import { AlertTriangle, Calendar, ChevronRight, Cpu, Layers } from "lucide-react"
import { Card } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"

export interface DashboardBookingRow {
  id: number
  resourceId: number
  name: string
  code: string
  interval: string
  room: string
  status: string
  dueAlert?: string
  endTimeStr?: string
  imageUrl: string
}

const FEATURED_RESOURCES = [
  {
    id: 1,
    name: "Workstation AI Deep Learning",
    subtitle: "RTX 4090 · Lab 204",
    tag: "Calculatoare",
    imageUrl:
      "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 2,
    name: "Braț Robotic Niryo Ned 2",
    subtitle: "6 axe · Lab 208",
    tag: "Roboți",
    imageUrl:
      "https://images.unsplash.com/photo-1563206767-5b18f218e8de?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 5,
    name: "Imprimantă 3D Bambu X1",
    subtitle: "Multi-filament · Lab Prototipare",
    tag: "Prototipare",
    imageUrl:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
  },
]

interface DashboardReservationsSectionProps {
  inUseRows: DashboardBookingRow[]
  upcomingRows: DashboardBookingRow[]
  isLoading: boolean
  totalCatalogCount: number
  onNavigateReservations: () => void
  onSelectResource: (id: number) => void
}

export function DashboardReservationsSection({
  inUseRows,
  upcomingRows,
  isLoading,
  totalCatalogCount,
  onNavigateReservations,
  onSelectResource,
}: DashboardReservationsSectionProps) {
  return (
    <div className="lg:col-span-8 space-y-5">
      <Card className="rounded-2xl border-neutral-200 bg-white p-5 shadow-none space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-neutral-800" />
            <h2 className="text-sm font-bold text-neutral-900">În utilizare</h2>
          </div>
          <Badge className="rounded-full bg-neutral-950 hover:bg-neutral-950 text-white text-[10px] font-semibold px-2.5 py-0.5 border-transparent">
            {inUseRows.length} active
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-50 text-neutral-500 font-medium border-y border-neutral-100">
              <tr>
                <th className="py-2.5 px-3">Resursă</th>
                <th className="py-2.5 px-3">Interval</th>
                <th className="py-2.5 px-3">Laborator</th>
                <th className="py-2.5 px-3">Stare</th>
                <th className="py-2.5 px-3 text-right">Acțiune</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-neutral-400">
                    Se încarcă rezervările active...
                  </td>
                </tr>
              ) : inUseRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-neutral-400">
                    Nu ai nicio resursă preluată în utilizare în acest moment.
                  </td>
                </tr>
              ) : (
                inUseRows.map((row) => (
                  <tr key={row.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={row.imageUrl}
                          alt={row.name}
                          className="h-10 w-10 rounded-lg object-cover bg-neutral-900 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-neutral-900">{row.name}</div>
                          <div className="text-[11px] text-neutral-400 font-mono">{row.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-neutral-700 font-medium">{row.interval}</td>
                    <td className="py-3.5 px-3 text-neutral-600">{row.room}</td>
                    <td className="py-3.5 px-3">
                      <div className="flex flex-col items-start gap-1">
                        <Badge className="rounded-full bg-neutral-950 hover:bg-neutral-950 text-white text-[10px] font-semibold px-2.5 py-0.5 border-transparent">
                          {row.status}
                        </Badge>
                        {row.dueAlert && (
                          <Badge
                            variant="outline"
                            className="rounded-full bg-amber-50 border-amber-200 text-amber-800 text-[10px] font-semibold px-2 py-0.5 gap-1"
                          >
                            <AlertTriangle className="h-2.5 w-2.5 text-amber-600" />
                            {row.dueAlert}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onNavigateReservations}
                        className="h-7 px-3 rounded-lg border-neutral-200 text-[11px] font-semibold text-neutral-800"
                      >
                        Detalii
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="rounded-2xl border-neutral-200 bg-white p-5 shadow-none space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-neutral-800" />
            <h2 className="text-sm font-bold text-neutral-900">
              Urmează în calendar (De preluat)
            </h2>
          </div>
          <Badge
            variant="outline"
            className="rounded-full bg-neutral-100 border-neutral-200 text-neutral-700 text-[10px] font-semibold px-2.5 py-0.5"
          >
            {upcomingRows.length} viitoare
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-50 text-neutral-500 font-medium border-y border-neutral-100">
              <tr>
                <th className="py-2.5 px-3">Resursă</th>
                <th className="py-2.5 px-3">Interval preluare</th>
                <th className="py-2.5 px-3">Laborator</th>
                <th className="py-2.5 px-3">Stare</th>
                <th className="py-2.5 px-3 text-right">Acțiune</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-neutral-400">
                    Se încarcă calendarul...
                  </td>
                </tr>
              ) : upcomingRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-neutral-400">
                    Nu ai rezervări viitoare programate în calendar.
                  </td>
                </tr>
              ) : (
                upcomingRows.map((row) => (
                  <tr key={row.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={row.imageUrl}
                          alt={row.name}
                          className="h-10 w-10 rounded-lg object-cover bg-neutral-100 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-neutral-900">{row.name}</div>
                          <div className="text-[11px] text-neutral-400 font-mono">{row.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-neutral-700 font-medium">{row.interval}</td>
                    <td className="py-3.5 px-3 text-neutral-600">{row.room}</td>
                    <td className="py-3.5 px-3">
                      <Badge
                        variant="outline"
                        className="rounded-full bg-neutral-100 border-neutral-200 text-neutral-800 text-[10px] font-semibold px-2.5 py-0.5"
                      >
                        {row.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onNavigateReservations}
                        className="h-7 px-3 rounded-lg border-neutral-200 text-[11px] font-semibold text-neutral-800"
                      >
                        Detalii
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="rounded-2xl border-neutral-200 bg-white p-5 shadow-none space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-neutral-800" />
            <h2 className="text-sm font-bold text-neutral-900">Resurse disponibile</h2>
          </div>
          <Link
            to="/resources"
            className="text-xs font-semibold text-neutral-700 hover:text-neutral-950 flex items-center gap-0.5"
          >
            <span>Catalog complet ({totalCatalogCount})</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {FEATURED_RESOURCES.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectResource(item.id)}
              className="rounded-xl border border-neutral-200 overflow-hidden bg-white hover:border-neutral-400 transition-colors cursor-pointer flex flex-col justify-between"
            >
              <div className="h-28 w-full bg-neutral-100 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3 space-y-2">
                <div>
                  <div className="text-xs font-bold text-neutral-900 line-clamp-1">
                    {item.name}
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">{item.subtitle}</div>
                </div>
                <Badge
                  variant="outline"
                  className="rounded-full bg-neutral-100 border-neutral-200 text-neutral-700 text-[10px] font-semibold px-2 py-0.5"
                >
                  {item.tag}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
