import { CALENDAR_HOURS } from "./ResourceAvailabilityCalendar"

interface BookingIntervalControlsProps {
  bookingMode: "HOURLY" | "MULTIDAY"
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
}

export function BookingIntervalControls({
  bookingMode,
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
}: BookingIntervalControlsProps) {
  return (
    <>
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
    </>
  )
}
