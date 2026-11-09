import { useState, useEffect, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { AppLayout } from "../components/layout/AppLayout"
import { resourcesApi } from "../api/resources"
import { reservationsApi } from "../api/reservations"
import type { Resource, Reservation, StudentQuota } from "../types"
import {
  Cpu,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Card } from "../components/ui/card"
import { Textarea } from "../components/ui/textarea"
import { QuotaLimitModal } from "../components/modals/QuotaLimitModal"
import { getCatalogItemByIdOrCode } from "../data/catalogItems"

interface DayColumn {
  dateObj: Date
  isoDate: string
  displayDate: string
  headerLabel: string
}

const RO_WEEKDAYS = ["Dum", "Lun", "Mar", "Mie", "Joi", "Vin", "Sâm"]
const RO_MONTHS = [
  "Ianuarie",
  "Februarie",
  "Martie",
  "Aprilie",
  "Mai",
  "Iunie",
  "Iulie",
  "August",
  "Septembrie",
  "Octombrie",
  "Noiembrie",
  "Decembrie",
]

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]

function toIsoDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function toDisplayDateStr(d: Date): string {
  const day = String(d.getDate()).padStart(2, "0")
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const y = d.getFullYear()
  return `${day}.${m}.${y}`
}

function buildFiveDays(baseDate: Date, offsetDays: number): DayColumn[] {
  const cols: DayColumn[] = []
  for (let i = 0; i < 5; i++) {
    const d = new Date(baseDate)
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() + offsetDays + i)
    const dd = String(d.getDate()).padStart(2, "0")
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const wk = RO_WEEKDAYS[d.getDay()]
    cols.push({
      dateObj: d,
      isoDate: toIsoDateStr(d),
      displayDate: toDisplayDateStr(d),
      headerLabel: `${dd}.${mm} · ${wk}`,
    })
  }
  return cols
}

