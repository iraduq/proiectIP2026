import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { resourcesApi } from "../api/resources"
import { reservationsApi } from "../api/reservations"
import { AppLayout } from "../components/layout/AppLayout"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import type { Reservation, StudentQuota } from "../types"
import {
  Plus,
  AlertTriangle,
  Cpu,
  Calendar,
  CheckCircle2,
  Layers,
  ChevronRight,
  Compass,
} from "lucide-react"

interface ActiveUsageItem {
  id: number
  resourceId: number
  name: string
  code: string
  interval: string
  room: string
  status: string
  dueAlert?: string
  imageUrl: string
}

const DEFAULT_IN_USE: ActiveUsageItem[] = [
  {
    id: 101,
    resourceId: 1,
    name: "Workstation AI",
    code: "INV-USV-2026-014",
    interval: "22.10.2026 · 09:00–16:00",
    room: "Lab 204",
    status: "Activ",
    imageUrl: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 102,
    resourceId: 3,
    name: "Jetson Orin Nano",
    code: "INV-USV-2026-102",
    interval: "22.10.2026 · 10:00–16:00",
    room: "Lab 210",
    status: "Activ",
    dueAlert: "Azi 16:00",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80",
  },
]

const DEFAULT_UPCOMING: ActiveUsageItem[] = [
  {
    id: 201,
    resourceId: 2,
    name: "Niryo Ned 2",
    code: "INV-USV-2026-088",
    interval: "23.10.2026 · 10:00–12:00",
    room: "Lab 208",
    status: "Confirmat",
    imageUrl: "https://images.unsplash.com/photo-1563206767-5b18f218e8de?auto=format&fit=crop&w=400&q=80",
  },
]

const FEATURED_RESOURCES = [
  {
    id: 1,
    name: "Workstation AI Deep Learning",
    subtitle: "RTX 4090 · Lab 204",
    tag: "Calculatoare",
    imageUrl: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 2,
    name: "Braț Robotic Niryo Ned 2",
    subtitle: "6 axe · Lab 208",
    tag: "Roboți",
    imageUrl: "https://images.unsplash.com/photo-1563206767-5b18f218e8de?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 5,
    name: "Imprimantă 3D Bambu X1",
    subtitle: "Multi-filament · Lab Prototipare",
    tag: "Prototipare",
    imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
  },
]

function formatReservationInterval(res: Reservation): string {
  try {
    const start = new Date(res.data_inceput)
    const end = new Date(res.data_sfarsit)
    const d = `${String(start.getDate()).padStart(2, "0")}.${String(start.getMonth() + 1).padStart(2, "0")}.${start.getFullYear()}`
    const sTime = `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`
    const eTime = `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`
    return `${d} · ${sTime}–${eTime}`
  } catch {
    return "22.10.2026 · 10:00–14:00"
  }
}

