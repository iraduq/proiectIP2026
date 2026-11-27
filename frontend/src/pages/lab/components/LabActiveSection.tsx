import { useState } from "react"
import { CalendarClock } from "lucide-react"
import { PaginationFooter } from "../../../components/common/PaginationFooter"
import type { Reservation } from "../../../types"
import { LAB_PAGE_SIZE } from "../data/labConstants"
import { formatDate, formatInterval } from "../data/labFormat"
import { Cell, Pill, ResourceThumb, SectionCard, SectionHeading, TableHead } from "./LabUi"

interface Props {
  labName: string
  reservations: Reservation[]
  onReturn: (id: number) => void
}

const COLUMNS = [
  { label: "Resursă · Cod inventar", className: "w-[240px] shrink-0" },
  { label: "Utilizator", className: "w-[180px] shrink-0" },
  { label: "Interval", className: "w-[180px] shrink-0" },
  { label: "Stare custodie", className: "w-[120px] shrink-0" },
  { label: "Acțiune", className: "w-[112px] shrink-0" },
]

export function LabActiveSection({ labName, reservations, onReturn }: Props) {
  const [page, setPage] = useState(1)
  const rows = reservations.slice((page - 1) * LAB_PAGE_SIZE, page * LAB_PAGE_SIZE)
  return (
    <SectionCard>
      <SectionHeading
        icon={<CalendarClock />}
        title={`Rezervări în curs${labName ? ` · ${labName}` : ""}`}
        right={
          <>
            <Pill tone="dark">{reservations.length} {reservations.length === 1 ? "activă" : "active"}</Pill>
            {labName && <Pill tone="neutral">Filtru: {labName}</Pill>}
          </>
        }
      />
      <div className="flex w-full flex-col overflow-x-auto">
        <TableHead columns={COLUMNS} />
        {rows.length === 0 && <div className="py-8 text-center text-sm text-neutral-500">Nu există rezervări aprobate.</div>}
        {rows.map((r) => (
          <div key={r.id} className="flex min-h-16 items-center border-b border-neutral-200">
            <Cell className="w-[240px] shrink-0 gap-2.5">
              <ResourceThumb size={40} radius={8} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{r.resursa_nume}</div>
                <div className="truncate text-xs text-neutral-500">{r.resursa_cod} · {r.sala_nume}</div>
              </div>
            </Cell>
            <Cell className="w-[180px] shrink-0">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{r.utilizator_nume}</div>
                <div className="truncate text-xs text-neutral-500">
                  {r.utilizator_rol === "STUDENT" ? "Student" : r.utilizator_rol}
                  {r.numar_matricol ? ` · ${r.numar_matricol}` : ""}
                </div>
              </div>
            </Cell>
            <Cell className="w-[180px] shrink-0">{formatDate(r.data_inceput)} · {formatInterval(r)}</Cell>
            <Cell className="w-[120px] shrink-0">
              {r.preluat_la ? <Pill tone="dark">În derulare</Pill> : <Pill tone="outline">Nepredat</Pill>}
            </Cell>
            <Cell className="w-[112px] shrink-0">
              <button
                type="button"
                onClick={() => onReturn(r.id)}
                className="inline-flex h-6 items-center rounded-md border border-neutral-200 bg-white px-2 text-xs font-medium text-neutral-950 hover:bg-neutral-50"
              >
                Retur
              </button>
            </Cell>
          </div>
        ))}
        <PaginationFooter totalItems={reservations.length} pageSize={LAB_PAGE_SIZE} currentPage={page} onPageChange={setPage} itemLabel="rezervări" />
      </div>
    </SectionCard>
  )
}
