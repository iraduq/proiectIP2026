import { useState } from "react"
import { Badge } from "../../../components/ui/badge"
import { PaginationFooter } from "../../../components/common/PaginationFooter"
import { DEMO_AUDIT } from "../data/adminDemoData"

const AUDIT_PAGE_SIZE = 5

export function AuditSection() {
  const [page, setPage] = useState(1)
  const visible = DEMO_AUDIT.slice((page - 1) * AUDIT_PAGE_SIZE, page * AUDIT_PAGE_SIZE)

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-950">Jurnal de audit</h2>
        <Badge variant="outline">Doar citire</Badge>
      </div>
      <p className="text-xs text-neutral-500">
        Jurnalul este doar citire. Nu sunt disponibile acțiuni de editare sau ștergere a înregistrărilor.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-neutral-500 border-b border-neutral-200">
              <th className="py-2 pr-3 font-medium">Timestamp</th>
              <th className="py-2 pr-3 font-medium">User ID</th>
              <th className="py-2 pr-3 font-medium">Acțiune</th>
              <th className="py-2 pr-3 font-medium">Entitate / Detalii</th>
              <th className="py-2 font-medium">IP / Sesiune</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((a) => (
              <tr key={`${a.timestamp}-${a.entitate}`} className="border-b border-neutral-100 last:border-0">
                <td className="py-3 pr-3 font-mono text-xs">{a.timestamp}</td>
                <td className="py-3 pr-3">{a.user}</td>
                <td className="py-3 pr-3">{a.actiune}</td>
                <td className="py-3 pr-3 text-neutral-600">{a.entitate}</td>
                <td className="py-3 font-mono text-xs">{a.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PaginationFooter
        totalItems={DEMO_AUDIT.length}
        pageSize={AUDIT_PAGE_SIZE}
        currentPage={page}
        onPageChange={setPage}
        itemLabel="intrări"
      />
    </section>
  )
}