export function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [quota, setQuota] = useState<StudentQuota | null>(null)
  const [myReservations, setMyReservations] = useState<Reservation[]>([])
  const [totalCatalogCount, setTotalCatalogCount] = useState<number>(130)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [resCatalog, reservData, quotaData] = await Promise.all([
          resourcesApi.getResources({ limit: 1 }).catch(() => null),
          reservationsApi.getReservations({ limit: 10 }).catch(() => null),
          reservationsApi.getMyQuota().catch(() => null),
        ])
        if (resCatalog && resCatalog.total > 0) {
          setTotalCatalogCount(resCatalog.total)
        }
        if (reservData && reservData.items) {
          setMyReservations(reservData.items)
        }
        if (quotaData) {
          setQuota(quotaData)
        }
      } catch {
      }
    }
    loadData()
  }, [])

  const fullName = user?.nume || "Radu Ivan"
  const firstName = fullName.split(" ")[0] || "Radu"
  const initials = fullName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const dynamicInUse: ActiveUsageItem[] = myReservations
    .filter((r) => r.stare === "APROBATA" || r.stare === "IN_ASTEPTARE")
    .slice(0, 3)
    .map((r, idx) => ({
      id: r.id,
      resourceId: r.resursa_id,
      name: r.resursa_nume || "Workstation AI Deep Learning",
      code: r.resursa_cod || `INV-USV-2026-0${14 + idx}`,
      interval: formatReservationInterval(r),
      room: r.sala_nume || "Lab 204",
      status: "Activ",
      dueAlert: idx === 1 ? "Azi 16:00" : undefined,
      imageUrl:
        idx % 2 === 0
          ? "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=400&q=80"
          : "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80",
    }))

  const inUseRows = dynamicInUse.length >= 2 ? dynamicInUse : DEFAULT_IN_USE
  const upcomingRows = DEFAULT_UPCOMING

  const activeCount = quota && quota.active_count > 0 ? quota.active_count : inUseRows.length
  const maxQuota = quota?.max_limit || 4
  const quotaPercent = Math.min(100, Math.round((activeCount / maxQuota) * 100))

  return (
    <AppLayout breadcrumbs={["Spațiu de lucru", "Panou de bord"]}>
      <div className="max-w-7xl mx-auto space-y-4">
        <Card className="rounded-2xl border-neutral-200 bg-white p-6 shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                Bună, {firstName}!
              </h1>
              <Badge
                variant="outline"
                className="rounded-full bg-neutral-100 border-neutral-200 text-neutral-700 text-[11px] font-medium px-2.5 py-0.5"
              >
                Student
              </Badge>
            </div>
            <p className="text-xs text-neutral-500">
              Panou de bord personal · 22 octombrie 2026
            </p>
          </div>

          <Button
            onClick={() => navigate("/resources")}
            className="bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold h-9 px-4 rounded-lg gap-1.5 shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            Rezervare nouă
          </Button>
        </Card>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 px-5 py-3.5 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs">
            <p className="font-bold text-amber-900">
              Ai 1 resursă cu termen astăzi
            </p>
            <p className="text-amber-800">
              Ai 1 resursă de returnat astăzi: Kit NVIDIA Jetson Orin Nano (Lab 210) până la ora 16:00.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-2xl border-neutral-200 bg-white p-5 shadow-none space-y-2.5">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span className="font-medium">Rezervări active</span>
              <Layers className="h-3.5 w-3.5 text-neutral-400" />
            </div>
            <div className="text-3xl font-extrabold text-neutral-900">
              {activeCount}
            </div>
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
            <div className="text-3xl font-extrabold text-neutral-900">
              {upcomingRows.length}
            </div>
            <div className="text-[11px] text-neutral-400">
              23.10.2026 · Niryo Ned 2
            </div>
          </Card>

          <Card className="rounded-2xl border-neutral-200 bg-white p-5 shadow-none space-y-2.5">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span className="font-medium">Resurse returnate</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-neutral-400" />
            </div>
            <div className="text-3xl font-extrabold text-neutral-900">
              12
            </div>
            <div className="text-[11px] text-neutral-400">
              în anul universitar 2026
            </div>
          </Card>

          <Card className="rounded-2xl border-amber-300 bg-amber-50/10 p-5 shadow-none space-y-2.5">
            <div className="flex items-center justify-between text-xs text-neutral-600">
              <span className="font-medium">Alerte scadente</span>
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            </div>
            <div className="text-3xl font-extrabold text-amber-600">
              1
            </div>
            <div className="text-[11px] text-amber-700 font-medium">
              Returnare azi la 16:00
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
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
                    {inUseRows.map((row) => (
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
                        <td className="py-3.5 px-3 text-neutral-700 font-medium">
                          {row.interval}
                        </td>
                        <td className="py-3.5 px-3 text-neutral-600">
                          {row.room}
                        </td>
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
                            onClick={() => navigate(`/resources/${row.resourceId}`)}
                            className="h-7 px-3 rounded-lg border-neutral-200 text-[11px] font-semibold text-neutral-800"
                          >
                            Detalii
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="rounded-2xl border-neutral-200 bg-white p-5 shadow-none space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-neutral-800" />
                  <h2 className="text-sm font-bold text-neutral-900">Urmează în calendar</h2>
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
                      <th className="py-2.5 px-3">Interval</th>
                      <th className="py-2.5 px-3">Laborator</th>
                      <th className="py-2.5 px-3">Stare</th>
                      <th className="py-2.5 px-3 text-right">Acțiune</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {upcomingRows.map((row) => (
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
                        <td className="py-3.5 px-3 text-neutral-700 font-medium">
                          {row.interval}
                        </td>
                        <td className="py-3.5 px-3 text-neutral-600">
                          {row.room}
                        </td>
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
                            onClick={() => navigate(`/resources/${row.resourceId}`)}
                            className="h-7 px-3 rounded-lg border-neutral-200 text-[11px] font-semibold text-neutral-800"
                          >
                            Detalii
                          </Button>
                        </td>
                      </tr>
                    ))}
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
                    onClick={() => navigate(`/resources/${item.id}`)}
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
                        <div className="text-[11px] text-neutral-500 mt-0.5">
                          {item.subtitle}
                        </div>
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
                    Student
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
                  onClick={() => navigate("/resources")}
                  className="w-full h-9 rounded-xl border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-semibold text-neutral-800"
                >
                  Explorează catalogul ({totalCatalogCount} resurse)
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/reservations")}
                  className="w-full h-9 rounded-xl border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-semibold text-neutral-800"
                >
                  Rezervările mele
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/guide")}
                  className="w-full h-9 rounded-xl border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-semibold text-neutral-800"
                >
                  Ghid laborator
                </Button>
                <Button
                  onClick={() => navigate("/resources/1")}
                  className="w-full h-9 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold"
                >
                  Rezervă o resursă
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
