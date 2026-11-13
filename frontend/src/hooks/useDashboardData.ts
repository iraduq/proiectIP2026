import { useEffect, useState } from "react"
import { reservationsApi } from "../api/reservations"
import { resourcesApi } from "../api/resources"
import type { DashboardBookingRow } from "../components/dashboard/DashboardReservationsSection"
import { getCatalogItemByIdOrCode } from "../data/catalogItems"
import type { Reservation, StudentQuota, User } from "../types"

function formatReservationInterval(res: Reservation): string {
  try {
    const start = new Date(res.data_inceput)
    const end = new Date(res.data_sfarsit)
    const d1 = `${String(start.getDate()).padStart(2, "0")}.${String(start.getMonth() + 1).padStart(2, "0")}.${start.getFullYear()}`
    const d2 = `${String(end.getDate()).padStart(2, "0")}.${String(end.getMonth() + 1).padStart(2, "0")}.${end.getFullYear()}`
    const sTime = `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`
    const eTime = `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`
    if (d1 === d2) return `${d1} · ${sTime}–${eTime}`
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

export function useDashboardData(user: User | null) {
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
        if (resCatalog && resCatalog.total > 0) setTotalCatalogCount(resCatalog.total)
        if (reservData?.items) {
          const ownItems = user?.id_utilizator
            ? reservData.items.filter((r) => r.utilizator_id === user.id_utilizator)
            : reservData.items
          setMyReservations(ownItems)
        }
        if (quotaData) setQuota(quotaData)
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

  const upcomingRaw = activeOrPending.filter((r) => new Date(r.data_inceput) > now)
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

  return {
    roleLabel,
    fullName,
    firstName,
    initials,
    isLoading,
    totalCatalogCount,
    inUseRows,
    upcomingRows,
    dueTodayRows,
    returnedCount,
    activeCount,
    maxQuota,
    quotaPercent,
    nextUpcomingText,
  }
}
