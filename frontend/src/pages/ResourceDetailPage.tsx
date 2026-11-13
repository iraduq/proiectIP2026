import { useState, useEffect, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { MapPin, CheckCircle2, AlertCircle } from "lucide-react"
import { AppLayout } from "../components/layout/AppLayout"
import { useAuth } from "../context/AuthContext"
import { resourcesApi } from "../api/resources"
import { reservationsApi } from "../api/reservations"
import type { Resource, Reservation, StudentQuota } from "../types"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Card } from "../components/ui/card"
import { QuotaLimitModal } from "../components/modals/QuotaLimitModal"
import { getCatalogItemByIdOrCode } from "../data/catalogItems"
import { ResourceSpecsCard } from "../components/resources/ResourceSpecsCard"
import {
  ResourceAvailabilityCalendar,
  RO_MONTHS,
  buildFiveDays,
  toDisplayDateStr,
  toIsoDateStr,
} from "../components/resources/ResourceAvailabilityCalendar"
import { ResourceBookingFormCard } from "../components/resources/ResourceBookingFormCard"

export function ResourceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const resKey = id || "1"
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
    if (h >= 8 && h <= 18) return h
    return 9
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
        if (resData) {
          setResource(resData)
        }
        if (quotaData) {
          setQuota(quotaData)
        }
        if (bookingsData && bookingsData.items) {
          setResourceBookings(
            bookingsData.items.filter(
              (b) => b.stare === "APROBATA" || b.stare === "IN_ASTEPTARE"
            )
          )
        }
      } catch {
      }
    }
    loadResourceAndQuota(Number(resKey))
  }, [resKey])

  const displayTitle = resource?.nume || fallback.nume
  const displayCategory = resource?.categorie_nume || fallback.categorie_nume
  const displayRoom = resource?.sala_cod || fallback.sala_cod
  const displayDept = resource?.departament_nume || fallback.departament
  const displayCode = resource?.cod_inventar || fallback.cod_inventar
  const displayImage = resource?.imagine_url || fallback.imagine_url

  const startDateTime = useMemo(() => {
    const [y, m, d] = selectedIsoDate.split("-").map(Number)
    return new Date(y, (m || 1) - 1, d || 1, selectedStartHour, 0, 0, 0)
  }, [selectedIsoDate, selectedStartHour])

  const endDateTime = useMemo(() => {
    if (bookingMode === "HOURLY") {
      const end = new Date(startDateTime)
      end.setHours(startDateTime.getHours() + durationHours)
      return end
    } else {
      const end = new Date(startDateTime)
      end.setDate(startDateTime.getDate() + multiDaysCount)
      end.setHours(multiEndHour, 0, 0, 0)
      return end
    }
  }, [bookingMode, startDateTime, durationHours, multiDaysCount, multiEndHour])

  const isSlotOccupied = (isoDate: string, hour: number): boolean => {
    const [y, m, d] = isoDate.split("-").map(Number)
    const slotStart = new Date(y, (m || 1) - 1, d || 1, hour, 0, 0, 0)
    const slotEnd = new Date(y, (m || 1) - 1, d || 1, hour + 1, 0, 0, 0)

    for (const b of resourceBookings) {
      const bStart = new Date(b.data_inceput)
      const bEnd = new Date(b.data_sfarsit)
      if (slotStart < bEnd && slotEnd > bStart) {
        return true
      }
    }
    return false
  }

  const isSlotSelected = (isoDate: string, hour: number): boolean => {
    const [y, m, d] = isoDate.split("-").map(Number)
    const slotStart = new Date(y, (m || 1) - 1, d || 1, hour, 0, 0, 0)
    const slotEnd = new Date(y, (m || 1) - 1, d || 1, hour + 1, 0, 0, 0)
    return slotStart >= startDateTime && slotEnd <= endDateTime
  }

  const hasSlotConflict = useMemo(() => {
    for (const b of resourceBookings) {
      const bStart = new Date(b.data_inceput)
      const bEnd = new Date(b.data_sfarsit)
      if (startDateTime < bEnd && endDateTime > bStart) {
        return true
      }
    }
    if (bookingMode === "HOURLY" && selectedStartHour + durationHours > 22) {
      return true
    }
    return false
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
  const endHourVal = endDateTime.getHours()
  const endStr = `${String(endHourVal).padStart(2, "0")}:00`
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
      const targetId = resource?.id || fallback.id

      await reservationsApi.createReservation({
        resursa_id: targetId,
        data_inceput: startDateTime.toISOString(),
        data_sfarsit: endDateTime.toISOString(),
        scop: purpose.trim() || "Activitate didactică / cercetare de laborator",
      })

      navigate("/reservations")
    } catch (err: unknown) {
      const errorObj = err as { response?: { status?: number; data?: { detail?: string } } }
      const status = errorObj.response?.status
      const detail: string = errorObj.response?.data?.detail || "Eroare la înregistrarea rezervării."
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

  const activeCount = quota.active_count
  const maxLimit = quota.max_limit || 4
  const firstDayCol = days[0]
  const monthLabel = `${RO_MONTHS[firstDayCol.dateObj.getMonth()]} ${firstDayCol.dateObj.getFullYear()}`

  return (
    <AppLayout breadcrumbs={["Spațiu de lucru", "Catalog resurse", displayTitle]}>
      <div className="max-w-7xl mx-auto space-y-5">
        <Card className="rounded-2xl border-neutral-200 bg-white p-6 shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                {displayTitle}
              </h1>
              <Badge
                variant="outline"
                className="rounded-full bg-neutral-100 border-neutral-200 text-neutral-700 text-[11px] font-medium px-2.5 py-0.5"
              >
                {displayCategory}
              </Badge>
              <Badge className="rounded-full bg-neutral-950 hover:bg-neutral-950 text-white text-[11px] font-semibold px-2.5 py-0.5 border-transparent">
                Disponibil
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <MapPin className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
              <span>
                {displayRoom} · {fallback.specializare} · {displayCode}
              </span>
            </div>
          </div>

          <Button
            onClick={() => {
              const el = document.getElementById("booking-section")
              el?.scrollIntoView({ behavior: "smooth" })
            }}
            className="bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold h-9 px-4 rounded-lg shrink-0"
          >
            Rezervă resursa
          </Button>
        </Card>

        {bookingSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{bookingSuccess}</span>
            </div>
            <button onClick={() => setBookingSuccess(null)} className="font-bold text-emerald-700">
              ✕
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span className="font-medium">{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="font-bold text-rose-700">
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <ResourceSpecsCard
            displayImage={displayImage}
            displayTitle={displayTitle}
            displayCode={displayCode}
            specs={fallback.specs}
            displayRoom={displayRoom}
            displayDept={displayDept}
            specializare={fallback.specializare}
            userRole={user?.rol}
          />

          <div className="lg:col-span-8 space-y-5">
            <ResourceAvailabilityCalendar
              days={days}
              dayOffset={dayOffset}
              monthLabel={monthLabel}
              onPrevDays={() => setDayOffset((prev) => Math.max(0, prev - 5))}
              onNextDays={() => setDayOffset((prev) => prev + 5)}
              isSlotOccupied={isSlotOccupied}
              isSlotSelected={isSlotSelected}
              onSelectSlot={handleSelectSlot}
            />

            <ResourceBookingFormCard
              bookingMode={bookingMode}
              onBookingModeChange={(mode) => {
                setBookingMode(mode)
                setErrorMsg(null)
              }}
              formattedSelectedRange={formattedSelectedRange}
              durationSummaryLabel={durationSummaryLabel}
              displayTitle={displayTitle}
              displayRoom={displayRoom}
              durationHours={durationHours}
              onDurationHoursChange={(h) => {
                setDurationHours(h)
                setErrorMsg(null)
              }}
              multiDaysCount={multiDaysCount}
              onMultiDaysCountChange={(d) => {
                setMultiDaysCount(d)
                setErrorMsg(null)
              }}
              multiEndHour={multiEndHour}
              onMultiEndHourChange={(h) => {
                setMultiEndHour(h)
                setErrorMsg(null)
              }}
              selectedIsoDate={selectedIsoDate}
              minIsoDate={toIsoDateStr(today)}
              onSelectedIsoDateChange={(iso) => {
                setSelectedIsoDate(iso)
                setErrorMsg(null)
              }}
              selectedStartHour={selectedStartHour}
              onSelectedStartHourChange={(h) => {
                setSelectedStartHour(h)
                setErrorMsg(null)
              }}
              startStr={startStr}
              endStr={endStr}
              endDisplayDate={endDisplayDate}
              purpose={purpose}
              onPurposeChange={setPurpose}
              hasSlotConflict={hasSlotConflict}
              activeCount={activeCount}
              maxLimit={maxLimit}
              isSubmitting={isSubmitting}
              onQuickHours={applyQuickHours}
              onQuickDays={applyQuickDays}
              onSubmit={handleContinueBooking}
            />
          </div>
        </div>
      </div>

      <QuotaLimitModal
        isOpen={isQuotaModalOpen}
        onClose={() => setIsQuotaModalOpen(false)}
        attemptedDate={startDisplayDate}
        attemptedTime={`${startStr}–${endStr}`}
        currentActiveCount={activeCount}
        maxLimit={maxLimit}
      />
    </AppLayout>
  )
}
