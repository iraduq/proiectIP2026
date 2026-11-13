import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, AlertTriangle } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { resourcesApi } from "../api/resources"
import { reservationsApi } from "../api/reservations"
import { getCatalogItemByIdOrCode } from "../data/catalogItems"
import { AppLayout } from "../components/layout/AppLayout"
import { DashboardStatsGrid } from "../components/dashboard/DashboardStatsGrid"
import {
  DashboardReservationsSection,
  type DashboardBookingRow,
} from "../components/dashboard/DashboardReservationsSection"
import { DashboardSidebarWidgets } from "../components/dashboard/DashboardSidebarWidgets"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import type { Reservation, StudentQuota } from "../types"

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

        <DashboardStatsGrid
          activeCount={activeCount}
          maxQuota={maxQuota}
          quotaPercent={quotaPercent}
          upcomingCount={upcomingRows.length}
          nextUpcomingText={nextUpcomingText}
          returnedCount={returnedCount}
          dueTodayCount={dueTodayRows.length}
          dueEndTimeStr={dueTodayRows[0]?.endTimeStr}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <DashboardReservationsSection
            inUseRows={inUseRows}
            upcomingRows={upcomingRows}
            isLoading={isLoading}
            totalCatalogCount={totalCatalogCount}
            onNavigateReservations={() => navigate("/reservations")}
            onSelectResource={(id) => navigate(`/resources/${id}`)}
          />

          <DashboardSidebarWidgets
            initials={initials}
            fullName={fullName}
            roleLabel={roleLabel}
            activeCount={activeCount}
            maxQuota={maxQuota}
            quotaPercent={quotaPercent}
            totalCatalogCount={totalCatalogCount}
            onNavigateResources={() => navigate("/resources")}
            onNavigateReservations={() => navigate("/reservations")}
            onNavigateRooms={() => navigate("/rooms")}
          />
        </div>
      </div>
    </AppLayout>
  )
}
