import { useState } from "react"
import { Package2 } from "lucide-react"
import { PaginationFooter } from "../../../components/common/PaginationFooter"
import type { Resource, StareTehnica } from "../../../types"
import { LAB_PAGE_SIZE, STARE_TEHNICA_LABELS } from "../data/labConstants"
import { formatDateTime } from "../data/labFormat"
import { Cell, Pill, ResourceThumb, SectionCard, SectionHeading, TableHead } from "./LabUi"

const COLUMNS = [
  { label: "Resursă · Cod inventar", className: "w-[260px] shrink-0" },
  { label: "Categorie", className: "w-[140px] shrink-0" },
  { label: "Stare tehnică", className: "w-[140px] shrink-0" },
  { label: "Ultima actualizare", className: "w-[180px] shrink-0" },
  { label: "Notă", className: "min-w-[200px] flex-1" },
]

const TONE: Record<StareTehnica, "dark" | "neutral" | "danger"> = {
  DISPONIBILA: "dark",
  IN_MENTENANTA: "neutral",
  DEFECTA: "danger",
}

export function LabInventorySection({ labName, department, resources }: { labName: string; department: string; resources: Resource[] }) {
  const [page, setPage] = useState(1)
  const rows = resources.slice((page - 1) * LAB_PAGE_SIZE, page * LAB_PAGE_SIZE)
  return (
    <SectionCard>
      <SectionHeading
        icon={<Package2 />}
        title="Inventar · stare tehnică"
        right={
          <>
            {labName && <Pill tone="neutral">{labName}{department ? ` — ${department}` : ""}</Pill>}
            <span className="text-xs text-neutral-500">Înainte de confirmarea returului</span>
          </>
        }
      />
      <div className="flex w-full flex-col overflow-x-auto">
        <TableHead columns={COLUMNS} />
        {rows.length === 0 && <div className="py-8 text-center text-sm text-neutral-500">Nu există resurse în laborator.</div>}
        {rows.map((r) => (
          <div key={r.id} className="flex min-h-[52px] items-center border-b border-neutral-200">
            <Cell className="w-[260px] shrink-0 gap-2.5">
              <ResourceThumb url={r.imagine_url} size={36} radius={6} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{r.nume}</div>
                <div className="truncate text-xs text-neutral-500">{r.cod_inventar}</div>
              </div>
            </Cell>
            <Cell className="w-[140px] shrink-0 text-xs text-neutral-500">{r.categorie_nume}</Cell>
            <Cell className="w-[140px] shrink-0">
              <Pill tone={TONE[r.stare_tehnica]}>{STARE_TEHNICA_LABELS[r.stare_tehnica]}</Pill>
            </Cell>
            <Cell className="w-[180px] shrink-0 whitespace-pre">{formatDateTime(r.updated_at)}</Cell>
            <Cell className="min-w-[200px] flex-1">{r.descriere ?? "—"}</Cell>
          </div>
        ))}
        <PaginationFooter totalItems={resources.length} pageSize={LAB_PAGE_SIZE} currentPage={page} onPageChange={setPage} itemLabel="resurse" />
      </div>
    </SectionCard>
  )
}
