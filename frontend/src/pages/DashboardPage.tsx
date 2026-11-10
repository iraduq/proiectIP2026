import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { resourcesApi } from "../api/resources"
import { reservationsApi } from "../api/reservations"
import { getCatalogItemByIdOrCode } from "../data/catalogItems"
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

interface DashboardBookingRow {
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
    const d1 = `${String(start.getDate()).padStart(2, "0")}.${String(start.getMonth() + 1).padStart(2, "0")}.${start.getFullYear()}`
    const d2 = `${String(end.getDate()).padStart(2, "0")}.${String(end.getMonth() + 1).padStart(2, "0")}.${end.getFullYear()}`
    const sTime = `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`
    const eTime = `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`
    if (d1 === d2) {
      return `${d1} · ${sTime}–${eTime}`
    }
    return `${d1} (${sTime}) – ${d2} (${eTime})`
  } catch {
    return "—"
  }
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [quota, setQuota] = useState<StudentQuota | null>(null)
  const [myReservations, setMyReservations] = useState<Reservation[]>([])
  const [totalCatalogCount, setTotalCatalogCount] = useState<number>(130)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [resCatalog, reservData, quotaData] = await Promise.all([
          resourcesApi.getResources({ limit: 1 }).catch(() => null),
          reservationsApi
            .getReservations(
              user?.id_utilizator
                ? { utilizator_id: user.id_utilizator, limit: 100 }
                : { limit: 100 }
            )
            .catch(() => null),
          reservationsApi.getMyQuota().catch(() => null),
        ])
        if (resCatalog && resCatalog.total > 0) {
          setTotalCatalogCount(resCatalog.total)
        }
        if (reservData && reservData.items) {
          const ownItems = user?.id_utilizator
            ? reservData.items.filter((r) => r.utilizator_id === user.id_utilizator)
            : reservData.items
          setMyReservations(ownItems)
        }
        if (quotaData) {
          setQuota(quotaData)
        }
      } catch {
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [user?.id_utilizator])

  const roleLabel =
    user?.rol === "PROFESOR"
      ? "Profesor"
      : user?.rol === "RESPONSABIL_LABORATOR"
      ? "Reprezentant laborator"
      : user?.rol === "ADMINISTRATOR"
      ? "Administrator"
      : "Student"

  const fullName = user?.nume || roleLabel
  const firstName = fullName.split(" ")[0] || roleLabel
  const initials = fullName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const now = new Date()

  const activeOrPending = myReservations.filter(
    (r) => r.stare === "APROBATA" || r.stare === "IN_ASTEPTARE"
  )

  const inUseRaw = activeOrPending.filter((r) => {
    const start = new Date(r.data_inceput)
    const end = new Date(r.data_sfarsit)
    return start <= now && end >= now
  })

  const upcomingRaw = activeOrPending.filter((r) => {
    const start = new Date(r.data_inceput)
    return start > now
  })

  const returnedCount = myReservations.filter((r) => r.stare === "FINALIZATA").length

  const mapToRow = (r: Reservation, isUpcoming: boolean): DashboardBookingRow => {
    const catalogMeta = getCatalogItemByIdOrCode(r.resursa_cod || r.resursa_id)
    const end = new Date(r.data_sfarsit)
    const endHourMin = `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`
    const dueToday = !isUpcoming && isSameCalendarDay(end, now)

    return {
      id: r.id,
      resourceId: r.resursa_id,
      name: r.resursa_nume || catalogMeta.name,
      code: r.resursa_cod || catalogMeta.code,
      interval: formatReservationInterval(r),
      room: r.sala_nume || catalogMeta.roomLabel,
      status: isUpcoming
        ? r.stare === "APROBATA"
          ? "Confirmat"
          : "În așteptare"
        : "Activ",
      dueAlert: dueToday ? `Azi ${endHourMin}` : undefined,
      endTimeStr: endHourMin,
      imageUrl: catalogMeta.imageUrl,
    }
  }

  const inUseRows = inUseRaw.map((r) => mapToRow(r, false))
  const upcomingRows = upcomingRaw.map((r) => mapToRow(r, true))
  const dueTodayRows = inUseRows.filter((row) => Boolean(row.dueAlert))

  const activeCount = quota ? quota.active_count : activeOrPending.length
  const maxQuota = quota?.max_limit || 4
  const quotaPercent = Math.min(100, Math.round((activeCount / maxQuota) * 100))

  const nextUpcomingText =
    upcomingRows.length > 0
      ? `${upcomingRows[0].interval.split("·")[0].trim()} · ${upcomingRows[0].name}`
      : "Nicio rezervare viitoare"

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
                {roleLabel}
              </Badge>
            </div>
            <p className="text-xs text-neutral-500">
              Panou de bord personal · Gestiune rezervări și echipamente
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

        {dueTodayRows.length > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 px-5 py-3.5 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-xs">
              <p className="font-bold text-amber-900">
                Ai {dueTodayRows.length} {dueTodayRows.length === 1 ? "resursă" : "resurse"} cu termen astăzi
              </p>
              <p className="text-amber-800">
                De returnat astăzi: {dueTodayRows[0].name} ({dueTodayRows[0].room}) până la ora{" "}
                {dueTodayRows[0].endTimeStr || "16:00"}.
              </p>
            </div>
          </div>
        )}

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
            <div className="text-[11px] text-neutral-400 truncate">
              {nextUpcomingText}
            </div>
          </Card>

          <Card className="rounded-2xl border-neutral-200 bg-white p-5 shadow-none space-y-2.5">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span className="font-medium">Resurse returnate</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-neutral-400" />
            </div>
            <div className="text-3xl font-extrabold text-neutral-900">
              {returnedCount}
            </div>
            <div className="text-[11px] text-neutral-400">
              în anul universitar curent
            </div>
          </Card>

          <Card
            className={`rounded-2xl p-5 shadow-none space-y-2.5 ${
              dueTodayRows.length > 0
                ? "border-amber-300 bg-amber-50/10"
                : "border-neutral-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between text-xs text-neutral-600">
              <span className="font-medium">Alerte scadente</span>
              <AlertTriangle
                className={`h-3.5 w-3.5 ${
                  dueTodayRows.length > 0 ? "text-amber-600" : "text-neutral-400"
                }`}
              />
            </div>
            <div
              className={`text-3xl font-extrabold ${
                dueTodayRows.length > 0 ? "text-amber-600" : "text-neutral-900"
              }`}
            >
              {dueTodayRows.length}
            </div>
            <div
              className={`text-[11px] font-medium ${
                dueTodayRows.length > 0 ? "text-amber-700" : "text-neutral-400"
              }`}
            >
              {dueTodayRows.length > 0
                ? `Returnare azi la ${dueTodayRows[0].endTimeStr || "16:00"}`
                : "Nicio returnare scadentă azi"}
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
                              onClick={() => navigate("/reservations")}
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
                              onClick={() => navigate("/reservations")}
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
                  onClick={() => navigate("/resources")}
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
