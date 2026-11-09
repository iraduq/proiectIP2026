import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AppLayout } from "../components/layout/AppLayout"
import { useAuth } from "../context/AuthContext"
import { resourcesApi } from "../api/resources"
import { academicApi } from "../api/academic"
import { reservationsApi } from "../api/reservations"
import type { Resource, Room } from "../types"
import {
  Calendar as CalendarIcon,
  Clock,
  DoorOpen,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Cpu,
  Layers,
} from "lucide-react"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"

export function GroupBookingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [resources, setResources] = useState<Resource[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedResourceId, setSelectedResourceId] = useState<number>(0)
  const [selectedRoomId, setSelectedRoomId] = useState<number>(0)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [startHour, setStartHour] = useState<number>(14)
  const [durationHours, setDurationHours] = useState<number>(4)
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [resPage, roomsPage] = await Promise.all([
        resourcesApi.getResources({ limit: 50 }),
        academicApi.getRooms({ limit: 50 }),
      ])
      setResources(resPage.items)
      setRooms(roomsPage.items)
      if (resPage.items.length > 0) setSelectedResourceId(resPage.items[0].id)
      if (roomsPage.items.length > 0) setSelectedRoomId(roomsPage.items[0].id)
    } catch (e) {
      console.error(e)
    }
  }

  const endHour = startHour + durationHours
  const formattedStart = `${String(startHour).padStart(2, "0")}:00`
  const formattedEnd = `${String(endHour).padStart(2, "0")}:00`

  const handleCreateGroupBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedResourceId || !isConfirmed) return

    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      const startDateTime = new Date(`${selectedDate}T${formattedStart}:00Z`)
      const endDateTime = new Date(`${selectedDate}T${formattedEnd}:00Z`)

      await reservationsApi.createReservation({
        resursa_id: selectedResourceId,
        data_inceput: startDateTime.toISOString(),
        data_sfarsit: endDateTime.toISOString(),
        scop: `Rezervare didactică / activitate de laborator pentru grupă (${durationHours} ore).`,
      })

      setSuccessMsg("Rezervarea didactică pentru grupă a fost confirmată și înregistrată.")
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Eroare la realizarea rezervării.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedRes = resources.find((r) => r.id === selectedResourceId)
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId)

  return (
    <AppLayout breadcrumbs={["Spațiu de lucru", "Rezervare grupă"]}>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Rezervare</h1>
              <Badge className="bg-neutral-900 text-white font-medium text-xs">
                Activitate didactică
              </Badge>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Alocă resurse unei discipline și confirmă impactul asupra rezervărilor individuale.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/professor")}
            className="text-xs gap-1.5 h-9"
          >
            <ArrowLeft className="h-4 w-4" />
            Înapoi la panou
          </Button>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="font-bold text-emerald-600">✕</button>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span className="font-medium">{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="font-bold text-rose-600">✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-6">
              <div className="border-b border-neutral-100 pb-4">
                <h2 className="text-sm font-bold text-neutral-900">Disciplină și resurse</h2>
                <p className="text-xs text-neutral-500">Rezervare didactică / grupă</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Tip resursă / Echipament</label>
                  <select
                    value={selectedResourceId}
                    onChange={(e) => setSelectedResourceId(Number(e.target.value))}
                    className="w-full h-10 rounded-xl border border-neutral-200 bg-white px-3 text-xs focus:outline-none focus:ring-1 focus:ring-black"
                  >
                    {resources.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nume} ({r.cod_inventar})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Sală</label>
                  <select
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(Number(e.target.value))}
                    className="w-full h-10 rounded-xl border border-neutral-200 bg-white px-3 text-xs focus:outline-none focus:ring-1 focus:ring-black"
                  >
                    {rooms.map((rm) => (
                      <option key={rm.id} value={rm.id}>
                        {rm.cod} - {rm.nume}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t border-neutral-100 pt-5 space-y-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Intervalul activității</h3>
                  <p className="text-xs text-neutral-600 font-medium mt-0.5">
                    {selectedDate} · {formattedStart} - {formattedEnd}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                    <span className="text-neutral-400 block text-[10px] uppercase font-bold">Început</span>
                    <span className="font-bold text-neutral-900 text-sm">{formattedStart}</span>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                    <span className="text-neutral-400 block text-[10px] uppercase font-bold">Sfârșit</span>
                    <span className="font-bold text-neutral-900 text-sm">{formattedEnd}</span>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                    <span className="text-neutral-400 block text-[10px] uppercase font-bold">Durată</span>
                    <span className="font-bold text-neutral-900 text-sm">{durationHours} ore</span>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold text-neutral-700 mb-1.5">
                      <span>Ora de început: {formattedStart}</span>
                    </div>
                    <input
                      type="range"
                      min="8"
                      max="17"
                      step="1"
                      value={startHour}
                      onChange={(e) => setStartHour(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-black"
                    />
                    <div className="flex justify-between text-[10px] text-neutral-400 pt-1 font-mono">
                      <span>08:00</span>
                      <span>12:00</span>
                      <span>17:00</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold text-neutral-700 mb-1.5">
                      <span>Durata laboratorului: {durationHours} ore</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={durationHours}
                      onChange={(e) => setDurationHours(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-black"
                    />
                    <div className="flex justify-between text-[10px] text-neutral-400 pt-1 font-mono">
                      <span>1 oră</span>
                      <span>3 ore</span>
                      <span>5 ore</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-snug">
                    Pași de 1 oră. Durata și ora de sfârșit se recalculează împreună, în limita slotului didactic selectat.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-5">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Data activității</h3>
                <div className="mt-2">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full h-10 rounded-xl border border-neutral-200 px-3 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              <div className="border-t border-neutral-100 pt-4 space-y-2.5">
                <h4 className="text-xs font-bold text-neutral-900">
                  Disponibilitate · {selectedRoom?.cod || "Laborator"}
                </h4>
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 space-y-1">
                  <div className="font-semibold text-neutral-900">
                    {formattedStart}-{formattedEnd} · Interval selectat
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    {selectedRes?.nume} · {durationHours} ore · {selectedRoom?.cod}
                  </div>
                </div>
              </div>

              <div className="border-t border-neutral-100 pt-4 space-y-3">
                <h4 className="text-xs font-bold text-neutral-900">Sumarul rezervării</h4>
                <div className="p-3.5 rounded-xl bg-neutral-900 text-white text-xs space-y-1">
                  <div className="font-semibold">{selectedDate} · {formattedStart} - {formattedEnd}</div>
                  <div className="text-neutral-400 text-[11px]">Durată: {durationHours} ore · {selectedRes?.nume}</div>
                </div>

                <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isConfirmed}
                    onChange={(e) => setIsConfirmed(e.target.checked)}
                    className="mt-0.5 rounded border-neutral-300 text-black focus:ring-black"
                  />
                  <span className="text-[11px] text-neutral-600 leading-snug">
                    Confirm alocarea echipamentelor pentru activitatea didactică cu grupa de studenți.
                  </span>
                </label>

                <Button
                  onClick={handleCreateGroupBooking}
                  disabled={!isConfirmed || isSubmitting}
                  className="w-full bg-black hover:bg-neutral-800 text-white text-xs h-10 shadow-sm font-semibold"
                >
                  {isSubmitting ? "Se confirmă..." : "Confirmă și rezervă"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
export default GroupBookingPage
