export const GROUP_HOUR_PRESETS = [1, 2, 4, 6, 8] as const

export const GROUP_DAY_PRESETS = [1, 2, 3, 5, 7, 14] as const

export const CALENDAR_WEEK_DAYS = ["Lu", "Ma", "Mi", "Jo", "Vi", "Sâ", "Du"] as const

export interface CalendarDayItem {
  label: string
  muted: boolean
  active?: boolean
}

export const STATIC_CALENDAR_DAYS: CalendarDayItem[] = [
  { label: "28", muted: true },
  { label: "29", muted: true },
  { label: "30", muted: true },
  ...Array.from({ length: 31 }, (_, idx) => ({
    label: String(idx + 1),
    muted: false,
    active: idx + 1 === 26,
  })),
  { label: "1", muted: true },
]
