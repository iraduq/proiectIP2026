import { useEffect, useMemo, useState } from "react"
import { Search } from "lucide-react"
import type { Reservation } from "../../../types"
import { Field, INPUT_CLASS } from "./LabUi"

interface Props {
  id: string
  reservations: Reservation[]
  value: number | null
  onChange: (id: number | null) => void
  description?: string
  disabledText: string
  searchIcon?: boolean
}

export function LabReservationField({ id, reservations, value, onChange, description, disabledText, searchIcon }: Props) {
  const labels = useMemo(() => {
    const base = reservations.map((r) => `${r.resursa_cod} · ${r.resursa_nume}`)
    return reservations.map((r, i) => (base.filter((b) => b === base[i]).length > 1 ? `${base[i]} · #${r.id}` : base[i]))
  }, [reservations])
  const [text, setText] = useState("")

  useEffect(() => {
    const idx = reservations.findIndex((r) => r.id === value)
    setText(idx >= 0 ? labels[idx] : "")
  }, [value, reservations, labels])

  const handle = (next: string) => {
    setText(next)
    const idx = labels.indexOf(next)
    onChange(idx >= 0 ? reservations[idx].id : null)
  }

  return (
    <Field label="Cod inventar sau denumire" required htmlFor={id}>
      <div className="relative">
        {searchIcon && <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />}
        <input
          id={id}
          list={`${id}-options`}
          className={`${INPUT_CLASS} ${searchIcon ? "pl-8" : ""}`}
          value={text}
          disabled={reservations.length === 0}
          placeholder={reservations.length === 0 ? disabledText : "INV-USV-2026-014 · Workstation AI Deep Learning"}
          onChange={(e) => handle(e.target.value)}
        />
        <datalist id={`${id}-options`}>
          {labels.map((l) => (
            <option key={l} value={l} />
          ))}
        </datalist>
      </div>
      {description && <p className="mt-1.5 text-sm text-neutral-500">{description}</p>}
    </Field>
  )
}
