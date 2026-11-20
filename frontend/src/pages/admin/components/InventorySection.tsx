import { Package2, Search } from "lucide-react"
import { Badge } from "../../../components/ui/badge"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { PaginationFooter } from "../../../components/common/PaginationFooter"
import type { Resource, StareTehnica } from "../../../types"
import { STARE_LABELS } from "../data/adminDemoData"
import { INVENTORY_PAGE_SIZE } from "../hooks/useAdminInventory"

interface InventorySectionProps {
  items: Resource[]
  total: number
  page: number
  isLoading: boolean
  error: string | null
  searchInput: string
  stare: StareTehnica | "ALL"
  onSearchInput: (value: string) => void
  onSearch: () => void
  onStare: (value: StareTehnica | "ALL") => void
  onPage: (page: number) => void
  onEdit: (resource: Resource) => void
  onToggleActive: (resource: Resource) => void
}

const stareVariant = (s: StareTehnica) =>
  s === "DISPONIBILA" ? "success" : s === "DEFECTA" ? "destructive" : "warning"

export function InventorySection(props: InventorySectionProps) {
  const { items, total, page, isLoading, error, searchInput, stare } = props

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-neutral-950">
          <Package2 className="h-4 w-4" /> Inventar centralizat
        </h2>
        <span className="text-xs text-neutral-500">{total} unități</span>
      </div>

      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          props.onSearch()
        }}
      >
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <Input
            value={searchInput}
            onChange={(e) => props.onSearchInput(e.target.value)}
            placeholder="Caută după cod sau denumire..."
            className="pl-9"
          />
        </div>
        <select
          value={stare}
          onChange={(e) => props.onStare(e.target.value as StareTehnica | "ALL")}
          className="h-9 rounded-md border border-neutral-200 bg-white px-3 text-sm"
        >
          <option value="ALL">Toate stările</option>
          {Object.entries(STARE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <Button type="submit" variant="outline">Caută</Button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-neutral-500 border-b border-neutral-200">
              <th className="py-2 pr-3 font-medium">Cod inventar</th>
              <th className="py-2 pr-3 font-medium">Denumire resursă</th>
              <th className="py-2 pr-3 font-medium">Lab</th>
              <th className="py-2 pr-3 font-medium">Stare</th>
              <th className="py-2 font-medium">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={5} className="py-6 text-center text-neutral-500">Se încarcă...</td></tr>
            )}
            {!isLoading && items.length === 0 && (
              <tr><td colSpan={5} className="py-6 text-center text-neutral-500">Nicio resursă găsită.</td></tr>
            )}
            {!isLoading && items.map((r) => (
              <tr key={r.id} className="border-b border-neutral-100 last:border-0">
                <td className="py-3 pr-3 font-mono text-xs">{r.cod_inventar}</td>
                <td className="py-3 pr-3">
                  <div className="font-medium text-neutral-900">{r.nume}</div>
                  {r.specificatii && <div className="text-xs text-neutral-500">{r.specificatii}</div>}
                </td>
                <td className="py-3 pr-3">{r.sala_cod ?? "—"}</td>
                <td className="py-3 pr-3">
                  <Badge variant={stareVariant(r.stare_tehnica)}>{STARE_LABELS[r.stare_tehnica]}</Badge>
                  {!r.is_active && <Badge variant="outline" className="ml-1">Inactiv</Badge>}
                </td>
                <td className="py-3">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => props.onEdit(r)}>Editează</Button>
                    <Button size="sm" variant="ghost" onClick={() => props.onToggleActive(r)}>
                      {r.is_active ? "Dezactivează" : "Activează"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PaginationFooter
        totalItems={total}
        pageSize={INVENTORY_PAGE_SIZE}
        currentPage={page}
        onPageChange={props.onPage}
      />
    </section>
  )
}
