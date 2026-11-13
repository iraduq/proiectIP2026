import { AlertTriangle, CheckCircle2, Clock, Wrench } from "lucide-react"
import type { TechnicalHistory } from "../../types"

function InterventionBadge({ type }: { type: string }) {
  switch (type) {
    case "DEFECTIUNE":
    case "DEFECTIUNE_RAPORTATA":
    case "RAPORT_DEFECTIUNE":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <AlertTriangle className="h-3 w-3" />
          Defecțiune
        </span>
      )
    case "MENTENANTA_PREVENTIVA":
    case "MENTENANTA":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Wrench className="h-3 w-3" />
          Mentenanță
        </span>
      )
    case "REPARATIE":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <CheckCircle2 className="h-3 w-3" />
          Reparație
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200">
          <Clock className="h-3 w-3" />
          {type}
        </span>
      )
  }
}

interface TechnicalHistoryTableProps {
  items: TechnicalHistory[]
  isLoading: boolean
}

export function TechnicalHistoryTable({ items, isLoading }: TechnicalHistoryTableProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
      {isLoading ? (
        <div className="p-12 text-center text-neutral-500 space-y-3">
          <div className="h-7 w-7 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-xs font-medium">Se încarcă jurnalul tehnic...</div>
        </div>
      ) : items.length === 0 ? (
        <div className="p-16 text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
            <Wrench className="h-6 w-6" />
          </div>
          <div className="font-semibold text-neutral-800 text-sm">Nicio intervenție găsită</div>
          <div className="text-xs text-neutral-500 max-w-sm mx-auto">
            Nu există intrări în jurnalul tehnic care să corespundă filtrului selectat.
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Dată înregistrare</th>
                <th className="py-3.5 px-4">Echipament și cod</th>
                <th className="py-3.5 px-4">Tip eveniment</th>
                <th className="py-3.5 px-4">Descriere tehnică</th>
                <th className="py-3.5 px-4">Tranziție stare</th>
                <th className="py-3.5 px-4">Înregistrat de</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-800">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50/70 transition-colors">
                  <td className="py-3.5 px-4 text-neutral-500 font-mono text-[11px] whitespace-nowrap">
                    {new Date(item.created_at).toLocaleString("ro-RO")}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-neutral-900">{item.resursa_nume}</div>
                    <div className="font-mono text-[11px] text-neutral-500">{item.resursa_cod}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <InterventionBadge type={item.tip_interventie} />
                  </td>
                  <td className="py-3.5 px-4 max-w-md text-neutral-700 leading-snug">
                    {item.descriere}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <span className="text-neutral-500">{item.stare_anterioara}</span>
                      <span className="text-neutral-400">→</span>
                      <span className="font-bold text-neutral-900">{item.stare_noua}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-neutral-900">{item.utilizator_nume}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
