import React from "react"
import { Button } from "../ui/button"
import { CALENDAR_WEEK_DAYS, STATIC_CALENDAR_DAYS } from "../../data/groupBookingConstants"
import type { Resource, Room } from "../../types"

interface GroupBookingSummaryCardProps {
  selectedRoom?: Room
  selectedRes?: Resource
  formattedStart: string
  formattedEnd: string
  durationHours: number
  isConfirmed: boolean
  isSubmitting: boolean
  onConfirmChange: (checked: boolean) => void
  onSubmit: (e: React.FormEvent) => void
}

export function GroupBookingSummaryCard({
  selectedRoom,
  selectedRes,
  formattedStart,
  formattedEnd,
  durationHours,
  isConfirmed,
  isSubmitting,
  onConfirmChange,
  onSubmit,
}: GroupBookingSummaryCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-5">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Data activității
            </h3>
            <div className="text-xs font-bold text-neutral-900 mt-0.5">
              Luni, 26 octombrie 2026
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <span className="font-semibold text-neutral-800">Octombrie 2026</span>
            <button type="button" className="p-1 hover:bg-neutral-100 rounded">
              ‹
            </button>
            <button type="button" className="p-1 hover:bg-neutral-100 rounded">
              ›
            </button>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-neutral-50/70 border border-neutral-200/80">
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-neutral-400 pb-2">
            {CALENDAR_WEEK_DAYS.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[11px]">
            {STATIC_CALENDAR_DAYS.map((day, idx) => (
              <span
                key={`${day.label}-${idx}`}
                className={
                  day.active
                    ? "py-1 bg-black text-white font-bold rounded-full"
                    : day.muted
                    ? "text-neutral-300 py-1"
                    : "py-1 text-neutral-600"
                }
              >
                {day.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-100 pt-4 space-y-2.5">
        <h4 className="text-xs font-bold text-neutral-900">
          Disponibilitate · {selectedRoom?.cod || "Lab 210"}
        </h4>
        <div className="space-y-2">
          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-0.5">
            <div className="font-semibold text-neutral-700">08:00–12:00 · Mentenanță</div>
            <div className="text-[11px] text-neutral-500">
              Indisponibil · nu poate fi suprascris
            </div>
          </div>
          <div className="p-3 rounded-xl bg-neutral-50/80 border border-neutral-300 text-xs space-y-0.5">
            <div className="font-semibold text-neutral-900">
              {formattedStart}–{formattedEnd} · Interval selectat
            </div>
            <div className="text-[11px] text-neutral-500">
              12× {selectedRes?.nume || "Kituri STM32"} · {durationHours} ore ·{" "}
              {selectedRoom?.cod || "Lab 210"}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-100 pt-4 space-y-3">
        <h4 className="text-xs font-bold text-neutral-900">Sumarul rezervării</h4>
        <div className="p-3.5 rounded-xl bg-neutral-900 text-white text-xs space-y-1">
          <div className="font-semibold">
            26.10.2026 · Luni {formattedStart} - {formattedEnd}
          </div>
          <div className="text-neutral-400 text-[11px]">
            Durată: {durationHours} ore · {selectedRes?.nume}
          </div>
        </div>

        <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
          <input
            type="checkbox"
            checked={isConfirmed}
            onChange={(e) => onConfirmChange(e.target.checked)}
            className="mt-0.5 rounded border-neutral-300 text-black focus:ring-black"
          />
          <span className="text-[11px] text-neutral-600 leading-snug">
            Bifează confirmarea de mai sus pentru a continua. Nicio rezervare nu a fost modificată
            încă.
          </span>
        </label>

        <Button
          onClick={onSubmit}
          disabled={!isConfirmed || isSubmitting}
          className="w-full bg-black hover:bg-neutral-800 text-white text-xs h-10 shadow-sm font-semibold"
        >
          {isSubmitting ? "Se confirmă..." : "Confirmă și rezervă"}
        </Button>
      </div>
    </div>
  )
}
