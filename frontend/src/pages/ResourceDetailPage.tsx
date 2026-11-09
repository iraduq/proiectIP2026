import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { AppLayout } from "../components/layout/AppLayout"
import { useAuth } from "../context/AuthContext"
import { resourcesApi } from "../api/resources"
import { reservationsApi } from "../api/reservations"
import type { Resource, StudentQuota } from "../types"
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
  isoDate: string
  displayDate: string
  headerLabel: string
}

const DEFAULT_DAYS: DayColumn[] = [
  { isoDate: "2026-10-23", displayDate: "23.10.2026", headerLabel: "23.10 · Joi" },
  { isoDate: "2026-10-24", displayDate: "24.10.2026", headerLabel: "24.10 · Vin" },
  { isoDate: "2026-10-25", displayDate: "25.10.2026", headerLabel: "25.10 · Sâm" },
  { isoDate: "2026-10-26", displayDate: "26.10.2026", headerLabel: "26.10 · Dum" },
  { isoDate: "2026-10-27", displayDate: "27.10.2026", headerLabel: "27.10 · Lun" },
]

const HOURS = [9, 10, 11, 12, 13, 14]

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

  const [resource, setResource] = useState<Resource | null>(null)
  const [quota, setQuota] = useState<StudentQuota>({
    active_count: 0,
    max_limit: 4,
    can_reserve: true,
    active_reservations: [],
  })

  const [occupiedMap, setOccupiedMap] = useState<Record<string, boolean>>({
    "0-10": true,
  })
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0)
  const [selectedStartHour, setSelectedStartHour] = useState<number>(9)
  const [durationHours, setDurationHours] = useState<number>(1)
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
      const [resData, quotaData] = await Promise.all([
        resourcesApi.getResource(resId).catch(() => null),
        reservationsApi.getMyQuota().catch(() => null),
      ])
      if (resData) {
        setResource(resData)
      }
      if (quotaData) {
        setQuota(quotaData)
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

  const selectedDay = DEFAULT_DAYS[selectedDayIdx] || DEFAULT_DAYS[0]
  const endHour = selectedStartHour + durationHours
  const startStr = `${String(selectedStartHour).padStart(2, "0")}:00`
  const endStr = `${String(endHour).padStart(2, "0")}:00`
  const formattedSelectedRange = `${startStr}–${endStr}`

  const isSlotOccupied = (dayIdx: number, hour: number) => {
    return Boolean(occupiedMap[`${dayIdx}-${hour}`])
  }

  const conflictingHours: number[] = []
  for (let h = selectedStartHour; h < selectedStartHour + durationHours; h++) {
    if (isSlotOccupied(selectedDayIdx, h) || h > 14) {
      conflictingHours.push(h)
    }
  }
  const hasSlotConflict = conflictingHours.length > 0

  const handleSelectSlot = (dayIdx: number, hour: number) => {
    if (isSlotOccupied(dayIdx, hour)) return
    setErrorMsg(null)
    setBookingSuccess(null)
    setSelectedDayIdx(dayIdx)
    setSelectedStartHour(hour)
  }

  const handleContinueBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setBookingSuccess(null)

    if (hasSlotConflict) {
      const firstConflict = conflictingHours[0]
      if (firstConflict > 14) {
        setErrorMsg(
          `Intervalul selectat (${formattedSelectedRange}) depășește programul disponibil (până la 15:00). Redu durata rezervării.`
        )
      } else {
        const cStart = `${String(firstConflict).padStart(2, "0")}:00`
        const cEnd = `${String(firstConflict + 1).padStart(2, "0")}:00`
        setErrorMsg(
          `Conflict de programare: Intervalul selectat (${formattedSelectedRange}) se suprapune cu slotul deja ocupat (${cStart}–${cEnd}). Alege o durată mai scurtă sau un alt interval liber.`
        )
      }
      return
    }

    if (quota.active_count >= quota.max_limit) {
      setIsQuotaModalOpen(true)
      return
    }

    setIsSubmitting(true)
    try {
      const targetId = resource?.id || fallback.id
      const startIso = new Date(`${selectedDay.isoDate}T${startStr}:00Z`).toISOString()
      const endIso = new Date(`${selectedDay.isoDate}T${endStr}:00Z`).toISOString()

      await reservationsApi.createReservation({
        resursa_id: targetId,
        data_inceput: startIso,
        data_sfarsit: endIso,
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
                <span className="text-xs text-neutral-400">23–27 octombrie 2026</span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg border-neutral-200 bg-white text-neutral-700 text-xs font-semibold px-3"
                >
                  ‹ Anterior
                </Button>
                <span className="text-xs font-bold text-neutral-900">Octombrie 2026</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg border-neutral-200 bg-white text-neutral-700 text-xs font-semibold px-3"
                >
                  Următor ›
                </Button>
              </div>

              <div className="overflow-x-auto pt-1">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="w-14 pb-2.5"></th>
                      {DEFAULT_DAYS.map((d, dIdx) => (
                        <th
                          key={d.isoDate}
                          className={`pb-2.5 px-1 text-center text-[11px] ${
                            dIdx === selectedDayIdx
                              ? "font-bold text-neutral-900"
                              : "font-medium text-neutral-500"
                          }`}
                        >
                          {d.headerLabel}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {HOURS.map((hour) => (
                      <tr key={hour}>
                        <td className="py-1 pr-2 text-left text-[11px] text-neutral-400 font-mono">
                          {String(hour).padStart(2, "0")}:00
                        </td>
                        {DEFAULT_DAYS.map((d, dIdx) => {
                          const occupied = isSlotOccupied(dIdx, hour)
                          const inSelectedWindow =
                            dIdx === selectedDayIdx &&
                            hour >= selectedStartHour &&
                            hour < selectedStartHour + durationHours

                          let btnClass =
                            "bg-white text-neutral-800 border border-neutral-200 hover:bg-neutral-50 font-semibold"
                          let label = "Liber"

                          if (occupied && inSelectedWindow) {
                            btnClass =
                              "bg-rose-100 text-rose-700 border border-rose-300 cursor-not-allowed font-semibold"
                            label = "Conflict"
                          } else if (occupied) {
                            btnClass =
                              "bg-neutral-100 text-neutral-400 border border-neutral-200/80 cursor-not-allowed font-medium"
                            label = "Ocupat"
                          } else if (inSelectedWindow) {
                            btnClass =
                              "bg-neutral-950 text-white border border-neutral-950 font-semibold"
                            label = "Selectat"
                          }

                          return (
                            <td key={d.isoDate} className="p-1">
                              <button
                                type="button"
                                disabled={occupied}
                                onClick={() => handleSelectSlot(dIdx, hour)}
                                className={`w-full h-9 rounded-lg text-xs transition-all ${btnClass}`}
                              >
                                {label}
                              </button>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-neutral-100 text-[11px] text-neutral-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-xs border border-neutral-300 bg-white"></span>
                  Liber
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-xs bg-neutral-200"></span>
                  Ocupat
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-xs bg-neutral-950"></span>
                  Selectat
                </span>
                <span className="flex items-center gap-1.5 text-neutral-500">
                  <Clock className="h-3 w-3 text-neutral-400" />
                  23.10: 10:00–12:00 ocupat de o altă rezervare
                </span>
              </div>
            </Card>

            <Card
              id="booking-section"
              className="rounded-2xl border-neutral-200 bg-white p-6 shadow-none space-y-5"
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-neutral-800" />
                <h3 className="text-sm font-bold text-neutral-900">Interval selectat</h3>
              </div>

              <div className="rounded-xl bg-neutral-100/80 border border-neutral-200/70 p-4 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-neutral-900">
                    {selectedDay.displayDate} · {formattedSelectedRange}
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    {durationHours} {durationHours === 1 ? "oră" : "ore"} · {displayTitle} · {displayRoom}
                  </div>
                </div>
                {hasSlotConflict ? (
                  <Badge className="rounded-full bg-rose-600 hover:bg-rose-600 text-white text-[10px] font-semibold px-2.5 py-0.5 border-transparent">
                    Indisponibil
                  </Badge>
                ) : (
                  <Badge className="rounded-full bg-neutral-950 hover:bg-neutral-950 text-white text-[10px] font-semibold px-2.5 py-0.5 border-transparent">
                    Selectat
                  </Badge>
                )}
              </div>

              <form onSubmit={handleContinueBooking} className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-600 font-medium">Durată rezervare</span>
                    <span className="font-bold text-neutral-900">
                      {durationHours} {durationHours === 1 ? "oră" : "ore"} ({formattedSelectedRange})
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-neutral-400 font-mono">1h</span>
                    <input
                      type="range"
                      min={1}
                      max={4}
                      step={1}
                      value={durationHours}
                      onChange={(e) => {
                        setErrorMsg(null)
                        setDurationHours(Number(e.target.value))
                      }}
                      className="flex-1 h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-black"
                    />
                    <span className="text-[11px] text-neutral-400 font-mono">4h</span>
                  </div>
                </div>

                {hasSlotConflict && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 flex items-start gap-2.5">
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-rose-800">
                        Conflict orar: intervalul {formattedSelectedRange} conține ore deja ocupate
                      </div>
                      <div className="text-[11px] text-rose-700">
                        Slotul de la ora {String(conflictingHours[0]).padStart(2, "0")}:00 este ocupat. Redu durata sau selectează un alt interval liber din tabel.
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-neutral-900">Scop / Proiect</label>
                    <Badge
                      variant="outline"
                      className="rounded-md bg-neutral-100 border-neutral-200 text-neutral-600 text-[10px] font-medium px-2 py-0"
                    >
                      Opțional
                    </Badge>
                  </div>
                  <Textarea
                    rows={2}
                    maxLength={200}
                    placeholder="Textarea"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                  />
                  <p className="text-[11px] text-neutral-400">
                    Maxim 200 de caractere. Nu se transmite responsabilului de laborator.
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-emerald-800">
                      Cotă disponibilă: {activeCount} rezervări active din max. {maxLimit}
                    </div>
                    <div className="text-[11px] text-emerald-700">
                      Poți adăuga această rezervare fără a depăși limita simultană.
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold h-10 rounded-xl"
                >
                  {isSubmitting ? "Se procesează..." : "Continuă cu rezervarea"}
                </Button>

                <p className="text-[11px] text-neutral-400 text-center">
                  Confirmare finală în pasul următor. Rezervarea nu este activă până la confirmare.
                </p>
              </form>
            </Card>
          </div>
        </div>
      </div>

      <QuotaLimitModal
        isOpen={isQuotaModalOpen}
        onClose={() => setIsQuotaModalOpen(false)}
        attemptedDate={selectedDay.displayDate}
        attemptedTime={formattedSelectedRange}
        currentActiveCount={activeCount}
        maxLimit={maxLimit}
      />
    </AppLayout>
  )
}
export default ResourceDetailPage
