import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react"
import { AppLayout } from "../components/layout/AppLayout"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { GroupBookingFormCard } from "../components/professor/GroupBookingFormCard"
import { GroupBookingSummaryCard } from "../components/professor/GroupBookingSummaryCard"
import { resourcesApi } from "../api/resources"
import { academicApi } from "../api/academic"
import { reservationsApi } from "../api/reservations"
import type { Resource, Room } from "../types"

export function GroupBookingPage() {
  const navigate = useNavigate()

  const [resources, setResources] = useState<Resource[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedResourceId, setSelectedResourceId] = useState<number>(0)
  const [selectedRoomId, setSelectedRoomId] = useState<number>(0)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [startHour, setStartHour] = useState<number>(10)
  const [durationMode, setDurationMode] = useState<"HOURS" | "DAYS">("HOURS")
  const [durationHours, setDurationHours] = useState<number>(4)
  const [durationDays, setDurationDays] = useState<number>(3)
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [resPage, roomsPage] = await Promise.all([
          resourcesApi.getResources({ limit: 200 }),
          academicApi.getRooms({ limit: 100 }),
        ])
        setResources(resPage.items)
        setRooms(roomsPage.items)
        if (resPage.items.length > 0) setSelectedResourceId(resPage.items[0].id)
        if (roomsPage.items.length > 0) setSelectedRoomId(roomsPage.items[0].id)
      } catch (e) {
        console.error(e)
      }
    }
    loadData()
  }, [])

  const endHour = durationMode === "HOURS" ? Math.min(22, startHour + durationHours) : startHour
  const formattedStart = `${String(startHour).padStart(2, "0")}:00`
  const formattedEnd = `${String(endHour).padStart(2, "0")}:00`

  const endDateStr = (() => {
    const d = new Date(`${selectedDate}T12:00:00`)
    if (durationMode === "DAYS") d.setDate(d.getDate() + durationDays)
    return d.toISOString().split("T")[0]
  })()

  const durationLabel =
    durationMode === "HOURS"
      ? `${durationHours} ${durationHours === 1 ? "oră" : "ore"}`
      : `${durationDays} ${durationDays === 1 ? "zi" : "zile"}`

  const handleCreateGroupBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedResourceId || !isConfirmed) return

    setIsSubmitting(true)
    setErrorMsg(null)
    try {
      const startDateTime = new Date(`${selectedDate}T${formattedStart}:00`)
      const endDateTime = new Date(`${endDateStr}T${formattedEnd}:00`)
      await reservationsApi.createReservation({
        resursa_id: selectedResourceId,
        data_inceput: startDateTime.toISOString(),
        data_sfarsit: endDateTime.toISOString(),
        scop: `Rezervare didactică / cercetare (${durationLabel}).`,
      })
      setSuccessMsg("Rezervarea a fost confirmată și înregistrată.")
      setTimeout(() => navigate("/reservations"), 800)
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
            <button onClick={() => setSuccessMsg(null)} className="font-bold text-emerald-600">
              ✕
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span className="font-medium">{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="font-bold text-rose-600">
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-6">
            <GroupBookingFormCard
              resources={resources}
              rooms={rooms}
              selectedResourceId={selectedResourceId}
              selectedRoomId={selectedRoomId}
              selectedDate={selectedDate}
              endDateStr={endDateStr}
              startHour={startHour}
              durationMode={durationMode}
              durationHours={durationHours}
              durationDays={durationDays}
              formattedStart={formattedStart}
              formattedEnd={formattedEnd}
              durationLabel={durationLabel}
              onResourceChange={setSelectedResourceId}
              onRoomChange={setSelectedRoomId}
              onDateChange={setSelectedDate}
              onStartHourChange={setStartHour}
              onDurationModeChange={setDurationMode}
              onDurationHoursChange={setDurationHours}
              onDurationDaysChange={setDurationDays}
            />
          </div>

          <div className="lg:col-span-5 space-y-6">
            <GroupBookingSummaryCard
              selectedRoom={selectedRoom}
              selectedRes={selectedRes}
              formattedStart={formattedStart}
              formattedEnd={formattedEnd}
              durationHours={durationHours}
              isConfirmed={isConfirmed}
              isSubmitting={isSubmitting}
              onConfirmChange={setIsConfirmed}
              onSubmit={handleCreateGroupBooking}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
export default GroupBookingPage
