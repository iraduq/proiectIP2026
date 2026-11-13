import { HelpCircle, Search } from "lucide-react"
import type { StareRezervare, StudentQuota } from "../../types"

interface ReservationFilterBarProps {
  isStudent: boolean
  quota: StudentQuota | null
  isStaff: boolean
  activeTab: "MY" | "MANAGEMENT"
  onTabChange: (tab: "MY" | "MANAGEMENT") => void
  pendingCount: number
  search: string
  onSearchChange: (val: string) => void
  statusFilter: StareRezervare | "ALL"
  onStatusFilterChange: (status: StareRezervare | "ALL") => void
}

export function ReservationFilterBar({
  isStudent,
  quota,
  isStaff,
  activeTab,
  onTabChange,
  pendingCount,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: ReservationFilterBarProps) {
  return (
    <div className="space-y-5">
      {isStudent && quota && (
        <div className="p-5 rounded-2xl bg-neutral-900 text-white shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                Cota ta de rezervare
              </div>
              <div className="text-2xl font-bold mt-0.5">
                {quota.active_count} / {quota.max_limit} resurse active
              </div>
            </div>
            <div className="text-xs text-neutral-300 max-w-md bg-neutral-800 p-3 rounded-xl border border-neutral-700">
              <div className="font-semibold text-white flex items-center gap-1.5 mb-1">
                <HelpCircle className="h-3.5 w-3.5 text-neutral-400" />
                Reguli academice de împrumut:
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-neutral-400">
                <li>Maximum 4 echipamente simultan per student</li>
                <li>Nu puteți rezerva două resurse din aceeași categorie în același timp</li>
                <li>Rezervările sunt supuse aprobării de către reprezentantul de laborator</li>
              </ul>
            </div>
          </div>

          <div className="w-full bg-neutral-800 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${
                quota.active_count >= quota.max_limit ? "bg-rose-500" : "bg-emerald-400"
              }`}
              style={{ width: `${(quota.active_count / quota.max_limit) * 100}%` }}
            />
          </div>
        </div>
      )}

      {isStaff && (
        <div className="flex border-b border-neutral-200 gap-4">
          <button
            type="button"
            onClick={() => onTabChange("MY")}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === "MY"
                ? "border-black text-black"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            Rezervările mele
          </button>
          <button
            type="button"
            onClick={() => onTabChange("MANAGEMENT")}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center gap-2 ${
              activeTab === "MANAGEMENT"
                ? "border-black text-black"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <span>Aprobare și gestiune cereri</span>
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-neutral-100 text-neutral-800 font-bold">
              {pendingCount} în așteptare
            </span>
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-neutral-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Caută în rezervări după echipament, utilizator, scop..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 h-9 text-xs rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-500">Stare:</span>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as StareRezervare | "ALL")}
            className="h-9 px-3 rounded-lg border border-neutral-200 bg-white text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-black"
          >
            <option value="ALL">Toate stările</option>
            <option value="IN_ASTEPTARE">În așteptare</option>
            <option value="APROBATA">Aprobate</option>
            <option value="FINALIZATA">Finalizate</option>
            <option value="RESPINSA">Respinse</option>
            <option value="ANULATA">Anulate</option>
          </select>
        </div>
      </div>
    </div>
  )
}
