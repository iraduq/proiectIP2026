import type { Reservation } from "../../../types"

const pad = (n: number) => String(n).padStart(2, "0")

export function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`
}

export function formatTime(iso: string): string {
  const d = new Date(iso)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function formatInterval(r: Pick<Reservation, "data_inceput" | "data_sfarsit">): string {
  return `${formatTime(r.data_inceput)}–${formatTime(r.data_sfarsit)}`
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)}  ${formatTime(iso)}`
}

export function isOngoing(r: Pick<Reservation, "data_inceput" | "data_sfarsit">, now = new Date()): boolean {
  return new Date(r.data_inceput) <= now && now <= new Date(r.data_sfarsit)
}

export function isToday(iso: string, now = new Date()): boolean {
  return formatDate(iso) === formatDate(now.toISOString())
}
