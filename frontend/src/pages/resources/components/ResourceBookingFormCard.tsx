import { Clock } from "lucide-react"
import { Card } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Button } from "../../../components/ui/button"
import { Textarea } from "../../../components/ui/textarea"
import { BookingIntervalControls } from "./BookingIntervalControls"
import { BookingQuickDuration } from "./BookingQuickDuration"
import { BookingStatusNotice } from "./BookingStatusNotice"

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

      <BookingQuickDuration
        bookingMode={bookingMode}
        durationHours={durationHours}
        multiDaysCount={multiDaysCount}
        onQuickHours={onQuickHours}
        onQuickDays={onQuickDays}
      />

      <form onSubmit={onSubmit} className="space-y-4">
        <BookingIntervalControls
          bookingMode={bookingMode}
          durationHours={durationHours}
          onDurationHoursChange={onDurationHoursChange}
          multiDaysCount={multiDaysCount}
          onMultiDaysCountChange={onMultiDaysCountChange}
          multiEndHour={multiEndHour}
          onMultiEndHourChange={onMultiEndHourChange}
          selectedIsoDate={selectedIsoDate}
          minIsoDate={minIsoDate}
          onSelectedIsoDateChange={onSelectedIsoDateChange}
          selectedStartHour={selectedStartHour}
          onSelectedStartHourChange={onSelectedStartHourChange}
          startStr={startStr}
          endStr={endStr}
          endDisplayDate={endDisplayDate}
        />

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

        <BookingStatusNotice
          hasSlotConflict={hasSlotConflict}
          formattedSelectedRange={formattedSelectedRange}
          activeCount={activeCount}
          maxLimit={maxLimit}
        />

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
