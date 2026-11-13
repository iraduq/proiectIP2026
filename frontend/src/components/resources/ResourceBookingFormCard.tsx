import { AlertCircle, CheckCircle2, Clock } from "lucide-react"
import { Card } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { CALENDAR_HOURS } from "./ResourceAvailabilityCalendar"

interface ResourceBookingFormCardProps {
  bookingMode: "HOURLY" | "MULTIDAY"
  onBookingModeChange: (mode: "HOURLY" | "MULTIDAY") => void
  formattedSelectedRange: string
  durationSummaryLabel: string
  displayTitle: string
  displayRoom: string
  durationHours: number
  onDurationHoursChange: (hours: number) => void
  multiDaysCount: number
  onMultiDaysCountChange: (days: number) => void
  multiEndHour: number
  onMultiEndHourChange: (hour: number) => void
  selectedIsoDate: string
  minIsoDate: string
  onSelectedIsoDateChange: (iso: string) => void
  selectedStartHour: number
  onSelectedStartHourChange: (hour: number) => void
  startStr: string
  endStr: string
  endDisplayDate: string
  purpose: string
  onPurposeChange: (val: string) => void
  hasSlotConflict: boolean
  activeCount: number
  maxLimit: number
  isSubmitting: boolean
  onQuickHours: (hours: number) => void
  onQuickDays: (days: number) => void
  onSubmit: (e: React.FormEvent) => void
}

export function ResourceBookingFormCard({
  bookingMode,
  onBookingModeChange,
  formattedSelectedRange,
  durationSummaryLabel,
  displayTitle,
  displayRoom,
  durationHours,
  onDurationHoursChange,
  multiDaysCount,
  onMultiDaysCountChange,
  multiEndHour,
  onMultiEndHourChange,
  selectedIsoDate,
  minIsoDate,
  onSelectedIsoDateChange,
  selectedStartHour,
  onSelectedStartHourChange,
  startStr,
  endStr,
  endDisplayDate,
  purpose,
  onPurposeChange,
  hasSlotConflict,
  activeCount,
  maxLimit,
  isSubmitting,
  onQuickHours,
  onQuickDays,
  onSubmit,
}: ResourceBookingFormCardProps) {
  return (
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
            onClick={() => onBookingModeChange("HOURLY")}
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
            onClick={() => onBookingModeChange("MULTIDAY")}
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
          <div className="text-sm font-bold text-neutral-900">{formattedSelectedRange}</div>
          <div className="text-xs text-neutral-500 mt-0.5">
            {durationSummaryLabel} · {displayTitle} · {displayRoom}
          </div>
        </div>
        <Badge className="rounded-full bg-neutral-950 hover:bg-neutral-950 text-white text-[10px] font-semibold px-2.5 py-0.5 border-transparent">
          Selectat
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-semibold text-neutral-700">
          Alege rapid durata rezervării (ore sau zile):
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[1, 2, 4, 6, 8].map((h) => {
            const isSelected = bookingMode === "HOURLY" && durationHours === h
            return (
              <button
                key={`h-${h}`}
                type="button"
                onClick={() => onQuickHours(h)}
                className={`h-8 px-3 rounded-xl text-xs font-semibold transition-colors ${
                  isSelected
                    ? "bg-neutral-950 text-white"
                    : "bg-neutral-100 hover:bg-neutral-200 text-neutral-800"
                }`}
              >
                {h} {h === 1 ? "oră" : "ore"}
              </button>
            )
          })}
          {[1, 2, 3, 5, 7, 14].map((dCount) => {
            const isSelected = bookingMode === "MULTIDAY" && multiDaysCount === dCount
            return (
              <button
                key={`d-${dCount}`}
                type="button"
                onClick={() => onQuickDays(dCount)}
                className={`h-8 px-3 rounded-xl text-xs font-semibold transition-colors ${
                  isSelected
                    ? "bg-neutral-950 text-white"
                    : "bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200"
                }`}
              >
                {dCount} {dCount === 1 ? "zi" : "zile"}
              </button>
            )
          })}
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-700">Data preluării</label>
            <input
              type="date"
              value={selectedIsoDate}
              min={minIsoDate}
              onChange={(e) => {
                if (e.target.value) {
                  onSelectedIsoDateChange(e.target.value)
                }
              }}
              className="w-full h-9 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-700">Ora de început</label>
            <select
              value={selectedStartHour}
              onChange={(e) => onSelectedStartHourChange(Number(e.target.value))}
              className="w-full h-9 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            >
              {CALENDAR_HOURS.map((h) => (
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
                onChange={(e) => onDurationHoursChange(Number(e.target.value))}
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
                  onChange={(e) => onMultiDaysCountChange(Number(e.target.value))}
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
                onChange={(e) => onMultiEndHourChange(Number(e.target.value))}
                className="w-full h-9 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                {CALENDAR_HOURS.map((h) => (
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
            <label className="text-xs font-bold text-neutral-800">Scop / proiect</label>
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
            onChange={(e) => onPurposeChange(e.target.value)}
            className="rounded-xl border-neutral-200 text-xs resize-none"
          />
          <p className="text-[11px] text-neutral-400">Maxim 200 de caractere.</p>
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
  )
}
