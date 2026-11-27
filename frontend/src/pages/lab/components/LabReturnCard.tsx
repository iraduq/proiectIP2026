import { useEffect, useState } from "react"
import { ArrowRightLeft, TriangleAlert } from "lucide-react"
import type { Reservation } from "../../../types"
import { RETURN_CONDITIONS, type ReturnCondition } from "../data/labConstants"
import { LabConditionRadios } from "./LabConditionRadios"
import { LabReservationField } from "./LabReservationField"
import { BTN_DESTRUCTIVE, BTN_PRIMARY, FlowPills, Pill, SectionCard, SectionHeading, TEXTAREA_CLASS } from "./LabUi"

interface Props {
  labName: string
  managerName: string
  reservations: Reservation[]
  preselected: number | null
  onGiveBack: (id: number, condition: ReturnCondition, observatii: string) => Promise<string | null>
}

const OPTIONS = RETURN_CONDITIONS.map(({ value, label }) => ({ value, label }))

export function LabReturnCard({ labName, managerName, reservations, preselected, onGiveBack }: Props) {
  const [selected, setSelected] = useState<number | null>(preselected)
  const [condition, setCondition] = useState<ReturnCondition>("FUNCTIONAL")
  const [notes, setNotes] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => setSelected(preselected), [preselected])

  const submit = async () => {
    if (selected == null) return
    setBusy(true)
    const err = await onGiveBack(selected, condition, notes.trim())
    setBusy(false)
    setMessage(err)
    if (!err) {
      setSelected(null)
      setNotes("")
      setCondition("FUNCTIONAL")
    }
  }

  return (
    <SectionCard>
      <SectionHeading
        icon={<ArrowRightLeft />}
        title="Retur · finalizare"
        right={labName ? <Pill tone="neutral">Filtru: {labName}</Pill> : undefined}
      />
      <LabReservationField
        id="lab-return-reservation"
        reservations={reservations}
        value={selected}
        onChange={setSelected}
        disabledText="Nicio rezervare de returnat"
      />
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-[#b91c1c]">
          Stare la returnare (obligatorie) <span>*</span>
        </div>
        <LabConditionRadios name="lab-return-state" options={OPTIONS} value={condition} onChange={setCondition} coloured />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="lab-return-notes" className="text-sm font-medium text-neutral-950">Observații la primire</label>
        <textarea
          id="lab-return-notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={`${TEXTAREA_CLASS} h-20`}
          placeholder="Studentul a semnalat: ecranul secundar nu pornește, cablu Display Port posibil deteriorat."
        />
      </div>
      <FlowPills steps={[{ label: "Preluat / În derulare", tone: "dark" }, { label: "Finalizată", tone: "outline" }]} />
      {condition === "DEFECT" && (
        <div className="flex flex-col gap-2.5 rounded-[10px] border border-[#fecaca] bg-[#fef2f2] p-3.5">
          <div className="flex items-center gap-2 text-sm font-medium text-[#e7000b]">
            <TriangleAlert className="h-4 w-4" /> Atenție: stare Defect selectată
          </div>
          <p className="text-sm text-[#991b1b]">
            La confirmarea returului, rezervarea devine Finalizată. Înregistrează defecțiunea în jurnalul tehnic pentru actualizarea stării resursei.
          </p>
          <p className="text-xs text-[#e7000b]">
            Salvarea unei intervenții cu starea Defectă actualizează automat catalogul și blochează cererile noi. Istoricul rămâne imutabil.
          </p>
        </div>
      )}
      <div className="flex justify-between text-xs text-neutral-500">
        <span>Responsabil: {managerName}</span>
        <span>{selected ? "Retur în curs · încă nesalvat" : "Alege o rezervare"}</span>
      </div>
      {message && <p className="text-xs font-medium text-[#e7000b]">{message}</p>}
      <button
        type="button"
        disabled={selected == null || busy}
        onClick={submit}
        className={`${condition === "DEFECT" ? BTN_DESTRUCTIVE : BTN_PRIMARY} w-full`}
      >
        Confirmă returul
      </button>
    </SectionCard>
  )
}
