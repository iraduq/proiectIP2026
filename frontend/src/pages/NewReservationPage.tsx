import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { AppLayout } from "../components/layout/AppLayout"
import { useAuth } from "../context/AuthContext"
import { resourcesApi } from "../api/resources"
import { reservationsApi } from "../api/reservations"
import type { Resource, StudentQuota } from "../types"
import { CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Card } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { QuotaLimitModal } from "../components/modals/QuotaLimitModal"

const FALLBACK_RESOURCES: Record<
  string,
  {
    id: number
    name: string
    specs: string
    codeAndLab: string
    imageUrl: string
    defaultScope: string
  }
> = {
  "1": {
    id: 1,
    name: "Workstation AI Deep Learning",
    specs: "RTX 4090 · 64GB RAM",
    codeAndLab: "INV-USV-2026-014 · Lab 204",
    imageUrl: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80",
    defaultScope: "Antrenare model Deep Learning",
  },
  "2": {
    id: 2,
    name: "Braț Robotic Educațional Niryo Ned 2",
    specs: "6 axe, ROS2",
    codeAndLab: "INV-USV-2026-088 · Lab 208",
    imageUrl: "https://images.unsplash.com/photo-1563206767-5b18f218e8de?auto=format&fit=crop&w=800&q=80",
    defaultScope: "Proiect de robotică",
  },
  "3": {
    id: 3,
    name: "Kit NVIDIA Jetson Orin Nano Dev Kit",
    specs: "40 TOPS · Dev Kit",
    codeAndLab: "INV-USV-2026-102 · Lab 210",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    defaultScope: "Inferență Edge AI",
  },
  "4": {
    id: 4,
    name: "Osciloscop Digital Rohde & Schwarz RTB2004",
    specs: "300 MHz · 2.5 GSa/s",
    codeAndLab: "INV-USV-2026-215 · Lab 105",
    imageUrl: "https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=800&q=80",
    defaultScope: "Măsurători de laborator",
  },
  "5": {
    id: 5,
    name: "Imprimantă 3D Bambu Lab X1-Carbon AMS",
    specs: "Multi-filament AMS",
    codeAndLab: "INV-USV-2026-041 · Lab Prototipare",
    imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
    defaultScope: "Proiect de licență",
  },
}

function parseRoDateToIso(dateStr: string, timeStr: string): string {
  const cleanDate = dateStr.trim()
  const cleanTime = timeStr.trim() || "14:00"
  const parts = cleanDate.split(".")
  if (parts.length === 3) {
    const [dd, mm, yyyy] = parts
    return new Date(`${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}T${cleanTime}:00Z`).toISOString()
  }
  const d = new Date(`${cleanDate}T${cleanTime}:00Z`)
  if (!isNaN(d.getTime())) {
    return d.toISOString()
  }
  return new Date().toISOString()
}

