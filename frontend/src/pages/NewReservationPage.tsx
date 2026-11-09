import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { AppLayout } from "../components/layout/AppLayout"
import { useAuth } from "../context/AuthContext"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Card } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { QuotaLimitModal } from "../components/modals/QuotaLimitModal"

const CATALOG_PREVIEW_MAP: Record<
  string,
  {
    name: string
    specs: string
    codeAndLab: string
    imageUrl: string
    defaultScope: string
  }
> = {
  "1": {
    name: "Workstation AI Deep Learning",
    specs: "RTX 4090 · 64GB RAM",
    codeAndLab: "INV-USV-2026-014 · Lab 204",
    imageUrl: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80",
    defaultScope: "Antrenare model Deep Learning",
  },
  "2": {
    name: "Braț Robotic Educațional Niryo Ned 2",
    specs: "6 axe, ROS2",
    codeAndLab: "INV-USV-2026-088 · Lab 208",
    imageUrl: "https://images.unsplash.com/photo-1563206767-5b18f218e8de?auto=format&fit=crop&w=800&q=80",
    defaultScope: "Proiect de robotică",
  },
  "3": {
    name: "Kit NVIDIA Jetson Orin Nano Dev Kit",
    specs: "40 TOPS · Dev Kit",
    codeAndLab: "INV-USV-2026-102 · Lab 210",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    defaultScope: "Inferență Edge AI",
  },
  "4": {
    name: "Osciloscop Digital Rohde & Schwarz RTB2004",
    specs: "300 MHz · 2.5 GSa/s",
    codeAndLab: "INV-USV-2026-215 · Lab 105",
    imageUrl: "https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=800&q=80",
    defaultScope: "Măsurători de laborator",
  },
  "5": {
    name: "Imprimantă 3D Bambu Lab X1-Carbon AMS",
    specs: "Multi-filament AMS",
    codeAndLab: "INV-USV-2026-041 · Lab Prototipare",
    imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
    defaultScope: "Proiect de licență",
  },
}

const ACTIVE_QUOTA_ITEMS = [
  {
    id: 1,
    name: "Workstation AI Deep Learning",
    meta: "INV-USV-2026-014 · Lab 204",
    interval: "22.10.2026 · 09:00–16:00",
  },
  {
    id: 2,
    name: "Kit NVIDIA Jetson Orin Nano Dev Kit",
    meta: "INV-USV-2026-102 · Lab 210",
    interval: "22.10.2026 · 10:00–16:00",
  },
  {
    id: 3,
    name: "Osciloscop Digital Rohde & Schwarz RTB2004",
    meta: "INV-USV-2026-215 · Lab 105",
    interval: "22.10.2026 · 13:00–17:00",
  },
  {
    id: 4,
    name: "Imprimantă 3D Bambu Lab X1-Carbon AMS",
    meta: "INV-USV-2026-041 · Lab Prototipare",
    interval: "22.10.2026 · 14:00–18:00",
  },
]

export function NewReservationPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const resId = searchParams.get("resursa") || "2"
  const selectedEquipment = CATALOG_PREVIEW_MAP[resId] || CATALOG_PREVIEW_MAP["2"]

  const [bookingDate, setBookingDate] = useState("22.10.2026")
  const [startTime, setStartTime] = useState("14:00")
  const [endTime, setEndTime] = useState("16:00")
  const [purpose, setPurpose] = useState(selectedEquipment.defaultScope)
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsQuotaModalOpen(true)
  }

  return (
    <AppLayout breadcrumbs={["Spațiu de lucru", "Rezervare nouă"]}>
      <div className="max-w-6xl mx-auto space-y-6">
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
            <div className="flex items-center gap-4">
              <div className="h-20 w-24 rounded-xl bg-white border border-neutral-200 overflow-hidden shrink-0 flex items-center justify-center p-1.5">
                <img
                  src={selectedEquipment.imageUrl}
                  alt={selectedEquipment.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-bold text-neutral-900 leading-snug">
                  {selectedEquipment.name}
                </h2>
                <p className="text-xs text-neutral-500">{selectedEquipment.specs}</p>
                <p className="text-xs text-neutral-500">{selectedEquipment.codeAndLab}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
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
                  Rezervarea este oprită de cota simultană, nu de un conflict orar al resursei.
                </div>
              </Card>

              <Button
                type="submit"
                className="w-full bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold h-10 rounded-xl"
              >
                Rezervă resursa
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
              <div className="text-2xl font-bold text-neutral-900">4 / 4</div>
              <div className="text-[11px] text-neutral-500">
                Plafon maxim atins în intervalul ales
              </div>
            </Card>

            <div className="divide-y divide-neutral-200 border-t border-b border-neutral-200">
              {ACTIVE_QUOTA_ITEMS.map((item) => (
                <div key={item.id} className="py-3 space-y-0.5">
                  <div className="text-xs font-bold text-neutral-900">{item.name}</div>
                  <div className="text-[11px] text-neutral-500">{item.meta}</div>
                  <div className="text-[11px] text-neutral-500">{item.interval}</div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Stare distinctă: 4 resurse simultane. Încercarea de rezervare ar adăuga a 5-a resursă în intervalul suprapus.
            </p>
          </div>
        </div>
      </div>

      <QuotaLimitModal
        isOpen={isQuotaModalOpen}
        onClose={() => setIsQuotaModalOpen(false)}
        attemptedDate={bookingDate}
        attemptedTime={`${startTime}–${endTime}`}
        currentActiveCount={4}
        maxLimit={4}
      />
    </AppLayout>
  )
}
