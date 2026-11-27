import type { ReactNode } from "react"
import { cn } from "../../../lib/utils"

export const INPUT_CLASS =
  "h-9 w-full rounded-[10px] border border-neutral-200 bg-white px-2.5 py-1 text-sm text-neutral-950 outline-none placeholder:text-neutral-500 focus:border-neutral-400 disabled:bg-neutral-50"

export const TEXTAREA_CLASS =
  "w-full resize-none rounded-[10px] border border-neutral-200 bg-white px-2.5 py-2 text-sm text-neutral-950 outline-none placeholder:text-neutral-500 focus:border-neutral-400"

export const BTN_PRIMARY =
  "inline-flex h-9 items-center justify-center rounded-[10px] bg-neutral-900 px-2.5 text-sm font-medium text-neutral-50 hover:bg-neutral-800 disabled:opacity-50"

export const BTN_OUTLINE =
  "inline-flex h-9 items-center justify-center rounded-[10px] border border-neutral-200 bg-white px-2.5 text-sm font-medium text-neutral-950 hover:bg-neutral-50 disabled:opacity-50"

export const BTN_DESTRUCTIVE =
  "inline-flex h-9 items-center justify-center rounded-[10px] bg-[rgba(231,0,11,0.1)] px-2.5 text-sm font-medium text-[#e7000b] hover:bg-[rgba(231,0,11,0.16)] disabled:opacity-50"

export function SectionCard({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <section
      id={id}
      className={cn("flex flex-col gap-5 rounded-[14px] border border-neutral-200 bg-white p-6 shadow-sm", className)}
    >
      {children}
    </section>
  )
}

export function SectionHeading({ icon, title, right }: { icon: ReactNode; title: string; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-lg font-semibold leading-7 text-black">
        <span className="flex h-4 w-4 items-center justify-center [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
        {title}
      </h2>
      <div className="flex items-center gap-1.5">{right}</div>
    </div>
  )
}

type Tone = "neutral" | "outline" | "dark" | "danger"
const TONES: Record<Tone, string> = {
  neutral: "bg-neutral-100 text-neutral-950 border-transparent",
  outline: "bg-transparent text-neutral-950 border-neutral-200",
  dark: "bg-neutral-900 text-neutral-50 border-transparent",
  danger: "bg-[rgba(231,0,11,0.1)] text-[#e7000b] border-transparent",
}

export function Pill({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex h-[22px] items-center justify-center whitespace-nowrap rounded-full border px-2 text-xs font-medium",
        TONES[tone]
      )}
    >
      {children}
    </span>
  )
}

export function Field({ label, required, htmlFor, children, className }: {
  label: string
  required?: boolean
  htmlFor?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col items-start gap-1.5", className)}>
      <label htmlFor={htmlFor} className="flex items-center gap-2 text-sm font-medium leading-5 text-neutral-950">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="w-full">{children}</div>
    </div>
  )
}

export function TableHead({ columns, height = "h-9" }: { columns: { label: string; className?: string }[]; height?: string }) {
  return (
    <div className={cn("flex w-full overflow-hidden rounded-md bg-neutral-100 text-xs font-medium text-neutral-500", height)}>
      {columns.map((c) => (
        <div key={c.label} className={cn("flex items-center p-2", c.className)}>
          {c.label}
        </div>
      ))}
    </div>
  )
}

export function Cell({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("flex items-center p-2 text-sm text-neutral-950", className)}>{children}</div>
}

export function ResourceThumb({ url, size = 40, radius = 8 }: { url?: string | null; size?: number; radius?: number }) {
  const style = { width: size, height: size, borderRadius: radius }
  return url ? (
    <img src={url} alt="" style={style} className="shrink-0 object-cover" />
  ) : (
    <div style={style} className="shrink-0 bg-neutral-100" />
  )
}

export function FlowPills({ steps }: { steps: { label: string; tone: Tone }[] }) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => (
        <span key={s.label} className="flex items-center gap-2">
          {i > 0 && <span className="text-sm text-neutral-500">→</span>}
          <Pill tone={s.tone}>{s.label}</Pill>
        </span>
      ))}
    </div>
  )
}