export function NewReservationPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const resParam = searchParams.get("resursa") || "1"

  const [dbResource, setDbResource] = useState<Resource | null>(null)
  const [quota, setQuota] = useState<StudentQuota>({
    active_count: 0,
    max_limit: 4,
    can_reserve: true,
    active_reservations: [],
  })
  const [bookingDate, setBookingDate] = useState("22.10.2026")
  const [startTime, setStartTime] = useState("14:00")
  const [endTime, setEndTime] = useState("16:00")
  const [purpose, setPurpose] = useState(
    (FALLBACK_RESOURCES[resParam] || FALLBACK_RESOURCES["2"]).defaultScope
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false)

  useEffect(() => {
    loadInitialData()
  }, [resParam])

  const loadInitialData = async () => {
    try {
      const [quotaData, resPage] = await Promise.all([
        reservationsApi.getMyQuota().catch(() => ({
          active_count: 0,
          max_limit: 4,
          can_reserve: true,
          active_reservations: [],
        })),
        resourcesApi.getResources({ limit: 50 }).catch(() => ({
          items: [],
          total: 0,
          skip: 0,
          limit: 50,
        })),
      ])

      setQuota(quotaData)

      const numericId = Number(resParam)
      const matched =
        resPage.items.find((r) => r.id === numericId) ||
        resPage.items[numericId - 1] ||
        resPage.items[0] ||
        null

      if (matched) {
        setDbResource(matched)
      }
    } catch {
    }
  }

  const fallback = FALLBACK_RESOURCES[resParam] || FALLBACK_RESOURCES["1"]
  const displayTitle = dbResource?.nume || fallback.name
  const displaySpecs = dbResource?.specificatii || fallback.specs
  const displayCodeAndLab = dbResource
    ? `${dbResource.cod_inventar} · ${dbResource.sala_cod || dbResource.sala_nume || "Lab 204"}`
    : fallback.codeAndLab
  const displayImage = dbResource?.imagine_url || fallback.imageUrl
  const targetResourceId = dbResource?.id || fallback.id

  const activeCount = quota.active_count
  const maxLimit = quota.max_limit || 4
  const isQuotaReached = activeCount >= maxLimit

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (isQuotaReached) {
      setIsQuotaModalOpen(true)
      return
    }

    if (!purpose.trim()) {
      setErrorMsg("Te rugăm să introduci scopul utilizării.")
      return
    }

    setIsSubmitting(true)
    try {
      const startIso = parseRoDateToIso(bookingDate, startTime)
      const endIso = parseRoDateToIso(bookingDate, endTime)

      await reservationsApi.createReservation({
        resursa_id: targetResourceId,
        data_inceput: startIso,
        data_sfarsit: endIso,
        scop: purpose.trim(),
      })

      const updatedQuota = await reservationsApi.getMyQuota().catch(() => ({
        ...quota,
        active_count: quota.active_count + 1,
        can_reserve: quota.active_count + 1 < maxLimit,
      }))
      setQuota(updatedQuota)
      setSuccessMsg("Rezervarea a fost înregistrată cu succes!")
    } catch (err: any) {
      const status = err.response?.status
      const detail: string = err.response?.data?.detail || "Eroare la crearea rezervării."
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

  return (
    <AppLayout breadcrumbs={["Spațiu de lucru", "Rezervare nouă"]}>
      <div className="max-w-6xl mx-auto space-y-6">
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{successMsg}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/reservations")}
                className="font-semibold underline text-emerald-900"
              >
                Vezi rezervările mele
              </button>
              <button
                type="button"
                onClick={() => setSuccessMsg(null)}
                className="font-bold text-emerald-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span className="font-medium">{errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="font-bold text-rose-700"
            >
              ✕
            </button>
          </div>
        )}

        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Rezervare nouă
            </h1>
            <Badge
              variant="outline"
              className="rounded-full bg-neutral-100 border-neutral-200 text-neutral-700 text-[11px] font-medium px-2.5 py-0.5"
            >
              Student · Anul III - AIA
            </Badge>
          </div>
          <p className="text-xs text-neutral-500">
            {user?.nume || "Radu Ivan"} · 22 octombrie 2026
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start pt-2">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-6 border-b border-neutral-200 pb-6">
              <div className="h-40 w-56 rounded-xl overflow-hidden shrink-0 flex items-center justify-center bg-neutral-100 border border-neutral-200">
                <img
                  src={displayImage}
                  alt={displayTitle}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1.5 min-w-0 flex-1">
                <h2 className="text-lg font-bold text-neutral-900 leading-snug">
                  {displayTitle}
                </h2>
                <p className="text-xs text-neutral-500">{displaySpecs}</p>
                <p className="text-xs text-neutral-500">{displayCodeAndLab}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-sm font-bold text-neutral-900">Detalii rezervare</h3>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-neutral-700">Data</label>
                <Input
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="h-10 rounded-xl border-neutral-200 bg-white text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-neutral-700">De la</label>
                  <Input
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="h-10 rounded-xl border-neutral-200 bg-white text-xs font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-neutral-700">Până la</label>
                  <Input
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="h-10 rounded-xl border-neutral-200 bg-white text-xs font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-neutral-700">
                  Scopul utilizării
                </label>
                <Input
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="h-10 rounded-xl border-neutral-200 bg-white text-xs font-medium"
                />
              </div>

              <Card className="rounded-xl border-neutral-200 bg-neutral-50/60 p-4 shadow-none space-y-0.5">
                <div className="text-xs font-semibold text-neutral-800">
                  Resursă disponibilă în interval
                </div>
                <div className="text-[11px] text-neutral-500">
                  {isQuotaReached
                    ? "Rezervarea este oprită de cota simultană, nu de un conflict orar al resursei."
                    : `Cota ta curentă (${activeCount}/${maxLimit}) îți permite rezervarea acestei resurse.`}
                </div>
              </Card>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold h-10 rounded-xl"
              >
                {isSubmitting ? "Se procesează rezervarea..." : "Rezervă resursa"}
              </Button>
            </form>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-neutral-900">
                Cota utilizată în interval
              </h3>
              <p className="text-xs text-neutral-500">
                {bookingDate} · {startTime}–{endTime}
              </p>
            </div>

            <Card className="rounded-2xl border-neutral-200 bg-white p-5 shadow-none space-y-1">
              <div className="text-xs text-neutral-500">Resurse simultane</div>
              <div className="text-2xl font-bold text-neutral-900">
                {activeCount} / {maxLimit}
              </div>
              <div className="text-[11px] text-neutral-500">
                {isQuotaReached
                  ? "Plafon maxim atins în intervalul ales"
                  : `Mai poți rezerva încă ${maxLimit - activeCount} resurse simultan`}
              </div>
            </Card>

            {quota.active_reservations.length > 0 ? (
              <div className="divide-y divide-neutral-200 border-t border-b border-neutral-200">
                {quota.active_reservations.map((item) => {
                  const dStart = new Date(item.data_inceput)
                  const dEnd = new Date(item.data_sfarsit)
                  const dFmt = dStart.toLocaleDateString("ro-RO", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                  const tStart = dStart.toLocaleTimeString("ro-RO", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                  const tEnd = dEnd.toLocaleTimeString("ro-RO", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                  return (
                    <div key={item.id} className="py-3 space-y-0.5">
                      <div className="text-xs font-bold text-neutral-900">
                        {item.resursa_nume || "Echipament rezervat"}
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        {item.resursa_cod || "INV-USV"} · {item.sala_nume || "Laborator"}
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        {dFmt} · {tStart}–{tEnd}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <Card className="rounded-xl border-neutral-200 bg-neutral-50/40 p-4 shadow-none text-xs text-neutral-500">
                Nu ai nicio altă resursă rezervată activă în acest moment ({activeCount}/{maxLimit}).
              </Card>
            )}

            <p className="text-[11px] text-neutral-500 leading-relaxed">
              {isQuotaReached
                ? "Stare distinctă: 4 resurse simultane. Încercarea de rezervare ar adăuga a 5-a resursă în intervalul suprapus."
                : "Plafonul maxim permis conform regulamentului este de 4 resurse active simultan per student."}
            </p>
          </div>
        </div>
      </div>

      <QuotaLimitModal
        isOpen={isQuotaModalOpen}
        onClose={() => setIsQuotaModalOpen(false)}
        attemptedDate={bookingDate}
        attemptedTime={`${startTime}–${endTime}`}
        currentActiveCount={activeCount}
        maxLimit={maxLimit}
      />
    </AppLayout>
  )
}
