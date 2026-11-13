import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { reservationsApi } from "../api/reservations"
import { resourcesApi } from "../api/resources"
import {
  RO_MONTHS,
  buildFiveDays,
  toDisplayDateStr,
  toIsoDateStr,
} from "../components/resources/ResourceAvailabilityCalendar"
import { getCatalogItemByIdOrCode } from "../data/catalogItems"
import type { Reservation, Resource, StudentQuota } from "../types"

export function useResourceDetail(resKey: string) {
  const navigate = useNavigate()
  const catalogMatch = getCatalogItemByIdOrCode(resKey)
  const fallback = {
    id: catalogMatch.id,
    nume: catalogMatch.name,
    categorie_nume: catalogMatch.categoryTag,
    stare_label: catalogMatch.statusBadge,
    sala_cod: catalogMatch.roomLabel,
    specializare: catalogMatch.specializare,
    departament: catalogMatch.department,
    cod_inventar: catalogMatch.code,
    imagine_url: catalogMatch.imageUrl,
    specs: catalogMatch.specs,
  }

  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const initialHour = useMemo(() => {
    const h = new Date().getHours()
    return h >= 8 && h <= 18 ? h : 9
  }, [])

  const [resource, setResource] = useState<Resource | null>(null)
  const [resourceBookings, setResourceBookings] = useState<Reservation[]>([])
  const [quota, setQuota] = useState<StudentQuota>({
    active_count: 0,
    max_limit: 4,
    can_reserve: true,
    active_reservations: [],
  })

  const [dayOffset, setDayOffset] = useState<number>(0)
  const days = useMemo(() => buildFiveDays(today, dayOffset), [today, dayOffset])
  const [bookingMode, setBookingMode] = useState<"HOURLY" | "MULTIDAY">("HOURLY")
  const [selectedIsoDate, setSelectedIsoDate] = useState<string>(() => toIsoDateStr(new Date()))
  const [selectedStartHour, setSelectedStartHour] = useState<number>(initialHour)
  const [durationHours, setDurationHours] = useState<number>(2)
  const [multiDaysCount, setMultiDaysCount] = useState<number>(2)
  const [multiEndHour, setMultiEndHour] = useState<number>(16)
  const [purpose, setPurpose] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState<boolean>(false)

  useEffect(() => {
    const loadResourceAndQuota = async (resId: number) => {
      try {
        const [resData, quotaData, bookingsData] = await Promise.all([
          resourcesApi.getResource(resId).catch(() => null),
          reservationsApi.getMyQuota().catch(() => null),
          reservationsApi.getReservations({ resursa_id: resId, limit: 100 }).catch(() => null),
        ])
        if (resData) setResource(resData)
        if (quotaData) setQuota(quotaData)
        if (bookingsData?.items) {
          setResourceBookings(
            bookingsData.items.filter((b) => b.stare === "APROBATA" || b.stare === "IN_ASTEPTARE")
          )
        }
      } catch {}
    }
    loadResourceAndQuota(Number(resKey))
  }, [resKey])

  const startDateTime = useMemo(() => {
    const [y, m, d] = selectedIsoDate.split("-").map(Number)
    return new Date(y, (m || 1) - 1, d || 1, selectedStartHour, 0, 0, 0)
  }, [selectedIsoDate, selectedStartHour])

  const endDateTime = useMemo(() => {
    const end = new Date(startDateTime)
    if (bookingMode === "HOURLY") {
      end.setHours(startDateTime.getHours() + durationHours)
    } else {
      end.setDate(startDateTime.getDate() + multiDaysCount)
      end.setHours(multiEndHour, 0, 0, 0)
    }
    return end
  }, [bookingMode, startDateTime, durationHours, multiDaysCount, multiEndHour])

  const isSlotOccupied = (isoDate: string, hour: number): boolean => {
    const [y, m, d] = isoDate.split("-").map(Number)
    const slotStart = new Date(y, (m || 1) - 1, d || 1, hour, 0, 0, 0)
    const slotEnd = new Date(y, (m || 1) - 1, d || 1, hour + 1, 0, 0, 0)
    return resourceBookings.some((b) => {
      const bStart = new Date(b.data_inceput)
      const bEnd = new Date(b.data_sfarsit)
      return slotStart < bEnd && slotEnd > bStart
    })
  }

  const isSlotSelected = (isoDate: string, hour: number): boolean => {
    const [y, m, d] = isoDate.split("-").map(Number)
    const slotStart = new Date(y, (m || 1) - 1, d || 1, hour, 0, 0, 0)
    const slotEnd = new Date(y, (m || 1) - 1, d || 1, hour + 1, 0, 0, 0)
    return slotStart >= startDateTime && slotEnd <= endDateTime
  }

  const hasSlotConflict = useMemo(() => {
    const overlaps = resourceBookings.some((b) => {
      const bStart = new Date(b.data_inceput)
      const bEnd = new Date(b.data_sfarsit)
      return startDateTime < bEnd && endDateTime > bStart
    })
    if (overlaps) return true
    return bookingMode === "HOURLY" && selectedStartHour + durationHours > 22
  }, [resourceBookings, startDateTime, endDateTime, bookingMode, selectedStartHour, durationHours])

  const applyQuickHours = (hours: number) => {
    setBookingMode("HOURLY")
    setDurationHours(hours)
    setErrorMsg(null)
  }

  const applyQuickDays = (daysCount: number) => {
    setBookingMode("MULTIDAY")
    setMultiDaysCount(daysCount)
    setMultiEndHour(selectedStartHour)
    setErrorMsg(null)
  }

  const handleSelectSlot = (isoDate: string, hour: number) => {
    if (isSlotOccupied(isoDate, hour)) return
    setErrorMsg(null)
    setBookingSuccess(null)

    const [y, m, d] = isoDate.split("-").map(Number)
    const clickedDate = new Date(y, (m || 1) - 1, d || 1, hour, 0, 0, 0)
    if (bookingMode === "MULTIDAY" && clickedDate > startDateTime) {
      const startDayOnly = new Date(
        startDateTime.getFullYear(),
        startDateTime.getMonth(),
        startDateTime.getDate()
      )
      const clickedDayOnly = new Date(y, (m || 1) - 1, d || 1)
      const diffDays = Math.round(
        (clickedDayOnly.getTime() - startDayOnly.getTime()) / (1000 * 60 * 60 * 24)
      )
      if (diffDays >= 1 && diffDays <= 14) {
        setMultiDaysCount(diffDays)
        setMultiEndHour(hour + 1)
        return
      }
    }
    setSelectedIsoDate(isoDate)
    setSelectedStartHour(hour)
  }

  const startStr = `${String(selectedStartHour).padStart(2, "0")}:00`
  const endStr = `${String(endDateTime.getHours()).padStart(2, "0")}:00`
  const startDisplayDate = toDisplayDateStr(startDateTime)
  const endDisplayDate = toDisplayDateStr(endDateTime)

  const formattedSelectedRange =
    bookingMode === "HOURLY"
      ? `${startDisplayDate} · ${startStr}–${endStr}`
      : `${startDisplayDate} (${startStr}) – ${endDisplayDate} (${endStr})`

  const durationSummaryLabel =
    bookingMode === "HOURLY"
      ? `${durationHours} ${durationHours === 1 ? "oră" : "ore"}`
      : `${multiDaysCount} ${multiDaysCount === 1 ? "zi" : "zile"} și ${Math.max(0, multiEndHour - selectedStartHour)} ore`

  const handleContinueBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setBookingSuccess(null)

    if (endDateTime <= startDateTime) {
      setErrorMsg("Data și ora de sfârșit trebuie să fie ulterioare datei și orei de început.")
      return
    }
    if (hasSlotConflict) {
      setErrorMsg(
        `Conflict de programare: Intervalul selectat (${formattedSelectedRange}) se suprapune cu o altă rezervare existentă sau depășește programul laboratorului.`
      )
      return
    }
    if (quota.active_count >= quota.max_limit) {
      setIsQuotaModalOpen(true)
      return
    }

    setIsSubmitting(true)
    try {
      await reservationsApi.createReservation({
        resursa_id: resource?.id || fallback.id,
        data_inceput: startDateTime.toISOString(),
        data_sfarsit: endDateTime.toISOString(),
        scop: purpose.trim() || "Activitate didactică / cercetare de laborator",
      })
      navigate("/reservations")
    } catch (err: unknown) {
      const errorObj = err as { response?: { status?: number; data?: { detail?: string } } }
      const status = errorObj.response?.status
      const detail = errorObj.response?.data?.detail || "Eroare la înregistrarea rezervării."
      if (
        status === 409 &&
        (detail.includes("4") ||
          detail.toLowerCase().includes("plafon") ||
          detail.toLowerCase().includes("limit") ||
          detail.toLowerCase().includes("simultan"))
      ) {
        const refreshed = await reservationsApi.getMyQuota().catch(() => ({
          ...quota,
          active_count: 4,
          can_reserve: false,
        }))
        setQuota(refreshed)
        setIsQuotaModalOpen(true)
      } else {
        setErrorMsg(detail)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const firstDayCol = days[0]
  return {
    displayTitle: resource?.nume || fallback.nume,
    displayCategory: resource?.categorie_nume || fallback.categorie_nume,
    displayRoom: resource?.sala_cod || fallback.sala_cod,
    displayDept: resource?.departament_nume || fallback.departament,
    displayCode: resource?.cod_inventar || fallback.cod_inventar,
    displayImage: resource?.imagine_url || fallback.imagine_url,
    specializare: fallback.specializare,
    specs: fallback.specs,
    minIsoDate: toIsoDateStr(today),
    days,
    dayOffset,
    setDayOffset,
    monthLabel: `${RO_MONTHS[firstDayCol.dateObj.getMonth()]} ${firstDayCol.dateObj.getFullYear()}`,
    bookingMode,
    setBookingMode,
    selectedIsoDate,
    setSelectedIsoDate,
    selectedStartHour,
    setSelectedStartHour,
    durationHours,
    setDurationHours,
    multiDaysCount,
    setMultiDaysCount,
    multiEndHour,
    setMultiEndHour,
    purpose,
    setPurpose,
    isSubmitting,
    bookingSuccess,
    setBookingSuccess,
    errorMsg,
    setErrorMsg,
    isQuotaModalOpen,
    setIsQuotaModalOpen,
    activeCount: quota.active_count,
    maxLimit: quota.max_limit || 4,
    startStr,
    endStr,
    startDisplayDate,
    endDisplayDate,
    formattedSelectedRange,
    durationSummaryLabel,
    hasSlotConflict,
    isSlotOccupied,
    isSlotSelected,
    applyQuickHours,
    applyQuickDays,
    handleSelectSlot,
    handleContinueBooking,
  }
}
