import { Button } from "../ui/button"
import type { DemoCatalogItem } from "../../data/professorDashboardConstants"
import type { Resource } from "../../types"

interface ProfessorStatsCardsProps {
  canApproveRequests: boolean
  resourcesCount: number
  pendingCount: number
  profActivitiesCount: number
}

export function ProfessorStatsCards({
  canApproveRequests,
  resourcesCount,
  pendingCount,
  profActivitiesCount,
}: ProfessorStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-xs space-y-1">
        <div className="text-xs text-neutral-500">Elemente din catalogul departamentului</div>
        <div className="text-3xl font-bold text-neutral-900">{resourcesCount}</div>
        <div className="text-xs text-neutral-500 pt-0.5">unități active în laboratoare</div>
      </div>

      {canApproveRequests ? (
        <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-xs space-y-1">
          <div className="text-xs text-neutral-500">Cereri studenți în așteptare</div>
          <div className="text-3xl font-bold text-neutral-900">{pendingCount}</div>
          <div className="text-xs text-neutral-500 pt-0.5">
            necesită decizia reprezentantului de laborator
          </div>
        </div>
      ) : (
        <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-xs space-y-1">
          <div className="text-xs text-neutral-500">
            Programări didactice și ședințe de laborator
          </div>
          <div className="text-3xl font-bold text-neutral-900">{profActivitiesCount}</div>
          <div className="text-xs text-neutral-500 pt-0.5">
            cererea ta individuală sau de grupă este validată de reprezentantul de laborator
          </div>
        </div>
      )}
    </div>
  )
}

interface ProfessorCatalogColumnProps {
  items: (Resource | DemoCatalogItem)[]
  onOpenCatalog: () => void
  onSelectResource: (id: number) => void
}

export function ProfessorCatalogColumn({
  items,
  onOpenCatalog,
  onSelectResource,
}: ProfessorCatalogColumnProps) {
  return (
    <div className="lg:col-span-7 space-y-4">
      <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
        <div>
          <h2 className="text-sm font-bold text-neutral-900">Catalogul departamentului</h2>
          <p className="text-xs text-neutral-500">
            Acces la catalogul complet, dintr-un singur loc.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenCatalog}
          className="text-xs h-8 border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-900 font-medium rounded-lg"
        >
          Catalog complet
        </Button>
      </div>

      <div className="space-y-4 pt-1">
        {items.map((r) => (
          <div
            key={r.id}
            onClick={() => onSelectResource(r.id)}
            className="p-3 bg-white hover:bg-neutral-50/80 rounded-xl transition-colors cursor-pointer flex items-center gap-4"
          >
            <div className="h-20 w-32 rounded-lg bg-neutral-900/5 border border-neutral-200 overflow-hidden shrink-0 flex items-center justify-center">
              {r.imagine_url ? (
                <img src={r.imagine_url} alt={r.nume} className="w-full h-full object-cover" />
              ) : (
                <div className="text-neutral-400 font-bold text-xs">RRM</div>
              )}
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="text-xs font-bold text-neutral-900 leading-tight truncate">
                {r.nume}
              </div>
              <div className="text-[11px] text-neutral-500 font-mono">
                {"specs" in r && r.specs ? `${r.specs} · ` : ""}
                {r.cod_inventar} · {r.sala_cod}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
