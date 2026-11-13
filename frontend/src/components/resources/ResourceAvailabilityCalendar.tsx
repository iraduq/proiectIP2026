import { Calendar, Clock } from "lucide-react"
import { Card } from "../ui/card"

export interface DayColumn {
  dateObj: Date
  isoDate: string
  displayDate: string
  headerLabel: string
}

export const CALENDAR_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]

const RO_WEEKDAYS = ["Dum", "Lun", "Mar", "Mie", "Joi", "Vin", "Sâm"]
export const RO_MONTHS = [
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

export function toIsoDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function toDisplayDateStr(d: Date): string {
  const day = String(d.getDate()).padStart(2, "0")
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const y = d.getFullYear()
  return `${day}.${m}.${y}`
}

export function buildFiveDays(baseDate: Date, offsetDays: number): DayColumn[] {
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

interface ResourceAvailabilityCalendarProps {
  days: DayColumn[]
  dayOffset: number
  monthLabel: string
  onPrevDays: () => void
  onNextDays: () => void
  isSlotOccupied: (isoDate: string, hour: number) => boolean
  isSlotSelected: (isoDate: string, hour: number) => boolean
  onSelectSlot: (isoDate: string, hour: number) => void
}

export function ResourceAvailabilityCalendar({
  days,
  dayOffset,
  monthLabel,
  onPrevDays,
  onNextDays,
  isSlotOccupied,
  isSlotSelected,
  onSelectSlot,
}: ResourceAvailabilityCalendarProps) {
  const firstDayCol = days[0]
  const lastDayCol = days[days.length - 1]

  return (
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
          onClick={onPrevDays}
          disabled={dayOffset === 0}
          className="h-8 px-3 rounded-lg border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 transition-colors"
        >
          ‹ Anterior
        </button>
        <span className="text-xs font-bold text-neutral-900">{monthLabel}</span>
        <button
          type="button"
          onClick={onNextDays}
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
            {CALENDAR_HOURS.map((hour) => {
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
                            onClick={() => onSelectSlot(day.isoDate, hour)}
                            className="w-full h-8 rounded-lg bg-neutral-950 text-white text-[11px] font-semibold shadow-sm"
                          >
                            Selectat
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onSelectSlot(day.isoDate, hour)}
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
  )
}
