import { GROUP_DAY_PRESETS, GROUP_HOUR_PRESETS } from "../../data/groupBookingConstants"
import type { Resource, Room } from "../../types"

interface GroupBookingFormCardProps {
  resources: Resource[]
  rooms: Room[]
  selectedResourceId: number
  selectedRoomId: number
  selectedDate: string
  endDateStr: string
  startHour: number
  durationMode: "HOURS" | "DAYS"
  durationHours: number
  durationDays: number
  formattedStart: string
  formattedEnd: string
  durationLabel: string
  onResourceChange: (id: number) => void
  onRoomChange: (id: number) => void
  onDateChange: (date: string) => void
  onStartHourChange: (hour: number) => void
  onDurationModeChange: (mode: "HOURS" | "DAYS") => void
  onDurationHoursChange: (hours: number) => void
  onDurationDaysChange: (days: number) => void
}

export function GroupBookingFormCard({
  resources,
  rooms,
  selectedResourceId,
  selectedRoomId,
  selectedDate,
  endDateStr,
  startHour,
  durationMode,
  durationHours,
  durationDays,
  formattedStart,
  formattedEnd,
  durationLabel,
  onResourceChange,
  onRoomChange,
  onDateChange,
  onStartHourChange,
  onDurationModeChange,
  onDurationHoursChange,
  onDurationDaysChange,
}: GroupBookingFormCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-6">
      <div className="border-b border-neutral-100 pb-4">
        <h2 className="text-sm font-bold text-neutral-900">Disciplină și resurse</h2>
        <p className="text-xs text-neutral-500">Rezervare didactică / grupă</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
            Tip resursă / Echipament
          </label>
          <select
            value={selectedResourceId}
            onChange={(e) => onResourceChange(Number(e.target.value))}
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
            onChange={(e) => onRoomChange(Number(e.target.value))}
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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Intervalul activității
            </h3>
            <p className="text-xs text-neutral-600 font-medium mt-0.5">
              {durationMode === "HOURS"
                ? `${selectedDate} · ${formattedStart} – ${formattedEnd}`
                : `${selectedDate} (${formattedStart}) – ${endDateStr} (${formattedEnd})`}
            </p>
          </div>

          <div className="inline-flex rounded-xl border border-neutral-200 bg-neutral-100 p-0.5">
            <button
              type="button"
              onClick={() => onDurationModeChange("HOURS")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                durationMode === "HOURS"
                  ? "bg-white text-neutral-950 shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Pe ore
            </button>
            <button
              type="button"
              onClick={() => onDurationModeChange("DAYS")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                durationMode === "DAYS"
                  ? "bg-white text-neutral-950 shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Pe zile (1–14 zile)
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {GROUP_HOUR_PRESETS.map((h) => (
            <button
              key={`gh-${h}`}
              type="button"
              onClick={() => {
                onDurationModeChange("HOURS")
                onDurationHoursChange(h)
              }}
              className={`h-8 px-3 rounded-xl text-xs font-semibold transition-colors ${
                durationMode === "HOURS" && durationHours === h
                  ? "bg-black text-white"
                  : "bg-neutral-100 hover:bg-neutral-200 text-neutral-800"
              }`}
            >
              {h} {h === 1 ? "oră" : "ore"}
            </button>
          ))}
          {GROUP_DAY_PRESETS.map((d) => (
            <button
              key={`gd-${d}`}
              type="button"
              onClick={() => {
                onDurationModeChange("DAYS")
                onDurationDaysChange(d)
              }}
              className={`h-8 px-3 rounded-xl text-xs font-semibold transition-colors ${
                durationMode === "DAYS" && durationDays === d
                  ? "bg-black text-white"
                  : "bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200"
              }`}
            >
              {d} {d === 1 ? "zi" : "zile"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
            <span className="text-neutral-400 block text-[10px] uppercase font-bold">Început</span>
            <span className="font-bold text-neutral-900 text-sm">
              {selectedDate} · {formattedStart}
            </span>
          </div>
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
            <span className="text-neutral-400 block text-[10px] uppercase font-bold">Sfârșit</span>
            <span className="font-bold text-neutral-900 text-sm">
              {endDateStr} · {formattedEnd}
            </span>
          </div>
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
            <span className="text-neutral-400 block text-[10px] uppercase font-bold">Durată</span>
            <span className="font-bold text-neutral-900 text-sm">{durationLabel}</span>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-neutral-700 mb-1.5">
              <span>Data de început</span>
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) onDateChange(e.target.value)
              }}
              className="w-full h-9 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-900"
            />
          </div>

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
              onChange={(e) => onStartHourChange(parseInt(e.target.value))}
              className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-black"
            />
            <div className="flex justify-between text-[10px] text-neutral-400 pt-1 font-mono">
              <span>08:00</span>
              <span>12:00</span>
              <span>17:00</span>
            </div>
          </div>

          {durationMode === "HOURS" ? (
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-neutral-700 mb-1.5">
                <span>Durata în ore: {durationHours} ore</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={durationHours}
                onChange={(e) => onDurationHoursChange(parseInt(e.target.value))}
                className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-black"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 pt-1 font-mono">
                <span>1 oră</span>
                <span>4 ore</span>
                <span>8 ore</span>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-neutral-700 mb-1.5">
                <span>
                  Durata în zile: {durationDays} {durationDays === 1 ? "zi" : "zile"}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="14"
                step="1"
                value={durationDays}
                onChange={(e) => onDurationDaysChange(parseInt(e.target.value))}
                className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-black"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 pt-1 font-mono">
                <span>1 zi</span>
                <span>3 zile</span>
                <span>7 zile</span>
                <span>14 zile</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
