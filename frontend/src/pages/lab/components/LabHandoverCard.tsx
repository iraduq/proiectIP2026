import { useState } from "react"
import { ArrowRightLeft } from "lucide-react"
import type { Reservation } from "../../../types"
import { LabConditionRadios } from "./LabConditionRadios"
import { LabReservationField } from "./LabReservationField"
import { BTN_PRIMARY, Field, FlowPills, INPUT_CLASS, Pill, ResourceThumb, SectionCard, SectionHeading } from "./LabUi"

interface Props {
  labName: string
  managerName: string
  reservations: Reservation[]
  onHandOver: (id: number, stare: "FUNCTIONAL" | "VERIFICARE") => Promise<string | null>
}

const OPTIONS = [
  { value: "FUNCTIONAL" as const, label: "Funcțional" },
  { value: "VERIFICARE" as const, label: "Necesită verificare" },
]

export function LabHandoverCard({ labName, managerName, reservations, onHandOver }: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  const [stare, setStare] = useState<"FUNCTIONAL" | "VERIFICARE">("FUNCTIONAL")
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const reservation = reservations.find((r) => r.id === selected)

  const submit = async () => {
    if (!reservation) return
    setBusy(true)
    const err = await onHandOver(reservation.id, stare)
    setBusy(false)
    setMessage(err)
    if (!err) setSelected(null)
  }

  return (
    <SectionCard>
      <SectionHeading
        icon={<ArrowRightLeft />}
        title="Predare · cerere aprobată"
        right={labName ? <Pill tone="neutral">Filtru: {labName}</Pill> : undefined}
      />
      <LabReservationField
        id="lab-handover-reservation"
        reservations={reservations}
        value={selected}
        onChange={setSelected}
        searchIcon
        disabledText="Nicio cerere aprobată de predat"
        description={`Introdu manual sau scanează codul de inventar${labName ? ` (numai ${labName})` : ""}`}
      />
      {reservation && (
        <div className="flex items-center gap-3 rounded-[10px] bg-neutral-100 p-3">
          <ResourceThumb size={48} radius={8} />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="truncate text-sm font-medium">{reservation.resursa_nume}</div>
            <div className="flex items-center gap-1.5">
              {reservation.sala_nume && <Pill tone="neutral">{reservation.sala_nume}</Pill>}
              <span className="truncate text-xs text-neutral-500">{reservation.categorie_nume}</span>
            </div>
          </div>
          <Pill tone="neutral">Scenariu predare</Pill>
        </div>
      )}
      <Field label="Beneficiar (student / cadru didactic)" required htmlFor="lab-handover-student">
        <input id="lab-handover-student" className={INPUT_CLASS} readOnly value={reservation?.utilizator_nume ?? ""} placeholder="Selectează o cerere aprobată" />
      </Field>
      <Field label="Stare inițială la predare" required>
        <LabConditionRadios name="lab-handover-state" options={OPTIONS} value={stare} onChange={setStare} />
      </Field>
      <FlowPills
        steps={[
          { label: "Aprobată", tone: "neutral" },
          { label: "Preluat / În derulare", tone: "dark" },
          { label: "Finalizată", tone: "outline" },
        ]}
      />
      <div className="flex justify-between text-xs text-neutral-500">
        <span>Responsabil: {managerName}</span>
        <span>Scenariu alternativ · înainte de preluare</span>
      </div>
      {message && <p className="text-xs font-medium text-[#e7000b]">{message}</p>}
      <button type="button" disabled={!reservation || busy} onClick={submit} className={`${BTN_PRIMARY} w-full`}>
        Confirmă predarea
      </button>
    </SectionCard>
  )
}
