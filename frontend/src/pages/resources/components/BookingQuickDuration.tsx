interface BookingQuickDurationProps {
  bookingMode: "HOURLY" | "MULTIDAY"
  durationHours: number
  multiDaysCount: number
  onQuickHours: (hours: number) => void
  onQuickDays: (days: number) => void
}

export function BookingQuickDuration({
  bookingMode,
  durationHours,
  multiDaysCount,
  onQuickHours,
  onQuickDays,
}: BookingQuickDurationProps) {
  return (
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
  )
}