export function ResourceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

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
    loadResourceAndQuota(Number(resKey))
  }, [resKey])

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

  const handleSelectSlot = (isoDate: string, hour: number) => {
    if (isSlotOccupied(isoDate, hour)) return
    setErrorMsg(null)
    setBookingSuccess(null)
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
    } catch (err: any) {
      const status = err.response?.status
      const detail: string = err.response?.data?.detail || "Eroare la înregistrarea rezervării."
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
  const lastDayCol = days[days.length - 1]
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
          <div className="lg:col-span-4 space-y-5">
            <Card className="rounded-2xl border-neutral-200 bg-white overflow-hidden shadow-none">
              <div className="h-56 w-full bg-neutral-950 overflow-hidden">
                <img
                  src={displayImage}
                  alt={displayTitle}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="px-4 py-2.5 bg-white border-t border-neutral-100 text-[11px] text-neutral-400 font-mono">
                {displayCode}
              </div>
            </Card>

            <Card className="rounded-2xl border-neutral-200 bg-white p-5 shadow-none space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
                <Cpu className="h-4 w-4 text-neutral-800" />
                <h2 className="text-sm font-bold text-neutral-900">Specificații tehnice</h2>
              </div>

              <div className="space-y-2.5 text-xs pb-3.5 border-b border-neutral-100">
                {fallback.specs.map((sp) => (
                  <div key={sp.label} className="flex items-center justify-between">
                    <span className="text-neutral-500">{sp.label}</span>
                    <span className="font-bold text-neutral-900">{sp.value}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2.5 text-xs pb-3.5 border-b border-neutral-100">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-neutral-500">
                    <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                    Laborator
                  </span>
                  <span className="font-bold text-neutral-900">{displayRoom}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Departament</span>
                  <span className="font-bold text-neutral-900">{displayDept}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Specializare</span>
                  <span className="font-bold text-neutral-900">{fallback.specializare}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                <Info className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                <span>Cotă max. 4 rezervări simultane pe cont student.</span>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-8 space-y-5">
            <Card className="rounded-2xl border-neutral-200 bg-white p-6 shadow-none space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-neutral-800" />
                  <h2 className="text-sm font-bold text-neutral-900">Disponibilitate</h2>
                </div>
                <span className="text-xs text-neutral-400">
                  {firstDayCol.displayDate} – {lastDayCol.displayDate}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setDayOffset((prev) => Math.max(0, prev - 5))}
                  disabled={dayOffset === 0}
                  className="h-8 px-3 rounded-lg border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 transition-colors"
                >
                  ‹ Anterior
                </button>
                <span className="text-xs font-bold text-neutral-900">{monthLabel}</span>
                <button
                  type="button"
                  onClick={() => setDayOffset((prev) => prev + 5)}
                  className="h-8 px-3 rounded-lg border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Următor ›
                </button>
              </div>

              <div className="overflow-x-auto pt-1 max-h-80">
                <table className="w-full border-separate border-spacing-1.5">
                  <thead>
                    <tr>
                      <th className="w-14 text-left text-[11px] font-medium text-neutral-400 pb-1" />
                      {days.map((day) => (
                        <th
                          key={day.isoDate}
                          className="text-center text-[11px] font-bold text-neutral-800 pb-1 min-w-[96px]"
                        >
                          {day.headerLabel}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {HOURS.map((hour) => {
                      const timeLabel = `${String(hour).padStart(2, "0")}:00`
                      return (
                        <tr key={hour}>
                          <td className="text-[11px] font-medium text-neutral-400 pr-2 py-1 align-middle">
                            {timeLabel}
                          </td>
                          {days.map((day) => {
                            const occupied = isSlotOccupied(day.isoDate, hour)
                            const selected = isSlotSelected(day.isoDate, hour)
                            const conflictOnSlot = occupied && selected

                            return (
                              <td key={`${day.isoDate}-${hour}`} className="p-0">
                                {conflictOnSlot ? (
                                  <button
                                    type="button"
                                    disabled
                                    className="w-full h-8 rounded-lg bg-rose-100 border border-rose-300 text-rose-700 text-[11px] font-bold cursor-not-allowed"
                                  >
                                    Conflict
                                  </button>
                                ) : occupied ? (
                                  <button
                                    type="button"
                                    disabled
                                    className="w-full h-8 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-400 text-[11px] font-medium cursor-not-allowed"
                                  >
                                    Ocupat
                                  </button>
                                ) : selected ? (
                                  <button
                                    type="button"
                                    onClick={() => handleSelectSlot(day.isoDate, hour)}
                                    className="w-full h-8 rounded-lg bg-neutral-950 text-white text-[11px] font-semibold shadow-sm"
                                  >
                                    Selectat
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleSelectSlot(day.isoDate, hour)}
                                    className="w-full h-8 rounded-lg bg-white border border-neutral-200 text-neutral-800 hover:border-neutral-400 text-[11px] font-semibold transition-colors"
                                  >
                                    Liber
                                  </button>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-neutral-100 text-[11px] text-neutral-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded border border-neutral-300 bg-white inline-block" />
                  Liber
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-neutral-200 inline-block" />
                  Ocupat
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-neutral-950 inline-block" />
                  Selectat
                </span>
                <span className="flex items-center gap-1 text-neutral-400">
                  <Clock className="h-3 w-3" />
                  Poți rezerva atât pe ore în aceeași zi, cât și pe mai multe zile consecutive.
                </span>
              </div>
            </Card>

            <Card
              id="booking-section"
              className="rounded-2xl border-neutral-200 bg-white p-6 shadow-none space-y-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-neutral-800" />
                  <h2 className="text-sm font-bold text-neutral-900">Interval selectat</h2>
                </div>

                <div className="inline-flex rounded-xl border border-neutral-200 bg-neutral-100 p-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setBookingMode("HOURLY")
                      setErrorMsg(null)
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      bookingMode === "HOURLY"
                        ? "bg-white text-neutral-950 shadow-sm"
                        : "text-neutral-600 hover:text-neutral-900"
                    }`}
                  >
                    Pe ore (1–8 ore)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBookingMode("MULTIDAY")
                      setErrorMsg(null)
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      bookingMode === "MULTIDAY"
                        ? "bg-white text-neutral-950 shadow-sm"
                        : "text-neutral-600 hover:text-neutral-900"
                    }`}
                  >
                    Pe mai multe zile
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-neutral-100/80 border border-neutral-200/80 px-4 py-3.5 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-neutral-900">
                    {formattedSelectedRange}
                  </div>
                  <div className="text-xs text-neutral-500 mt-0.5">
                    {durationSummaryLabel} · {displayTitle} · {displayRoom}
                  </div>
                </div>
                <Badge className="rounded-full bg-neutral-950 hover:bg-neutral-950 text-white text-[10px] font-semibold px-2.5 py-0.5 border-transparent">
                  Selectat
                </Badge>
              </div>

              <form onSubmit={handleContinueBooking} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-700">
                      Data preluării
                    </label>
                    <input
                      type="date"
                      value={selectedIsoDate}
                      min={toIsoDateStr(today)}
                      onChange={(e) => {
                        if (e.target.value) {
                          setSelectedIsoDate(e.target.value)
                          setErrorMsg(null)
                        }
                      }}
                      className="w-full h-9 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-700">
                      Ora de început
                    </label>
                    <select
                      value={selectedStartHour}
                      onChange={(e) => {
                        setSelectedStartHour(Number(e.target.value))
                        setErrorMsg(null)
                      }}
                      className="w-full h-9 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    >
                      {HOURS.map((h) => (
                        <option key={h} value={h}>
                          {String(h).padStart(2, "0")}:00
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {bookingMode === "HOURLY" ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-600 font-medium">Durată rezervare (ore)</span>
                      <span className="font-bold text-neutral-900">
                        {durationHours} {durationHours === 1 ? "oră" : "ore"} ({startStr}–{endStr})
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-neutral-400">
                      <span>1h</span>
                      <input
                        type="range"
                        min={1}
                        max={8}
                        value={durationHours}
                        onChange={(e) => {
                          setDurationHours(Number(e.target.value))
                          setErrorMsg(null)
                        }}
                        className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-black"
                      />
                      <span>8h</span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-600 font-medium">Număr de zile</span>
                        <span className="font-bold text-neutral-900">
                          {multiDaysCount} {multiDaysCount === 1 ? "zi" : "zile"} (până pe {endDisplayDate})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-400 pt-1">
                        <span>1 zi</span>
                        <input
                          type="range"
                          min={1}
                          max={14}
                          value={multiDaysCount}
                          onChange={(e) => {
                            setMultiDaysCount(Number(e.target.value))
                            setErrorMsg(null)
                          }}
                          className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-black"
                        />
                        <span>14 zile</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-700">
                        Ora returnării (în ultima zi)
                      </label>
                      <select
                        value={multiEndHour}
                        onChange={(e) => {
                          setMultiEndHour(Number(e.target.value))
                          setErrorMsg(null)
                        }}
                        className="w-full h-9 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                      >
                        {HOURS.map((h) => (
                          <option key={h} value={h + 1}>
                            {String(h + 1).padStart(2, "0")}:00
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-neutral-800">
                      Scop / Proiect
                    </label>
                    <Badge
                      variant="outline"
                      className="rounded-md bg-neutral-100 border-neutral-200 text-neutral-500 text-[10px] font-medium px-1.5 py-0"
                    >
                      Opțional
                    </Badge>
                  </div>
                  <Textarea
                    rows={2}
                    maxLength={200}
                    placeholder="Descrie pe scurt scopul rezervării (ex. proiect licență, antrenare model AI, măsurători laborator)..."
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="rounded-xl border-neutral-200 text-xs resize-none"
                  />
                  <p className="text-[11px] text-neutral-400">
                    Maxim 200 de caractere.
                  </p>
                </div>

                {hasSlotConflict ? (
                  <div className="rounded-xl border border-rose-200 bg-rose-50/70 px-4 py-3 flex items-start gap-2.5">
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-bold text-rose-800">
                        Interval indisponibil: suprapunere cu un slot ocupat
                      </p>
                      <p className="text-rose-700 text-[11px] mt-0.5">
                        Intervalul {formattedSelectedRange} conține ore deja rezervate. Alege alt interval liber.
                      </p>
                    </div>
                  </div>
                ) : activeCount < maxLimit ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-bold text-emerald-800">
                        Cotă disponibilă: {activeCount} rezervări active din max. {maxLimit}
                      </p>
                      <p className="text-emerald-700 text-[11px] mt-0.5">
                        Poți adăuga această rezervare fără a depăși limita simultană.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 flex items-start gap-2.5">
                    <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-bold text-amber-900">
                        Limită cotă atinsă: {activeCount} / {maxLimit} resurse simultane
                      </p>
                      <p className="text-amber-700 text-[11px] mt-0.5">
                        Ai atins plafonul maxim de 4 resurse simultan.
                      </p>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold shadow-sm"
                >
                  {isSubmitting ? "Se procesează..." : "Continuă cu rezervarea"}
                </Button>

                <p className="text-center text-[11px] text-neutral-400">
                  După confirmare vei fi redirecționat automat către pagina Rezervările mele.
                </p>
              </form>
            </Card>
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
