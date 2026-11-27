import { useState } from "react"
import { CalendarClock } from "lucide-react"
import { PaginationFooter } from "../../../components/common/PaginationFooter"
import type { Reservation } from "../../../types"
import { LAB_PAGE_SIZE } from "../data/labConstants"
import { formatDate, formatInterval } from "../data/labFormat"
import {
  BTN_DESTRUCTIVE, BTN_OUTLINE, Cell, Field, INPUT_CLASS, Pill, ResourceThumb, SectionCard, SectionHeading, TableHead,
} from "./LabUi"

interface Props {
  faculty: string
  requests: Reservation[]
  onApprove: (id: number) => Promise<string | null>
  onReject: (id: number, reason: string) => Promise<string | null>
}

const COLUMNS = [
  { label: "Referință", className: "w-[100px] shrink-0" },
  { label: "Resursă", className: "w-[220px] shrink-0" },
  { label: "Data", className: "w-[110px] shrink-0" },
  { label: "Interval", className: "w-[130px] shrink-0" },
  { label: "Lab", className: "w-[90px] shrink-0" },
  { label: "Stare", className: "w-[130px] shrink-0" },
  { label: "Acțiuni", className: "flex-1" },
]

export function LabRequestsSection({ faculty, requests, onApprove, onReject }: Props) {
  const [page, setPage] = useState(1)
  const [reason, setReason] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState<number | null>(null)
  const rows = requests.slice((page - 1) * LAB_PAGE_SIZE, page * LAB_PAGE_SIZE)

  const act = async (id: number, kind: "approve" | "reject") => {
    if (kind === "reject" && !reason.trim()) {
      setMessage("Respingerea necesită un motiv.")
      return
    }
    setBusy(id)
    const err = kind === "approve" ? await onApprove(id) : await onReject(id, reason.trim())
    setBusy(null)
    setMessage(err)
    if (!err && kind === "reject") setReason("")
  }

  return (
    <SectionCard className="rounded-[10px]">
      <SectionHeading
        icon={<CalendarClock />}
        title="Cererile studenților"
        right={<Pill tone="neutral">{requests.length} de aprobat</Pill>}
      />
      <p className="text-sm text-neutral-500">
        {faculty ? `${faculty} · ` : ""}Rezervări personale separate de cererile studenților.
      </p>
      <div className="flex w-full flex-col overflow-hidden">
        <TableHead columns={COLUMNS} height="h-10" />
        {rows.length === 0 && <div className="py-8 text-center text-sm text-neutral-500">Nu există cereri în așteptare.</div>}
        {rows.map((r) => (
          <div key={r.id} className="flex min-h-16 items-center border-b border-neutral-200">
            <Cell className="w-[100px] shrink-0 text-neutral-500">#{r.id}</Cell>
            <Cell className="w-[220px] shrink-0 gap-2.5">
              <ResourceThumb size={36} radius={6} />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{r.resursa_nume}</div>
                <div className="truncate text-xs text-neutral-500">{r.resursa_cod}</div>
              </div>
            </Cell>
            <Cell className="w-[110px] shrink-0">{formatDate(r.data_inceput)}</Cell>
            <Cell className="w-[130px] shrink-0">{formatInterval(r)}</Cell>
            <Cell className="w-[90px] shrink-0">{r.sala_nume}</Cell>
            <Cell className="w-[130px] shrink-0"><Pill tone="neutral">În așteptare</Pill></Cell>
            <Cell className="flex-1 gap-2">
              <button type="button" disabled={busy === r.id} onClick={() => act(r.id, "approve")} className={BTN_OUTLINE}>
                Aprobă
              </button>
              <button type="button" disabled={busy === r.id} onClick={() => act(r.id, "reject")} className={BTN_DESTRUCTIVE}>
                Respinge motivat
              </button>
            </Cell>
          </div>
        ))}
        <PaginationFooter totalItems={requests.length} pageSize={LAB_PAGE_SIZE} currentPage={page} onPageChange={setPage} itemLabel="cereri" />
      </div>
      <Field label="Motiv respingere · obligatoriu" required htmlFor="lab-reject-reason">
        <input
          id="lab-reject-reason"
          className={INPUT_CLASS}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ex.: activitatea nu justifică utilizarea echipamentului."
        />
      </Field>
      <p className="text-xs text-neutral-500">
        Aprobarea verifică eligibilitatea. Respingerea necesită un motiv; cererea nu este anulată de student.
      </p>
      {message && <p className="text-xs font-medium text-[#e7000b]">{message}</p>}
    </SectionCard>
  )
}
