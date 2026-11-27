import { CircleCheck, TriangleAlert } from "lucide-react"
import { cn } from "../../../lib/utils"

interface Option<T extends string> {
  value: T
  label: string
}

interface Props<T extends string> {
  name: string
  options: Option<T>[]
  value: T
  onChange: (v: T) => void
  coloured?: boolean
}

const COLOURS: Record<string, string> = {
  FUNCTIONAL: "text-[#15803d]",
  VERIFICARE: "text-[#92400e]",
  DEFECT: "text-[#e7000b]",
}

export function LabConditionRadios<T extends string>({ name, options, value, onChange, coloured }: Props<T>) {
  return (
    <div className={cn("flex flex-wrap", coloured ? "gap-x-4 gap-y-3" : "gap-5")}>
      {options.map((o) => (
        <label key={o.value} className="flex cursor-pointer items-center gap-2 text-sm text-neutral-950">
          <input type="radio" name={name} checked={value === o.value} onChange={() => onChange(o.value)} className="h-4 w-4 accent-neutral-900" />
          <span className={cn("flex items-center gap-1", coloured && COLOURS[o.value])}>
            {coloured &&
              (o.value === "FUNCTIONAL" ? <CircleCheck className="h-3 w-3" /> : <TriangleAlert className="h-3 w-3" />)}
            {o.label}
          </span>
        </label>
      ))}
    </div>
  )
}
