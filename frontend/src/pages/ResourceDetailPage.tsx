import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { AppLayout } from "../components/layout/AppLayout"
import { useAuth } from "../context/AuthContext"
import { resourcesApi } from "../api/resources"
import { reservationsApi } from "../api/reservations"
import type { Resource, ResourceAvailability, StudentQuota } from "../types"
import {
  Cpu,
  DoorOpen,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Building,
} from "lucide-react"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { QuotaLimitModal } from "../components/modals/QuotaLimitModal"

export function ResourceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [resource, setResource] = useState<Resource | null>(null)
  const [availability, setAvailability] = useState<ResourceAvailability | null>(null)
  const [quota, setQuota] = useState<StudentQuota | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedStartHour, setSelectedStartHour] = useState<number>(9)
  const [durationHours, setDurationHours] = useState<number>(1)
  const [purpose, setPurpose] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null)
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState<boolean>(false)

  const [dateOffset, setDateOffset] = useState<number>(0)

  useEffect(() => {
    if (id) {
      loadData(Number(id), dateOffset)
    }
  }, [id, dateOffset])

  const loadData = async (resId: number, offsetDays: number) => {
    setIsLoading(true)
    setErrorMsg(null)
    try {
      const targetDate = new Date()
      targetDate.setDate(targetDate.getDate() + offsetDays)
      const dateStr = targetDate.toISOString().split("T")[0]

      const [resData, availData] = await Promise.all([
        resourcesApi.getResource(resId),
        resourcesApi.getAvailability(resId, { start_date: dateStr, days_count: 5 }),
      ])

      setResource(resData)
      setAvailability(availData)

      if (availData.zile.length > 0 && !selectedDate) {
        setSelectedDate(availData.zile[0].data)
      }

      if (user?.rol === "STUDENT") {
        try {
          const q = await reservationsApi.getMyQuota()
          setQuota(q)
        } catch (e) {
          console.error(e)
        }
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Eroare la încărcarea detaliilor resursei.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectSlot = (dateIso: string, hourStr: string, status: string) => {
    if (status !== "LIBER") return
    setSelectedDate(dateIso)
    setSelectedStartHour(parseInt(hourStr.split(":")[0]))
  }

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resource || !selectedDate) return

    if (user?.rol === "STUDENT" && quota && quota.active_count >= quota.max_limit) {
      setIsQuotaModalOpen(true)
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      const startDateTime = new Date(`${selectedDate}T${String(selectedStartHour).padStart(2, "0")}:00:00Z`)
      const endHour = selectedStartHour + durationHours
      const endDateTime = new Date(`${selectedDate}T${String(endHour).padStart(2, "0")}:00:00Z`)

      await reservationsApi.createReservation({
        resursa_id: resource.id,
        data_inceput: startDateTime.toISOString(),
        data_sfarsit: endDateTime.toISOString(),
        scop: purpose.trim() || "Activitate didactică / cercetare de laborator.",
      })

      setBookingSuccess("Rezervarea a fost trimisă cu succes către responsabilul de laborator!")
      if (id) loadData(Number(id), dateOffset)
    } catch (err: any) {
      const detail = err.response?.data?.detail || "Eroare la crearea rezervării."
      if (err.response?.status === 409 && detail.includes("4")) {
        setIsQuotaModalOpen(true)
      } else {
        setErrorMsg(detail)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading && !resource) {
    return (
      <AppLayout breadcrumbs={["Spațiu de lucru", "Catalog resurse", "Se încarcă..."]}>
        <div className="p-16 text-center text-neutral-500 space-y-3">
          <div className="h-8 w-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-xs font-medium">Se încarcă detaliile echipamentului...</div>
        </div>
      </AppLayout>
    )
  }

  if (errorMsg && !resource) {
    return (
      <AppLayout breadcrumbs={["Spațiu de lucru", "Catalog resurse", "Eroare"]}>
        <div className="p-8 max-w-lg mx-auto my-12 text-center space-y-4 bg-white rounded-2xl border border-neutral-200">
          <ShieldAlert className="h-10 w-10 text-rose-500 mx-auto" />
          <h2 className="text-base font-bold text-neutral-900">{errorMsg}</h2>
          <Button onClick={() => navigate("/resources")} className="text-xs bg-black text-white">
            Înapoi la Catalog
          </Button>
        </div>
      </AppLayout>
    )
  }

  const endHour = selectedStartHour + durationHours
  const formattedSelectedRange = `${String(selectedStartHour).padStart(2, "0")}:00 - ${String(endHour).padStart(2, "0")}:00`

  return (
    <AppLayout breadcrumbs={["Spațiu de lucru", "Catalog resurse", resource?.nume || "Detaliu"]}>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{resource?.nume}</h1>
              <Badge variant="outline" className="text-xs font-normal border-neutral-300">
                {resource?.categorie_nume || "Echipament"}
              </Badge>
              {resource?.stare_tehnica === "DISPONIBILA" ? (
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                  Disponibil
                </Badge>
              ) : resource?.stare_tehnica === "IN_MENTENANTA" ? (
                <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50">
                  În mentenanță
                </Badge>
              ) : (
                <Badge className="bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-50">
                  Defect
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
              <span className="flex items-center gap-1 font-medium text-neutral-800">
                <DoorOpen className="h-3.5 w-3.5 text-neutral-400" />
                {resource?.sala_cod} · {resource?.sala_nume}
              </span>
              <span>•</span>
              <span>{resource?.departament_nume || resource?.facultate_nume}</span>
              <span>•</span>
              <span className="font-mono text-neutral-600 font-semibold">{resource?.cod_inventar}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                const el = document.getElementById("booking-section")
                el?.scrollIntoView({ behavior: "smooth" })
              }}
              disabled={resource?.stare_tehnica !== "DISPONIBILA"}
              className="bg-black hover:bg-neutral-800 text-white text-xs gap-1.5 shadow-sm"
            >
              <Calendar className="h-4 w-4" />
              Rezervă resursa
            </Button>
          </div>
        </div>

        {bookingSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{bookingSuccess}</span>
            </div>
            <button onClick={() => setBookingSuccess(null)} className="font-bold text-emerald-600">✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
              <div className="h-56 bg-neutral-900 flex items-center justify-center text-white relative overflow-hidden">
                {resource?.imagine_url ? (
                  <img
                    src={resource.imagine_url}
                    alt={resource.nume}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Cpu className="h-16 w-16 text-neutral-400 opacity-60" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded font-mono text-[11px] bg-black/70 text-white border border-white/20 backdrop-blur-xs">
                  {resource?.cod_inventar}
                </span>
              </div>

              <div className="p-5 space-y-4">
                <div className="border-b border-neutral-100 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Specificații Tehnice</h3>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-neutral-50">
                    <span className="text-neutral-500">Laborator</span>
                    <span className="font-medium text-neutral-900">{resource?.sala_cod}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-50">
                    <span className="text-neutral-500">Departament</span>
                    <span className="font-medium text-neutral-900">{resource?.departament_nume || "n/a"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-50">
                    <span className="text-neutral-500">Categorie</span>
                    <span className="font-medium text-neutral-900">{resource?.categorie_nume}</span>
                  </div>
                  {resource?.specificatii && (
                    <div className="pt-2">
                      <span className="text-neutral-500 block mb-1">Specificații hardware:</span>
                      <p className="text-neutral-800 leading-relaxed bg-neutral-50 p-2.5 rounded-lg border border-neutral-100 font-mono text-[11px]">
                        {resource.specificatii}
                      </p>
                    </div>
                  )}
                  {resource?.descriere && (
                    <div className="pt-1">
                      <span className="text-neutral-500 block mb-1">Descriere:</span>
                      <p className="text-neutral-700 leading-relaxed">{resource.descriere}</p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-neutral-100 flex items-center gap-2 text-[11px] text-neutral-500">
                  <Info className="h-4 w-4 text-neutral-400 shrink-0" />
                  <span>Cotă max. 4 rezervări simultane pe cont student (PRD SM-03).</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-neutral-700" />
                    Disponibilitate orară
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">Selectează un slot orar liber pentru a rezerva</p>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDateOffset((prev) => Math.max(0, prev - 5))}
                    disabled={dateOffset === 0}
                    className="h-8 text-xs gap-1"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDateOffset((prev) => prev + 5)}
                    className="h-8 text-xs gap-1"
                  >
                    Următor
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {availability && availability.zile.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-center border-collapse">
                    <thead>
                      <tr>
                        <th className="p-2 border-b border-neutral-200 text-left font-semibold text-neutral-500 text-[11px] w-16">
                          Ora
                        </th>
                        {availability.zile.map((z, idx) => {
                          const dateObj = new Date(z.data)
                          const dayNum = dateObj.getDate()
                          const monthNum = dateObj.getMonth() + 1
                          return (
                            <th key={idx} className="p-2 border-b border-neutral-200 font-semibold text-neutral-800 text-[11px]">
                              <div>{dayNum}.{monthNum < 10 ? `0${monthNum}` : monthNum}</div>
                              <div className="text-[10px] text-neutral-400 font-normal">{z.zi_nume}</div>
                            </th>
                          )
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {availability.zile[0].slots.map((slotTemplate, sIdx) => (
                        <tr key={sIdx} className="border-b border-neutral-100 hover:bg-neutral-50/50">
                          <td className="p-2 font-mono text-[11px] text-neutral-500 text-left font-medium">
                            {slotTemplate.ora}
                          </td>
                          {availability.zile.map((zi, zIdx) => {
                            const slot = zi.slots[sIdx]
                            const isSelected =
                              selectedDate === zi.data &&
                              parseInt(slot.ora.split(":")[0]) >= selectedStartHour &&
                              parseInt(slot.ora.split(":")[0]) < selectedStartHour + durationHours

                            let cellStyle = "bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200 cursor-pointer"
                            let label = "Liber"

                            if (slot.status === "MENTENANTA") {
                              cellStyle = "bg-amber-50 text-amber-700 border border-amber-200 cursor-not-allowed opacity-75"
                              label = "Mentenanță"
                            } else if (slot.status === "OCUPAT") {
                              cellStyle = "bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed"
                              label = "Ocupat"
                            } else if (isSelected) {
                              cellStyle = "bg-black text-white border border-black font-semibold shadow-xs"
                              label = "Selectat"
                            }

                            return (
                              <td key={zIdx} className="p-1">
                                <button
                                  type="button"
                                  onClick={() => handleSelectSlot(zi.data, slot.ora, slot.status)}
                                  disabled={slot.status !== "LIBER"}
                                  className={`w-full py-1.5 px-1 rounded-md text-[11px] transition-all ${cellStyle}`}
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
              ) : (
                <div className="py-8 text-center text-xs text-neutral-400">
                  Nu sunt disponibile date de disponibilitate orară pentru acest interval.
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px] text-neutral-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded bg-white border border-neutral-300"></span> Liber
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded bg-neutral-200 border border-neutral-300"></span> Ocupat
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded bg-black"></span> Selectat
                  </span>
                </div>
                <div className="text-[10px] text-neutral-400 font-mono">
                  23.10: 10:00–12:00 ocupat de o altă rezervare
                </div>
              </div>
            </div>

            <div id="booking-section" className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-5">
              <div className="border-b border-neutral-100 pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-neutral-900">Interval selectat</h3>
                  <Badge variant="secondary" className="text-xs bg-black text-white rounded-md">
                    Selectat
                  </Badge>
                </div>
                <div className="text-xs text-neutral-600 mt-1">
                  <span className="font-bold text-neutral-900">{selectedDate || "23.10.2026"} · {formattedSelectedRange}</span>
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">
                  {durationHours} {durationHours === 1 ? "oră" : "ore"} · {resource?.nume} · {resource?.sala_cod}
                </div>
              </div>

              <form onSubmit={handleCreateBooking} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center text-xs font-semibold text-neutral-700 mb-1.5">
                    <span>Durată rezervare</span>
                    <span className="text-neutral-900 font-bold">{durationHours} {durationHours === 1 ? "oră" : "ore"} ({formattedSelectedRange})</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    step="1"
                    value={durationHours}
                    onChange={(e) => setDurationHours(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-black"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-400 pt-1 font-mono">
                    <span>1h</span>
                    <span>4h</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-neutral-700">
                      Scop / Proiect
                    </label>
                    <span className="text-[10px] text-neutral-400">Opțional</span>
                  </div>
                  <textarea
                    rows={2}
                    maxLength={200}
                    placeholder="Textarea"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full text-xs rounded-xl border border-neutral-200 p-3 bg-white focus:outline-none focus:ring-1 focus:ring-black resize-none"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">
                    Maxim 200 de caractere. Nu se transmite responsabilului de laborator.
                  </p>
                </div>

                {user?.rol === "STUDENT" && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <div className="font-semibold text-emerald-950">
                        Cotă disponibilă: {quota?.active_count ?? 2} rezervări active din max. 4
                      </div>
                      <div className="text-[11px] text-emerald-800 leading-snug">
                        Poți adăuga această rezervare fără a depăși limita simultană.
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting || resource?.stare_tehnica !== "DISPONIBILA"}
                  className="w-full bg-black hover:bg-neutral-800 text-white text-xs h-10 rounded-xl shadow-xs font-semibold"
                >
                  {isSubmitting ? "Se trimite rezervarea..." : "Continuă cu rezervarea"}
                </Button>

                <p className="text-[11px] text-neutral-400 text-center leading-snug">
                  Confirmare finală în pasul următor. Rezervarea nu este activă până la confirmare.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      <QuotaLimitModal
        isOpen={isQuotaModalOpen}
        onClose={() => setIsQuotaModalOpen(false)}
        attemptedDate={selectedDate}
        attemptedTime={formattedSelectedRange}
        currentActiveCount={quota?.active_count ?? 4}
        maxLimit={quota?.max_limit ?? 4}
      />
    </AppLayout>
  )
}
export default ResourceDetailPage
