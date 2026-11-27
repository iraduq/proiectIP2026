import { useState } from "react"
import { Plus, Wrench } from "lucide-react"
import { PaginationFooter } from "../../../components/common/PaginationFooter"
import type { Resource, StareTehnica, TechnicalHistory } from "../../../types"
import type { JournalDraft } from "../hooks/useLabOverview"
import { JOURNAL_FORM_ID, JOURNAL_STATUS_LABELS, LAB_PAGE_SIZE, STARE_TEHNICA_OPTIONS } from "../data/labConstants"
import { formatDateTime } from "../data/labFormat"
import {
  BTN_PRIMARY, Cell, Field, INPUT_CLASS, Pill, SectionCard, SectionHeading, TableHead, TEXTAREA_CLASS,
} from "./LabUi"

interface Props {
  labName: string
  managerName: string
  entries: TechnicalHistory[]
  resources: Resource[]
  onAdd: (draft: JournalDraft) => Promise<string | null>
}

const COLUMNS = [
  { label: "Data / Ora", className: "w-[174px] shrink-0" },
  { label: "Cod inventar", className: "w-[191px] shrink-0" },
  { label: "Tip intervenție", className: "w-[187px] shrink-0" },
  { label: "Descriere", className: "min-w-[233px] flex-1" },
  { label: "Autor", className: "w-[196px] shrink-0" },
  { label: "Status", className: "w-[115px] shrink-0" },
]

const TONE: Record<StareTehnica, "neutral" | "outline" | "danger"> = {
  DISPONIBILA: "neutral",
  IN_MENTENANTA: "outline",
  DEFECTA: "danger",
}

export function LabJournalSection({ labName, managerName, entries, resources, onAdd }: Props) {
  const [page, setPage] = useState(1)
  const [resursaId, setResursaId] = useState("")
  const [tip, setTip] = useState("")
  const [descriere, setDescriere] = useState("")
  const [stare, setStare] = useState<StareTehnica>("IN_MENTENANTA")
  const [message, setMessage] = useState<string | null>(null)
  const rows = entries.slice((page - 1) * LAB_PAGE_SIZE, page * LAB_PAGE_SIZE)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resursaId || !tip.trim() || !descriere.trim()) {
      setMessage("Completează codul de inventar, tipul și descrierea.")
      return
    }
    const err = await onAdd({
      resursa_id: Number(resursaId),
      tip_interventie: tip.trim(),
      descriere: descriere.trim(),
      stare_noua: stare,
    })
    setMessage(err)
    if (!err) {
      setTip("")
      setDescriere("")
      setResursaId("")
    }
  }

  return (
    <SectionCard>
      <SectionHeading
        icon={<Wrench />}
        title="Jurnal tehnic · istoric imutabil"
        right={
          <>
            {labName && <Pill tone="neutral">{labName}</Pill>}
            <Pill tone="outline">Jurnal imutabil — fără editare</Pill>
          </>
        }
      />
      <div className="flex w-full flex-col overflow-x-auto">
        <TableHead columns={COLUMNS} />
        {rows.length === 0 && <div className="py-8 text-center text-sm text-neutral-500">Nu există intrări în jurnal.</div>}
        {rows.map((h) => (
          <div key={h.id} className="flex min-h-[52px] items-center border-b border-neutral-200">
            <Cell className="w-[174px] shrink-0 whitespace-pre">{formatDateTime(h.created_at)}</Cell>
            <Cell className="w-[191px] shrink-0">{h.resursa_cod}</Cell>
            <Cell className="w-[187px] shrink-0">{h.tip_interventie}</Cell>
            <Cell className="min-w-[233px] flex-1">{h.descriere}</Cell>
            <Cell className="w-[196px] shrink-0">{h.utilizator_nume}</Cell>
            <Cell className="w-[115px] shrink-0">
              <Pill tone={TONE[h.stare_noua]}>{JOURNAL_STATUS_LABELS[h.stare_noua]}</Pill>
            </Cell>
          </div>
        ))}
        <PaginationFooter totalItems={entries.length} pageSize={LAB_PAGE_SIZE} currentPage={page} onPageChange={setPage} itemLabel="intrări" />
      </div>

      <hr className="border-neutral-200" />
      <form id={JOURNAL_FORM_ID} onSubmit={submit} className="flex flex-col gap-4">
        <h3 className="flex items-center gap-2 text-sm font-medium text-neutral-500">
          <Plus className="h-3.5 w-3.5" /> Adaugă intrare nouă în jurnal
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="Cod inventar" required htmlFor="lab-j-cod">
            <select id="lab-j-cod" className={INPUT_CLASS} value={resursaId} onChange={(e) => setResursaId(e.target.value)}>
              <option value="">INV-USV-2026-014</option>
              {resources.map((r) => (
                <option key={r.id} value={r.id}>{r.cod_inventar} · {r.nume}</option>
              ))}
            </select>
          </Field>
          <Field label="Tip intervenție" required htmlFor="lab-j-tip">
            <input id="lab-j-tip" className={INPUT_CLASS} value={tip} onChange={(e) => setTip(e.target.value)} placeholder="Defecțiune semnalată" />
          </Field>
        </div>
        <Field label="Descriere intervenție" required htmlFor="lab-j-desc">
          <textarea
            id="lab-j-desc"
            value={descriere}
            onChange={(e) => setDescriere(e.target.value)}
            className={`${TEXTAREA_CLASS} h-[72px]`}
            placeholder="Descrie intervenția, piesele utilizate și rezultatul…"
          />
        </Field>
        <Field label="Stare tehnică după intervenție" required htmlFor="lab-j-stare">
          <select id="lab-j-stare" className={INPUT_CLASS} value={stare} onChange={(e) => setStare(e.target.value as StareTehnica)}>
            {STARE_TEHNICA_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-neutral-500">
            <span>Autor: {managerName}</span>
            <span>Timestamp automat · {new Date().toLocaleDateString("ro-RO")}</span>
          </div>
          <button type="submit" className={BTN_PRIMARY}>Salvează înregistrarea</button>
        </div>
        {message && <p className="text-xs font-medium text-[#e7000b]">{message}</p>}
      </form>
    </SectionCard>
  )
}
